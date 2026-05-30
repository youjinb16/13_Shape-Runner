const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()
app.use(cors())
app.use(express.json())

async function fetchRoadGraph(lat, lng, radius = 2000) {
  const query = `
  [out:json][timeout:25];
  (
    way
  ["highway"]
  (around:${radius},${lat},${lng});
  );
  (._;>;);
  out body;
  `

  const url = 'https://overpass-api.de/api/interpreter'

  const params = new URLSearchParams()
  params.append('data', query)

  const res = await axios.post(url, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'ShapeRunner/1.0 (student project)',
    },
  })
    return res.data
  }

app.post('/graph', async (req, res) => {
  const { lat, lng } = req.body

  try {
    const data = await fetchRoadGraph(lat, lng)
    res.json(data)
  } catch (err) {
  console.error(err.response?.data || err.message)
  res.status(500).json({ error: 'failed to fetch graph' })
}
})

app.listen(3001, '0.0.0.0', () => {
  console.log('Server running on http://localhost:3001')
})