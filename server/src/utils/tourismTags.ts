/**
 * Tourism tags — activity / destination type tags per country.
 * Used as filter chips in the tourism weight panel.
 *
 * Each function receives restcountries data + climate data and returns boolean.
 */

// ──────────────────────────────────────────────────────────────────────────────
// Tag: beachDestination
// Warm coastline suitable for swimming (hottest month ≥ 24 °C, not landlocked)
// ──────────────────────────────────────────────────────────────────────────────

// Countries universally known as beach destinations, regardless of what data says
const BEACH_OVERRIDE: Set<string> = new Set([
  "MV", // Maldives
  "SC", // Seychelles
  "MU", // Mauritius
  "FJ", // Fiji
  "BS", // Bahamas
  "BB", // Barbados
  "JM", // Jamaica
  "CU", // Cuba
  "DO", // Dominican Republic
  "CR", // Costa Rica
  "TH", // Thailand
  "ID", // Indonesia (Bali)
  "PH", // Philippines
  "VN", // Vietnam
  "MY", // Malaysia
  "LK", // Sri Lanka
  "GR", // Greece
  "HR", // Croatia
  "ES", // Spain
  "PT", // Portugal
  "IT", // Italy
  "TR", // Turkey
  "EG", // Egypt (Red Sea)
  "TN", // Tunisia
  "MA", // Morocco
  "BR", // Brazil
  "MX", // Mexico
  "PA", // Panama
  "CO", // Colombia
  "AU", // Australia
  "NZ", // New Zealand
  "ZA", // South Africa
  "KE", // Kenya (coast)
  "TZ", // Tanzania (Zanzibar)
  "MZ", // Mozambique
  "CV", // Cape Verde
  "CY", // Cyprus
  "MT", // Malta
  "ME", // Montenegro
  "AL", // Albania
  "BG", // Bulgaria
  "RO", // Romania (Black Sea)
  "UA", // Ukraine (Black Sea - seasonal)
  "GE", // Georgia (Black Sea)
  "AE", // UAE (Dubai beaches)
  "OM", // Oman
  "SA", // Saudi Arabia (Red Sea)
  "BH", // Bahrain
  "QA", // Qatar
  "KH", // Cambodia
  "MM", // Myanmar
  "BN", // Brunei
  "TL", // Timor-Leste
  "PG", // Papua New Guinea
  "NC", // New Caledonia
  "PF", // French Polynesia
  "VU", // Vanuatu
  "WS", // Samoa
  "TO", // Tonga
  "SB", // Solomon Islands
  "KI", // Kiribati
  "TV", // Tuvalu
  "PW", // Palau
  "FM", // Micronesia
  "MH", // Marshall Islands
  "NR", // Nauru
  "AG", // Antigua
  "DM", // Dominica
  "GD", // Grenada
  "KN", // St Kitts
  "LC", // St Lucia
  "VC", // St Vincent
  "TT", // Trinidad
  "CW", // Curacao
  "AW", // Aruba
  "BZ", // Belize
  "HN", // Honduras (Bay Islands)
  "NI", // Nicaragua
  "SV", // El Salvador
  "GT", // Guatemala
  "SN", // Senegal
  "GM", // Gambia
  "GH", // Ghana
  "NG", // Nigeria
  "CM", // Cameroon
  "GA", // Gabon
  "AO", // Angola
  "NA", // Namibia
  "EC", // Ecuador
  "PE", // Peru
  "CL", // Chile
  "AR", // Argentina
  "UY", // Uruguay
  "VE", // Venezuela
  "GY", // Guyana
  "SR", // Suriname
  "PR", // Puerto Rico
  "VI", // US Virgin Islands
  "VG", // British Virgin Islands
  "BM", // Bermuda
  "KY", // Cayman Islands
  "TC", // Turks & Caicos
  "SX", // Sint Maarten
  "MF", // St Martin
  "IL", // Israel (Tel Aviv + Eilat)
  "LB", // Lebanon
  "JP", // Japan
  "KR", // South Korea
  "TW", // Taiwan
  "CN", // China
  "IN", // India (Goa, Kerala)
  "BD", // Bangladesh (Cox's Bazar)
  "PK", // Pakistan (coast)
  "IR", // Iran (Kish, Persian Gulf)
  "IQ", // Iraq (limited)
  "SG", // Singapore (Sentosa)
  "HK", // Hong Kong
]);

export function isBeachDestination(
  iso2: string,
  landlocked: boolean,
  hottestMonth: number | undefined,
): boolean {
  if (BEACH_OVERRIDE.has(iso2)) return true;
  if (landlocked) return false;
  return (hottestMonth ?? 0) >= 24;
}

// ──────────────────────────────────────────────────────────────────────────────
// Tag: islandNation
// ──────────────────────────────────────────────────────────────────────────────

const ISLAND_NATIONS: Set<string> = new Set([
  "MV",
  "SC",
  "MU",
  "FJ",
  "BS",
  "BB",
  "JM",
  "CU",
  "DO",
  "HT",
  "TT",
  "AG",
  "DM",
  "GD",
  "KN",
  "LC",
  "VC",
  "CW",
  "AW",
  "BM",
  "KY",
  "TC",
  "SX",
  "MF",
  "VG",
  "VI",
  "PR",
  "PH",
  "ID",
  "SG",
  "BN",
  "TL",
  "MY", // Borneo-based
  "JP",
  "KR", // technically not but key islands
  "TW",
  "HK",
  "MO",
  "PG",
  "NC",
  "PF",
  "VU",
  "WS",
  "TO",
  "SB",
  "KI",
  "FM",
  "MH",
  "NR",
  "PW",
  "TV",
  "IS",
  "GB",
  "IE",
  "MT",
  "CY",
  "CV",
  "ST",
  "KM",
  "MG",
  "NZ",
  "AU",
  "BH",
  "GU",
  "AS",
  "MP",
  "FO",
  "GL",
]);

