const VAT_RATE = 0.19;
const ANCILLARY_COST_RATE = 0.075;
const BUILDING_SHARE = 0.8;
const SPECIAL_AFA_CAP_PER_SQM = 4000;
const KFW_MAX_PER_UNIT = 150000;
const KFW_FIXED_RATE_YEARS = 10;
const COST_INFLATION_RATE = 0.02;
const OVER_100_FINANCE_SURCHARGE = 0.5;

const properties = {
  a64: {
    id: "a64",
    label: "1-Raum",
    title: "WE A 64 | 5. OG",
    subtitle: "Musterwohnung auf Basis des kleinsten Preisbands",
    rooms: "1-Raum-Wohnung",
    positioning: "Kompakter Einstieg in das Projekt",
    story: "Für Kunden, die erst verstehen wollen, wie sich eine kleinere Einheit auf Liquidität und Vermögen auswirkt.",
    highlights: [
      "Klar strukturierter 1-Raum-Grundriss aus dem Exposé",
      "Niedrigere Einstiegshürde als bei den größeren Einheiten",
      "TG-Stellplatz ist hier nicht automatisch Teil des Szenarios"
    ],
    area: 30.17,
    defaultPrice: 187000,
    defaultRentPerSqm: 25,
    recommendedParking: false,
    image: "assets/floorplan-a64.png",
    excerptNote: "Preisband-Untergrenze und oberes Mietband aus dem Verkaufsdatenblatt.",
    parkingNote: "TG standardmäßig nicht eingerechnet."
  },
  a60: {
    id: "a60",
    label: "5-Raum",
    title: "WE A 60 | 5. OG",
    subtitle: "Musterwohnung auf Basis des größten Preisbands",
    rooms: "5-Raum-Wohnung",
    positioning: "Große Einheit mit stärkerer Objektpräsenz",
    story: "Für Kunden, die mehr Fläche, mehr Sichtbarkeit im Projekt und eine andere Größenordnung im Vermögensaufbau vergleichen wollen.",
    highlights: [
      "Großzügiger Grundriss mit mehreren separat nutzbaren Zimmern",
      "Mehr Wohnfläche und damit ein anderes Miet- und Kaufprofil",
      "TG-Stellplatz ist hier als realistischer Standard vorbelegt"
    ],
    area: 124.36,
    defaultPrice: 932000,
    defaultRentPerSqm: 18,
    recommendedParking: true,
    image: "assets/floorplan-a60.png",
    excerptNote: "Preisband-Obergrenze und unteres Mietband aus dem Verkaufsdatenblatt.",
    parkingNote: "TG wird hier als realistische Ergänzung vorbelegt."
  }
};

const state = {
  selectedProperty: "a64",
  annualIncome: 90000,
  horizon: 20,
  filingStatus: "single",
  churchTaxEnabled: true,
  churchTaxRate: 9,
  rentGrowth: 1,
  valueGrowth: 1,
  useKfw: true,
  depotReturn: 5,
  marketRate: 4.05,
  marketRepayment: 2,
  kfwRate: 0.6,
  kfwRepayment: 2,
  propertyInputs: {
    a64: {
      price: properties.a64.defaultPrice,
      rentPerSqm: properties.a64.defaultRentPerSqm,
      equityContribution: 20000,
      parkingEnabled: properties.a64.recommendedParking
    },
    a60: {
      price: properties.a60.defaultPrice,
      rentPerSqm: properties.a60.defaultRentPerSqm,
      equityContribution: 100000,
      parkingEnabled: properties.a60.recommendedParking
    }
  }
};

const dom = {};

function init() {
  captureDom();
  bindEvents();
  syncInputsWithState();
  render();
}

