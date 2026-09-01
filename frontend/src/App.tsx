import { useEffect, useState } from 'react'
import { loadCSV } from './utils/csv'
import type {
  KpiRow,
  GenreRow,
  DecadeRow,
  GenreTrendRow,
  ClusterRow,
  MovieSearchRow,
  ThemeMode,
} from './types'
import { Navbar } from './components/Navbar'
import { DashboardView } from './components/DashboardView'
import { MovieAnalyticsView } from './components/MovieAnalyticsView'

// ============================================================
// API BASE URL & HYBRID LOADER
// ============================================================

const API_BASE_URL = 'http://localhost:5000/api'

type ApiResponse<T> = {
  status: string
  data: T[]
}

/**
 * Smart dataset loader: Tries backend Express API first (/api/endpoint).
 * If backend server is unreachable or errors out, gracefully falls back to local CSV files.
 */
async function loadDataset<T>(
  endpoint: string,
  csvFallbackPath: string
): Promise<T[]> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`)
    if (response.ok) {
      const result: ApiResponse<T> = await response.json()
      if (result.status === 'success' && Array.isArray(result.data) && result.data.length > 0) {
        return result.data
      }
    }
  } catch {
    // Backend API offline; fallback to direct CSV
  }
  return loadCSV<T>(csvFallbackPath)
}

function App() {
  // ============================================================
  // THEME & NAVIGATION STATE
  // ============================================================

  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('app_theme')
    return (saved as ThemeMode) || 'dark'
  })

  const [activePage, setActivePage] = useState<'dashboard' | 'movie-analytics'>('dashboard')
  const [selectedMovie, setSelectedMovie] = useState<MovieSearchRow | null>(null)

  // ============================================================
  // DATASETS
  // ============================================================

  const [kpis, setKpis] = useState<KpiRow[]>([])
  const [genres, setGenres] = useState<GenreRow[]>([])
  const [decades, setDecades] = useState<DecadeRow[]>([])
  const [genreTrends, setGenreTrends] = useState<GenreTrendRow[]>([])
  const [clusters, setClusters] = useState<ClusterRow[]>([])
  const [movies, setMovies] = useState<MovieSearchRow[]>([])

  const [selectedGenre, setSelectedGenre] = useState<string>('Drama')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // ============================================================
  // THEME TOGGLE
  // ============================================================

  const handleToggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('app_theme', next)
      return next
    })
  }

  // ============================================================
  // LOAD ALL DATASETS FROM BACKEND API WITH FALLBACK
  // ============================================================

  const loadAllDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [
        kpisData,
        genresData,
        decadesData,
        trendsData,
        clustersData,
        moviesData,
      ] = await Promise.all([
        loadDataset<KpiRow>('/kpis', '/data/dashboard_kpis.csv'),
        loadDataset<GenreRow>('/genres', '/data/dashboard_genre_summary.csv'),
        loadDataset<DecadeRow>('/decades', '/data/dashboard_decade_summary.csv'),
        loadDataset<GenreTrendRow>('/genre-trends', '/data/dashboard_genre_trends.csv'),
        loadDataset<ClusterRow>('/clusters', '/data/dashboard_cluster_distribution.csv'),
        loadDataset<MovieSearchRow>('/movies', '/data/dashboard_movies_search.csv'),
      ])

      console.log('KPI data loaded:', kpisData.length)
      console.log('Genre summary loaded:', genresData.length)
      console.log('Decade summary loaded:', decadesData.length)
      console.log('Genre trends loaded:', trendsData.length)
      console.log('Cluster distribution loaded:', clustersData.length)
      console.log('Movies search dataset loaded:', moviesData.length)

      setKpis(kpisData)
      setGenres(genresData)
      setDecades(decadesData)
      setGenreTrends(trendsData)
      setClusters(clustersData)
      setMovies(moviesData)

      if (genresData.length > 0) {
        const dramaExists = genresData.some(g => g.genre === 'Drama')
        setSelectedGenre(dramaExists ? 'Drama' : genresData[0].genre)
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError('Unable to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllDashboardData()
  }, [])

  // ============================================================
  // MOVIE SELECTION
  // ============================================================

  const handleSelectMovie = (movie: MovieSearchRow | null) => {
    setSelectedMovie(movie)
    if (movie) {
      setActivePage('movie-analytics')
    }
  }

  const isDark = theme === 'dark'

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div
        className={`flex min-h-screen flex-col items-center justify-center transition-colors ${
          isDark ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'
        }`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-lg font-medium">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {
    return (
      <div
        className={`flex min-h-screen flex-col items-center justify-center px-4 transition-colors ${
          isDark ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-900'
        }`}
      >
        <div
          className={`max-w-md rounded-xl border p-8 text-center shadow-2xl ${
            isDark ? 'border-red-800/50 bg-slate-900/90' : 'border-red-200 bg-white'
          }`}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-800/40 bg-red-950/60 text-2xl text-red-400">
            ⚠️
          </div>
          <h3 className="text-xl font-bold">{error}</h3>
          <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Unable to connect to data sources. Please try again.
          </p>
          <button
            onClick={loadAllDashboardData}
            className="mt-6 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 active:scale-95"
          >
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  // ============================================================
  // MAIN APP UI
  // ============================================================

  return (
    <div
      className={`min-h-screen font-sans antialiased transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activePage={activePage}
        onSelectPage={setActivePage}
        selectedMovieTitle={selectedMovie?.primaryTitle}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activePage === 'dashboard' ? (
          <DashboardView
            theme={theme}
            kpis={kpis}
            genres={genres}
            decades={decades}
            genreTrends={genreTrends}
            clusters={clusters}
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
            onNavigateToMovieSearch={() => setActivePage('movie-analytics')}
          />
        ) : (
          <MovieAnalyticsView
            theme={theme}
            movies={movies}
            decades={decades}
            genres={genres}
            genreTrends={genreTrends}
            clusters={clusters}
            selectedMovie={selectedMovie}
            onSelectMovie={handleSelectMovie}
            onNavigateToDashboard={() => setActivePage('dashboard')}
          />
        )}
      </main>
    </div>
  )
}

export default App