export function isIslandNation(iso2: string): boolean {
  return ISLAND_NATIONS.has(iso2);
}

// ──────────────────────────────────────────────────────────────────────────────
// Tag: skiResorts
// ──────────────────────────────────────────────────────────────────────────────

const SKI_COUNTRIES: Set<string> = new Set([
  "AT",
  "CH",
  "FR",
  "IT",
  "DE",
  "AD", // Alps core
  "NO",
  "SE",
  "FI", // Scandinavia
  "US",
  "CA", // North America
  "JP", // Niseko, Hakuba
  "NZ",
  "AU", // Southern hemisphere
  "ES", // Sierra Nevada, Pyrenees
  "BG", // Bansko
  "RO", // Sinaia, Poiana Brasov
  "SK", // Jasná, Tatras
  "CZ", // Krkonoše
  "PL", // Zakopane
  "SI", // Julian Alps
  "BA", // Jahorina
  "RS", // Kopaonik
  "ME", // Kolašin
  "GE", // Gudauri, Bakuriani
  "AM", // Tsaghkadzor
  "IR", // Dizin, Tochal
  "CL", // Portillo, Valle Nevado
  "AR", // Bariloche, Las Leñas
  "KR", // Pyeongchang
  "CN", // Multiple resorts
  "IN", // Gulmarg, Auli
  "TR", // Palandöken, Uludağ
  "IS", // Akureyri
  "RU", // Sochi region
  "KZ", // Shymbulak
  "KG", // Karakol
  "UA", // Bukovel
  "LI", // Malbun
  "MK", // Popova Shapka
  "GR", // Parnassos
  "LB", // Faraya, Cedars
  "MN", // Sky Resort
  "PT", // Serra da Estrela
  "HR", // Sljeme
]);

export function hasSkiResorts(iso2: string): boolean {
  return SKI_COUNTRIES.has(iso2);
}

// ──────────────────────────────────────────────────────────────────────────────
// Tag: mountaineering — significant mountains / trekking
// ──────────────────────────────────────────────────────────────────────────────

const MOUNTAIN_COUNTRIES: Set<string> = new Set([
  "NP", // Himalayas, Everest, Annapurna
  "PE", // Andes, Machu Picchu trails
  "BO", // Andes, Huayna Potosí
  "TZ", // Kilimanjaro
  "KE", // Mount Kenya
  "UG", // Rwenzori
  "EC", // Cotopaxi, Chimborazo
  "CL", // Torres del Paine, Andes
  "AR", // Aconcagua, Patagonia
  "CO", // Sierra Nevada
  "US", // Rockies, Appalachians, Cascades
  "CA", // Canadian Rockies
  "CH", // Swiss Alps
  "AT", // Austrian Alps
  "FR", // Mont Blanc, Pyrenees
  "IT", // Dolomites
  "DE", // Bavarian Alps
  "ES", // Pyrenees, Sierra Nevada
  "NO", // Jotunheimen, Lofoten
  "SE", // Kungsleden
  "IS", // Highland treks
  "NZ", // Southern Alps, Milford Track
  "AU", // Blue Mountains
  "JP", // Mount Fuji, Japan Alps
  "CN", // Himalayas (Tibet), Huangshan
  "IN", // Himalayas, Western Ghats
  "PK", // Karakoram, K2
  "KG", // Tien Shan
  "KZ", // Tien Shan
  "TJ", // Pamirs
  "GE", // Caucasus
  "AM", // Lesser Caucasus
  "AZ", // Greater Caucasus
  "RU", // Elbrus, Caucasus, Altai
  "TR", // Ararat, Lycian Way
  "IR", // Alborz, Zagros
  "MA", // Atlas Mountains
  "ET", // Simien Mountains
  "RW", // Volcanoes NP (gorilla trekking)
  "MN", // Altai
  "ID", // Rinjani, Bromo, Papua peaks
  "MY", // Kinabalu
  "PH", // Pulag, Apo
  "TW", // Jade Mountain
  "VN", // Fansipan
  "LA", // Northern highlands
  "MM", // Hkakabo Razi
  "BT", // Snowman Trek
  "LK", // Adam's Peak, Knuckles
  "SI", // Julian Alps
  "HR", // Velebit
  "ME", // Durmitor
  "AL", // Albanian Alps
  "BA", // Dinaric Alps
  "GR", // Mount Olympus
  "BG", // Rila, Pirin
  "RO", // Carpathians
  "SK", // High Tatras
  "PL", // Tatras
  "PT", // Madeira, Azores
  "UA", // Carpathians
  "MG", // Andringitra
  "SC", // Morne Seychellois
  "CR", // Chirripó
  "GT", // Volcanos
  "HN", // Celaque
  "PA", // Barú
]);

export function hasMountaineering(iso2: string): boolean {
  return MOUNTAIN_COUNTRIES.has(iso2);
}

// ──────────────────────────────────────────────────────────────────────────────
// Tag: historicCities — rich urban historical heritage
// ──────────────────────────────────────────────────────────────────────────────

