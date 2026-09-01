import React, { useMemo } from 'react'
import Plot from 'react-plotly.js'
import type {
  KpiRow,
  GenreRow,
  DecadeRow,
  GenreTrendRow,
  ClusterRow,
  ThemeMode,
} from '../types'

interface DashboardViewProps {
  theme: ThemeMode
  kpis: KpiRow[]
  genres: GenreRow[]
  decades: DecadeRow[]
  genreTrends: GenreTrendRow[]
  clusters: ClusterRow[]
  selectedGenre: string
  onSelectGenre: (genre: string) => void
  onNavigateToMovieSearch?: () => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  theme,
  kpis,
  genres,
  decades,
  genreTrends,
  clusters,
  selectedGenre,
  onSelectGenre,
  onNavigateToMovieSearch,
}) => {
  const isDark = theme === 'dark'

  // Plotly Theme Configurations depending on light/dark mode
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

  // Genres sorted by movie_count descending
  const sortedGenres = useMemo(() => {
    return [...genres].sort(
      (a, b) => Number(b.movie_count) - Number(a.movie_count)
    )
  }, [genres])

  // Available unique genres for the dropdown
  const availableGenres = useMemo(() => {
    if (genreTrends.length > 0) {
      const uniqueGenres = Array.from(
        new Set(genreTrends.map(row => row.genre))
      ).filter(Boolean)

      const genreOrderMap = new Map(
        sortedGenres.map((g, idx) => [g.genre, idx])
      )

      return uniqueGenres.sort((a, b) => {
        const orderA = genreOrderMap.get(a) ?? 999
        const orderB = genreOrderMap.get(b) ?? 999
        return orderA - orderB
      })
    }
    return sortedGenres.map(g => g.genre)
  }, [genreTrends, sortedGenres])

  // Genre trend filtered by selected genre
  const filteredGenreTrend = useMemo(() => {
    if (!selectedGenre) return []
    return genreTrends
      .filter(row => row.genre === selectedGenre)
      .sort((a, b) => Number(a.decade) - Number(b.decade))
  }, [genreTrends, selectedGenre])

  // Key Insights calculation
  const keyInsights = useMemo(() => {
    if (
      sortedGenres.length === 0 ||
      decades.length === 0 ||
      clusters.length === 0
    ) {
      return null
    }

    const topGenre = sortedGenres[0]

    const sortedDecades = [...decades].sort(
      (a, b) => Number(b.movie_count) - Number(a.movie_count)
    )
    const peakDecade = sortedDecades[0]

    const ratings = decades.map(d => Number(d.avg_rating)).filter(Boolean)
    const minRating = Math.min(...ratings)
    const maxRating = Math.max(...ratings)

    const sortedClusters = [...clusters].sort(
      (a, b) => Number(b.movie_count) - Number(a.movie_count)
    )
    const largestCluster = sortedClusters[0]

    return {
      topGenre: `${topGenre.genre} is the most prevalent genre in the dataset with ${Number(
        topGenre.movie_count
      ).toLocaleString()} movies.`,
      productionTrend: `Movie production surged significantly, reaching its peak in the ${
        peakDecade.decade
      }s with ${Number(peakDecade.movie_count).toLocaleString()} releases.`,
      ratingTrend: `Average IMDb ratings remain relatively stable across most decades, hovering between ${minRating.toFixed(
        2
      )} and ${maxRating.toFixed(2)}.`,
      largestCluster: `Cluster ${largestCluster.cluster} contains the largest number of movies with ${Number(
        largestCluster.movie_count
      ).toLocaleString()} titles.`,
    }
  }, [sortedGenres, decades, clusters])

  const getKpiValue = (metricName: string): string => {
    return kpis.find(k => k.metric === metricName)?.value || '0'
  }

  // Common Card Class depending on theme with smooth micro-animations
  const cardClass = `rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 ${
    isDark
      ? 'border-slate-800/80 bg-slate-900/90 shadow-lg hover:border-slate-700 hover:shadow-indigo-950/20'
      : 'border-slate-200/90 bg-white shadow-sm hover:shadow-xl hover:border-indigo-200'
  }`

  return (
    <div className="space-y-8 animate-fade-in">
      {/* QUICK SEARCH PROMPT BANNER */}
      {onNavigateToMovieSearch && (
        <div
          className={`flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border p-5 sm:p-6 transition-all duration-300 shadow-lg ${
            isDark
              ? 'border-indigo-800/50 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-purple-950/50 text-slate-200 shadow-indigo-950/30'
              : 'border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-purple-50 text-indigo-950 shadow-md'
          }`}
        >
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl text-white shadow-md transition-transform duration-300 hover:scale-110">
              🔎
            </span>
            <div>
              <h3 className="text-base font-bold sm:text-lg">Looking for a specific movie?</h3>
              <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-indigo-800'}`}>
                Search any movie title to view detailed comparative analytics, rating benchmarks, and feature cluster positioning.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToMovieSearch}
            className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            Search Movies →
          </button>
        </div>
      )}

      {/* ====================================================
          KPI SECTION (6 CARDS)
      ==================================================== */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. TOTAL MOVIES */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Movies
            </p>
            <span className={`rounded-xl p-2.5 text-blue-500 border transition-transform duration-300 hover:scale-110 ${isDark ? 'bg-blue-950/60 border-blue-800/40' : 'bg-blue-50 border-blue-200'}`}>
              🎥
            </span>
          </div>
          <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {Number(getKpiValue('Total Movies')).toLocaleString()}
          </h2>
        </div>

        {/* 2. AVERAGE RATING */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Average Rating
            </p>
            <span className={`rounded-xl p-2.5 text-amber-500 border transition-transform duration-300 hover:scale-110 ${isDark ? 'bg-amber-950/60 border-amber-800/40' : 'bg-amber-50 border-amber-200'}`}>
              ⭐
            </span>
          </div>
          <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {Number(getKpiValue('Average Rating')).toFixed(2)}
          </h2>
        </div>

        {/* 3. TOTAL VOTES */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Votes
            </p>
            <span className={`rounded-xl p-2.5 text-emerald-500 border transition-transform duration-300 hover:scale-110 ${isDark ? 'bg-emerald-950/60 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200'}`}>
              👍
            </span>
          </div>
          <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {Number(getKpiValue('Total Votes')).toLocaleString()}
          </h2>
        </div>

        {/* 4. AVERAGE RUNTIME */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Average Runtime
            </p>
            <span className={`rounded-xl p-2.5 text-purple-500 border transition-transform duration-300 hover:scale-110 ${isDark ? 'bg-purple-950/60 border-purple-800/40' : 'bg-purple-50 border-purple-200'}`}>
              ⏱️
            </span>
          </div>
          <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {Number(getKpiValue('Average Runtime')).toFixed(2)} min
          </h2>
        </div>

        {/* 5. EARLIEST MOVIE YEAR */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Earliest Movie Year
            </p>
            <span className={`rounded-xl p-2.5 text-cyan-500 border transition-transform duration-300 hover:scale-110 ${isDark ? 'bg-cyan-950/60 border-cyan-800/40' : 'bg-cyan-50 border-cyan-200'}`}>
              ⏳
            </span>
          </div>
          <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {Math.round(Number(getKpiValue('Earliest Movie Year')))}
          </h2>
        </div>

        {/* 6. LATEST MOVIE YEAR */}
        <div className={`${cardClass} p-6`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Latest Movie Year
            </p>
            <span className={`rounded-xl p-2.5 text-rose-500 border transition-transform duration-300 hover:scale-110 ${isDark ? 'bg-rose-950/60 border-rose-800/40' : 'bg-rose-50 border-rose-200'}`}>
              🚀
            </span>
          </div>
          <h2 className={`mt-3 text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {Math.round(Number(getKpiValue('Latest Movie Year')))}
          </h2>
        </div>
      </section>

      {/* ====================================================
          CHARTS SECTION (2x2 GRID)
      ==================================================== */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. GENRE POPULARITY */}
        <div className={`${cardClass} p-6`}>
          <div className="mb-4">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Genre Popularity
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total movie counts sorted in descending order
            </p>
          </div>

          <Plot
            data={[
              {
                x: sortedGenres.map(row => row.genre),
                y: sortedGenres.map(row => Number(row.movie_count)),
                type: 'bar',
                marker: {
                  color: isDark ? '#3b82f6' : '#2563eb',
                  line: {
                    color: isDark ? '#60a5fa' : '#1d4ed8',
                    width: 1,
                  },
                },
                hovertemplate:
                  '<b>Genre:</b> %{x}<br><b>Movies:</b> %{y:,}<extra></extra>',
                name: 'Movies',
              },
            ]}
            layout={{
              autosize: true,
              height: 380,
              paper_bgcolor: plotlyTheme.paper_bgcolor,
              plot_bgcolor: plotlyTheme.plot_bgcolor,
              font: plotlyTheme.font,
              margin: { l: 60, r: 20, t: 20, b: 120 },
              xaxis: {
                title: { text: 'Genre', font: { color: plotlyTheme.font.color, size: 12 } },
                tickangle: -45,
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

        {/* 2. GENRE TRENDS ACROSS DECADES */}
        <div className={`${cardClass} p-6`}>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Genre Trends Across Decades
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Select a genre to visualize production volume over time
              </p>
            </div>

            {/* DYNAMIC GENRE SELECTOR */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="genre-select"
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Genre:
              </label>
              <select
                id="genre-select"
                value={selectedGenre}
                onChange={e => onSelectGenre(e.target.value)}
                className={`rounded-xl border px-3 py-1.5 text-sm outline-none transition cursor-pointer shadow-sm ${
                  isDark
                    ? 'border-slate-700 bg-slate-800 text-white focus:border-indigo-500'
                    : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-indigo-600'
                }`}
              >
                {availableGenres.map(genreName => (
                  <option key={genreName} value={genreName}>
                    {genreName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Plot
            data={[
              {
                x: filteredGenreTrend.map(row => row.decade),
                y: filteredGenreTrend.map(row => Number(row.movie_count)),
                type: 'scatter',
                mode: 'lines+markers',
                line: {
                  color: isDark ? '#10b981' : '#059669',
                  width: 3,
                },
                marker: {
                  color: isDark ? '#10b981' : '#059669',
                  size: 7,
                },
                hovertemplate:
                  '<b>Decade:</b> %{x}<br><b>Movies:</b> %{y:,}<extra></extra>',
                name: selectedGenre || 'Selected Genre',
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

        {/* 3. AVERAGE IMDB RATING ACROSS DECADES */}
        <div className={`${cardClass} p-6`}>
          <div className="mb-4">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Average IMDb Rating Across Decades
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Historical rating trends (Scale 0 to 10)
            </p>
          </div>

          <Plot
            data={[
              {
                x: decades.map(row => row.decade),
                y: decades.map(row => Number(row.avg_rating)),
                type: 'scatter',
                mode: 'lines+markers',
                line: {
                  color: isDark ? '#f59e0b' : '#d97706',
                  width: 3,
                },
                marker: {
                  color: isDark ? '#f59e0b' : '#d97706',
                  size: 7,
                },
                hovertemplate:
                  '<b>Decade:</b> %{x}<br><b>Average Rating:</b> %{y:.2f}<extra></extra>',
                name: 'Average Rating',
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
                title: { text: 'Average IMDb Rating', font: { color: plotlyTheme.font.color, size: 12 } },
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

        {/* 4. MOVIE DISTRIBUTION ACROSS CLUSTERS */}
        <div className={`${cardClass} p-6`}>
          <div className="mb-4">
            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Movie Distribution Across Clusters
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Number of movies categorized into unsupervised feature clusters
            </p>
          </div>

          <Plot
            data={[
              {
                x: clusters.map(row => `Cluster ${row.cluster}`),
                y: clusters.map(row => Number(row.movie_count)),
                type: 'bar',
                marker: {
                  color: isDark ? '#8b5cf6' : '#7c3aed',
                  line: {
                    color: isDark ? '#a78bfa' : '#6d28d9',
                    width: 1,
                  },
                },
                hovertemplate:
                  '<b>Cluster:</b> %{x}<br><b>Movies:</b> %{y:,}<extra></extra>',
                name: 'Movies',
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
                title: { text: 'Cluster', font: { color: plotlyTheme.font.color, size: 12 } },
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

      {/* ====================================================
          KEY INSIGHTS SECTION
      ==================================================== */}
      {keyInsights && (
        <section className={`${cardClass} p-6 lg:p-8`}>
          <div className={`mb-6 flex items-center gap-3 border-b pb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xl shadow-md ${
              isDark
                ? 'bg-indigo-950/80 text-indigo-400 border-indigo-800/50'
                : 'bg-indigo-50 text-indigo-600 border-indigo-200'
            }`}>
              💡
            </span>
            <div>
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Key Insights
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Automated summary derived dynamically from loaded dataset KPIs
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Insight 1 */}
            <div className={`rounded-xl border p-4 border-l-4 border-l-blue-500 transition-transform duration-300 hover:scale-[1.02] ${
              isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/80'
            }`}>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-500 mb-1">
                Genre Dominance
              </p>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {keyInsights.topGenre}
              </p>
            </div>

            {/* Insight 2 */}
            <div className={`rounded-xl border p-4 border-l-4 border-l-emerald-500 transition-transform duration-300 hover:scale-[1.02] ${
              isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/80'
            }`}>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">
                Production Peak
              </p>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {keyInsights.productionTrend}
              </p>
            </div>

            {/* Insight 3 */}
            <div className={`rounded-xl border p-4 border-l-4 border-l-amber-500 transition-transform duration-300 hover:scale-[1.02] ${
              isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/80'
            }`}>
              <p className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
                Rating Stability
              </p>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {keyInsights.ratingTrend}
              </p>
            </div>

            {/* Insight 4 */}
            <div className={`rounded-xl border p-4 border-l-4 border-l-purple-500 transition-transform duration-300 hover:scale-[1.02] ${
              isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/80'
            }`}>
              <p className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-1">
                Cluster Breakdown
              </p>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {keyInsights.largestCluster}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
