const VAT_RATE = 0.19;
const ANCILLARY_COST_RATE = 0.075;
const BUILDING_SHARE = 0.8;
const SPECIAL_AFA_CAP_PER_SQM = 4000;
const KFW_MAX_PER_UNIT = 150000;

const properties = {
  a64: {
    id: "a64",
    label: "1-Raum",
    title: "WE A 64 | 5. OG",
    subtitle: "Musterwohnung auf Basis des kleinsten Preisbands",
    rooms: "1-Raum-Wohnung",
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
  rentGrowth: 3,
  valueGrowth: 2,
  parkingEnabled: false,
  useKfw: true,
  marketRate: 4.05,
  marketRepayment: 2,
  kfwRate: 0.6,
  kfwRepayment: 2,
  propertyInputs: {
    a64: {
      price: properties.a64.defaultPrice,
      rentPerSqm: properties.a64.defaultRentPerSqm
    },
    a60: {
      price: properties.a60.defaultPrice,
      rentPerSqm: properties.a60.defaultRentPerSqm
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
  dom.horizon = document.getElementById("horizon");
  dom.priceInput = document.getElementById("price-input");
  dom.rentInput = document.getElementById("rent-input");
  dom.rentGrowth = document.getElementById("rent-growth");
  dom.valueGrowth = document.getElementById("value-growth");
  dom.churchEnabled = document.getElementById("church-enabled");
  dom.churchRate = document.getElementById("church-rate");
  dom.parkingEnabled = document.getElementById("parking-enabled");
  dom.useKfw = document.getElementById("use-kfw");
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
    state.parkingEnabled = dom.parkingEnabled.checked;
    render();
  });

  dom.useKfw.addEventListener("change", () => {
    state.useKfw = dom.useKfw.checked;
    dom.kfwRate.disabled = !state.useKfw;
    dom.kfwRepayment.disabled = !state.useKfw;
    render();
  });
}

function setProperty(propertyId) {
  state.selectedProperty = propertyId;
  state.parkingEnabled = properties[propertyId].recommendedParking;
  syncInputsWithState();
  render();
}

function syncInputsWithState() {
  dom.annualIncome.value = state.annualIncome;
  dom.horizon.value = state.horizon;
  dom.rentGrowth.value = state.rentGrowth;
  dom.valueGrowth.value = state.valueGrowth;
  dom.marketRate.value = state.marketRate;
  dom.marketRepayment.value = state.marketRepayment;
  dom.kfwRate.value = state.kfwRate;
  dom.kfwRepayment.value = state.kfwRepayment;
  dom.churchEnabled.checked = state.churchTaxEnabled;
  dom.churchRate.value = String(state.churchTaxRate);
  dom.churchRate.disabled = !state.churchTaxEnabled;
  dom.parkingEnabled.checked = state.parkingEnabled;
  dom.useKfw.checked = state.useKfw;
  dom.kfwRate.disabled = !state.useKfw;
  dom.kfwRepayment.disabled = !state.useKfw;
  dom.priceInput.value = Math.round(state.propertyInputs[state.selectedProperty].price);
  dom.rentInput.value = state.propertyInputs[state.selectedProperty].rentPerSqm.toFixed(2);
  syncPropertySwitch();
  syncFilingSwitch();
}

function syncPropertySwitch() {
  dom.propertySwitch.querySelectorAll("[data-property]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.property === state.selectedProperty);
  });
}

