# Budget Matcher Page — Design Brief

## Concept

The Budget Matcher helps digital nomads answer the question: **"Where in the world can I live comfortably on my budget?"**

The user enters a monthly budget and configures their lifestyle profile. The system calculates a per-country monthly cost and comfort score for **216 countries**, then presents ranked results showing which countries fit best.

All state is persisted in localStorage so the user returns to their last configuration.

## User Inputs

| Input                  | Options                                                    | Default    |
| ---------------------- | ---------------------------------------------------------- | ---------- |
| **Monthly budget**     | $300 – $10,000 (slider + number input)                     | $2,000     |
| **Apartment size**     | 1 Bedroom · 2 Bedrooms · 3 Bedrooms                        | 1 BR       |
| **Housing preference** | Major City · Smaller City (only shown for 1 BR)            | Major City |
| **Number of people**   | Free numeric input (1, 2, 3, …) — no upper limit           | 1          |
| **Quality blend**      | 0–100% slider (pure affordability ↔ country quality score) | 30%        |
| **Category weights**   | 0–100 slider per category (7 categories)                   | All 100    |

### Category weights (7 sliders)

Each spending category can be weighted 0–100 to reflect how important it is to the user:

1. **Housing** (rent)
2. **Groceries**
3. **Dining out**
4. **Transport**
5. **Utilities & Internet**
6. **Coworking**
7. **Health Insurance**

Setting a weight to 0 effectively removes that category from the cost calculation.

## Per-Country Output Data

For each country that has cost data, the system produces:

| Field             | Description                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Country**       | Name, flag, region                                                                                                       |
| **Comfort score** | 0–99 blended score (budget headroom + country quality)                                                                   |
| **Monthly cost**  | Total estimated monthly spend (USD) based on user's profile                                                              |
| **Surplus**       | Budget minus monthly cost (can be negative)                                                                              |
| **Breakdown**     | 7 individual category costs (housing, groceries, dining, transport, utilities, coworking, health insurance) — all in USD |

Results are sorted by comfort score descending.

## How Costs Scale

- **Rent**: For 1BR, determined by housing preference (major city / smaller city) — 2 data points per country. For 2BR and 3BR, a single national average per country (1 data point each). The housing preference toggle is hidden when 2BR or 3BR is selected.
- **Other categories**: Base values (calibrated for a single nomad) are scaled by the number of people using per-category formulas:
  - Groceries: `base × (1 + (n−1) × 0.8)`
  - Dining out: `base × n`
  - Transport: `base × (1 + (n−1) × 0.6)`
  - Utilities & Internet: `base × (1 + (n−1) × 0.12)`
  - Coworking: `base × 1` (does not scale)
  - Health Insurance: `base × n`
- **Category weights**: Applied as a percentage multiplier (weight / 100) to each category's scaled cost.

## Data Coverage

- 216 countries with Numbeo-calibrated cost-of-living data (April 2026)
- Each country also has quality-of-life scores (safety, internet speed, healthcare, climate, etc.) used in the quality blend
- Rent data: 1BR has major-city and smaller-city values; 2BR and 3BR each have a single national average

## Additional Context

- The app supports 3 languages: English, Ukrainian, Russian
- Dark theme throughout
- The page lives at `/budget` (with language prefix: `/en/budget`, `/ua/budget`, `/ru/budget`)
- There is a hero section at the top of the page
- The country cards need to work well on both desktop and mobile
