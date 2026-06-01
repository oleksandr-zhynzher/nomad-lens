# Nomad Lens

> Country quality-of-life ranking tool with user-adjustable scoring weights.

Compare countries across 9 dimensions — Economy, Healthcare, Education, Environment, Climate, Safety, Internet & Infrastructure, Happiness, and Human Development — and drag sliders to re-rank them based on what matters to you.

## Data Sources

| Category                                                    | Source                 | Type       |
| ----------------------------------------------------------- | ---------------------- | ---------- |
| Economy, Healthcare, Education, Environment, Infrastructure | World Bank API         | Live API   |
| Healthcare (supplemental)                                   | WHO GHO                | Live API   |
| Climate                                                     | Open-Meteo             | Live API   |
| Country metadata                                            | REST Countries         | Live API   |
| Happiness                                                   | World Happiness Report | Local JSON |
| Human Development                                           | UNDP HDI               | Local JSON |
| Safety / Peace                                              | Global Peace Index     | Local JSON |
| Crime                                                       | UNODC Homicide         | Local JSON |

## Tech Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS + React Router + i18next + Zustand
- **Backend:** Node.js + TypeScript + Express, packaged for AWS Lambda with serverless Express
- **Infrastructure:** AWS CDK — Lambda + API Gateway HTTP API + S3 + CloudFront + Route 53
- **Local dev:** npm workspaces; Docker Compose remains available for containerized local runs

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

### Updating Data

The files in `server/src/data/` are the checked-in source datasets bundled with the server and
static client build. To update them:

1. Download the latest data from the source (links in each JSON file's `_source` field)
2. Update the JSON file following the existing schema
3. Run `npm run generate` when source inputs change and review the generated `countries.json`
4. Run `npm run quality:pr` before merging
5. Run `npm run deploy` to build and deploy the app
6. Commit with: `git commit -m "chore(data): update <dataset> to <year>"`

### Deployment

Production is deployed with AWS CDK:

```bash
npm run deploy
```

The deploy script builds the server/client/infra workspaces and deploys CDK. The CDK stack
publishes the site at `https://www.nomad-lens.org` and
`https://nomad-lens.org` through CloudFront. It imports the existing Route 53 hosted zone and
CloudFront certificate; override them from `infra/` with
`npx cdk deploy -c hostedZoneId=<zone-id> -c certificateArn=<certificate-arn>`.

Production also deploys automatically on pushes to `main` through GitHub Actions OIDC using the
`nomad-lens-github-deploy` IAM role managed by CDK.

## Contributing

All commits follow [Conventional Commits](https://www.conventionalcommits.org/). Use `npm run commit` for an interactive prompt.

**Scopes:** `client` | `server` | `infra` | `data` | `deps` | `docker`

### Quality workflow

Run the fast PR gate before pushing:

```bash
npm run quality:pr
```

This blocks on Prettier formatting, ESLint, unit tests, and the client/server build. CI runs the same command for every pull request and for pushes to `main`.

Slower smoke/regression coverage runs on `main` and release delivery:

```bash
npm run quality:main
```

This includes the PR gate, Playwright E2E smoke tests, and a React Doctor scan. React Doctor findings are currently informational in CI while the roadmap raises the score to the target threshold; Prettier, ESLint, unit tests, builds, and main/release E2E failures block delivery.

## License

MIT
