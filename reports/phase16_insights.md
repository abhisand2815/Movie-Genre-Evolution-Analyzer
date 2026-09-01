# Movie Genre Evolution Analyzer — Phase 16

## Insights & Findings

### Major Findings

1. The final analytical dataset contains 569,655 movie records.
2. Drama is the most prevalent genre, with approximately 240,101 genre assignments.
3. The overall mean IMDb rating is 6.13.
4. The decade with the highest movie volume is the 2010s, with 162,838 movies.
5. The highest average IMDb rating is observed in the 2020s, at 6.26.

### Statistical Validation

- **Spearman Correlation** (IMDb Rating vs Votes): statistic = -0.1270, p-value = 0; result is statistically significant at α = 0.05.
- **One-Way ANOVA** (IMDb Rating across Decades): statistic = 274.2440, p-value = 0; result is statistically significant at α = 0.05.
- **Chi-Square Test** (Genre vs Decade): statistic = 99794.8904, p-value = 0; result is statistically significant at α = 0.05.

### Limitations

- Dataset coverage may not represent all global cinema.
- Historical periods may contain unequal numbers of observations.
- Genre classifications may contain multi-genre assignments.
- Vote counts can be affected by popularity and audience exposure.
- Correlation does not imply causation.
- Clusters represent statistical similarity based on selected features.
- Missing or incomplete data may influence some estimates.
- IMDb ratings are user-generated measurements.

### Conclusion

The project combines data analytics, statistical validation, machine learning, and visualization to investigate long-term movie genre evolution and related movie characteristics.