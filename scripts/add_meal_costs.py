#!/usr/bin/env python3
"""
Add mealBudget and mealMidRange fields to costOfLiving.json.

mealBudget:   Cost per person for a single meal at an inexpensive/budget restaurant (USD)
mealMidRange: Cost per person for a single meal at a mid-range restaurant (USD)
              (Numbeo's "Meal for 2 at Mid-Range" / 2)

Sources: Numbeo.com prices by country (April 2026), cross-referenced with
travel blogs and regional cost guides.
"""
import json
import os

# Known per-meal costs in USD from Numbeo and travel data sources
# Format: code -> (mealBudget, mealMidRange)
KNOWN_MEAL_COSTS: dict[str, tuple[float, float]] = {
    # ─── Europe (Western) ──────────────────────────────────────────────
    "AD": (14.0, 28.0),   # Andorra
    "AT": (14.0, 30.0),   # Austria
    "BE": (18.0, 35.0),   # Belgium
    "CH": (32.0, 55.0),   # Switzerland
    "DE": (16.5, 36.0),   # Germany
    "DK": (24.0, 43.0),   # Denmark
    "ES": (14.0, 25.0),   # Spain
    "FI": (16.0, 35.0),   # Finland
    "FO": (20.0, 40.0),   # Faroe Islands
    "FR": (16.0, 32.0),   # France
    "GB": (17.0, 35.0),   # UK
    "GI": (15.0, 30.0),   # Gibraltar
    "GL": (22.0, 45.0),   # Greenland
    "GR": (12.0, 22.0),   # Greece (in types)
    "IE": (18.0, 35.0),   # Ireland
    "IM": (16.0, 32.0),   # Isle of Man
    "IS": (22.0, 45.0),   # Iceland
    "IT": (15.0, 30.0),   # Italy
    "LI": (30.0, 50.0),   # Liechtenstein
    "LU": (18.0, 38.0),   # Luxembourg
    "MC": (25.0, 50.0),   # Monaco
    "MT": (13.0, 28.0),   # Malta
    "NL": (17.0, 35.0),   # Netherlands
    "NO": (24.0, 45.0),   # Norway
    "PT": (13.0, 25.0),   # Portugal
    "SE": (16.0, 35.0),   # Sweden
    "SM": (14.0, 28.0),   # San Marino

    # ─── Europe (Eastern & Central) ────────────────────────────────────
    "AL": (5.0, 12.0),    # Albania
    "BA": (5.5, 12.0),    # Bosnia
    "BG": (7.0, 15.0),    # Bulgaria
    "BY": (6.0, 14.0),    # Belarus
    "CZ": (9.0, 18.0),    # Czech Republic
    "CY": (12.0, 25.0),   # Cyprus
    "EE": (10.0, 22.0),   # Estonia
    "GE": (5.0, 12.0),    # Georgia
    "HR": (10.0, 22.0),   # Croatia
    "HU": (8.0, 17.0),    # Hungary
    "LT": (9.0, 18.0),    # Lithuania
    "LV": (10.0, 20.0),   # Latvia
    "MD": (5.0, 12.0),    # Moldova
    "ME": (7.0, 15.0),    # Montenegro
    "MK": (5.0, 12.0),    # North Macedonia
    "PL": (8.0, 17.0),    # Poland
    "RO": (7.0, 15.0),    # Romania
    "RS": (6.5, 14.0),    # Serbia
    "RU": (7.0, 16.0),    # Russia
    "SI": (11.0, 25.0),   # Slovenia
    "SK": (8.0, 18.0),    # Slovakia
    "UA": (4.5, 10.0),    # Ukraine
    "XK": (4.5, 10.0),    # Kosovo (if present)

    # ─── North America ─────────────────────────────────────────────────
    "US": (20.0, 37.5),   # USA
    "CA": (18.0, 35.0),   # Canada
    "BM": (25.0, 50.0),   # Bermuda
    "KY": (20.0, 40.0),   # Cayman Islands
    "PR": (12.0, 25.0),   # Puerto Rico
    "VI": (18.0, 35.0),   # US Virgin Islands
    "VG": (18.0, 35.0),   # British Virgin Islands
    "GU": (15.0, 30.0),   # Guam
    "MP": (12.0, 25.0),   # N. Mariana Islands
    "AS": (12.0, 25.0),   # American Samoa

    # ─── Central America & Caribbean ───────────────────────────────────
    "MX": (10.0, 20.0),   # Mexico
    "GT": (5.0, 12.0),    # Guatemala
    "BZ": (7.0, 15.0),    # Belize
    "HN": (4.5, 10.0),    # Honduras
    "SV": (5.0, 11.0),    # El Salvador
    "NI": (4.0, 9.0),     # Nicaragua
    "CR": (8.0, 18.0),    # Costa Rica
    "PA": (7.0, 18.0),    # Panama
    "CU": (4.0, 10.0),    # Cuba
    "JM": (6.0, 15.0),    # Jamaica
    "HT": (4.0, 10.0),    # Haiti
    "DO": (5.0, 14.0),    # Dominican Republic
    "TT": (6.0, 16.0),    # Trinidad & Tobago
    "BB": (12.0, 28.0),   # Barbados
    "BS": (15.0, 35.0),   # Bahamas
    "AG": (10.0, 25.0),   # Antigua & Barbuda
    "DM": (8.0, 18.0),    # Dominica
    "GD": (7.0, 16.0),    # Grenada
    "KN": (8.0, 20.0),    # St Kitts
    "LC": (8.0, 18.0),    # St Lucia
    "VC": (6.0, 15.0),    # St Vincent
    "CW": (10.0, 22.0),   # Curaçao
    "SX": (12.0, 28.0),   # Sint Maarten
    "MF": (15.0, 30.0),   # St Martin (French)
    "TC": (14.0, 30.0),   # Turks & Caicos
    "AW": (12.0, 25.0),   # Aruba

    # ─── South America ─────────────────────────────────────────────────
    "BR": (5.5, 15.0),    # Brazil
    "AR": (6.0, 14.0),    # Argentina
    "CL": (8.0, 18.0),    # Chile
    "CO": (4.0, 11.0),    # Colombia
    "PE": (4.0, 12.0),    # Peru
    "EC": (4.0, 12.0),    # Ecuador
    "VE": (5.0, 12.0),    # Venezuela
    "BO": (3.0, 8.0),     # Bolivia
    "PY": (4.5, 11.0),    # Paraguay
    "UY": (10.0, 22.0),   # Uruguay
    "GY": (5.0, 12.0),    # Guyana
    "SR": (5.0, 12.0),    # Suriname

    # ─── East Asia ─────────────────────────────────────────────────────
    "JP": (8.0, 22.0),    # Japan
    "KR": (8.0, 18.0),    # South Korea
    "CN": (4.0, 12.0),    # China
    "TW": (4.5, 14.0),    # Taiwan
    "HK": (8.0, 22.0),    # Hong Kong
    "MO": (7.0, 20.0),    # Macau
    "MN": (4.0, 10.0),    # Mongolia
    "KP": (3.0, 8.0),     # North Korea

    # ─── Southeast Asia ────────────────────────────────────────────────
    "TH": (3.0, 13.0),    # Thailand
    "VN": (2.0, 10.0),    # Vietnam
    "ID": (2.0, 8.0),     # Indonesia
    "PH": (3.0, 10.0),    # Philippines
    "MY": (3.5, 10.0),    # Malaysia
    "SG": (7.0, 25.0),    # Singapore
    "KH": (3.0, 10.0),    # Cambodia
    "LA": (2.5, 8.0),     # Laos
    "MM": (2.0, 7.0),     # Myanmar
    "BN": (4.0, 14.0),    # Brunei
    "TL": (3.5, 10.0),    # Timor-Leste

    # ─── South Asia ────────────────────────────────────────────────────
    "IN": (2.5, 8.0),     # India
    "LK": (2.5, 8.0),     # Sri Lanka
    "BD": (2.0, 6.0),     # Bangladesh
    "NP": (2.5, 7.0),     # Nepal
    "PK": (2.0, 6.0),     # Pakistan
    "BT": (4.0, 10.0),    # Bhutan
    "MV": (6.0, 20.0),    # Maldives

    # ─── Central Asia ──────────────────────────────────────────────────
    "KZ": (5.0, 12.0),    # Kazakhstan
    "UZ": (3.0, 8.0),     # Uzbekistan
    "KG": (3.5, 8.0),     # Kyrgyzstan
    "TJ": (3.0, 7.0),     # Tajikistan
    "TM": (4.0, 10.0),    # Turkmenistan
    "AZ": (5.0, 14.0),    # Azerbaijan
    "AM": (5.0, 13.0),    # Armenia

    # ─── Middle East ───────────────────────────────────────────────────
    "AE": (10.0, 25.0),   # UAE
    "SA": (8.0, 20.0),    # Saudi Arabia
    "QA": (8.0, 22.0),    # Qatar
    "KW": (6.0, 18.0),    # Kuwait
    "BH": (6.0, 16.0),    # Bahrain
    "OM": (6.0, 15.0),    # Oman
    "JO": (5.0, 14.0),    # Jordan
    "LB": (6.0, 18.0),    # Lebanon
    "IL": (26.0, 42.0),   # Israel
    "PS": (4.0, 10.0),    # Palestine
    "IQ": (4.0, 10.0),    # Iraq
    "IR": (3.0, 8.0),     # Iran
    "SY": (3.0, 8.0),     # Syria
    "YE": (3.0, 6.0),     # Yemen
    "TR": (5.0, 12.0),    # Turkey

    # ─── North Africa ──────────────────────────────────────────────────
    "MA": (3.5, 10.0),    # Morocco
    "TN": (3.0, 9.0),     # Tunisia
    "DZ": (3.0, 8.0),     # Algeria
    "EG": (3.0, 8.0),     # Egypt
    "LY": (4.0, 10.0),    # Libya
    "SD": (3.0, 7.0),     # Sudan

    # ─── Sub-Saharan Africa (East) ─────────────────────────────────────
    "KE": (3.0, 10.0),    # Kenya
    "TZ": (3.0, 9.0),     # Tanzania
    "UG": (3.0, 8.0),     # Uganda
    "RW": (3.5, 10.0),    # Rwanda
    "ET": (2.5, 7.0),     # Ethiopia
    "SO": (3.0, 7.0),     # Somalia
    "DJ": (6.0, 15.0),    # Djibouti
    "ER": (3.0, 7.0),     # Eritrea
    "SS": (4.0, 8.0),     # South Sudan
    "MG": (2.5, 7.0),     # Madagascar
    "MU": (6.0, 16.0),    # Mauritius
    "SC": (12.0, 28.0),   # Seychelles
    "KM": (4.0, 10.0),    # Comoros
    "BI": (3.0, 7.0),     # Burundi

    # ─── Sub-Saharan Africa (West) ─────────────────────────────────────
    "NG": (3.0, 10.0),    # Nigeria
    "GH": (4.0, 10.0),    # Ghana
    "SN": (3.5, 10.0),    # Senegal
    "CI": (4.0, 10.0),    # Ivory Coast
    "CM": (3.0, 8.0),     # Cameroon
    "GM": (3.0, 8.0),     # Gambia
    "ML": (3.0, 8.0),     # Mali
    "BF": (2.5, 7.0),     # Burkina Faso
    "NE": (2.5, 6.0),     # Niger
    "GN": (3.0, 7.0),     # Guinea
    "GW": (3.0, 7.0),     # Guinea-Bissau
    "SL": (3.0, 7.0),     # Sierra Leone
    "LR": (4.0, 8.0),     # Liberia
    "TG": (3.0, 7.0),     # Togo
    "BJ": (3.0, 8.0),     # Benin
    "GQ": (8.0, 20.0),    # Equatorial Guinea
    "GA": (8.0, 18.0),    # Gabon
    "CG": (5.0, 12.0),    # Congo-Brazzaville
    "CD": (4.0, 10.0),    # DR Congo
    "CF": (4.0, 8.0),     # Central African Rep.
    "TD": (4.0, 8.0),     # Chad
    "MR": (4.0, 9.0),     # Mauritania
    "CV": (5.0, 12.0),    # Cape Verde
    "ST": (5.0, 12.0),    # Sao Tome
    "AO": (8.0, 18.0),    # Angola

    # ─── Sub-Saharan Africa (Southern) ─────────────────────────────────
    "ZA": (6.0, 15.0),    # South Africa
    "NA": (5.0, 14.0),    # Namibia
    "BW": (5.0, 14.0),    # Botswana
    "MW": (3.0, 7.0),     # Malawi
    "MZ": (3.5, 8.0),     # Mozambique
    "ZM": (4.0, 10.0),    # Zambia
    "ZW": (5.0, 12.0),    # Zimbabwe
    "SZ": (4.0, 10.0),    # Eswatini
    "LS": (3.5, 8.0),     # Lesotho

    # ─── Oceania ───────────────────────────────────────────────────────
    "AU": (18.0, 35.0),   # Australia
    "NZ": (14.0, 30.0),   # New Zealand
    "FJ": (6.0, 16.0),    # Fiji
    "PG": (5.0, 14.0),    # Papua New Guinea
    "NC": (16.0, 35.0),   # New Caledonia
    "PF": (16.0, 35.0),   # French Polynesia
    "VU": (6.0, 15.0),    # Vanuatu
    "WS": (6.0, 14.0),    # Samoa
    "TO": (6.0, 14.0),    # Tonga
    "SB": (5.0, 12.0),    # Solomon Islands
    "KI": (5.0, 12.0),    # Kiribati
    "FM": (5.0, 12.0),    # Micronesia
    "MH": (8.0, 16.0),    # Marshall Islands
    "NR": (8.0, 16.0),    # Nauru
    "PW": (10.0, 22.0),   # Palau
    "TV": (5.0, 12.0),    # Tuvalu
    "AF": (2.5, 6.0),     # Afghanistan
}


