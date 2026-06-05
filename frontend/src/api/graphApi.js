export async function fetchGraphData(lat, lng) {

  const controller = new AbortController()

  const timeout = setTimeout(
    () => controller.abort(),
    10000
  )

  try {

    const API_BASE = 'http://localhost:3001'

    const res = await fetch(`${API_BASE}/graph`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat, lng }),
      signal: controller.signal,
    })

    if (!res.ok) {
      throw new Error(`HTTP error: ${res.status}`)
    }

    return await res.json()

  } finally {
    clearTimeout(timeout)
  }
}
