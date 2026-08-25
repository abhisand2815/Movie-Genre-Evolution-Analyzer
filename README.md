# Movie Genre Evolution Analyzer

An interactive Data Science and web-based analytics platform that studies how the movie industry and audience preferences have evolved across decades, using large-scale IMDb datasets.

The system processes movie metadata such as genre, release year, runtime, rating, and vote count to identify historical trends, detect emerging and declining genres, analyze genre combinations, and study changes in audience reception over time.

## Overview

The project follows a clear separation between data processing and presentation:

```
IMDb Dataset
    -> Data Processing
    -> Feature Engineering
    -> Statistical Analysis
    -> Trend Detection
    -> Python Backend (Flask / FastAPI)
    -> REST API
    -> HTML + CSS + JavaScript Frontend
    -> Interactive Dashboard
```

The frontend never reads raw data files or CSVs directly. All data is served through a REST API backed by a processed dataset and database, which keeps the system structured like a production-grade Data Science application rather than a standalone analysis script.

## Key Features

- **Genre Evolution Analysis** — tracks the growth or decline of individual genres over decades.
- **Genre Dominance** — identifies the most prominent genres in different time periods.
- **Rating Analysis** — compares audience ratings across genres and eras.
- **Runtime Evolution** — analyzes how movie duration has changed over time.
- **Genre Combination Analysis** — surfaces frequently occurring combinations such as Action + Adventure or Horror + Thriller.
- **Emerging and Declining Genre Detection** — flags genres with statistically significant growth or decline.
- **Statistical Validation** — applies hypothesis testing, correlation, ANOVA, and chi-square tests to confirm whether observed patterns are meaningful.
- **Interactive Dashboard** — presents trends through dynamic, filterable charts and visualizations.

## Technology Stack

**Data Science / Backend**
- Python
- Pandas, NumPy
- Scikit-learn
- SciPy / Statsmodels
- SQL (DuckDB)
- Flask or FastAPI

**Frontend**
- HTML5, CSS3, JavaScript
- Chart.js / Plotly.js
- Tailwind CSS (optional)

**Database**
- SQLite / PostgreSQL / DuckDB

**Data Source**
- IMDb Non-Commercial Datasets (`title.basics.tsv.gz`, `title.ratings.tsv.gz`)

**Tooling**
- Git, GitHub, VS Code

## Data Source

The project uses IMDb's publicly available non-commercial datasets:

- `title.basics.tsv.gz` — title, release year, runtime, and genre information.
- `title.ratings.tsv.gz` — average rating and vote count per title.

These datasets are merged, cleaned, and transformed into a single processed dataset used across all downstream analysis.

## Project Phases

| Phase | Focus | Main Tasks | Technology |
|---|---|---|---|
| 1 | Project Setup | Python, VS Code, Git/GitHub, project structure, virtual environment, libraries | Python, Git |
| 2 | Data Collection | Download IMDb datasets, organize raw data | IMDb |
| 3 | Data Understanding | Inspect columns, data types, dataset size, missing values, genre/year/rating distributions | Pandas, NumPy |
| 4 | Data Cleaning | Filter movies, handle missing values, clean years/runtime/genres, remove duplicates/outliers | Pandas |
| 5 | Data Integration | Merge title.basics + title.ratings, create final movie dataset, save processed data | Pandas |
| 6 | Feature Engineering | Create year, decade, era, movie age, genre count, genre indicators | Pandas, NumPy |
| 7 | Exploratory Data Analysis | Analyze movie counts, genres, ratings, votes, runtime and relationships | Pandas, Matplotlib, Seaborn |
| 8 | Genre Evolution Analysis | Genre popularity, genre share, dominant/emerging/declining genres, trends across decades | Pandas, Statistics |
| 9 | Statistical Analysis | Hypothesis testing, correlation, ANOVA, chi-square, confidence intervals | SciPy, Statistics |
| 10 | Genre Combination Analysis | Extract multi-genre combinations, analyze combinations over time, genre relationships | Pandas, Network Analysis |
| 11 | Advanced Analysis | Trend detection, growth/decline scoring, clustering, rating/runtime evolution | Scikit-learn, SciPy |
| 12 | SQL Integration | Store processed data, analytical queries, combine SQL with Python | DuckDB / SQL |
| 13 | Data Visualization | Time-series, heatmaps, interactive charts, genre networks | Plotly, D3.js |
| 14 | Interactive Web Application | Build complete frontend, filters, charts, animations, genre explorer, decade explorer | HTML, CSS, JavaScript, Chart.js/Plotly.js |
| 15 | Backend and API | Create APIs for genre evolution, ratings, decades, combinations and analysis | Python, FastAPI |
| 16 | Insights and Findings | Identify major trends, explain discoveries, statistical validation, limitations | Python, Research |
| 17 | GitHub and Documentation | README, architecture, methodology, dataset instructions, results, screenshots, requirements | Git/GitHub, Markdown |
| 18 | Deployment | Deploy frontend + backend, connect database/API, testing and final production setup | Vercel/Render/Railway |

## Research Questions

- How has cinema changed over time?
- Which genres are emerging or declining?
- Are movies becoming longer?
- Are genre combinations becoming more complex?
- How has audience reception changed across different genres and eras?

## Data Science Workflow

Python -> Pandas -> NumPy -> SQL -> EDA -> Feature Engineering -> Statistics -> Trend Analysis -> Visualization -> Interactive Dashboard

## Project Status

This project is under active development. Progress is tracked phase by phase as outlined above.

## License

To be determined.
