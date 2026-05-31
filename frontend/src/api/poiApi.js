export async function fetchPOIs(
  lat,
  lng
) {

  const res = await fetch(
    'http://localhost:3001/pois',
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        lat,
        lng,
      }),
    }
  )

  return await res.json()
}