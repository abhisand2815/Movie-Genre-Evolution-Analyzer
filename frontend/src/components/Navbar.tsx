import React from 'react'
import type { ThemeMode } from '../types'

interface NavbarProps {
  theme: ThemeMode
  onToggleTheme: () => void
  activePage: 'dashboard' | 'movie-analytics'
  onSelectPage: (page: 'dashboard' | 'movie-analytics') => void
  selectedMovieTitle?: string
}

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  activePage,
  onSelectPage,
  selectedMovieTitle,
}) => {
  const isDark = theme === 'dark'

  return (
    <header
      className={`border-b sticky top-0 z-50 backdrop-blur-xl transition-all duration-300 ${
        isDark
          ? 'border-slate-800/80 bg-slate-950/80 text-white shadow-lg shadow-black/20'
          : 'border-slate-200/80 bg-white/85 text-slate-900 shadow-sm'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* BRAND LOGO & TITLE */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectPage('dashboard')}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-xl shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
              🎬
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight sm:text-xl flex items-center gap-2">
                <span
                  className={
                    isDark
                      ? 'bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent'
                      : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 bg-clip-text text-transparent'
                  }
                >
                  Movie Genre Evolution Analyzer
                </span>
              </h1>
              <p
                className={`text-[11px] font-medium tracking-wide ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Interactive IMDb Data Intelligence
              </p>
            </div>
          </div>

          {/* PAGE SWITCHER NAVIGATION TABS */}
          <nav
            className={`flex items-center gap-1.5 rounded-xl p-1.5 border transition-all duration-300 ${
              isDark
                ? 'bg-slate-900/90 border-slate-800/80 shadow-inner'
                : 'bg-slate-100/90 border-slate-200/80'
            }`}
          >
            <button
              onClick={() => onSelectPage('dashboard')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                activePage === 'dashboard'
                  ? isDark
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/50'
                    : 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>📊</span>
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onSelectPage('movie-analytics')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 active:scale-95 ${
                activePage === 'movie-analytics'
                  ? isDark
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/50'
                    : 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>🔍</span>
              <span>Movie Analytics</span>
              {selectedMovieTitle && (
                <span className="hidden lg:inline-block truncate max-w-[120px] rounded-md bg-indigo-950/80 px-2 py-0.5 text-[10px] text-indigo-300 border border-indigo-700/50 font-bold animate-fade-in">
                  {selectedMovieTitle}
                </span>
              )}
            </button>
          </nav>

          {/* LIGHT / DARK MODE TOGGLE BUTTON */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleTheme}
              aria-label="Toggle Light and Dark Mode"
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-1.5 text-xs sm:text-sm font-semibold shadow-sm transition-all duration-300 active:scale-95 hover:shadow-md ${
                isDark
                  ? 'border-slate-700/80 bg-slate-800/90 text-amber-300 hover:border-amber-500/50 hover:bg-slate-700/90'
                  : 'border-slate-300 bg-slate-50 text-indigo-900 hover:border-indigo-400 hover:bg-white'
              }`}
            >
              <span className="text-base transition-transform duration-300 hover:rotate-45">
                {isDark ? '☀️' : '🌙'}
              </span>
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
