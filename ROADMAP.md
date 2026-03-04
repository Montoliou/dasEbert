# Roadmap

## Goal
- Evolve `Das Ebert` from a single-property calculator into a robust sales-ready investment dashboard with maintainable calculations, clearer assumptions, and repeatable deployment.

## Current Baseline
- App is a static HTML/CSS/JS project in the repository root.
- Calculation and rendering logic are currently concentrated in `app.js`.
- Visual assets are already extracted and integrated from the expose.
- A public deployment exists at `montolio.de/dasEbert`.

## Priority 1: Stabilize Mobile UX
- Continue testing narrow widths and small laptop viewports.
- Prevent overlap or clipping in forms, tables, chart legends, and apartment cards.
- Add a final responsive pass for common breakpoints:
  - 360px
  - 390px
  - 768px
  - 1024px

## Priority 2: Separate Calculation Config From Rendering
- Extract property assumptions and financing defaults out of `app.js`.
- Target files:
  - `data/property-content.json`
  - `data/calculation-config.json`
- Keep UI rendering separate from tax and liquidity math.

## Priority 3: Formalize Tax And Financing Assumptions
- Centralize all tax thresholds, Soli logic, church tax rates, and AfA settings.
- Document the exact source and date for each assumption.
- Make KfW and market financing defaults easier to update without code edits.

## Priority 4: Improve Apartment Data Quality
- Replace modeled sample assumptions with an actual unit-level data source if one becomes available.
- Add structured apartment metadata:
  - unit id
  - rooms
  - area
  - price
  - rent
  - parking
  - floorplan asset

## Priority 5: Make Output More Sales-Ready
- Add a compact customer summary view with fewer technical inputs.
- Add a consultant detail mode with full financing and tax controls.
- Add export-friendly layouts for PDF or print.
- Make disclaimers and source references easier to maintain.

## Priority 6: Deployment Workflow
- Standardize deployment steps for GitHub and SFTP.
- Add a small deploy script or checklist for:
  1. local validation
  2. repo sync
  3. branch push
  4. upload to `/MLP_MultiAccount_App/dasEbert`
  5. live URL verification

## Priority 7: Reusability
- Prepare the project so the same engine can be reused for future real-estate dashboards.
- Move toward a structure where project-specific copy, visuals, and assumptions can be swapped with minimal code changes.

## Next Concrete Steps
- Extract configuration data from `app.js`.
- Add a lightweight local validation checklist.
- Add a deployment note or script so local repo and deployed state stay synchronized.