const HISTORIC_CITIES_COUNTRIES: Set<string> = new Set([
  "IT",
  "FR",
  "ES",
  "GR",
  "TR",
  "EG",
  "DE",
  "AT",
  "CZ",
  "PL",
  "HU",
  "HR",
  "PT",
  "GB",
  "IE",
  "NL",
  "BE",
  "LU",
  "RO",
  "BG",
  "RS",
  "BA",
  "ME",
  "AL",
  "MK",
  "RU",
  "UA",
  "BY",
  "GE",
  "AM",
  "MA",
  "TN",
  "DZ",
  "LY",
  "IR",
  "IQ",
  "JO",
  "LB",
  "SY",
  "PS",
  "IL",
  "IN",
  "LK",
  "NP",
  "PK",
  "CN",
  "JP",
  "KR",
  "TW",
  "VN",
  "KH",
  "MM",
  "LA",
  "TH",
  "MX",
  "PE",
  "CO",
  "EC",
  "GT",
  "BO",
  "CU",
  "ET",
  "KE",
  "TZ",
  "GH",
  "SN",
  "ML",
  "UZ",
  "KG",
  "KZ",
  "TJ",
  "US",
  "CA",
  "BR",
  "AR",
  "SE",
  "NO",
  "DK",
  "FI",
  "CH",
  "LI",
  "SM",
  "MT",
  "CY",
  "AD",
  "SI",
  "SK",
  "EE",
  "LT",
  "LV",
  "MD",
  "SA",
  "OM",
  "AE",
  "YE",
  "AU",
  "NZ",
  "ID",
  "MY",
  "PH",
]);

export function hasHistoricCities(iso2: string): boolean {
  return HISTORIC_CITIES_COUNTRIES.has(iso2);
}

// ──────────────────────────────────────────────────────────────────────────────
// Tag: wildlifeSafari — notable wildlife / safari tourism
// ──────────────────────────────────────────────────────────────────────────────

const WILDLIFE_COUNTRIES: Set<string> = new Set([
  "KE",
  "TZ",
  "ZA",
  "BW",
  "NA",
  "UG",
  "RW",
  "ZM",
  "ZW",
  "MZ",
  "ET",
  "MG",
  "MW",
  "SZ",
  "IN",
  "LK",
  "NP",
  "BT",
  "BR",
  "CR",
  "EC",
  "PE",
  "CO",
  "AU",
  "NZ",
  "PG",
  "ID", // Komodo, orangutans
  "MY", // Borneo orangutans
  "TH", // Elephants
  "CN", // Pandas
  "US",
  "CA", // Bears, wolves, bison
  "NO",
  "IS",
  "GL", // Arctic wildlife, whale watching
  "AR", // Patagonia penguins, whales
  "CL", // Patagonia
  "GA", // Gorillas, forest elephants
  "CG", // Gorillas
  "CD", // Mountain gorillas
  "CM", // Wildlife reserves
  "GH", // Mole NP
  "SN", // Djoudj NP
  "AO", // Kissama NP
  "MV", // Marine life
  "SC", // Tortoises, marine life
  "FJ", // Marine life
  "PH", // Whale sharks, tarsiers
  "JP", // Snow monkeys, Okinawa marine
]);

export function hasWildlifeSafari(iso2: string): boolean {
  return WILDLIFE_COUNTRIES.has(iso2);
}

// ──────────────────────────────────────────────────────────────────────────────
// Tag: divingSnorkeling — renowned diving/snorkeling spots
// ──────────────────────────────────────────────────────────────────────────────

const DIVING_COUNTRIES: Set<string> = new Set([
  "EG", // Red Sea
  "MV", // Maldives
  "TH", // Similan, Koh Tao
  "ID", // Raja Ampat, Komodo
  "PH", // Tubbataha, Apo Reef
  "MY", // Sipadan
  "AU", // Great Barrier Reef
  "BZ", // Blue Hole
  "HN", // Roatán, Utila
  "MX", // Cenotes, Cozumel
  "CR", // Cocos Island
  "PA", // Coiba
  "EC", // Galápagos
  "CU", // Jardines de la Reina
  "BS", // Andros, Exumas
  "KY", // Stingray City
  "BB", // Shipwrecks
  "CW", // Reefs
  "AW", // Reefs
  "BM", // Shipwrecks
  "MU", // Reefs
  "SC", // Inner/outer islands
  "TZ", // Mafia, Pemba
  "MZ", // Tofo
  "KE", // Diani
  "MG", // Nosy Be
  "ZA", // Sardine Run, Aliwal Shoal
  "JP", // Okinawa
  "PW", // Palau
  "FM", // Chuuk/Truk lagoon
  "MH", // Bikini Atoll
  "FJ", // Soft coral capital
  "VU", // SS President Coolidge
  "NC", // Barrier reef
  "PG", // Kimbe Bay
  "TO", // Humpback whales
  "SB", // WWII wrecks
  "WS", // Reefs
  "OM", // Daymaniyat
  "JO", // Aqaba, Red Sea
  "SA", // Red Sea
  "IL", // Eilat
  "PT", // Azores
  "ES", // Canaries, Med
  "HR", // Adriatic
  "MT", // Blue Hole, wrecks
  "GR", // Med islands
  "TR", // Kaş, Fethiye
  "IT", // Sardinia, Ustica
  "FR", // Mediterranean, Réunion
  "IN", // Andaman, Lakshadweep
  "LK", // Trincomalee, Hikkaduwa
  "VN", // Nha Trang, Phú Quốc
  "KH", // Koh Rong
  "MM", // Mergui Archipelago
  "BN", // Brunei reefs
  "TL", // Atauro Island
  "CO", // San Andrés, Malpelo
  "BR", // Fernando de Noronha
  "CV", // Cape Verde
  "KR", // Jeju
  "TW", // Green Island, Kenting
  "NZ", // Poor Knights Islands
  "CY", // Zenobia wreck
  "AL", // Albanian Riviera
  "ME", // Adriatic
  "SG", // Sisters Islands
  "CN", // Hainan
  "US", // Florida Keys, Hawaii
  "PR", // Isla Mona
  "VI", // Buck Island
  "SN", // Gorée reefs
]);