function captureDom() {
  dom.heroFacts = document.getElementById("hero-facts");
  dom.propertySwitch = document.getElementById("property-switch");
  dom.filingSwitch = document.getElementById("filing-switch");
  dom.annualIncome = document.getElementById("annual-income");
  dom.equityInput = document.getElementById("equity-input");
  dom.horizon = document.getElementById("horizon");
  dom.priceInput = document.getElementById("price-input");
  dom.rentInput = document.getElementById("rent-input");
  dom.rentGrowth = document.getElementById("rent-growth");
  dom.valueGrowth = document.getElementById("value-growth");
  dom.churchEnabled = document.getElementById("church-enabled");
  dom.churchRate = document.getElementById("church-rate");
  dom.parkingEnabled = document.getElementById("parking-enabled");
  dom.useKfw = document.getElementById("use-kfw");
  dom.depotReturn = document.getElementById("depot-return");
  dom.marketRate = document.getElementById("market-rate");
  dom.marketRepayment = document.getElementById("market-repayment");
  dom.kfwRate = document.getElementById("kfw-rate");
  dom.kfwRepayment = document.getElementById("kfw-repayment");
  dom.summaryGrid = document.getElementById("summary-grid");
  dom.chart = document.getElementById("cashflow-chart");
  dom.yearlyTable = document.getElementById("yearly-table");
  dom.propertyCards = document.getElementById("property-cards");
  dom.assumptionNotes = document.getElementById("assumption-notes");
}

function bindEvents() {
  dom.propertySwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-property]");
    if (!button) {
      return;
    }
    setProperty(button.dataset.property);
  });

  dom.filingSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filing]");
    if (!button) {
      return;
    }
    state.filingStatus = button.dataset.filing;
    syncFilingSwitch();
    render();
  });

  dom.propertyCards.addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-property]");
    if (!button) {
      return;
    }
    setProperty(button.dataset.selectProperty);
  });

  const numberBindings = [
    [dom.annualIncome, "annualIncome", 0, 100000000],
    [dom.horizon, "horizon", 5, 20],
    [dom.rentGrowth, "rentGrowth", 0, 8],
    [dom.valueGrowth, "valueGrowth", 0, 8],
    [dom.depotReturn, "depotReturn", 0, 12],
    [dom.marketRate, "marketRate", 0, 10],
    [dom.marketRepayment, "marketRepayment", 0.5, 10],
    [dom.kfwRate, "kfwRate", 0, 10],
    [dom.kfwRepayment, "kfwRepayment", 0.5, 10]
  ];

  numberBindings.forEach(([element, key, min, max]) => {
    element.addEventListener("input", () => {
      state[key] = clamp(Number(element.value || 0), min, max);
      render();
    });
  });

  dom.priceInput.addEventListener("input", () => {
    state.propertyInputs[state.selectedProperty].price = clamp(Number(dom.priceInput.value || 0), 0, 100000000);
    render();
  });

  dom.rentInput.addEventListener("input", () => {
    state.propertyInputs[state.selectedProperty].rentPerSqm = clamp(Number(dom.rentInput.value || 0), 0, 1000);
    render();
  });

  dom.equityInput.addEventListener("input", () => {
    state.propertyInputs[state.selectedProperty].equityContribution = clamp(Number(dom.equityInput.value || 0), 0, 100000000);
    render();
  });

  dom.churchEnabled.addEventListener("change", () => {
    state.churchTaxEnabled = dom.churchEnabled.checked;
    dom.churchRate.disabled = !state.churchTaxEnabled;
    render();
  });

  dom.churchRate.addEventListener("change", () => {
    state.churchTaxRate = Number(dom.churchRate.value);
    render();
  });

  dom.parkingEnabled.addEventListener("change", () => {
    state.propertyInputs[state.selectedProperty].parkingEnabled = dom.parkingEnabled.checked;
    render();
  });

  dom.useKfw.addEventListener("change", () => {
    state.useKfw = dom.useKfw.checked;
    dom.kfwRate.disabled = !state.useKfw;
    dom.kfwRepayment.disabled = !state.useKfw;
    render();
  });

  bindSegmentedKeyboard(dom.propertySwitch, "data-property");
  bindSegmentedKeyboard(dom.filingSwitch, "data-filing");
}

function setProperty(propertyId) {
  state.selectedProperty = propertyId;
  syncInputsWithState();
  render();
}

