export async function apiRequest(path, options = {}) {
  const { body, headers, ...requestOptions } = options
  const response = await fetch(path, {
    ...requestOptions,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('The server returned an invalid response.')
  }

  if (!response.ok) {
    throw new Error(data.error || 'The request could not be completed.')
  }

  return data
}