function syncFilingSwitch() {
  dom.filingSwitch.querySelectorAll("[data-filing]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filing === state.filingStatus);
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
  const includeParking = state.parkingEnabled;
  const parkingPrice = includeParking ? 49900 : 0;
  const purchasePrice = apartmentPrice + parkingPrice;
  const ancillaryCosts = purchasePrice * ANCILLARY_COST_RATE;
  const apartmentRentMonthly = property.area * propertyInput.rentPerSqm;
  const parkingRentMonthly = includeParking ? 140 : 0;
  const totalRentMonthlyStart = apartmentRentMonthly + parkingRentMonthly;

  const apartmentWegMonthly = 30 * (1 + VAT_RATE);
  const apartmentSeMonthly = 20 * (1 + VAT_RATE);
  const reserveMonthly = property.area * 0.25;
  const parkingWegMonthly = includeParking ? 2.5 * (1 + VAT_RATE) : 0;
  const parkingSeMonthly = includeParking ? 2 * (1 + VAT_RATE) : 0;
  const ownerCashCostsMonthly = apartmentWegMonthly + apartmentSeMonthly + reserveMonthly + parkingWegMonthly + parkingSeMonthly;

  const kfwPrincipal = state.useKfw ? Math.min(KFW_MAX_PER_UNIT, apartmentPrice) : 0;
  const bankPrincipal = Math.max(0, purchasePrice - kfwPrincipal);
  const bankSchedule = buildLoanSchedule(bankPrincipal, state.marketRate, state.marketRepayment, state.horizon);
  const kfwSchedule = buildLoanSchedule(kfwPrincipal, state.kfwRate, state.kfwRepayment, state.horizon);

  const buildingBasis = apartmentPrice * BUILDING_SHARE;
  const specialBasis = Math.min(buildingBasis, property.area * SPECIAL_AFA_CAP_PER_SQM);
  const depreciation = buildDepreciationSeries(buildingBasis, specialBasis, state.horizon);

  const yearlyRows = [];
  const churchRate = state.churchTaxEnabled ? state.churchTaxRate / 100 : 0;
  const baseTax = calculateTotalTax(state.annualIncome, state.filingStatus, churchRate);

  for (let year = 1; year <= state.horizon; year += 1) {
    const growthFactor = (1 + state.rentGrowth / 100) ** (year - 1);
    const annualRent = totalRentMonthlyStart * 12 * growthFactor;
    const ownerCashCostsAnnual = ownerCashCostsMonthly * 12;
    const financingInterest = bankSchedule[year - 1].interest + kfwSchedule[year - 1].interest;
    const financingPrincipal = bankSchedule[year - 1].principal + kfwSchedule[year - 1].principal;
    const financingPayments = bankSchedule[year - 1].payment + kfwSchedule[year - 1].payment;
    const annualDepreciation = depreciation[year - 1].regular + depreciation[year - 1].special;
    const preTaxCashFlow = annualRent - ownerCashCostsAnnual - financingPayments;
    const taxableRentalResult = annualRent - ownerCashCostsAnnual + reserveMonthly * 12 - financingInterest - annualDepreciation;
    const taxWithInvestment = calculateTotalTax(
      Math.max(0, state.annualIncome + taxableRentalResult),
      state.filingStatus,
      churchRate
    );
    const taxEffect = baseTax - taxWithInvestment;
    const afterTaxCashFlow = preTaxCashFlow + taxEffect;
    const propertyValue = purchasePrice * (1 + state.valueGrowth / 100) ** year;

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
      monthlyPreTax: preTaxCashFlow / 12,
      monthlyAfterTax: afterTaxCashFlow / 12,
      bankBalance: bankSchedule[year - 1].endingBalance,
      kfwBalance: kfwSchedule[year - 1].endingBalance
    });
  }

  const firstYear = yearlyRows[0];
  const finalYear = yearlyRows[yearlyRows.length - 1];
  const cumulativeAfterTax = yearlyRows.reduce((sum, row) => sum + row.afterTaxCashFlow, 0);

  return {
    property,
    apartmentPrice,
    purchasePrice,
    ancillaryCosts,
    totalRentMonthlyStart,
    ownerCashCostsMonthly,
    kfwPrincipal,
    bankPrincipal,
    yearlyRows,
    firstYear,
    finalYear,
    cumulativeAfterTax,
    grossYield: annualize(totalRentMonthlyStart) / purchasePrice,
    remainingDebt: finalYear.bankBalance + finalYear.kfwBalance
  };
}