def estimate_meal_costs(entry: dict) -> tuple[float, float]:
    """Estimate meal costs for countries without known data.
    Uses a formula based on totalBasic (monthly living cost) or groceries."""
    code = entry["code"]

    # If we have known data, use it
    if code in KNOWN_MEAL_COSTS:
        return KNOWN_MEAL_COSTS[code]

    # Estimate from totalBasic or groceries
    total = entry.get("totalBasic") or entry.get("totalComfortable")
    groceries = entry.get("groceries")

    if total and total > 0:
        # Budget meal ≈ totalBasic / 100  (rough scaling)
        # Mid-range meal ≈ totalBasic / 40
        budget = round(max(1.5, total / 100), 1)
        mid = round(max(4.0, total / 40), 1)
    elif groceries and groceries > 0:
        # Budget meal ≈ groceries / 30  (daily groceries as baseline)
        daily_groc = groceries / 30
        budget = round(max(1.5, daily_groc * 0.9), 1)
        mid = round(max(4.0, daily_groc * 2.3), 1)
    else:
        # Absolute fallback for countries with no data
        budget = 5.0
        mid = 12.0

    # Cap at reasonable ranges
    budget = min(budget, 35.0)
    mid = min(mid, 60.0)

    return (budget, mid)


def main():
    path = os.path.join(
        os.path.dirname(__file__),
        "..", "server", "src", "data", "costOfLiving.json"
    )
    path = os.path.normpath(path)

    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    updated = 0
    estimated = 0

    for entry in raw["data"]:
        code = entry["code"]
        budget, mid = estimate_meal_costs(entry)

        if code in KNOWN_MEAL_COSTS:
            updated += 1
        else:
            estimated += 1

        entry["mealBudget"] = budget
        entry["mealMidRange"] = mid

    with open(path, "w", encoding="utf-8") as f:
        json.dump(raw, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"Updated {updated} countries with known data")
    print(f"Estimated {estimated} countries from formula")
    print(f"Total: {updated + estimated}")

    # Print a sample to verify
    sample_codes = ["BR", "TH", "VN", "MX", "US", "DE", "PT", "JP", "IN", "EG", "KE", "AU"]
    print("\nSample data:")
    print(f"{'Code':<6} {'mealBudget':>10} {'mealMidRange':>12} {'groceries':>10}")
    for entry in raw["data"]:
        if entry["code"] in sample_codes:
            print(f"{entry['code']:<6} ${entry['mealBudget']:>8.1f}  ${entry['mealMidRange']:>10.1f}  ${entry.get('groceries', 'N/A'):>8}")


if __name__ == "__main__":
    main()