export function hasDivingSnorkeling(iso2: string): boolean {
  return DIVING_COUNTRIES.has(iso2);
}

// ──────────────────────────────────────────────────────────────────────────────
// Tag: desertAdventure — desert landscapes and adventure tourism
// ──────────────────────────────────────────────────────────────────────────────

const DESERT_COUNTRIES: Set<string> = new Set([
  "EG", // Sahara, White Desert
  "MA", // Sahara, Merzouga
  "TN", // Grand Erg Oriental
  "DZ", // Sahara
  "LY", // Sahara
  "MR", // Sahara
  "ML", // Sahara edge
  "NE", // Ténéré
  "TD", // Ennedi Plateau
  "SD", // Nubian Desert
  "JO", // Wadi Rum
  "SA", // Rub al Khali
  "AE", // Dubai desert
  "OM", // Wahiba Sands
  "IR", // Dasht-e Lut, Dasht-e Kavir
  "IL", // Negev
  "PS", // Judean
  "IQ", // Western Desert
  "NA", // Namib, Sossusvlei
  "BW", // Kalahari
  "ZA", // Kalahari edge
  "US", // Mojave, Sonoran, Monument Valley
  "MX", // Baja, Sonoran
  "CL", // Atacama
  "PE", // Nazca, Ica
  "AR", // Patagonian steppe
  "AU", // Outback, Uluru
  "CN", // Gobi, Taklamakan
  "MN", // Gobi
  "IN", // Thar, Rajasthan
  "PK", // Cholistan, Thar
  "UZ", // Kyzylkum
  "TM", // Karakum
  "KZ", // Betpak-Dala
  "KG", // Semi-arid areas
  "ET", // Danakil Depression
  "DJ", // Lac Assal
  "ER", // Danakil
  "SO", // Arid terrain
  "YE", // Rub al Khali edge
  "KW", // Desert
  "BH", // Desert
  "QA", // Desert
]);

export function hasDesertAdventure(iso2: string): boolean {
  return DESERT_COUNTRIES.has(iso2);
}

// ──────────────────────────────────────────────────────────────────────────────
// All tags
// ──────────────────────────────────────────────────────────────────────────────

export type TourismTag =
  | "beach"
  | "island"
  | "ski"
  | "mountains"
  | "historic"
  | "wildlife"
  | "diving"
  | "desert";

export const ALL_TOURISM_TAGS: TourismTag[] = [
  "beach",
  "island",
  "ski",
  "mountains",
  "historic",
  "wildlife",
  "diving",
  "desert",
];

export function computeTourismTags(
  iso2: string,
  landlocked: boolean,
  hottestMonth: number | undefined,
): TourismTag[] {
  const tags: TourismTag[] = [];
  if (isBeachDestination(iso2, landlocked, hottestMonth)) tags.push("beach");
  if (isIslandNation(iso2)) tags.push("island");
  if (hasSkiResorts(iso2)) tags.push("ski");
  if (hasMountaineering(iso2)) tags.push("mountains");
  if (hasHistoricCities(iso2)) tags.push("historic");
  if (hasWildlifeSafari(iso2)) tags.push("wildlife");
  if (hasDivingSnorkeling(iso2)) tags.push("diving");
  if (hasDesertAdventure(iso2)) tags.push("desert");
  return tags;
}

// ──────────────────────────────────────────────────────────────────────────────
// Tag quality scores — curated 0-100 score per country per tag.
// Countries in the tag set but not in the score map get a default of 50.
// ──────────────────────────────────────────────────────────────────────────────

const BEACH_SCORES: Record<string, number> = {
  MV: 97,
  SC: 96,
  TH: 93,
  GR: 92,
  ID: 92,
  ES: 91,
  FJ: 91,
  MU: 91,
  AU: 90,
  PH: 88,
  BS: 88,
  HR: 87,
  IT: 87,
  PT: 86,
  CR: 86,
  BB: 86,
  LK: 85,
  JM: 85,
  MX: 85,
  DO: 84,
  BR: 84,
  MY: 83,
  CY: 83,
  CU: 82,
  VN: 82,
  TR: 82,
  NZ: 80,
  MT: 80,
  CO: 78,
  EG: 78,
  ZA: 78,
  PA: 76,
  ME: 76,
  AE: 75,
  KE: 72,
  AL: 72,
  TZ: 72,
  MZ: 70,
  BG: 68,
  RO: 62,
  UA: 58,
};

const ISLAND_SCORES: Record<string, number> = {
  MV: 97,
  SC: 96,
  FJ: 91,
  JP: 89,
  PH: 88,
  ID: 88,
  NZ: 87,
  IS: 86,
  MU: 85,
  GR: 85,
  AU: 84,
  BS: 83,
  GB: 82,
  LK: 80,
  BB: 80,
  CU: 78,
  MT: 78,
  CY: 78,
  MG: 76,
  VU: 75,
  TW: 75,
  KR: 74,
  PG: 72,
  SG: 70,
  IE: 70,
  PW: 78,
  NC: 72,
  PF: 85,
  WS: 70,
  TO: 68,
};