function buildLoanSchedule(principal, annualRate, repaymentRate, years) {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = principal > 0 ? principal * ((annualRate + repaymentRate) / 100) / 12 : 0;
  let balance = principal;
  const schedule = [];

  for (let year = 1; year <= years; year += 1) {
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
      endingBalance: balance
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
    { value: formatCurrency(scenario.purchasePrice, 0), label: "Modellierter Kaufpreis" },
    { value: formatCurrency(scenario.firstYear.monthlyAfterTax, 0, true), label: "Monatlich nach Steuer in Jahr 1" },
    { value: formatCurrency(scenario.ancillaryCosts, 0), label: "Einmalige Erwerbsnebenkosten" }
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
      title: "Jahr 1 vor Steuer",
      value: formatCurrency(scenario.firstYear.preTaxCashFlow, 0, true),
      note: `${formatCurrency(scenario.firstYear.monthlyPreTax, 0, true)} pro Monat`,
      stateClass: scenario.firstYear.preTaxCashFlow >= 0 ? "is-positive" : "is-negative"
    },
    {
      title: "Jahr 1 nach Steuer",
      value: formatCurrency(scenario.firstYear.afterTaxCashFlow, 0, true),
      note: `${formatCurrency(scenario.firstYear.monthlyAfterTax, 0, true)} pro Monat`,
      stateClass: scenario.firstYear.afterTaxCashFlow >= 0 ? "is-positive" : "is-negative"
    },
    {
      title: "Steuerwirkung Jahr 1",
      value: formatCurrency(scenario.firstYear.taxEffect, 0, true),
      note: `inkl. ESt, Soli${state.churchTaxEnabled ? ` und ${state.churchTaxRate} % Kirchensteuer` : ""}`,
      stateClass: scenario.firstYear.taxEffect >= 0 ? "is-positive" : "is-negative"
    },
    {
      title: `Objektwert in Jahr ${state.horizon}`,
      value: formatCurrency(scenario.finalYear.propertyValue, 0),
      note: `Restschuld ${formatCurrency(scenario.remainingDebt, 0)}`,
      stateClass: ""
    },
    {
      title: "Kumuliert nach Steuer",
      value: formatCurrency(scenario.cumulativeAfterTax, 0, true),
      note: `${formatPercent(scenario.grossYield * 100, 2)} Bruttomietrendite zum Start`,
      stateClass: scenario.cumulativeAfterTax >= 0 ? "is-positive" : "is-negative"
    },
    {
      title: "KfW / Bank",
      value: `${formatCurrency(scenario.kfwPrincipal, 0)} / ${formatCurrency(scenario.bankPrincipal, 0)}`,
      note: state.useKfw ? "KfW 298 plus Bankdarlehen" : "reine Bankfinanzierung",
      stateClass: ""
    }
  ];

  dom.summaryGrid.innerHTML = cards.map((card) => `
    <article class="summary-card ${card.stateClass}">
      <h3>${card.title}</h3>
      <span class="summary-value">${card.value}</span>
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
        <td>${formatCurrency(row.interest, 0)}</td>
        <td>${formatCurrency(row.principal, 0)}</td>
        <td>${formatCurrency(row.ownerCashCostsAnnual, 0)}</td>
        <td>${formatCurrency(row.annualDepreciation, 0)}</td>
        <td class="${row.preTaxCashFlow >= 0 ? "value-positive" : "value-negative"}">${formatCurrency(row.preTaxCashFlow, 0, true)}</td>
        <td class="${row.taxEffect >= 0 ? "value-positive" : "value-negative"}">${formatCurrency(row.taxEffect, 0, true)}</td>
        <td class="${row.afterTaxCashFlow >= 0 ? "value-positive" : "value-negative"}">${formatCurrency(row.afterTaxCashFlow, 0, true)}</td>
        <td>${formatCurrency(row.propertyValue, 0)}</td>
      </tr>
    `;
  }).join("");
}

function renderPropertyCards() {
  dom.propertyCards.innerHTML = Object.values(properties).map((property) => {
    const assumption = state.propertyInputs[property.id];
    const isSelected = property.id === state.selectedProperty;
    const rentMonthly = property.area * assumption.rentPerSqm + (property.recommendedParking ? 140 : 0);
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
          <div class="property-metrics">
            <div class="metric">
              <strong>${formatCurrency(assumption.price, 0)}</strong>
              <span>Kaufpreisannahme</span>
            </div>
            <div class="metric">
              <strong>${formatCurrency(rentMonthly, 0)}</strong>
              <span>Startmiete pro Monat</span>
            </div>
            <div class="metric">
              <strong>${formatNumber(assumption.rentPerSqm, 2)} €/m²</strong>
              <span>Mietansatz</span>
            </div>
            <div class="metric">
              <strong>${formatPercent((annualize(rentMonthly) / assumption.price) * 100, 2)}</strong>
              <span>Bruttomietrendite</span>
            </div>
          </div>
          <p class="property-note">${property.excerptNote}</p>
          <div class="property-actions">
            <span class="property-note">${property.parkingNote}</span>
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
    `Erwerbsnebenkosten pauschal mit ${formatPercent(ANCILLARY_COST_RATE * 100, 1)} angesetzt, gemäß Verkaufsdatenblatt.`,
    `Steuermodell mit § 32a EStG 2026, Soli-Freigrenze 40.700 € bzw. 81.400 € im Splitting und optionaler Kirchensteuer.`,
    `AfA-Modell mit 5 % degressivem Satz auf ${formatPercent(BUILDING_SHARE * 100, 0)} % Gebäudeanteil sowie Sonder-AfA nach § 7b EStG.`
  ];

  dom.assumptionNotes.innerHTML = notes.map((note) => `<div class="assumption-note">${note}</div>`).join("");
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
