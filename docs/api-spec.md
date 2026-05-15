# API Specification

## POST /generate-route

input:

```json
{
  "shape": "heart",
  "distance": 5,
  "startPoint": [37.5445, 127.0373]
}
```

output:

```json
{
  "routePath": [
    [37.5441, 127.0370],
    [37.5442, 127.0373]
  ]
}
```

---

## Step 1: User Input

output:

```json
{
  "shape": "heart",
  "distance": 5,
  "startPoint": [37.5445, 127.0373]
}
```

---

## Step 2: Shape Transform

output:

```json
{
  "waypoints": [
    [37.5441, 127.0370],
    [37.5450, 127.0380]
  ]
}
```

---

## Step 3: Pathfinding

output:

```json
{
  "routePath": [
    [37.5441, 127.0370],
    [37.5442, 127.0373]
  ]
}
```

---

## Step 4: Optimization

output:

```json
{
  "optimizedRoute": [
    [37.5441, 127.0370],
    [37.5442, 127.0373]
  ],
  "roadPreference": "alley"
}
```
