# Nomad Lens

> Country quality-of-life ranking tool with user-adjustable scoring weights.

Compare countries across 9 dimensions — Economy, Healthcare, Education, Environment, Climate, Safety, Internet & Infrastructure, Happiness, and Human Development — and drag sliders to re-rank them based on what matters to you.

## Data Sources

| Category | Source | Type |
|---|---|---|
| Economy, Healthcare, Education, Environment, Infrastructure | World Bank API | Live API |
| Healthcare (supplemental) | WHO GHO | Live API |
| Climate | Open-Meteo | Live API |
| Country metadata | REST Countries | Live API |
| Happiness | World Happiness Report | Local JSON |
| Human Development | UNDP HDI | Local JSON |
| Safety / Peace | Global Peace Index | Local JSON |
| Crime | UNODC Homicide | Local JSON |

## Tech Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS + Headless UI
- **Backend:** Node.js + Express + TypeScript (runs on AWS Lambda)
- **Infrastructure:** AWS CDK — Lambda + API Gateway + S3 + CloudFront
- **Local dev:** Docker Compose

## Getting Started

### Prerequisites

- Node.js 22+
- Docker Desktop

### Local Development

```bash
# Install dependencies
npm install

# Start both frontend and backend with hot reload
docker compose up
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/api/health

### Updating Local Data

The files in `server/src/data/` are manually maintained JSON files. To update them:

1. Download the latest data from the source (links in each JSON file's `_source` field)
2. Update the JSON file following the existing schema
3. Commit with: `git commit -m "chore(data): update <dataset> to <year>"`

## Contributing

All commits follow [Conventional Commits](https://www.conventionalcommits.org/). Use `npm run commit` for an interactive prompt.

**Scopes:** `client` | `server` | `infra` | `data` | `deps` | `docker`

## License

MIT
