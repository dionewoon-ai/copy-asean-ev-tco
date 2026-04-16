# ASEAN + Taiwan — EV Total Cost of Ownership Dashboard

**Live dashboard:** https://dionewoon-ai.github.io/copy-asean-ev-tco/

**Data & assumptions (Google Sheet):** *(add your Google Sheet link here)*

---

## What This Is

An interactive browser-based tool that models the **Total Cost of Ownership (TCO)** of electric vehicles vs ICE vehicles across 9 markets: Thailand, Vietnam, Indonesia, Malaysia, Singapore, Philippines, Cambodia, Myanmar, and Taiwan.

Built by a member of Grab's Strategy team to support **data-driven decisions on EV fleet transition** — covering personal drivers, ride-hail/taxi operators, and delivery fleets, across cars and 2-wheel motorbikes.

---

## Business Context & Why This Matters

### The core question this answers
> *At what point does it make economic sense for Grab drivers, fleet operators, and the platform itself to transition to EVs — and what needs to be true for that to happen?*

### Strategic decisions this supports

| Decision | How to use the dashboard |
|----------|--------------------------|
| **City-level EV deployment timing** | Compare breakeven years across cities — prioritise cities where EV TCO is already favourable (e.g. Vietnam, Singapore) |
| **Fleet procurement advice** | Show operators the 5-yr net TCO savings vs ICE by segment; use as a business case template for fleet partnerships |
| **Charging infrastructure investment** | Use the "Charging Infrastructure Capacity Constraint" section to size charger buildout needed before deploying a target fleet size |
| **Driver incentive design** | The per-trip ICE cost penalty shows how much value EV transition creates per trip — informs how to structure driver transition subsidies |
| **Country policy engagement** | The EV Policy & Market Comparison table gives a side-by-side view of subsidies, duties, and EV share for advocacy conversations with government |
| **Operator/partner pitches** | The Marketplace Economics section models ROI on fleet EV transition at city scale — useful for GrabFleet, logistics, and car rental partners |
| **2-wheel delivery fleet decisions** | Motorbike segment modelling (GrabFood, GrabExpress) with battery swap vs plug-in charging comparison |

### Limitations to communicate
- Prices are verified from public sources (OEM websites, dealer listings, media) as of 2025–2026. They are **not official Grab procurement prices.**
- The model uses publicly available electricity and fuel tariffs. Actual rates negotiated by fleet operators may differ.
- Charging downtime costs are modelled assumptions — real driver behaviour data would sharpen these significantly.
- Country-level analysis does not account for micro-market variations within cities.

---

## How to Use the Dashboard

### Section 1 — Single Country TCO
1. **Select a country** from the top bar
2. **Select a city** — charger counts and price multipliers adjust per city
3. **Set use case:** Personal Driver / Taxi / Fleet — this scales annual km, home charging, maintenance, and whether downtime costs apply
4. **Choose a vehicle segment:** Compact / Mid-size / SUV / MPV / Premium MPV / Motorbike
5. Adjust **sliders** (fuel price, electricity rate, subsidy, years of ownership, etc.) to model specific scenarios
6. **Read the outputs:**
   - Breakeven year (when does EV become cheaper than ICE?)
   - Total savings over ownership period
   - Charging Reality — does daily km require mid-shift charging?
   - Charging Infrastructure Capacity — can the city's charger network support a fleet of this size?
   - Year-by-year TCO table and charts

### Section 2 — Cross-Country Comparison
- Switch to **"Cross-Country"** tab
- Choose a vehicle segment
- See TCO, breakeven year, and energy cost ratio side-by-side across all 9 markets

### Section 3 — Grab Marketplace Economics
- Select a **vehicle segment** (GrabCar / Grab Premium / GrabExec / GrabBike)
- Set **fleet size, trips per day, trip distance, charger costs**
- The model calculates:
  - Per-trip ICE cost penalty (how much each ICE trip costs vs EV in fuel + maintenance + downtime)
  - Annual fleet-wide savings opportunity
  - Infrastructure investment required
  - Phased deployment ROI over 10 years (realistic ramp: 15% → 35% → 55% → 75% → 90% → 100%)
  - Real-world barriers to transition (capital gap, charger buildout time, grid capacity, driver resistance)

---

## Assumptions & Model Logic

All assumptions are documented in [`data/model_assumptions.csv`](data/model_assumptions.csv). Key ones to be aware of:

### Financial model
- **Financing cost** is approximated as `price × interest_rate × years × 0.55` (accounts for declining balance)
- **Residual value** decays as an exponential curve: `price × (residual_floor + (1 - floor) × e^(-0.25 × year))`
- **Battery degradation**: 2% per year, affecting EV energy efficiency
- **Insurance**: Starts at annual rate, reduces 3%/year, floors at 70% of Y1
- **Maintenance**: Grows 5%/year to reflect ageing

### Charging & downtime model
- Fleet/taxi drivers are assumed to use **20% home/depot charging, 80% public DC**
- Personal drivers are assumed **70% home, 30% public**
- DC fast charger: 45 min (10→80%), AC Level 2: 6–10 hrs (full)
- ICE refuel: 8 min per stop, assumed every 500 km
- Annual downtime cost = extra hours lost to charging vs ICE × hourly earnings
- **No downtime cost for personal drivers** (they charge overnight)

