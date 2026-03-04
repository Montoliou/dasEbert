# Roadmap

## Goal
- Turn `Das Ebert` into a customer-facing decision tool that answers two questions clearly:
  - What does this investment do to my monthly liquidity?
  - How does my wealth after 20 years compare with and without this investment?

## Current Baseline
- App is a static HTML/CSS/JS project in the repository root.
- Calculation and rendering logic are currently concentrated in `app.js`.
- Visual assets are already extracted and integrated from the expose.
- A public deployment exists at `montolio.de/dasEbert`.

## Priority 1: Customer Decision Clarity
- Reframe the UI around a customer-safe `Kundenmodus`.
- Show the horizon result as:
  - wealth with investment
  - wealth without investment
  - delta versus comparison portfolio
- Keep technical financing controls available, but demote them behind clearer copy and better grouping.

## Priority 2: Wealth Comparison Engine
- Add a comparison scenario without property using a conservative managed portfolio.
- Model:
  - user-defined equity contribution
  - annual after-tax property cash flows
  - alternative portfolio compounding
  - net property equity after remaining debt
- Display the final delta as the core decision metric.

## Priority 3: Financing Realism Without Losing Simplicity
- Add equity contribution as a first-class input.
- Model acquisition costs separately and show them clearly.
- Apply a `0.5 %-point` bank rate surcharge for financing above 100 % of property purchase price.
- Keep bank follow-up interest equal to the initial rate for simplicity.
- Treat subsidized KfW debt more conservatively after its first fixed-rate period.

## Priority 4: Assumption Hygiene
- Set default assumptions to:
  - rent growth: `1 %`
  - property value growth: `1 %`
  - inflation: `2 %`
- Mention but do not include:
  - vacancy risk
  - exit costs
- Keep all assumption notes explicit in the UI.

## Priority 5: Public/Private Source Handling
- Expose may be linked publicly.
- Sales sheet may inform the model but must not be linked publicly.
- Public disclaimer should separate:
  - visible customer assumptions
  - internal sales-sheet-derived defaults

## Priority 6: UX And Trust
- Simplify wording for customers.
- Reduce early exposure to tax and financing jargon.
- Keep MLP-compliant design, but improve hierarchy and result storytelling.
- Add a clearer CTA path after the result.

## Priority 7: Codebase Stability
- Separate rendering, tax logic, financing logic, and scenario comparison logic.
- Move hardcoded assumptions into configuration data.
- Add at least:
  - unit tests for tax calculations
  - unit tests for financing schedules
  - unit tests for wealth comparison math

## Next Concrete Steps
- Keep the visible customer layer focused on:
  - project images
  - monthly start effect
  - wealth comparison after the chosen horizon
- Keep advanced tax and financing controls behind optional details.
- Maintain a strong project-story section so the app does not collapse into a pure calculator.
- Add a clearer post-result path:
  - expose access
  - advisor follow-up CTA
  - optional PDF or scenario handoff later
- In a later hardening pass:
  - split `app.js` into modules
  - add tests for tax, loan, and wealth comparison logic
  - add CI and linting