const SKI_SCORES: Record<string, number> = {
  AT: 97,
  CH: 96,
  FR: 95,
  IT: 91,
  JP: 90,
  US: 88,
  CA: 87,
  NO: 85,
  AD: 83,
  NZ: 80,
  AR: 80,
  ES: 78,
  SE: 78,
  CL: 78,
  SI: 76,
  GE: 74,
  BG: 72,
  FI: 72,
  KR: 72,
  TR: 72,
  SK: 70,
  CN: 70,
  PL: 68,
  RO: 68,
  DE: 75,
  CZ: 65,
  BA: 62,
  RS: 60,
  UA: 65,
  IS: 68,
};

const MOUNTAIN_SCORES: Record<string, number> = {
  NP: 98,
  CH: 96,
  NZ: 94,
  PE: 93,
  AR: 92,
  CL: 89,
  FR: 88,
  AT: 88,
  NO: 87,
  IT: 87,
  US: 86,
  CA: 86,
  CN: 85,
  JP: 84,
  IN: 84,
  PK: 83,
  TZ: 82,
  GE: 80,
  IS: 80,
  KG: 78,
  CO: 76,
  EC: 76,
  KE: 74,
  BO: 74,
  ID: 72,
  TR: 72,
  UG: 72,
  MN: 70,
  IR: 70,
  MA: 70,
  ET: 70,
  DE: 72,
  ES: 70,
  SE: 68,
  RU: 68,
  AU: 65,
  BT: 75,
  TJ: 72,
  KZ: 65,
};

const HISTORIC_SCORES: Record<string, number> = {
  IT: 98,
  GR: 96,
  EG: 95,
  FR: 94,
  ES: 93,
  TR: 92,
  CN: 91,
  IN: 91,
  PE: 90,
  JP: 89,
  MX: 88,
  GB: 87,
  DE: 86,
  IR: 86,
  CZ: 85,
  MA: 84,
  KH: 84,
  PT: 83,
  RU: 82,
  JO: 82,
  HR: 80,
  AT: 80,
  ET: 80,
  UZ: 80,
  HU: 78,
  PL: 78,
  VN: 75,
  TH: 75,
  LK: 74,
  NP: 74,
  CU: 72,
  RO: 72,
  CO: 70,
  IL: 76,
  KR: 75,
  SE: 72,
  NL: 74,
  BE: 73,
  IE: 72,
};

const WILDLIFE_SCORES: Record<string, number> = {
  KE: 97,
  TZ: 96,
  BW: 95,
  ZA: 94,
  UG: 92,
  AU: 91,
  CR: 90,
  BR: 88,
  IN: 87,
  NA: 86,
  EC: 85,
  RW: 84,
  ZM: 83,
  PE: 82,
  ZW: 81,
  ID: 80,
  MG: 80,
  LK: 78,
  US: 76,
  CA: 75,
  NO: 75,
  CO: 74,
  TH: 72,
  MY: 72,
  NZ: 72,
  CN: 70,
  GA: 70,
  JP: 68,
  AR: 68,
  CL: 65,
};

const DIVING_SCORES: Record<string, number> = {
  MV: 97,
  EG: 95,
  ID: 94,
  AU: 94,
  PH: 93,
  PW: 93,
  TH: 91,
  BZ: 90,
  MY: 90,
  HN: 88,
  EC: 88,
  FJ: 87,
  MX: 86,
  SC: 85,
  CR: 85,
  FM: 85,
  PG: 84,
  CU: 82,
  BS: 82,
  TZ: 82,
  MZ: 80,
  JP: 78,
  VU: 78,
  NC: 76,
  ZA: 75,
  SB: 75,
  MU: 75,
  HR: 72,
  MT: 72,
  PT: 70,
  GR: 70,
  IN: 70,
  LK: 70,
  ES: 68,
  IT: 66,
  TR: 65,
  VN: 68,
  CO: 68,
  BR: 70,
  NZ: 68,
  US: 72,
};

const DESERT_SCORES: Record<string, number> = {
  JO: 97,
  NA: 96,
  MA: 94,
  EG: 93,
  AU: 92,
  US: 88,
  CL: 87,
  AE: 85,
  OM: 84,
  IR: 82,
  MN: 80,
  SA: 80,
  PE: 78,
  IN: 76,
  CN: 75,
  DZ: 72,
  TN: 70,
  IL: 70,
  BW: 70,
  MX: 68,
  ZA: 65,
  ET: 65,
};

const TAG_SCORE_MAPS: Record<TourismTag, Record<string, number>> = {
  beach: BEACH_SCORES,
  island: ISLAND_SCORES,
  ski: SKI_SCORES,
  mountains: MOUNTAIN_SCORES,
  historic: HISTORIC_SCORES,
  wildlife: WILDLIFE_SCORES,
  diving: DIVING_SCORES,
  desert: DESERT_SCORES,
};

/**
 * Compute quality scores (0-100) for each tag the country has.
 * Only tags the country qualifies for will appear in the result.
 * Countries in a tag set but without an explicit score get a default of 50.
 */
export function computeTourismTagScores(
  iso2: string,
  tags: TourismTag[],
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const tag of tags) {
    const map = TAG_SCORE_MAPS[tag];
    scores[tag] = map[iso2] ?? 50;
  }
  return scores;
}