### Infrastructure model
- DC charger capacity: **7 sessions/day** per charger
- AC charger capacity: **2.5 sessions/day** per charger
- Battery swap station: **120 sessions/day** per station
- Contention thresholds: <30% = Low, 30–60% = Moderate, 60–85% = High, >85% = Critical

### Marketplace Economics
- Phased deployment ramp: 0% → 15% → 35% → 55% → 75% → 90% → 100% over 5 years
- Hidden costs included: grid connection ($10K/DC charger), driver training ($30/driver), charger maintenance (6% DC, 4% AC annually), fleet management overhead ($50/car/yr, $15/bike/yr), EV loan premium (2%)

---

## Data Sources

- Vehicle prices: OEM websites, dealer listings, automotive media (2025–2026)
- Fuel prices: [GlobalPetrolPrices.com](https://www.globalpetrolprices.com/), [CleanTechnica](https://cleantechnica.com/2026/03/10/how-are-prices-of-gas-diesel-in-asean-and-where-do-we-go-from-here/)
- EV policy and subsidies: IEA Global EV Outlook 2025, official government sources
- Charger counts: Public EV charging databases, operator announcements

---

## Repository Structure

```
asean-ev-tco/
├── index.html                  # Full dashboard — all UI, logic, and charts
├── script.js                   # CSV loader (loads country_metrics.csv at runtime)
├── data/
│   ├── country_metrics.csv     # ✅ LIVE — overrides dashboard at runtime
│   ├── vehicle_prices.csv      # Reference — EV/ICE/hybrid prices by country & segment
│   ├── city_data.csv           # Reference — charger counts & multipliers per city
│   ├── model_assumptions.csv   # Reference — all financial & operational constants
│   ├── charge_specs.csv        # Reference — vehicle charging specs by segment
│   ├── use_case_multipliers.csv# Reference — personal/taxi/fleet scaling factors
│   ├── phased_deployment_ramp.csv # Reference — fleet conversion ramp by year
│   └── marketplace_segment_defaults.csv # Reference — Grab segment slider defaults
└── README.md
```

**Only `country_metrics.csv` is actively loaded into the dashboard.** The other CSVs are documentation/reference files mirroring what is currently hardcoded in `index.html`.

---

## Workflow: Keeping Data Up to Date

### Source of truth: Google Sheet

All data edits should originate in the **Google Sheet** (link above), not directly in the CSV files or `index.html`. This ensures a single traceable source of truth with commentary, change history, and formulas.

```
Google Sheet  →  Export as CSV  →  Replace file in repo  →  Commit & push  →  Live on GitHub Pages
```

### Step-by-step update process

1. **Update values in Google Sheet** (e.g. Malaysia's gas price changed)
2. Go to the relevant tab (e.g. `country_metrics`)
3. **File → Download → Comma-separated values (.csv)**
4. Replace the corresponding file in `data/` in this repo (e.g. `data/country_metrics.csv`)
5. Open Cursor / your editor, check the diff looks right in **Source Control**
6. **Stage → Commit** with a message like `update: Malaysia gas price to $0.52 (Apr 2026)`
7. **Push** — GitHub Pages automatically serves the updated CSV within ~1 minute

### What each CSV tab covers

| Google Sheet tab | CSV file | Update frequency |
|------------------|----------|-----------------|
| `country_metrics` | `data/country_metrics.csv` | Monthly or when fuel/electricity prices change significantly |
| `vehicle_prices` | `data/vehicle_prices.csv` | Quarterly or when a new model launches / price changes |
| `city_data` | `data/city_data.csv` | Quarterly or when charger rollout announcements are made |
| `model_assumptions` | `data/model_assumptions.csv` | Only when methodology changes — document reasoning in Sheet |
| `charge_specs` | `data/charge_specs.csv` | Rarely — only if a new vehicle segment is added |
| `use_case_multipliers` | `data/use_case_multipliers.csv` | Rarely — only if use case definitions change |
| `phased_deployment_ramp` | `data/phased_deployment_ramp.csv` | Scenario-dependent — adjust for specific partner proposals |
| `marketplace_segment_defaults` | `data/marketplace_segment_defaults.csv` | When Grab trip data (avg trips/day, km/trip) is refreshed |

### Git commit message conventions

```
update: <what changed> (<date or source>)
fix: <what was wrong and what was corrected>
add: <new country / segment / feature>
```

Example: `update: Singapore electricity rate to $0.48/kWh (SP Group Apr 2026)`

---

## Roadmap / Future Improvements

- [ ] Wire remaining CSVs into the dashboard (vehicle prices, city data) so `index.html` has no hardcoded numbers
- [ ] Add Grab-specific trip data (avg trips/day, km/trip from internal data) to replace public estimates
- [ ] Add a "scenario comparison" mode — save and compare two parameter sets side-by-side
- [ ] Add fleet size sensitivity — show how breakeven changes at 100 / 500 / 5,000 / 50,000 vehicle scale
- [ ] Integrate real charger utilisation data (if available from partners) vs modelled capacity
- [ ] Add carbon emissions comparison alongside TCO

---

## Contact

Built by the Grab Strategy team. For questions on methodology, data sources, or business applications, reach out to **Dione Woon**.
