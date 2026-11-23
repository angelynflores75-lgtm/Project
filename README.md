# Skwela Ta

## Run the application

1. Copy `backend/.env.example` to `backend/.env`.
2. Start the API with `npm run backend`.
3. In another terminal, start the frontend with `npm run dev`.

The backend connects to the configured SQL Server and creates `dbo.USERS` if it
does not exist. For an existing `dbo.USERS` table, it adds a nullable
`password_hash` column when needed. The SQL account needs permission to create
the table or alter it, as applicable.

The default local configuration uses `localhost` on TCP port `14330` and does
not require SQL Server Browser. In SQL Server Configuration Manager, enable
TCP/IP for the `SQLEXPRESS` instance, set **IP Addresses > IPAll > TCP Port** to
`14330`, clear **TCP Dynamic Ports**, and restart SQL Server (SQLEXPRESS).
The default `DB_AUTH=windows` uses Windows Integrated Authentication; run the
backend as a Windows user that has access to `DB_FP`. To use SQL authentication,
set `DB_AUTH=sql` and provide `DB_USER` and `DB_PASSWORD` in `backend/.env`.
If you choose a different static port, use that same port in both SQL Server
Configuration Manager and `DB_PORT`.

Registration, login, and password changes use the backend API. Password changes
verify the current password. Passwords are stored as scrypt hashes; SQL
credentials must remain in the backend environment file and must never be added
to frontend code.