// ──────────────────────────────────────────────────────────────────────────────
// Seasonality — monthly quality scores per tag (0-100).
// Uses a sinusoidal temperature model based on latitude + existing climate data.
// For beach countries, coastal temperature overrides provide more accurate data.
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Coastal climate overrides for beach destinations.
 * Country-wide averages include cold mountains, making coastal temps appear too low.
 * These values represent typical coastal/resort area temperatures.
 * { annualMean: °C, tempRange: °C (difference between hottest and coldest month) }
 */
const COASTAL_CLIMATE_OVERRIDE: Record<
  string,
  { annualMean: number; tempRange: number }
> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // COASTAL TEMPERATURE OVERRIDES — based on verified beach resort temperatures
  // Values derived from: annualMean = (Jan+Jul)/2, tempRange = |Jul-Jan|
  // June temp ≈ annualMean + (tempRange/2) × 0.866;  need ≥24°C for score 85
  // ═══════════════════════════════════════════════════════════════════════════

  // Mediterranean — warm summer beach destinations
  TR: { annualMean: 20, tempRange: 18 }, // Turkey - Antalya: Jan 10°C, Jul 29°C → Jun~27°C
  GR: { annualMean: 20, tempRange: 16 }, // Greece - islands: Jan 12°C, Jul 28°C → Jun~27°C
  BG: { annualMean: 14, tempRange: 22 }, // Bulgaria - Sunny Beach: Jan 3°C, Jul 25°C → Jun~24°C
  ME: { annualMean: 17, tempRange: 18 }, // Montenegro - Budva: Jan 8°C, Jul 26°C → Jun~25°C
  HR: { annualMean: 18, tempRange: 18 }, // Croatia - Dubrovnik: Jan 9°C, Jul 27°C → Jun~26°C
  AL: { annualMean: 18, tempRange: 16 }, // Albania - Riviera: Jan 10°C, Jul 26°C → Jun~25°C
  CY: { annualMean: 21, tempRange: 14 }, // Cyprus - Paphos: Jan 14°C, Jul 28°C → Jun~27°C
  MT: { annualMean: 19, tempRange: 12 }, // Malta: Jan 13°C, Jul 26°C → Jun~24°C
  IT: { annualMean: 18, tempRange: 15 }, // Italy - Sicily/Amalfi: Jan 10°C, Jul 25°C → Jun~25°C
  ES: { annualMean: 19, tempRange: 14 }, // Spain - Costa del Sol: Jan 12°C, Jul 26°C → Jun~25°C
  PT: { annualMean: 18, tempRange: 10 }, // Portugal - Algarve: Jan 13°C, Jul 23°C → Jun~22°C (Atlantic)
  FR: { annualMean: 17, tempRange: 14 }, // France - Côte d'Azur: Jan 10°C, Jul 24°C → Jun~23°C
  SI: { annualMean: 16, tempRange: 18 }, // Slovenia - Piran: Jan 7°C, Jul 25°C → Jun~24°C

  // Black Sea — cooler, short beach season (Jul-Aug only for 85+)
  RO: { annualMean: 13, tempRange: 23 }, // Romania - Constanta: Jan 1°C, Jul 24°C → Jun~23°C
  UA: { annualMean: 11, tempRange: 24 }, // Ukraine - Odessa: Jan -1°C, Jul 23°C → Jun~21°C
  GE: { annualMean: 16, tempRange: 17 }, // Georgia - Batumi: Jan 7°C, Jul 24°C → Jun~23°C
  RU: { annualMean: 15, tempRange: 18 }, // Russia - Sochi: Jan 6°C, Jul 24°C → Jun~23°C

  // North Africa / Red Sea — hot year-round
  EG: { annualMean: 25, tempRange: 14 }, // Egypt - Sharm: Jan 18°C, Jul 32°C → Jun~31°C
  TN: { annualMean: 20, tempRange: 17 }, // Tunisia - Sousse: Jan 11°C, Jul 28°C → Jun~27°C
  MA: { annualMean: 21, tempRange: 7 }, // Morocco - Agadir: Jan 17°C, Jul 24°C → Jun~24°C (Atlantic)

  // Middle East / Gulf — extremely hot summers
  AE: { annualMean: 28, tempRange: 17 }, // UAE - Dubai: Jan 19°C, Jul 36°C → Jun~35°C
  OM: { annualMean: 27, tempRange: 14 }, // Oman - Muscat: Jan 20°C, Jul 34°C → Jun~33°C
  QA: { annualMean: 27, tempRange: 19 }, // Qatar - Doha: Jan 17°C, Jul 36°C → Jun~35°C
  BH: { annualMean: 26, tempRange: 18 }, // Bahrain: Jan 17°C, Jul 35°C → Jun~34°C
  SA: { annualMean: 29, tempRange: 9 }, // Saudi - Jeddah: Jan 24°C, Jul 33°C → Jun~33°C
  IL: { annualMean: 20, tempRange: 14 }, // Israel - Tel Aviv: Jan 13°C, Jul 27°C → Jun~26°C
  JO: { annualMean: 25, tempRange: 17 }, // Jordan - Aqaba: Jan 16°C, Jul 33°C → Jun~32°C

  // Southeast Asia — tropical, stable year-round
  TH: { annualMean: 28, tempRange: 2 }, // Thailand - Phuket: year-round 27-29°C
  VN: { annualMean: 27, tempRange: 5 }, // Vietnam - Nha Trang: Jan 24°C, Jul 29°C
  ID: { annualMean: 27, tempRange: 1 }, // Indonesia - Bali: year-round 27°C
  MY: { annualMean: 28, tempRange: 2 }, // Malaysia - Langkawi: year-round 27-28°C
  PH: { annualMean: 28, tempRange: 2 }, // Philippines - Boracay: year-round 27-28°C
  KH: { annualMean: 28, tempRange: 4 }, // Cambodia: Jan 26°C, Jul 29°C
  MM: { annualMean: 27, tempRange: 4 }, // Myanmar - coast: Jan 25°C, Jul 28°C
  LK: { annualMean: 27, tempRange: 1 }, // Sri Lanka: year-round 27°C
  MV: { annualMean: 28, tempRange: 1 }, // Maldives: year-round 28°C

  // Indian Ocean — mostly tropical
  MU: { annualMean: 24, tempRange: 7 }, // Mauritius (S): Jan 27°C, Jul 20°C → Dec-Mar peak
  SC: { annualMean: 27, tempRange: 2 }, // Seychelles: year-round 26-27°C
  TZ: { annualMean: 26, tempRange: 4 }, // Tanzania - Zanzibar (S): Jan 28°C, Jul 24°C
  KE: { annualMean: 26, tempRange: 3 }, // Kenya - Mombasa (S): Jan 27°C, Jul 25°C
  MZ: { annualMean: 25, tempRange: 7 }, // Mozambique (S): Jan 28°C, Jul 21°C
  MG: { annualMean: 24, tempRange: 7 }, // Madagascar (S): Jan 27°C, Jul 20°C

  // Caribbean — tropical, warm year-round
  CU: { annualMean: 25, tempRange: 6 }, // Cuba - Havana: Jan 22°C, Jul 28°C
  DO: { annualMean: 27, tempRange: 3 }, // Dominican Republic: Jan 25°C, Jul 28°C
  JM: { annualMean: 27, tempRange: 3 }, // Jamaica: Jan 25°C, Jul 28°C
  BS: { annualMean: 25, tempRange: 7 }, // Bahamas: Jan 21°C, Jul 28°C
  BB: { annualMean: 27, tempRange: 2 }, // Barbados: Jan 26°C, Jul 28°C
  TT: { annualMean: 27, tempRange: 2 }, // Trinidad: Jan 26°C, Jul 28°C
  PR: { annualMean: 26, tempRange: 3 }, // Puerto Rico: Jan 25°C, Jul 28°C
  AW: { annualMean: 28, tempRange: 3 }, // Aruba: Jan 27°C, Jul 29°C
  CW: { annualMean: 28, tempRange: 3 }, // Curacao: Jan 27°C, Jul 29°C

  // Central America — tropical
  MX: { annualMean: 26, tempRange: 4 }, // Mexico - Cancun: Jan 24°C, Jul 28°C
  CR: { annualMean: 27, tempRange: 2 }, // Costa Rica - Pacific: year-round 26-27°C
  PA: { annualMean: 27, tempRange: 1 }, // Panama: year-round 27°C
  BZ: { annualMean: 26, tempRange: 5 }, // Belize: Jan 24°C, Jul 28°C
  HN: { annualMean: 27, tempRange: 4 }, // Honduras - Bay Islands: Jan 25°C, Jul 29°C

  // South America — mix of tropical and temperate
  BR: { annualMean: 24, tempRange: 5 }, // Brazil - Rio (S): Jan 26°C, Jul 21°C
  CO: { annualMean: 28, tempRange: 1 }, // Colombia - Cartagena: year-round 27-28°C
  VE: { annualMean: 27, tempRange: 2 }, // Venezuela: year-round 26-28°C
  EC: { annualMean: 25, tempRange: 3 }, // Ecuador - coast: year-round 24-26°C
  PE: { annualMean: 19, tempRange: 6 }, // Peru - coast (Humboldt): Jan 22°C, Jul 16°C (cool!)
  CL: { annualMean: 15, tempRange: 8 }, // Chile - Viña del Mar (S): Jan 19°C, Jul 11°C
  AR: { annualMean: 15, tempRange: 13 }, // Argentina - Mar del Plata (S): Jan 21°C, Jul 8°C
  UY: { annualMean: 16, tempRange: 12 }, // Uruguay - Punta del Este (S): Jan 22°C, Jul 10°C

  // Pacific Islands — mostly tropical
  FJ: { annualMean: 25, tempRange: 4 }, // Fiji (S): Jan 27°C, Jul 23°C
  PF: { annualMean: 26, tempRange: 4 }, // French Polynesia (S): Jan 28°C, Jul 24°C
  NC: { annualMean: 23, tempRange: 6 }, // New Caledonia (S): Jan 26°C, Jul 20°C
  VU: { annualMean: 25, tempRange: 4 }, // Vanuatu (S): Jan 27°C, Jul 23°C
  WS: { annualMean: 27, tempRange: 2 }, // Samoa: year-round 26-27°C
  TO: { annualMean: 25, tempRange: 5 }, // Tonga (S): Jan 27°C, Jul 22°C
  PW: { annualMean: 28, tempRange: 1 }, // Palau: year-round 28°C
  GU: { annualMean: 27, tempRange: 2 }, // Guam: year-round 27°C

  // Oceania — temperate (S hemisphere)
  AU: { annualMean: 21, tempRange: 9 }, // Australia - Gold Coast: Jan 25°C, Jul 16°C
  NZ: { annualMean: 16, tempRange: 9 }, // New Zealand - Auckland: Jan 20°C, Jul 11°C

  // Africa — tropical to subtropical
  ZA: { annualMean: 22, tempRange: 7 }, // South Africa - Durban (S): Jan 25°C, Jul 18°C
  CV: { annualMean: 25, tempRange: 5 }, // Cape Verde: Jan 22°C, Jul 27°C
  SN: { annualMean: 26, tempRange: 6 }, // Senegal - Dakar: Jan 23°C, Jul 28°C
  GM: { annualMean: 27, tempRange: 6 }, // Gambia: Jan 24°C, Jul 29°C
  GH: { annualMean: 27, tempRange: 3 }, // Ghana - Accra: year-round 26-28°C
  NG: { annualMean: 27, tempRange: 3 }, // Nigeria - Lagos: year-round 26-28°C
};

