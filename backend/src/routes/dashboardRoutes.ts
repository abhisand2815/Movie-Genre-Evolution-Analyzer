import { Router, Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

const router = Router()

const DATA_PATH = path.join(
  process.cwd(),
  '../frontend/public/data'
)

// In-memory cache for CSV datasets to avoid repeated disk reads
const csvCache: Record<string, Record<string, string>[]> = {}

/**
 * Safely reads and parses a CSV file with in-memory caching.
 */
function readCSV(filename: string): Record<string, string>[] {
  if (csvCache[filename]) {
    return csvCache[filename]
  }

  const filePath = path.join(DATA_PATH, filename)

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filename}`)
  }

  const csv = fs.readFileSync(filePath, 'utf-8')

  const lines = csv
    .trim()
    .split('\n')
    .filter(line => line.trim() !== '')

  if (lines.length === 0) {
    return []
  }

  const headers = lines[0].split(',').map(header => header.trim())

  const data = lines.slice(1).map(line => {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())

    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] ? values[index].replace(/^"|"$/g, '').trim() : ''
    })

    return row
  })

  // Cache in memory
  csvCache[filename] = data
  return data
}


// ============================================================
// 1. KPI API
// ============================================================
router.get('/kpis', (_req: Request, res: Response) => {
  try {
    const data = readCSV('dashboard_kpis.csv')
    res.json({
      status: 'success',
      data,
    })
  } catch (error) {
    console.error('Error reading KPI CSV:', error)
    res.status(500).json({
      status: 'error',
      message: 'Unable to load KPI data',
    })
  }
})


// ============================================================
// 2. GENRE API
// ============================================================
router.get('/genres', (_req: Request, res: Response) => {
  try {
    const data = readCSV('dashboard_genre_summary.csv')
    res.json({
      status: 'success',
      data,
    })
  } catch (error) {
    console.error('Error reading genre CSV:', error)
    res.status(500).json({
      status: 'error',
      message: 'Unable to load genre data',
    })
  }
})


// ============================================================
// 3. DECADE API
// ============================================================
router.get('/decades', (_req: Request, res: Response) => {
  try {
    const data = readCSV('dashboard_decade_summary.csv')
    res.json({
      status: 'success',
      data,
    })
  } catch (error) {
    console.error('Error reading decade CSV:', error)
    res.status(500).json({
      status: 'error',
      message: 'Unable to load decade data',
    })
  }
})


// ============================================================
// 4. GENRE TRENDS API
// ============================================================
router.get('/genre-trends', (_req: Request, res: Response) => {
  try {
    const data = readCSV('dashboard_genre_trends.csv')
    res.json({
      status: 'success',
      data,
    })
  } catch (error) {
    console.error('Error reading genre trends CSV:', error)
    res.status(500).json({
      status: 'error',
      message: 'Unable to load genre trends data',
    })
  }
})


// ============================================================
// 5. CLUSTER API
// ============================================================
router.get('/clusters', (_req: Request, res: Response) => {
  try {
    const data = readCSV('dashboard_cluster_distribution.csv')
    res.json({
      status: 'success',
      data,
    })
  } catch (error) {
    console.error('Error reading cluster CSV:', error)
    res.status(500).json({
      status: 'error',
      message: 'Unable to load cluster data',
    })
  }
})


// ============================================================
// 6. MOVIES API (WITH VALIDATION, SEARCH, FILTER & PAGINATION)
// ============================================================
router.get('/movies', (req: Request, res: Response): void => {
  try {
    const rawData = readCSV('dashboard_movies_search.csv')

    // Parse & Validate Query Parameters
    const { search, genre, year, minRating, limit: limitStr, offset: offsetStr } = req.query

    // Validate offset parameter
    let offset = 0
    if (offsetStr !== undefined) {
      const parsedOffset = Number(offsetStr)
      if (!Number.isInteger(parsedOffset) || parsedOffset < 0) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid query parameter: offset must be a non-negative integer',
        })
        return
      }
      offset = parsedOffset
    }

    // Validate limit parameter
    let limit = 3500
    if (limitStr !== undefined) {
      const parsedLimit = Number(limitStr)
      if (!Number.isInteger(parsedLimit) || parsedLimit <= 0 || parsedLimit > 3500) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid query parameter: limit must be a positive integer up to 3500',
        })
        return
      }
      limit = parsedLimit
    }

    // Validate year parameter
    let yearNum: number | null = null
    if (year !== undefined && year !== '') {
      const parsedYear = Number(year)
      if (isNaN(parsedYear) || !Number.isInteger(parsedYear)) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid query parameter: year must be a valid integer',
        })
        return
      }
      yearNum = parsedYear
    }

    // Validate minRating parameter
    let minRatingNum: number | null = null
    if (minRating !== undefined && minRating !== '') {
      const parsedMinRating = Number(minRating)
      if (isNaN(parsedMinRating) || parsedMinRating < 0 || parsedMinRating > 10) {
        res.status(400).json({
          status: 'error',
          message: 'Invalid query parameter: minRating must be a number between 0 and 10',
        })
        return
      }
      minRatingNum = parsedMinRating
    }

    // Filter dataset based on parameters
    let filtered = rawData

    if (search && typeof search === 'string' && search.trim() !== '') {
      const searchLower = search.trim().toLowerCase()
      filtered = filtered.filter(row =>
        row.primaryTitle?.toLowerCase().includes(searchLower)
      )
    }

    if (genre && typeof genre === 'string' && genre.trim() !== '' && genre.trim().toLowerCase() !== 'all') {
      const genreLower = genre.trim().toLowerCase()
      filtered = filtered.filter(row =>
        row.genres?.toLowerCase().includes(genreLower)
      )
    }

    if (yearNum !== null) {
      filtered = filtered.filter(row => Number(row.startYear) === yearNum)
    }

    if (minRatingNum !== null) {
      filtered = filtered.filter(row => Number(row.averageRating) >= minRatingNum!)
    }

    const total = filtered.length
    const paginatedData = filtered.slice(offset, offset + limit)

    res.json({
      status: 'success',
      data: paginatedData,
      pagination: {
        limit,
        offset,
        total,
      },
    })
  } catch (error) {
    console.error('Error reading movie search CSV:', error)
    res.status(500).json({
      status: 'error',
      message: 'Unable to load movie data',
    })
  }
})

export default router