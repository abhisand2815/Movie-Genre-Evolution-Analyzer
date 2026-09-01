export type ThemeMode = 'dark' | 'light'

export type KpiRow = {
  metric: string
  value: string
}

export type GenreRow = {
  genre: string
  movie_count: string
  avg_rating?: string
  avg_votes?: string
}

export type DecadeRow = {
  decade: string
  movie_count: string
  avg_rating: string
  avg_votes?: string
}

export type GenreTrendRow = {
  decade: string
  genre: string
  movie_count: string
}

export type ClusterRow = {
  cluster: string
  movie_count: string
}

export type MovieSearchRow = {
  tconst: string
  primaryTitle: string
  startYear: string
  runtimeMinutes: string
  genres: string
  averageRating: string
  numVotes: string
  cluster: string
}
