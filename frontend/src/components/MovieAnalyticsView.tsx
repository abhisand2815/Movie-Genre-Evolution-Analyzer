import React, { useState, useMemo } from 'react'
import Plot from 'react-plotly.js'
import type {
  MovieSearchRow,
  DecadeRow,
  GenreRow,
  GenreTrendRow,
  ClusterRow,
  ThemeMode,
} from '../types'

interface MovieAnalyticsViewProps {
  theme: ThemeMode
  movies: MovieSearchRow[]
  decades: DecadeRow[]
  genres: GenreRow[]
  genreTrends: GenreTrendRow[]
  clusters: ClusterRow[]
  selectedMovie: MovieSearchRow | null
  onSelectMovie: (movie: MovieSearchRow | null) => void
  onNavigateToDashboard: () => void
}

export const MovieAnalyticsView: React.FC<MovieAnalyticsViewProps> = ({
  theme,
  movies,
  decades,
  genres,
  genreTrends,
  selectedMovie,
  onSelectMovie,
  onNavigateToDashboard,
}) => {
  const isDark = theme === 'dark'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenreFilter, setSelectedGenreFilter] = useState('All')
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0)

  // Plotly Theme Config
  const plotlyTheme = useMemo(() => {
    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: {
        color: isDark ? '#94a3b8' : '#475569',
        family: 'Inter, system-ui, sans-serif',
      },
      gridcolor: isDark ? '#1e293b' : '#e2e8f0',
      tickcolor: isDark ? '#cbd5e1' : '#334155',
      hoverlabel: {
        bgcolor: isDark ? '#0f172a' : '#ffffff',
        bordercolor: isDark ? '#334155' : '#cbd5e1',
        font: { color: isDark ? '#f8fafc' : '#0f172a', family: 'Inter, sans-serif' },
      },
    }
  }, [isDark])

  // Extract unique genres for filter dropdown
  const availableGenresList = useMemo(() => {
    const set = new Set<string>()
    movies.forEach(m => {
      if (m.genres) {
        m.genres.split(',').forEach(g => set.add(g.trim()))
      }
    })
    return ['All', ...Array.from(set).sort()]
  }, [movies])

  // Filtered movies list
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesSearch =
        searchTerm === '' ||
        movie.primaryTitle.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesGenre =
        selectedGenreFilter === 'All' ||
        movie.genres.toLowerCase().includes(selectedGenreFilter.toLowerCase())

      const matchesRating = Number(movie.averageRating) >= minRatingFilter

      return matchesSearch && matchesGenre && matchesRating
    })
  }, [movies, searchTerm, selectedGenreFilter, minRatingFilter])

  // Popular quick pick movies
  const quickPickMovies = useMemo(() => {
    const popularTitles = [
      'Inception',
      'The Dark Knight',
      'The Shawshank Redemption',
      'Interstellar',
      'Pulp Fiction',
      'Fight Club',
      'The Matrix',
      'Forrest Gump',
      'The Godfather',
    ]
    return movies.filter(m => popularTitles.includes(m.primaryTitle)).slice(0, 8)
  }, [movies])

  // ============================================================
  // ANALYTICS COMPUTATION FOR SELECTED MOVIE
  // ============================================================

  const movieAnalytics = useMemo(() => {
    if (!selectedMovie) return null

    const year = Number(selectedMovie.startYear)
    const rating = Number(selectedMovie.averageRating)
    const votes = Number(selectedMovie.numVotes)
    const runtime = Number(selectedMovie.runtimeMinutes) || 90
    const decade = `${Math.floor(year / 10) * 10}`

    // 1. Decade Average Rating Benchmark
    const decadeData = decades.find(d => d.decade === decade)
    const decadeAvgRating = decadeData ? Number(decadeData.avg_rating) : 6.13
    const ratingVsDecadeDiff = rating - decadeAvgRating

    // 2. Primary Genre Average Benchmark
    const primaryGenre = selectedMovie.genres ? selectedMovie.genres.split(',')[0].trim() : 'Drama'
    const genreData = genres.find(g => g.genre.toLowerCase() === primaryGenre.toLowerCase())
    const genreAvgRating = genreData && genreData.avg_rating ? Number(genreData.avg_rating) : 6.13
    const ratingVsGenreDiff = rating - genreAvgRating

    // 3. Overall Dataset Rating Average (6.13)
    const overallAvgRating = 6.13

    // 4. Popularity Percentile / Rank
    const movieIndex = movies.findIndex(m => m.tconst === selectedMovie.tconst)
    const rank = movieIndex >= 0 ? movieIndex + 1 : 1
    const totalCount = movies.length
    const percentile = (((totalCount - rank) / totalCount) * 100).toFixed(1)

    // 5. Cluster Description
    const clusterDescriptions: Record<string, { label: string; desc: string; color: string }> = {
      '0': {
        label: 'Cluster 0: Low-Rating / Niche Works',
        desc: 'Films with lower average ratings (~4.5) and smaller vote volume.',
        color: 'border-slate-500 text-slate-400',
      },
      '1': {
        label: 'Cluster 1: Blockbuster High-Vote Titles',
        desc: 'Massive audience engagement with high vote volume and strong ratings.',
        color: 'border-blue-500 text-blue-400',
      },
      '2': {
        label: 'Cluster 2: Classic Era Cinema',
        desc: 'Pre-1970s classic films with established historical rating patterns.',
        color: 'border-amber-500 text-amber-400',
      },
      '3': {
        label: 'Cluster 3: Highly Rated Modern Features',
        desc: 'Top-tier critically acclaimed modern releases with superior IMDb ratings.',
        color: 'border-emerald-500 text-emerald-400',
      },
      '4': {
        label: 'Cluster 4: Epic Length Productions',
        desc: 'Extended runtime feature films (>130 mins) with solid rating stability.',
        color: 'border-purple-500 text-purple-400',
      },
    }

    const clusterInfo = clusterDescriptions[selectedMovie.cluster] || {
      label: `Cluster ${selectedMovie.cluster}`,
      desc: 'Standard feature grouping based on runtime, votes, and rating metrics.',
      color: 'border-indigo-500 text-indigo-400',
    }

    // 6. Primary Genre Trend across decades
    const primaryGenreTrends = genreTrends
      .filter(gt => gt.genre.toLowerCase() === primaryGenre.toLowerCase())
      .sort((a, b) => Number(a.decade) - Number(b.decade))

    return {
      year,
      rating,
      votes,
      runtime,
      decade,
      decadeAvgRating,
      ratingVsDecadeDiff,
      primaryGenre,
      genreAvgRating,
      ratingVsGenreDiff,
      overallAvgRating,
      rank,
      percentile,
      clusterInfo,
      primaryGenreTrends,
    }
  }, [selectedMovie, decades, genres, genreTrends, movies])

  const cardClass = `rounded-2xl border transition-all duration-300 ${
    isDark
      ? 'border-slate-800/80 bg-slate-900/90 shadow-lg hover:border-slate-700'
      : 'border-slate-200/90 bg-white shadow-sm hover:shadow-lg'
  }`

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ============================================================
          IF NO MOVIE IS SELECTED: SEARCH & SELECTION INTERFACE
      ============================================================ */}
      {!selectedMovie ? (
        <div className="space-y-6">
          {/* BANNER HEADER */}
          <div
            className={`rounded-3xl border p-6 lg:p-8 transition-all duration-300 shadow-xl ${
              isDark
                ? 'border-indigo-800/40 bg-gradient-to-br from-slate-900 via-indigo-950/70 to-purple-950/40 text-white shadow-indigo-950/20'
                : 'border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-slate-900 shadow-md'
            }`}
          >
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-400 border border-indigo-500/20 mb-3 shadow-sm">
                <span>🔍</span> Movie Analytics & Intelligence Engine
              </span>
              <h2 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
                Search Any Movie for Complete Analytics
              </h2>
              <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Explore detailed individual metrics, rating benchmarks against release decade & genre averages, popularity rankings, and cluster classifications for over 3,500 movies.
              </p>
            </div>

            {/* QUICK PICK POPULAR MOVIES BUTTONS */}
            <div className="mt-6">
              <p className={`text-xs font-extrabold uppercase tracking-wider mb-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Popular Searches:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickPickMovies.map(m => (
                  <button
                    key={m.tconst}
                    onClick={() => onSelectMovie(m)}
                    className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shadow-sm ${
                      isDark
                        ? 'border-slate-700/80 bg-slate-800/90 text-slate-200 hover:border-indigo-500 hover:bg-indigo-950/70 hover:text-white'
                        : 'border-slate-300 bg-white text-slate-800 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-950'
                    }`}
                  >
                    <span>🎬</span>
                    <span>{m.primaryTitle}</span>
                    <span className="text-[10px] text-amber-500 font-extrabold">⭐ {m.averageRating}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SEARCH & FILTER CONTROLS */}
          <div className={`${cardClass} p-6`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              {/* SEARCH INPUT */}
              <div className="md:col-span-6">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Search Movie Title
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Type movie name e.g. Inception, Avatar, Titanic..."
                    className={`w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none transition-all duration-200 shadow-sm ${
                      isDark
                        ? 'border-slate-700/80 bg-slate-800 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                        : 'border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                    }`}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* GENRE FILTER */}
              <div className="md:col-span-3">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Genre Filter
                </label>
                <select
                  value={selectedGenreFilter}
                  onChange={e => setSelectedGenreFilter(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all duration-200 cursor-pointer shadow-sm ${
                    isDark
                      ? 'border-slate-700/80 bg-slate-800 text-white focus:border-indigo-500'
                      : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-indigo-600'
                  }`}
                >
                  {availableGenresList.map(g => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* MIN RATING FILTER */}
              <div className="md:col-span-3">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Min Rating ({minRatingFilter > 0 ? `${minRatingFilter}+` : 'All'})
                </label>
                <select
                  value={minRatingFilter}
                  onChange={e => setMinRatingFilter(Number(e.target.value))}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all duration-200 cursor-pointer shadow-sm ${
                    isDark
                      ? 'border-slate-700/80 bg-slate-800 text-white focus:border-indigo-500'
                      : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-indigo-600'
                  }`}
                >
                  <option value={0}>All Ratings</option>
                  <option value={7.0}>7.0+ Rated</option>
                  <option value={8.0}>8.0+ Highly Rated</option>
                  <option value={8.5}>8.5+ Masterpieces</option>
                </select>
              </div>
            </div>

            <div className={`mt-4 flex items-center justify-between text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>Showing {filteredMovies.length} matching movies out of {movies.length}</span>
              {(searchTerm || selectedGenreFilter !== 'All' || minRatingFilter > 0) && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedGenreFilter('All')
                    setMinRatingFilter(0)
                  }}
                  className="text-indigo-500 hover:underline font-bold"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* MOVIES GRID RESULT */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMovies.slice(0, 30).map(movie => (
              <div
                key={movie.tconst}
                onClick={() => onSelectMovie(movie)}
                className={`${cardClass} p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-indigo-500 flex flex-col justify-between group shadow-sm hover:shadow-xl`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-base font-bold transition-colors duration-200 group-hover:text-indigo-400 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {movie.primaryTitle}
                    </h3>
                    <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-extrabold text-amber-500 border border-amber-500/30 shrink-0 shadow-sm">
                      ⭐ {Number(movie.averageRating).toFixed(1)}
                    </span>
                  </div>

                  <div className={`mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>📅 {movie.startYear}</span>
                    <span>⏱️ {Number(movie.runtimeMinutes) || 90} min</span>
                    <span>👍 {Number(movie.numVotes).toLocaleString()} votes</span>
                  </div>

                  <div className="mt-3.5 flex flex-wrap gap-1.5">
                    {movie.genres.split(',').map(genre => (
                      <span
                        key={genre}
                        className={`rounded-md px-2.5 py-0.5 text-[11px] font-semibold border ${
                          isDark
                            ? 'border-slate-800 bg-slate-950 text-slate-300'
                            : 'border-slate-200 bg-slate-100 text-slate-700'
                        }`}
                      >
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-bold ${
                  isDark ? 'border-slate-800 text-indigo-400' : 'border-slate-100 text-indigo-600'
                }`}>
                  <span>Cluster {movie.cluster}</span>
                  <span className="group-hover:translate-x-1.5 transition-transform duration-200">
                    Analyze Movie Analytics →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredMovies.length === 0 && (
            <div className={`${cardClass} p-12 text-center`}>
              <span className="text-4xl animate-bounce">🎬</span>
              <h3 className={`mt-3 text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                No movies found matching your search
              </h3>
              <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Try adjusting your search terms or resetting genre/rating filters.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ============================================================
            DETAILED MOVIE ANALYTICS PAGE FOR SELECTED MOVIE
        ============================================================ */
        movieAnalytics && (
          <div className="space-y-8 animate-scale-up">
            {/* NAVIGATION / BACK BUTTON BAR */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => onSelectMovie(null)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md cursor-pointer ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-200 hover:border-slate-600 hover:bg-slate-700'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>← Back to Movie Search</span>
              </button>

              <button
                onClick={onNavigateToDashboard}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md cursor-pointer ${
                  isDark
                    ? 'border-indigo-800/60 bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/60'
                    : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                <span>📊 Back to Main Dashboard</span>
              </button>
            </div>

            {/* MOVIE HERO BANNER */}
            <div
              className={`rounded-3xl border p-6 lg:p-8 shadow-2xl transition-all duration-300 ${
                isDark
                  ? 'border-indigo-800/40 bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 text-white shadow-indigo-950/30'
                  : 'border-indigo-100 bg-gradient-to-r from-indigo-50/90 via-white to-purple-50 text-slate-900 shadow-md'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-extrabold text-amber-500 border border-amber-500/40 flex items-center gap-1 shadow-sm">
                      ⭐ IMDb {movieAnalytics.rating.toFixed(1)} / 10
                    </span>
                    <span className="rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-extrabold text-blue-400 border border-blue-500/40 shadow-sm">
                      📅 {movieAnalytics.year} Release
                    </span>
                    <span className={`rounded-full px-3.5 py-1 text-xs font-extrabold border shadow-sm ${movieAnalytics.clusterInfo.color}`}>
                      {movieAnalytics.clusterInfo.label}
                    </span>
                  </div>

                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                    {selectedMovie.primaryTitle}
                  </h1>

                  <div className={`mt-3 flex flex-wrap items-center gap-4 text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <span>⏱️ Runtime: <strong>{movieAnalytics.runtime} min</strong></span>
                    <span>👍 Audience Votes: <strong>{movieAnalytics.votes.toLocaleString()}</strong></span>
                    <span>🏆 Dataset Popularity: <strong>Top {movieAnalytics.percentile}%</strong></span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedMovie.genres.split(',').map(genre => (
                      <span
                        key={genre}
                        className={`rounded-lg px-3 py-1 text-xs font-bold border shadow-sm ${
                          isDark
                            ? 'border-slate-700 bg-slate-800/90 text-indigo-300'
                            : 'border-indigo-200 bg-white text-indigo-800'
                        }`}
                      >
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* OVERALL SCORE ACCENT CARD */}
                <div className={`shrink-0 rounded-2xl border p-6 text-center max-w-xs transition-transform duration-300 hover:scale-105 ${
                  isDark ? 'border-slate-800 bg-slate-950/80 shadow-xl' : 'border-slate-200 bg-white shadow-md'
                }`}>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    IMDb Rating vs Decade
                  </p>
                  <div className="mt-2 text-4xl font-black text-amber-500 flex items-center justify-center gap-1">
                    <span>{movieAnalytics.rating.toFixed(1)}</span>
                  </div>
                  <p className={`mt-1 text-xs font-bold ${
                    movieAnalytics.ratingVsDecadeDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {movieAnalytics.ratingVsDecadeDiff >= 0 ? '+' : ''}
                    {movieAnalytics.ratingVsDecadeDiff.toFixed(2)} pts vs {movieAnalytics.decade}s decade avg ({movieAnalytics.decadeAvgRating.toFixed(2)})
                  </p>
                </div>
              </div>
            </div>

            {/* COMPARATIVE KPI METRIC CARDS (4 CARDS) */}
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {/* 1. DECADE BENCHMARK */}
              <div className={`${cardClass} p-5 hover:-translate-y-1 transition-transform duration-300`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Decade Rating Benchmark
                </p>
                <h3 className={`mt-2 text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {movieAnalytics.rating.toFixed(1)} vs {movieAnalytics.decadeAvgRating.toFixed(2)}
                </h3>
                <p className={`mt-1 text-xs ${movieAnalytics.ratingVsDecadeDiff >= 0 ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                  {movieAnalytics.ratingVsDecadeDiff >= 0
                    ? `+${movieAnalytics.ratingVsDecadeDiff.toFixed(2)} higher than ${movieAnalytics.decade}s average`
                    : `${movieAnalytics.ratingVsDecadeDiff.toFixed(2)} lower than ${movieAnalytics.decade}s average`}
                </p>
              </div>

              {/* 2. GENRE BENCHMARK */}
              <div className={`${cardClass} p-5 hover:-translate-y-1 transition-transform duration-300`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {movieAnalytics.primaryGenre} Genre Benchmark
                </p>
                <h3 className={`mt-2 text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {movieAnalytics.rating.toFixed(1)} vs {movieAnalytics.genreAvgRating.toFixed(2)}
                </h3>
                <p className={`mt-1 text-xs ${movieAnalytics.ratingVsGenreDiff >= 0 ? 'text-emerald-500 font-bold' : 'text-slate-400'}`}>
                  {movieAnalytics.ratingVsGenreDiff >= 0
                    ? `+${movieAnalytics.ratingVsGenreDiff.toFixed(2)} above ${movieAnalytics.primaryGenre} genre average`
                    : `${movieAnalytics.ratingVsGenreDiff.toFixed(2)} vs ${movieAnalytics.primaryGenre} genre average`}
                </p>
              </div>

              {/* 3. POPULARITY RANKING */}
              <div className={`${cardClass} p-5 hover:-translate-y-1 transition-transform duration-300`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Vote Volume Rank
                </p>
                <h3 className={`mt-2 text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  #{movieAnalytics.rank.toLocaleString()}
                </h3>
                <p className="mt-1 text-xs text-blue-500 font-bold">
                  Top {movieAnalytics.percentile}% most voted movies
                </p>
              </div>

              {/* 4. CLUSTER FEATURE ASSIGNMENT */}
              <div className={`${cardClass} p-5 hover:-translate-y-1 transition-transform duration-300`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Unsupervised Cluster
                </p>
                <h3 className={`mt-2 text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Cluster {selectedMovie.cluster}
                </h3>
                <p className={`mt-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {movieAnalytics.clusterInfo.desc}
                </p>
              </div>
            </section>

            {/* VISUAL MOVIE ANALYTICS CHARTS SECTION */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* CHART 1: RATING BENCHMARKS COMPARISON */}
              <div className={`${cardClass} p-6`}>
                <div className="mb-4">
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    IMDb Rating Comparison Benchmarks
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Movie rating compared against release decade, genre, and overall dataset averages
                  </p>
                </div>

                <Plot
                  data={[
                    {
                      x: [
                        selectedMovie.primaryTitle,
                        `${movieAnalytics.decade}s Decade Avg`,
                        `${movieAnalytics.primaryGenre} Genre Avg`,
                        'Dataset Overall Avg',
                      ],
                      y: [
                        movieAnalytics.rating,
                        movieAnalytics.decadeAvgRating,
                        movieAnalytics.genreAvgRating,
                        movieAnalytics.overallAvgRating,
                      ],
                      type: 'bar',
                      marker: {
                        color: [
                          '#f59e0b',
                          isDark ? '#3b82f6' : '#2563eb',
                          isDark ? '#10b981' : '#059669',
                          isDark ? '#8b5cf6' : '#7c3aed',
                        ],
                      },
                      hovertemplate:
                        '<b>Benchmark:</b> %{x}<br><b>Average Rating:</b> %{y:.2f}<extra></extra>',
                      name: 'Rating',
                    },
                  ]}
                  layout={{
                    autosize: true,
                    height: 380,
                    paper_bgcolor: plotlyTheme.paper_bgcolor,
                    plot_bgcolor: plotlyTheme.plot_bgcolor,
                    font: plotlyTheme.font,
                    margin: { l: 60, r: 20, t: 20, b: 80 },
                    xaxis: {
                      tickangle: -15,
                      gridcolor: plotlyTheme.gridcolor,
                      tickfont: { color: plotlyTheme.tickcolor, size: 11 },
                    },
                    yaxis: {
                      title: { text: 'IMDb Rating Scale (0 - 10)', font: { color: plotlyTheme.font.color, size: 12 } },
                      range: [0, 10],
                      gridcolor: plotlyTheme.gridcolor,
                      tickfont: { color: plotlyTheme.tickcolor, size: 11 },
                    },
                    hoverlabel: plotlyTheme.hoverlabel,
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>

              {/* CHART 2: HISTORICAL GENRE EVOLUTION FOR THIS MOVIE */}
              <div className={`${cardClass} p-6`}>
                <div className="mb-4">
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {movieAnalytics.primaryGenre} Genre Production Over Time
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Historical movie volume for {movieAnalytics.primaryGenre} (highlighting {movieAnalytics.decade}s)
                  </p>
                </div>

                <Plot
                  data={[
                    {
                      x: movieAnalytics.primaryGenreTrends.map(r => r.decade),
                      y: movieAnalytics.primaryGenreTrends.map(r => Number(r.movie_count)),
                      type: 'scatter',
                      mode: 'lines+markers',
                      line: {
                        color: isDark ? '#3b82f6' : '#2563eb',
                        width: 3,
                      },
                      marker: {
                        color: movieAnalytics.primaryGenreTrends.map(r =>
                          r.decade === movieAnalytics.decade ? '#f59e0b' : (isDark ? '#3b82f6' : '#2563eb')
                        ),
                        size: movieAnalytics.primaryGenreTrends.map(r =>
                          r.decade === movieAnalytics.decade ? 12 : 6
                        ),
                      },
                      hovertemplate:
                        '<b>Decade:</b> %{x}<br><b>Movies:</b> %{y:,}<extra></extra>',
                      name: movieAnalytics.primaryGenre,
                    },
                  ]}
                  layout={{
                    autosize: true,
                    height: 380,
                    paper_bgcolor: plotlyTheme.paper_bgcolor,
                    plot_bgcolor: plotlyTheme.plot_bgcolor,
                    font: plotlyTheme.font,
                    margin: { l: 60, r: 20, t: 20, b: 60 },
                    xaxis: {
                      title: { text: 'Decade', font: { color: plotlyTheme.font.color, size: 12 } },
                      gridcolor: plotlyTheme.gridcolor,
                      tickfont: { color: plotlyTheme.tickcolor, size: 11 },
                    },
                    yaxis: {
                      title: { text: 'Number of Movies', font: { color: plotlyTheme.font.color, size: 12 } },
                      gridcolor: plotlyTheme.gridcolor,
                      tickfont: { color: plotlyTheme.tickcolor, size: 11 },
                    },
                    hoverlabel: plotlyTheme.hoverlabel,
                  }}
                  config={{ responsive: true, displayModeBar: false }}
                  style={{ width: '100%' }}
                />
              </div>
            </section>
          </div>
        )
      )}
    </div>
  )
}