function syncInputsWithState() {
  const propertyInput = state.propertyInputs[state.selectedProperty];
  dom.annualIncome.value = state.annualIncome;
  dom.equityInput.value = Math.round(propertyInput.equityContribution);
  dom.horizon.value = state.horizon;
  dom.rentGrowth.value = state.rentGrowth;
  dom.valueGrowth.value = state.valueGrowth;
  dom.depotReturn.value = state.depotReturn;
  dom.marketRate.value = state.marketRate;
  dom.marketRepayment.value = state.marketRepayment;
  dom.kfwRate.value = state.kfwRate;
  dom.kfwRepayment.value = state.kfwRepayment;
  dom.churchEnabled.checked = state.churchTaxEnabled;
  dom.churchRate.value = String(state.churchTaxRate);
  dom.churchRate.disabled = !state.churchTaxEnabled;
  dom.parkingEnabled.checked = propertyInput.parkingEnabled;
  dom.useKfw.checked = state.useKfw;
  dom.kfwRate.disabled = !state.useKfw;
  dom.kfwRepayment.disabled = !state.useKfw;
  dom.priceInput.value = Math.round(propertyInput.price);
  dom.rentInput.value = propertyInput.rentPerSqm.toFixed(2);
  syncPropertySwitch();
  syncFilingSwitch();
}