/**
 * Estimate 12 monthly mean temperatures using a cosine model.
 * Peak warmth is July (index 6) for Northern Hemisphere,
 * January (index 0) for Southern Hemisphere.
 */
function estimateMonthlyTemps(
  annualMean: number,
  tempRange: number,
  latitude: number,
): number[] {
  const peakMonth = latitude >= 0 ? 6 : 0;
  const months: number[] = [];
  for (let m = 0; m < 12; m++) {
    const phase = (2 * Math.PI * (m - peakMonth)) / 12;
    months.push(annualMean + (tempRange / 2) * Math.cos(phase));
  }
  return months;
}

function beachSeasonal(temp: number): number {
  if (temp >= 28) return 100;
  if (temp >= 24) return 85;
  if (temp >= 20) return 55;
  if (temp >= 15) return 25;
  return 5;
}

function islandSeasonal(temp: number): number {
  // Same profile as beach — warm is better
  if (temp >= 27) return 100;
  if (temp >= 23) return 85;
  if (temp >= 19) return 55;
  if (temp >= 14) return 30;
  return 10;
}

function skiSeasonal(temp: number): number {
  if (temp <= -5) return 95;
  if (temp <= 0) return 90;
  if (temp <= 5) return 65;
  if (temp <= 10) return 25;
  return 0;
}

