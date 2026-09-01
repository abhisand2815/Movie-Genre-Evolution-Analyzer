import Papa from 'papaparse'

export async function loadCSV<T = Record<string, string>>(
  path: string
): Promise<T[]> {
  const response = await fetch(path)

  if (!response.ok) {
    throw new Error(`Failed to load CSV: ${path}`)
  }

  const csvText = await response.text()

  const result = Papa.parse<T>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  if (result.errors.length > 0) {
    console.error('CSV parsing errors:', result.errors)
  }

  return result.data
}