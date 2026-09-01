# Movie Genre Evolution Analyzer — API Documentation

This document describes all REST API endpoints provided by the Express backend (`http://localhost:5000/api`).

---

## Overview

- **Base URL**: `http://localhost:5000/api`
- **CORS Allowed Origin**: `http://localhost:5173` (configured via `FRONTEND_URL`)
- **Default Response Format**: JSON

---

## API Endpoints

### 1. Health Check
Checks if the Express API server is running.

- **Method**: `GET`
- **URL**: `/api/health`
- **Query Parameters**: None
- **Example Request**:
  ```http
  GET /api/health HTTP/1.1
  Host: localhost:5000
  ```
- **Example Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Movie Genre Evolution API is running"
  }
  ```

---

### 2. KPI Summary
Returns global dataset KPI metrics (Total Movies, Average Rating, Total Votes, Average Runtime, Earliest Movie Year, Latest Movie Year).

- **Method**: `GET`
- **URL**: `/api/kpis`
- **Query Parameters**: None
- **Example Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      { "metric": "Total Movies", "value": "569655.0" },
      { "metric": "Average Rating", "value": "6.13" },
      { "metric": "Total Votes", "value": "1290658988.0" },
      { "metric": "Average Runtime", "value": "89.54" },
      { "metric": "Earliest Movie Year", "value": "1900.0" },
      { "metric": "Latest Movie Year", "value": "2026.0" }
    ]
  }
  ```

---

### 3. Genre Popularity Summary
Returns movie counts and average rating/votes per genre sorted by volume.

- **Method**: `GET`
- **URL**: `/api/genres`
- **Query Parameters**: None
- **Example Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      { "genre": "Drama", "movie_count": "240101", "avg_rating": "6.18", "avg_votes": "4128.65" },
      { "genre": "Documentary", "movie_count": "139858", "avg_rating": "7.17", "avg_votes": "318.8" }
    ]
  }
  ```

---

### 4. Decade Summary
Returns movie production count and average rating per decade.

- **Method**: `GET`
- **URL**: `/api/decades`
- **Query Parameters**: None
- **Example Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      { "decade": "1900", "movie_count": "106", "avg_rating": "3.27", "avg_votes": "46.92" },
      { "decade": "2010", "movie_count": "94821", "avg_rating": "6.21", "avg_votes": "4509.75" }
    ]
  }
  ```

---

### 5. Genre Trends Across Decades
Returns breakdown of movie counts per genre per decade.

- **Method**: `GET`
- **URL**: `/api/genre-trends`
- **Query Parameters**: None
- **Example Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      { "decade": "1900", "genre": "Action", "movie_count": "2" },
      { "decade": "2010", "genre": "Sci-Fi", "movie_count": "2450" }
    ]
  }
  ```

---

### 6. Cluster Distribution
Returns movie distribution across unsupervised feature clusters (Cluster 0 to 4).

- **Method**: `GET`
- **URL**: `/api/clusters`
- **Query Parameters**: None
- **Example Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      { "cluster": "0", "movie_count": "71281" },
      { "cluster": "1", "movie_count": "50980" },
      { "cluster": "2", "movie_count": "65498" },
      { "cluster": "3", "movie_count": "90638" },
      { "cluster": "4", "movie_count": "28745" }
    ]
  }
  ```

---

### 7. Movie Search & Analytics API
Serves top 3,500 popular movies dataset with title search, genre filtering, year filtering, rating filtering, and pagination.

- **Method**: `GET`
- **URL**: `/api/movies`
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `search` | string | No | Substring match against `primaryTitle` (case-insensitive) |
  | `genre` | string | No | Substring match against `genres` (case-insensitive) |
  | `year` | integer | No | Exact release year filter (e.g. `2010`) |
  | `minRating` | number | No | Minimum IMDb average rating filter (0 to 10) |
  | `limit` | integer | No | Max rows to return (1 to 3500, default `3500`) |
  | `offset` | integer | No | Starting index offset for pagination (default `0`) |

- **Example Request**:
  ```http
  GET /api/movies?search=Inception&genre=Sci-Fi&limit=10&offset=0 HTTP/1.1
  Host: localhost:5000
  ```

- **Example Response (200 OK)**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "tconst": "tt1375666",
        "primaryTitle": "Inception",
        "startYear": "2010",
        "runtimeMinutes": "148.0",
        "genres": "Adventure,Sci-Fi,Thriller",
        "averageRating": "8.8",
        "numVotes": "2857890",
        "cluster": "1"
      }
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "total": 1
    }
  }
  ```

---

## Error Handling & Status Codes

All API errors return a standard JSON error response format:

```json
{
  "status": "error",
  "message": "Description of the error"
}
```

### Common HTTP Status Codes
- `200 OK`: Request succeeded.
- `400 Bad Request`: Invalid or malformed query parameter (e.g. negative offset, non-numeric limit/year).
- `404 Not Found`: Endpoint or route does not exist.
- `500 Internal Server Error`: Server dataset loading error (internal stack traces hidden).