function mountainsSeasonal(temp: number): number {
  if (temp >= 15 && temp <= 25) return 100;
  if (temp >= 10 && temp < 15) return 80;
  if (temp >= 25 && temp < 30) return 75;
  if (temp >= 5 && temp < 10) return 50;
  if (temp >= 30) return 40;
  return 20;
}

function historicSeasonal(temp: number): number {
  // Sightseeing is year-round; mild weather preferred
  if (temp >= 15 && temp <= 28) return 100;
  if (temp >= 10 && temp < 15) return 85;
  if (temp >= 28 && temp < 35) return 70;
  if (temp >= 5 && temp < 10) return 65;
  if (temp >= 35) return 50;
  return 55;
}

function wildlifeSeasonal(temp: number): number {
  // Best in dry/mild conditions; approximated by moderate temps
  if (temp >= 18 && temp <= 30) return 100;
  if (temp >= 12 && temp < 18) return 80;
  if (temp >= 30 && temp < 35) return 70;
  if (temp >= 5 && temp < 12) return 55;
  return 40;
}

function divingSeasonal(temp: number): number {
  // Warm water needed
  if (temp >= 27) return 100;
  if (temp >= 23) return 85;
  if (temp >= 19) return 55;
  if (temp >= 15) return 25;
  return 5;
}

function desertSeasonal(temp: number): number {
  // Comfortable temps are best; extreme heat is bad
  if (temp >= 15 && temp <= 30) return 100;
  if (temp >= 10 && temp < 15) return 75;
  if (temp >= 30 && temp < 38) return 55;
  if (temp >= 38) return 15;
  return 50;
}

const TAG_SEASONAL_FN: Record<TourismTag, (temp: number) => number> = {
  beach: beachSeasonal,
  island: islandSeasonal,
  ski: skiSeasonal,
  mountains: mountainsSeasonal,
  historic: historicSeasonal,
  wildlife: wildlifeSeasonal,
  diving: divingSeasonal,
  desert: desertSeasonal,
};

/**
 * Compute monthly seasonality scores (0-100) for each tag a country has.
 * Returns a map of tag → 12-element array [Jan, Feb, …, Dec].
 * For coastal/water tags (beach, island, diving), uses coastal temperature overrides
 * when available, since country-wide averages underestimate coastal warmth.
 */
export function computeTourismTagSeasonality(
  iso2: string,
  tags: TourismTag[],
  latitude: number,
  annualMean: number,
  tempRange: number,
): Record<string, number[]> {
  const coastalTags = new Set<TourismTag>(["beach", "island", "diving"]);
  const coastalOverride = COASTAL_CLIMATE_OVERRIDE[iso2];

  // Standard temps based on country-wide climate
  const standardTemps = estimateMonthlyTemps(annualMean, tempRange, latitude);
  // Coastal temps if override available
  const coastalTemps = coastalOverride
    ? estimateMonthlyTemps(
        coastalOverride.annualMean,
        coastalOverride.tempRange,
        latitude,
      )
    : standardTemps;

  const result: Record<string, number[]> = {};
  for (const tag of tags) {
    const fn = TAG_SEASONAL_FN[tag];
    const temps = coastalTags.has(tag) ? coastalTemps : standardTemps;
    result[tag] = temps.map((t) => Math.round(fn(t)));
  }
  return result;
}
