import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import dotenv from "dotenv";
import express from "express";
import tediousSql from "mssql";
import windowsSql from "mssql/msnodesqlv8.js";

dotenv.config({ path: fileURLToPath(new URL("./.env", import.meta.url)) });

const app = express();
const PORT = Number(process.env.PORT || 5000);
const scrypt = promisify(nodeScrypt);
const PASSWORD_HASH_BYTES = 64;
const dbAuth = process.env.DB_AUTH || "sql";
const useWindowsAuth = dbAuth === "windows";
const sql = useWindowsAuth ? windowsSql : tediousSql;
const [dbServer, dbInstanceName] = (process.env.DB_SERVER || "").split("\\", 2);
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;

app.use(express.json({ limit: "16kb" }));

const dbConfig = {
  ...(!useWindowsAuth
    ? { user: process.env.DB_USER, password: process.env.DB_PASSWORD }
    : {}),
  server: dbServer,
  ...(dbPort ? { port: dbPort } : {}),
  database: process.env.DB_DATABASE,
  ...(useWindowsAuth ? { driver: "ODBC Driver 17 for SQL Server" } : {}),
  options: {
    encrypt: !useWindowsAuth,
    trustServerCertificate: true,
    ...(useWindowsAuth ? { trustedConnection: true } : {}),
    ...(!dbPort && dbInstanceName ? { instanceName: dbInstanceName } : {}),
  },
};

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function publicUser(record) {
  return {
    id: record.user_id,
    name: record.display_name,
    email: record.email,
  };
}

function sendServerError(res, error, message) {
  console.error(message, error);
  res.status(500).json({ error: "The server could not complete the request." });
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const derivedKey = await scrypt(password, salt, PASSWORD_HASH_BYTES);
  return `scrypt$${salt.toString("base64")}$${derivedKey.toString("base64")}`;
}

async function verifyPassword(password, storedHash) {
  if (typeof storedHash !== "string") return false;
  const [algorithm, saltString, keyString] = storedHash.split("$");
  if (algorithm !== "scrypt" || !saltString || !keyString) return false;

  const salt = Buffer.from(saltString, "base64");
  const storedKey = Buffer.from(keyString, "base64");
  if (salt.length !== 16 || storedKey.length !== PASSWORD_HASH_BYTES) return false;

  const candidateKey = await scrypt(password, salt, PASSWORD_HASH_BYTES);
  return timingSafeEqual(candidateKey, storedKey);
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", database: "connected" });
});

app.post("/api/auth/register", async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;

  if (
    !name ||
    name.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 150 ||
    typeof password !== "string"
  ) {
    return res.status(400).json({ error: "Enter a valid name, email, and password." });
  }
  if (password.length < 8 || password.length > 128) {
    return res.status(400).json({ error: "Password must be between 8 and 128 characters." });
  }

  try {
    const existing = await req.app.locals.pool
      .request()
      .input("email", sql.NVarChar(150), email)
      .query(`
        SELECT TOP (1) user_id
        FROM dbo.USERS
        WHERE LOWER(LTRIM(RTRIM(email))) = @email
      `);

    if (existing.recordset.length) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    const passwordHash = await hashPassword(password);
    const result = await req.app.locals.pool
      .request()
      .input("email", sql.NVarChar(150), email)
      .input("display_name", sql.NVarChar(100), name)
      .input("password_hash", sql.NVarChar(256), passwordHash)
      .query(`
        INSERT INTO dbo.USERS (email, display_name, password_hash)
        OUTPUT INSERTED.user_id, INSERTED.email, INSERTED.display_name
        VALUES (@email, @display_name, @password_hash)
      `);

    res.status(201).json(publicUser(result.recordset[0]));
  } catch (error) {
    sendServerError(res, error, "Account registration failed:");
  }
});

app.post("/api/auth/login", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof password !== "string" ||
    password.length > 128
  ) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const result = await req.app.locals.pool
      .request()
      .input("email", sql.NVarChar(150), email)
      .query(`
        SELECT TOP (1) user_id, email, display_name, password_hash
        FROM dbo.USERS
        WHERE LOWER(LTRIM(RTRIM(email))) = @email
      `);
    const record = result.recordset[0];
    if (!record || !(await verifyPassword(password, record.password_hash))) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    res.json(publicUser(record));
  } catch (error) {
    sendServerError(res, error, "Login failed:");
  }
});

app.post("/api/auth/password", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const currentPassword = req.body?.currentPassword;
  const newPassword = req.body?.newPassword;
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof currentPassword !== "string" ||
    typeof newPassword !== "string" ||
    currentPassword.length > 128
  ) {
    return res.status(400).json({ error: "Email and both passwords are required." });
  }
  if (newPassword.length < 8 || newPassword.length > 128) {
    return res.status(400).json({ error: "Password must be between 8 and 128 characters." });
  }

  try {
    const result = await req.app.locals.pool
      .request()
      .input("email", sql.NVarChar(150), email)
      .query(`
        SELECT TOP (1) user_id, password_hash
        FROM dbo.USERS
        WHERE LOWER(LTRIM(RTRIM(email))) = @email
      `);
    const record = result.recordset[0];
    if (!record || !(await verifyPassword(currentPassword, record.password_hash))) {
      return res.status(401).json({ error: "Email or current password is incorrect." });
    }

    const passwordHash = await hashPassword(newPassword);
    await req.app.locals.pool
      .request()
      .input("user_id", sql.Int, record.user_id)
      .input("password_hash", sql.NVarChar(256), passwordHash)
      .query(`
        UPDATE dbo.USERS
        SET password_hash = @password_hash
        WHERE user_id = @user_id
      `);

    res.json({ message: "Password updated." });
  } catch (error) {
    sendServerError(res, error, "Password update failed:");
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  sendServerError(res, error, "Request failed:");
});

async function startServer() {
  if (!["sql", "windows"].includes(dbAuth)) {
    throw new Error("DB_AUTH must be either sql or windows.");
  }
  const requiredConfig = ["DB_SERVER", "DB_DATABASE"];
  if (!useWindowsAuth) requiredConfig.push("DB_USER", "DB_PASSWORD");
  const missingConfig = requiredConfig.filter((key) => !process.env[key]);
  if (missingConfig.length) {
    throw new Error(`Missing database configuration: ${missingConfig.join(", ")}`);
  }
  if (process.env.DB_PORT && (!Number.isInteger(dbPort) || dbPort < 1 || dbPort > 65535)) {
    throw new Error("DB_PORT must be a valid TCP port between 1 and 65535.");
  }

  const pool = await sql.connect(dbConfig);
  await pool.request().query(`
    IF OBJECT_ID(N'dbo.USERS', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.USERS (
        user_id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        email NVARCHAR(150) NOT NULL,
        display_name NVARCHAR(100) NOT NULL,
        password_hash NVARCHAR(256) NULL,
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
      );
    END;

    IF COL_LENGTH(N'dbo.USERS', N'password_hash') IS NULL
      ALTER TABLE dbo.USERS ADD password_hash NVARCHAR(256) NULL;
  `);
  app.locals.pool = pool;

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start SQL Server API:", error);
  process.exit(1);
});
