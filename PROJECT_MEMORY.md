# Project Memory

## Purpose
- Build and maintain a standalone browser dashboard for the real-estate project `Das Ebert`.
- Primary delivery artifact is the static app in the repository root (`index.html`, `styles.css`, `app.js`).

## Active Skill Baseline
- Design guide source: `SKILL.md` at repository root.
- This design guide is mandatory for UI work in this project.
- Key constraints:
  - MLP-compliant color palette and typography.
  - 8px spacing grid.
  - Body text at least 16px.
  - Clear hover and focus states.
  - Responsive behavior for mobile and desktop.

## Current App Scope
- Customer selects between one 1-room apartment and one 5-room apartment.
- Customer enters taxable annual income, equity contribution, and investment horizon.
- Customer can adjust rent growth and property value growth.
- Customer can switch between `Grundtabelle` and `Splitting`.
- Customer can include income tax, solidarity surcharge, and church tax.
- App calculates annual and monthly liquidity before and after tax over up to 20 years.
- App compares customer wealth after 20 years `with investment` and `without investment`.
- The comparison baseline is a conservative managed portfolio (`Vergleichsdepot`) rather than a high-volatility equity benchmark.
- App shows project visuals and apartment floorplans from the expose.

## Data Basis And Assumptions
- Expose source file: `Exposé - das ebert.pdf`
- Sales sheet source file: `Verkaufsdatenblatt.jpg`
- Sales sheet contains ranges rather than a full unit-by-unit price list.
- Two sample apartments are therefore modeled with editable default assumptions.
- Tax logic is based on the current German income tax table and includes Soli and church tax options.
- Financing assumptions combine editable market financing inputs with optional KfW usage.
- Customer chooses how much equity to contribute.
- If total financing exceeds 100 % of the property purchase price, bank financing gets a `0.5 %-point` interest surcharge.
- Comparison asset is a conservative managed portfolio with lower expected return than MSCI World.
- Default growth assumptions:
  - rent growth: `1 %`
  - property value growth: `1 %`
  - inflation / cost inflation: `2 %`
- Vacancy risk is mentioned but not built into the base case.
- Exit costs are currently not modeled.
- Bank follow-up interest is simplified as unchanged; subsidized KfW financing should not be extrapolated with the teaser rate beyond its first fixed period.

## Working Conventions
- Main implementation files:
  - `index.html`
  - `styles.css`
  - `app.js`
- Static assets live in `assets/`.
- Start locally:
  - `python -m http.server 4180`
  - open `http://127.0.0.1:4180/`
- Syntax check:
  - `node --check app.js`

## Delivery Paths
- Local development folder: repository root
- GitHub delivery repo:
  - `https://github.com/Montoliou/dasEbert`
- Current public deployment target:
  - `https://montolio.de/dasEbert/`

## Session Startup Rule
- At start of each implementation session:
  1. Read `SKILL.md`.
  2. Read `PROJECT_MEMORY.md`.
  3. Review `ROADMAP.md` if the task changes structure, calculations, or deployment.
  4. Check whether local files and deployed files are still aligned.