function syncPropertySwitch() {
  dom.propertySwitch.querySelectorAll("[data-property]").forEach((button) => {
    const isActive = button.dataset.property === state.selectedProperty;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-checked", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });
}

function syncFilingSwitch() {
  dom.filingSwitch.querySelectorAll("[data-filing]").forEach((button) => {
    const isActive = button.dataset.filing === state.filingStatus;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-checked", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });
}

function render() {
  syncInputsWithState();
  const scenario = calculateScenario();
  renderHeroFacts(scenario);
  renderSummary(scenario);
  renderChart(scenario);
  renderTable(scenario);
  renderPropertyCards();
  renderAssumptionNotes(scenario);
}

function calculateScenario() {
  const property = properties[state.selectedProperty];
  const propertyInput = state.propertyInputs[property.id];
  const apartmentPrice = propertyInput.price;
  const includeParking = propertyInput.parkingEnabled;
  const parkingPrice = includeParking ? 49900 : 0;
  const purchasePrice = apartmentPrice + parkingPrice;
  const ancillaryCosts = purchasePrice * ANCILLARY_COST_RATE;
  const totalAcquisition = purchasePrice + ancillaryCosts;
  const equityContribution = clamp(propertyInput.equityContribution, 0, totalAcquisition);
  const financingNeed = Math.max(0, totalAcquisition - equityContribution);
  const isOver100Financing = financingNeed > purchasePrice;
  const bankRateApplied = state.marketRate + (isOver100Financing ? OVER_100_FINANCE_SURCHARGE : 0);
  const apartmentRentMonthly = property.area * propertyInput.rentPerSqm;
  const parkingRentMonthly = includeParking ? 140 : 0;
  const totalRentMonthlyStart = apartmentRentMonthly + parkingRentMonthly;

  const apartmentWegMonthly = 30 * (1 + VAT_RATE);
  const apartmentSeMonthly = 20 * (1 + VAT_RATE);
  const reserveMonthly = property.area * 0.25;
  const parkingWegMonthly = includeParking ? 2.5 * (1 + VAT_RATE) : 0;
  const parkingSeMonthly = includeParking ? 2 * (1 + VAT_RATE) : 0;
  const ownerCashCostsMonthly = apartmentWegMonthly + apartmentSeMonthly + reserveMonthly + parkingWegMonthly + parkingSeMonthly;

  const kfwPrincipal = state.useKfw ? Math.min(KFW_MAX_PER_UNIT, apartmentPrice, financingNeed) : 0;
  const bankPrincipal = Math.max(0, financingNeed - kfwPrincipal);
  const bankSchedule = buildLoanSchedule({
    principal: bankPrincipal,
    annualRate: bankRateApplied,
    repaymentRate: state.marketRepayment,
    years: state.horizon
  });
  const kfwSchedule = buildLoanSchedule({
    principal: kfwPrincipal,
    annualRate: state.kfwRate,
    repaymentRate: state.kfwRepayment,
    years: state.horizon,
    followUpRate: bankRateApplied,
    switchAfterYear: KFW_FIXED_RATE_YEARS
  });

  const buildingBasis = apartmentPrice * BUILDING_SHARE;
  const specialBasis = Math.min(buildingBasis, property.area * SPECIAL_AFA_CAP_PER_SQM);
  const depreciation = buildDepreciationSeries(buildingBasis, specialBasis, state.horizon);

  const yearlyRows = [];
  const churchRate = state.churchTaxEnabled ? state.churchTaxRate / 100 : 0;
  const baseTax = calculateTotalTax(state.annualIncome, state.filingStatus, churchRate);
  const depotReturn = state.depotReturn / 100;
  let investmentSideAccount = 0;
  let comparisonDepotBalance = equityContribution;

  for (let year = 1; year <= state.horizon; year += 1) {
    const growthFactor = (1 + state.rentGrowth / 100) ** (year - 1);
    const inflationFactor = (1 + COST_INFLATION_RATE) ** (year - 1);
    const annualRent = totalRentMonthlyStart * 12 * growthFactor;
    const ownerCashCostsAnnual = ownerCashCostsMonthly * 12 * inflationFactor;
    const reserveAnnual = reserveMonthly * 12 * inflationFactor;
    const financingInterest = bankSchedule[year - 1].interest + kfwSchedule[year - 1].interest;
    const financingPrincipal = bankSchedule[year - 1].principal + kfwSchedule[year - 1].principal;
    const financingPayments = bankSchedule[year - 1].payment + kfwSchedule[year - 1].payment;
    const annualDepreciation = depreciation[year - 1].regular + depreciation[year - 1].special;
    const preTaxCashFlow = annualRent - ownerCashCostsAnnual - financingPayments;
    const taxableRentalResult = annualRent - ownerCashCostsAnnual + reserveAnnual - financingInterest - annualDepreciation;
    const taxWithInvestment = calculateTotalTax(
      Math.max(0, state.annualIncome + taxableRentalResult),
      state.filingStatus,
      churchRate
    );
    const taxEffect = baseTax - taxWithInvestment;
    const afterTaxCashFlow = preTaxCashFlow + taxEffect;
    const propertyValue = purchasePrice * (1 + state.valueGrowth / 100) ** year;
    const remainingDebt = bankSchedule[year - 1].endingBalance + kfwSchedule[year - 1].endingBalance;
    const propertyNetEquity = propertyValue - remainingDebt;

    investmentSideAccount = investmentSideAccount * (1 + depotReturn) + afterTaxCashFlow;
    comparisonDepotBalance = comparisonDepotBalance * (1 + depotReturn) + Math.max(-afterTaxCashFlow, 0);
    const wealthWithInvestment = propertyNetEquity + investmentSideAccount;
    const wealthWithoutInvestment = comparisonDepotBalance;
    const wealthDelta = wealthWithInvestment - wealthWithoutInvestment;

    yearlyRows.push({
      year,
      annualRent,
      interest: financingInterest,
      principal: financingPrincipal,
      ownerCashCostsAnnual,
      annualDepreciation,
      preTaxCashFlow,
      taxEffect,
      afterTaxCashFlow,
      propertyValue,
      remainingDebt,
      propertyNetEquity,
      wealthWithInvestment,
      wealthWithoutInvestment,
      wealthDelta,
      investmentSideAccount,
      comparisonDepotBalance,
      monthlyPreTax: preTaxCashFlow / 12,
      monthlyAfterTax: afterTaxCashFlow / 12,
      bankBalance: bankSchedule[year - 1].endingBalance,
      kfwBalance: kfwSchedule[year - 1].endingBalance
    });
  }

  const firstYear = yearlyRows[0];
  const finalYear = yearlyRows[yearlyRows.length - 1];
  const cumulativeAfterTax = yearlyRows.reduce((sum, row) => sum + row.afterTaxCashFlow, 0);
  const financingQuote = purchasePrice > 0 ? financingNeed / purchasePrice : 0;
  const grossYield = purchasePrice > 0 ? annualize(totalRentMonthlyStart) / purchasePrice : 0;

  return {
    property,
    apartmentPrice,
    purchasePrice,
    ancillaryCosts,
    totalAcquisition,
    equityContribution,
    financingNeed,
    isOver100Financing,
    bankRateApplied,
    totalRentMonthlyStart,
    ownerCashCostsMonthly,
    kfwPrincipal,
    bankPrincipal,
    yearlyRows,
    firstYear,
    finalYear,
    cumulativeAfterTax,
    financingQuote,
    grossYield,
    remainingDebt: finalYear.remainingDebt
  };
}

function buildLoanSchedule({
  principal,
  annualRate,
  repaymentRate,
  years,
  followUpRate = annualRate,
  switchAfterYear = years
}) {
  let balance = principal;
  const schedule = [];
  let activeRate = annualRate;
  let monthlyPayment = principal > 0 ? principal * ((activeRate + repaymentRate) / 100) / 12 : 0;

  for (let year = 1; year <= years; year += 1) {
    if (year === switchAfterYear + 1) {
      activeRate = followUpRate;
      monthlyPayment = balance > 0 ? balance * ((activeRate + repaymentRate) / 100) / 12 : 0;
    }

    const monthlyRate = activeRate / 100 / 12;
    let interest = 0;
    let principalPaid = 0;
    let payments = 0;

    for (let month = 1; month <= 12; month += 1) {
      if (balance <= 0) {
        break;
      }

      const interestPart = balance * monthlyRate;
      const principalPart = Math.min(balance, Math.max(0, monthlyPayment - interestPart));
      const payment = interestPart + principalPart;

      balance -= principalPart;
      interest += interestPart;
      principalPaid += principalPart;
      payments += payment;
    }

    schedule.push({
      year,
      interest,
      principal: principalPaid,
      payment: payments,
      endingBalance: balance,
      rate: activeRate
    });
  }

  return schedule;
}

function buildDepreciationSeries(buildingBasis, specialBasis, years) {
  let regularBookValue = buildingBasis;
  const series = [];

  for (let year = 1; year <= years; year += 1) {
    const regular = regularBookValue * 0.05;
    regularBookValue = Math.max(0, regularBookValue - regular);
    const special = year <= 4 ? specialBasis * 0.05 : 0;
    series.push({ regular, special });
  }

  return series;
}

function calculateTotalTax(income, filingStatus, churchTaxRate) {
  const incomeTax = calculateIncomeTax(income, filingStatus);
  const soli = calculateSoli(incomeTax, filingStatus);
  const churchTax = incomeTax * churchTaxRate;
  return incomeTax + soli + churchTax;
}

function calculateIncomeTax(income, filingStatus) {
  const roundedIncome = Math.max(0, Math.floor(income));
  if (filingStatus === "splitting") {
    return 2 * calculateIncomeTaxSingle(roundedIncome / 2);
  }
  return calculateIncomeTaxSingle(roundedIncome);
}

function calculateIncomeTaxSingle(income) {
  const x = Math.floor(income);

  if (x <= 12348) {
    return 0;
  }

  if (x <= 17799) {
    const y = (x - 12348) / 10000;
    return Math.floor((914.51 * y + 1400) * y);
  }

  if (x <= 69878) {
    const z = (x - 17799) / 10000;
    return Math.floor((173.1 * z + 2397) * z + 1034.87);
  }

  if (x <= 277825) {
    return Math.floor(0.42 * x - 11135.63);
  }

  return Math.floor(0.45 * x - 19470.38);
}

function calculateSoli(incomeTax, filingStatus) {
  const threshold = filingStatus === "splitting" ? 81400 : 40700;

  if (incomeTax <= threshold) {
    return 0;
  }

  return Math.min(incomeTax * 0.055, (incomeTax - threshold) * 0.119);
}

function renderHeroFacts(scenario) {
  const facts = [
    { value: formatCurrency(scenario.firstYear.monthlyAfterTax, 0, true), label: "Monatliche Wirkung nach Steuer im Startjahr" },
    { value: formatCurrency(scenario.finalYear.wealthDelta, 0, true), label: `Mehr- oder Mindervermögen bis Jahr ${state.horizon}` },
    { value: formatCurrency(scenario.equityContribution + scenario.ancillaryCosts, 0), label: "Kapital zum Start aus Eigenkapital und Nebenkosten" }
  ];

  dom.heroFacts.innerHTML = facts.map((fact) => `
    <div class="hero-fact">
      <strong>${fact.value}</strong>
      <span>${fact.label}</span>
    </div>
  `).join("");
}

function renderSummary(scenario) {
  const cards = [
    {
      title: "Monatliche Wirkung im Startjahr",
      value: formatCurrency(scenario.firstYear.monthlyAfterTax, 0, true),
      note: scenario.firstYear.monthlyAfterTax >= 0
        ? "Im Basisszenario entsteht schon im ersten Jahr ein monatlicher Überschuss nach Steuer."
        : "Im Basisszenario tragen Sie anfangs monatlich zu. Die Frage ist, ob der langfristige Vermögensvorteil das rechtfertigt.",
      stateClass: scenario.firstYear.monthlyAfterTax >= 0 ? "is-positive" : "is-negative"
    },
    {
      title: `Vermögensvergleich in Jahr ${state.horizon}`,
      rows: [
        { label: "Mit Immobilie", value: formatCurrency(scenario.finalYear.wealthWithInvestment, 0, true) },
        { label: "Ohne Immobilie", value: formatCurrency(scenario.finalYear.wealthWithoutInvestment, 0, true) },
        { label: "Differenz", value: formatCurrency(scenario.finalYear.wealthDelta, 0, true) }
      ],
      note: `Der Vergleich nutzt Ihr Eigenkapital und nur vermiedene Belastungen für das Depot.`,
      stateClass: scenario.finalYear.wealthDelta >= 0 ? "is-positive" : "is-negative"
    },
    {
      title: "Was das Ergebnis aktuell treibt",
      bullets: [
        `Das Vergleichsdepot läuft defensiv mit ${formatPercent(state.depotReturn, 2)} p.a. und nicht mit einem aggressiven Aktienindex.`,
        `Nebenkosten und Eigenkapital sind im Vermögensvergleich enthalten; die Immobilie startet also nicht künstlich zu freundlich.`,
        state.useKfw
          ? `KfW-Mittel entlasten die ersten ${KFW_FIXED_RATE_YEARS} Jahre; danach rechnet das Modell dort konservativ mit Bankzins weiter.`
          : `Ohne KfW läuft das Szenario vollständig über Bankfinanzierung.`
      ],
      note: scenario.isOver100Financing
        ? "Die Finanzierung liegt über 100 % des Kaufpreises; deshalb ist bereits der 0,50 %-Punkte-Zinsaufschlag eingerechnet."
        : "Die Finanzierung liegt nicht über 100 % des Kaufpreises; ein Vollfinanzierungsaufschlag fällt im Basisszenario nicht an.",
      stateClass: "is-neutral"
    }
  ];

  dom.summaryGrid.innerHTML = cards.map((card) => `
    <article class="summary-card ${card.stateClass}">
      <h3>${card.title}</h3>
      ${card.rows ? `
        <div class="summary-rows">
          ${card.rows.map((row) => `
            <div class="summary-row">
              <span class="summary-row-label">${row.label}</span>
              <span class="summary-row-value">${row.value}</span>
            </div>
          `).join("")}
        </div>
      ` : card.bullets ? `
        <div class="summary-bullets">
          ${card.bullets.map((bullet) => `<div class="summary-bullet">${bullet}</div>`).join("")}
        </div>
      ` : `<span class="summary-value">${card.value}</span>`}
      <div class="summary-note">${card.note}</div>
    </article>
  `).join("");
}

function renderChart(scenario) {
  const rows = scenario.yearlyRows;
  const width = 880;
  const height = 360;
  const margin = { top: 24, right: 32, bottom: 56, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const values = rows.flatMap((row) => [row.monthlyPreTax, row.monthlyAfterTax]);
  const maxAbs = Math.max(...values.map((value) => Math.abs(value)), 1000);
  const yMax = niceRound(maxAbs * 1.15);
  const yMin = -yMax;
  const zeroY = toY(0, yMin, yMax, chartHeight, margin.top);
  const gridValues = [yMax, yMax / 2, 0, yMin / 2, yMin];

  const preTaxPath = buildLinePath(rows.map((row, index) => ({
    x: toX(index, rows.length, chartWidth, margin.left),
    y: toY(row.monthlyPreTax, yMin, yMax, chartHeight, margin.top)
  })));

  const afterTaxPoints = rows.map((row, index) => ({
    x: toX(index, rows.length, chartWidth, margin.left),
    y: toY(row.monthlyAfterTax, yMin, yMax, chartHeight, margin.top)
  }));

  const afterTaxPath = buildLinePath(afterTaxPoints);
  const points = rows.map((row, index) => {
    const x = toX(index, rows.length, chartWidth, margin.left);
    return `<text x="${x}" y="${height - 24}" text-anchor="middle" class="chart-axis-label">${row.year}</text>`;
  }).join("");

  const grid = gridValues.map((value) => {
    const y = toY(value, yMin, yMax, chartHeight, margin.top);
    const stroke = value === 0 ? "rgba(3,61,93,0.28)" : "rgba(190,182,170,0.4)";
    const strokeWidth = value === 0 ? 2 : 1;
    return `
      <line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="${stroke}" stroke-width="${strokeWidth}" />
      <text x="${margin.left - 12}" y="${y + 5}" text-anchor="end" class="chart-grid-label">${formatCurrency(value, 0, true)}</text>
    `;
  }).join("");

  dom.chart.innerHTML = `
    <defs>
      <linearGradient id="afterTaxArea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(19,133,62,0.24)" />
        <stop offset="100%" stop-color="rgba(19,133,62,0.02)" />
      </linearGradient>
    </defs>
    ${grid}
    <path d="${buildAreaPath(afterTaxPoints, zeroY)}" fill="url(#afterTaxArea)"></path>
    <path d="${preTaxPath}" fill="none" stroke="#047584" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="${afterTaxPath}" fill="none" stroke="#13853e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
    <circle cx="${afterTaxPoints[afterTaxPoints.length - 1].x}" cy="${toY(rows[rows.length - 1].monthlyPreTax, yMin, yMax, chartHeight, margin.top)}" r="5" fill="#047584"></circle>
    <circle cx="${afterTaxPoints[afterTaxPoints.length - 1].x}" cy="${afterTaxPoints[afterTaxPoints.length - 1].y}" r="5" fill="#13853e"></circle>
    <text x="${margin.left}" y="16" class="chart-title-small">Monatlicher Durchschnitt pro Jahr</text>
    ${points}
  `;
}

function renderTable(scenario) {
  dom.yearlyTable.innerHTML = scenario.yearlyRows.map((row) => {
    const isHighlight = row.year === state.horizon ? "is-highlight" : "";
    return `
      <tr class="${isHighlight}">
        <td>Jahr ${row.year}</td>
        <td>${formatCurrency(row.annualRent, 0)}</td>
        <td class="${row.preTaxCashFlow >= 0 ? "value-positive" : "value-negative"}">${formatCurrency(row.preTaxCashFlow, 0, true)}</td>
        <td class="${row.taxEffect >= 0 ? "value-positive" : "value-negative"}">${formatCurrency(row.taxEffect, 0, true)}</td>
        <td class="${row.afterTaxCashFlow >= 0 ? "value-positive" : "value-negative"}">${formatCurrency(row.afterTaxCashFlow, 0, true)}</td>
        <td>${formatCurrency(row.propertyValue, 0)}</td>
        <td>${formatCurrency(row.remainingDebt, 0)}</td>
        <td class="${row.wealthWithInvestment >= 0 ? "value-positive" : "value-negative"}">${formatCurrency(row.wealthWithInvestment, 0, true)}</td>
        <td class="${row.wealthWithoutInvestment >= 0 ? "value-positive" : "value-negative"}">${formatCurrency(row.wealthWithoutInvestment, 0, true)}</td>
        <td class="${row.wealthDelta >= 0 ? "value-positive" : "value-negative"}">${formatCurrency(row.wealthDelta, 0, true)}</td>
      </tr>
    `;
  }).join("");
}

function renderPropertyCards() {
  dom.propertyCards.innerHTML = Object.values(properties).map((property) => {
    const assumption = state.propertyInputs[property.id];
    const isSelected = property.id === state.selectedProperty;
    return `
      <article class="property-card ${isSelected ? "is-selected" : ""}">
        <div class="property-top">
          <div>
            <h3 class="property-title">${property.title}</h3>
            <span class="property-subtitle">${property.rooms} | ca. ${formatNumber(property.area, 2)} m²</span>
          </div>
          <span class="badge">${property.label}</span>
        </div>
        <img class="property-plan" src="${property.image}" alt="Grundriss ${property.title}">
        <div class="property-body">
          <div class="property-story">
            <strong>${property.positioning}</strong>
            <p>${property.story}</p>
          </div>
          <div class="property-facts">
            <span class="property-fact">${property.rooms}</span>
            <span class="property-fact">ca. ${formatNumber(property.area, 2)} m²</span>
            <span class="property-fact">Grundriss aus dem Exposé</span>
          </div>
          <div class="property-highlights">
            ${property.highlights.map((highlight) => `<div class="property-highlight">${highlight}</div>`).join("")}
          </div>
          <p class="property-note">${property.excerptNote}</p>
          <div class="property-actions">
            <span class="property-note">${assumption.parkingEnabled ? "TG-Stellplatz aktuell eingerechnet." : property.parkingNote}</span>
            <button class="property-button" type="button" data-select-property="${property.id}">
              ${isSelected ? "Aktive Kalkulation" : "Für Kalkulation nutzen"}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderAssumptionNotes(scenario) {
  const property = scenario.property;
  const notes = [
    `Musterpreis ${property.id === "a64" ? "aus Preisuntergrenze" : "aus Preisobergrenze"} des Verkaufsdatenblatts vorbelegt.`,
    `Mietansatz ${formatNumber(state.propertyInputs[property.id].rentPerSqm, 2)} €/m² aus Mietband 18,00 bis 25,00 €/m² vorbelegt.`,
    `Erwerbsnebenkosten werden separat mit ${formatPercent(ANCILLARY_COST_RATE * 100, 1)} ausgewiesen und in der Vermögenslogik berücksichtigt.`,
    `Vergleichsdepot mit ${formatPercent(state.depotReturn, 2)} p.a.; dort wird Eigenkapital und nur die vermiedene Immobilienbelastung angelegt.`,
    scenario.isOver100Financing
      ? `Die Finanzierung liegt über 100 % des Kaufpreises; auf den Bankzins wurden deshalb 0,50 %-Punkte aufgeschlagen.`
      : `Die Finanzierung liegt nicht über 100 % des Kaufpreises; es wird kein Zinsaufschlag für Vollfinanzierung angesetzt.`,
    `Steuermodell mit § 32a EStG 2026, Soli-Freigrenze 40.700 € bzw. 81.400 € im Splitting und optionaler Kirchensteuer.`,
    `AfA-Modell mit 5 % degressivem Satz auf ${formatPercent(BUILDING_SHARE * 100, 0)} Gebäudeanteil sowie Sonder-AfA nach § 7b EStG.`,
    `Mietausfall wird angesprochen, aber im Basisszenario nicht eingerechnet. Kosten steigen mit ${formatPercent(COST_INFLATION_RATE * 100, 2)} p.a.; Exit-Kosten bleiben unberücksichtigt.`
  ];

  dom.assumptionNotes.innerHTML = notes.map((note) => `<div class="assumption-note">${note}</div>`).join("");
}

function bindSegmentedKeyboard(container, dataAttribute) {
  container.addEventListener("keydown", (event) => {
    const isForward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const isBackward = event.key === "ArrowLeft" || event.key === "ArrowUp";

    if (!isForward && !isBackward) {
      return;
    }

    const buttons = [...container.querySelectorAll(`[${dataAttribute}]`)];
    const currentIndex = buttons.indexOf(document.activeElement);

    if (currentIndex === -1) {
      return;
    }

    event.preventDefault();
    const direction = isForward ? 1 : -1;
    const nextIndex = (currentIndex + direction + buttons.length) % buttons.length;
    buttons[nextIndex].focus();
    buttons[nextIndex].click();
  });
}

function annualize(monthlyAmount) {
  return monthlyAmount * 12;
}

function toX(index, count, chartWidth, offset) {
  if (count === 1) {
    return offset + chartWidth / 2;
  }
  return offset + (index / (count - 1)) * chartWidth;
}

function toY(value, min, max, chartHeight, offset) {
  return offset + ((max - value) / (max - min)) * chartHeight;
}

function buildLinePath(points) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
}

function buildAreaPath(points, baselineY) {
  if (!points.length) {
    return "";
  }
  const first = points[0];
  const last = points[points.length - 1];
  return `${buildLinePath(points)} L ${last.x.toFixed(2)} ${baselineY.toFixed(2)} L ${first.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function niceRound(value) {
  const absolute = Math.abs(value);
  if (absolute <= 1000) {
    return 1000;
  }
  const factor = 10 ** Math.floor(Math.log10(absolute));
  return Math.ceil(absolute / factor) * factor;
}

function formatCurrency(value, digits = 0, signed = false) {
  const formatter = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
  const formatted = formatter.format(Math.abs(value));
  if (!signed) {
    return value < 0 ? `-${formatted}` : formatted;
  }
  if (value > 0) {
    return `+${formatted}`;
  }
  if (value < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

function formatPercent(value, digits = 2) {
  return `${formatNumber(value, digits)} %`;
}

function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value);
}

document.addEventListener("DOMContentLoaded", init);
