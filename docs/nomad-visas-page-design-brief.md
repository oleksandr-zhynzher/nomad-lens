# Design Brief — Nomad Visas Page

## Context

This is a redesign brief for the **Nomad Visas** page of Nomad Lens — a dark-themed web app that helps remote workers find the best country to live and work in. The existing design system is dark (near-black backgrounds), uses copper/amber as the primary accent, and employs a monospaced font (IBM Plex Mono) for numbers alongside a clean geometric sans-serif (Geist) for UI text.

Please match the existing visual language of the app — do not introduce a new style. The goal is a design that feels cohesive with the rest of the product.

---

## Page Goal

Help digital nomads quickly understand what nomad visa programmes exist, compare them at a glance, and dive into the details of any one country.

---

## Data Available

### Section 1 — Overview / General Stats

These are aggregate numbers computed from all countries that have a nomad visa programme:

| Datum                                 | Type    | Example |
| ------------------------------------- | ------- | ------- |
| Total countries with a nomad visa     | integer | 52      |
| Countries with tax-exempt status      | integer | 8       |
| Countries with a free visa (cost = 0) | integer | 4       |

> These numbers should feel prominent and scannable — they give the user an immediate sense of scale before they dive into the list.

---

### Section 2 — Country List

Each country in the list has the following data points:

#### Identity

- Country name (string)
- Country flag (image)
- Country ISO code (2-letter string, e.g. `PT`, `DE`)

#### Visa Programme

- **Visa name** — official name of the programme (string, e.g. "D8 Digital Nomad Visa")
- **Official URL** — link to the government page (URL)
- **Last updated** — date the data was last verified (ISO date string)

#### Duration

- **Initial stay** — months granted on first entry (integer, e.g. `12`)
- **Max extension** — how many months it can be extended up to (integer, e.g. `24`)
- **Renewable** — whether the visa can be renewed after max extension (boolean)

#### Cost

- **Amount** — visa application fee (number, e.g. `75`)
- **Currency** — currency of the fee (string, e.g. `EUR`)
- **Notes** — free-text clarification (string, e.g. "Residency permit ~€83 extra")

#### Income Requirement

- **Monthly minimum** — required monthly income in local currency (number or null)
- **Annual minimum** — required annual income (number or null)
- **Currency** — currency of the requirement (string)
- **Notes** — free-text clarification (string)

#### Tax Status

- **Status** — one of three categories: `exempt`, `standard`, or `special`
- **Rate** — percentage tax rate (number or null — may be null for progressive systems)
- **Notes** — free-text explanation of the tax regime (string)

#### Eligibility

- **Minimum age** — integer (usually 18)
- **Requirements** — list of conditions (array of strings, e.g. "Remote employment contract with a non-local entity", "Valid passport (6+ months)", "Health insurance")

#### Benefits

- List of perks the visa programme offers (array of strings, e.g. "Path to permanent residency after 5 years", "Access to Schengen Area", "Family reunification allowed")

#### Application Process

- **Online** — whether the application can be submitted online (boolean)
- **Processing time** — estimated wait (string, e.g. "30–60 days")
- **Required documents** — list of documents to prepare (array of strings)

---

## Structure

The page has **two main sections**:

1. **Overview section** — showcases the aggregate stats and sets the scene. This is at the top and should feel like a high-level introduction to the data: how many countries, how many are tax-exempt, how many have free visas, etc.

2. **Country list section** — displays all countries with their nomad visa data in full detail. Each entry exposes all the fields described above. Users need to be able to browse/search/compare entries.

---

## Interaction Notes (for reference, not prescriptive)

- There is a search input to filter countries by name
- Columns are sortable: Country, Duration, Cost, Income Requirement, Tax Status
- A country row can link through to the individual Country Detail Page

---

## Design Direction

Please design this freely — no specific layout, component type, or visual pattern is prescribed. Make it feel modern and information-dense but not overwhelming. It should be consistent with the existing dark design system of the product.

The only hard requirement is that **all the data fields listed above** are accessible to the user in some way within these two sections.
