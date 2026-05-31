/**
 * Second-pass nomad-visa corrections from a 5-source cross-verification
 * (current to May 2026). Applies only high-confidence fixes:
 *  - PT: NHR ended → D8 has no special tax rate by default
 *  - EE: tax exemption is conditional on non-residency (22% flat if resident)
 *  - RO: income is 3× the (annually rising) average gross salary, not €3,700
 *  - GE: "Remotely from Georgia" defunct → 365-day visa-free, no income req
 *  - NO: official figure is NOK 325,400/yr profit; permit issued for 1 year
 *  - AM: flag the 1 Aug 2026 quota/fee/turnover reform
 *  - ZA: ZAR 650,796/yr is official (the ZAR 1,000,000 draft was withdrawn)
 *  - MY: add the MYR 30/person/month pass fee
 *  - EC: drop the incorrect "REMPE" label
 *  - official-URL corrections: CY, AG, DM, BS, IS
 *
 * Usage: npx tsx scripts/fix-nomad-visas-2.ts
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const DETAILS_FILE = path.join(__dirname, '..', 'src', 'data', 'nomadVisaDetails.json');
const TODAY = '2026-05-29';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Entry = any;
const details: Entry[] = JSON.parse(fs.readFileSync(DETAILS_FILE, 'utf8'));

const ensure = (e: Entry): Entry => {
  e.i18n = e.i18n || {};
  e.i18n.ru = e.i18n.ru || {};
  e.i18n.ua = e.i18n.ua || {};
  return e;
};
function note(e: Entry, section: string, en: string, ru: string, ua: string): void {
  e[section].notes = en;
  ensure(e);
  e.i18n.ru[section] = e.i18n.ru[section] || {};
  e.i18n.ru[section].notes = ru;
  e.i18n.ua[section] = e.i18n.ua[section] || {};
  e.i18n.ua[section].notes = ua;
}

const patches: Record<string, (e: Entry) => void> = {
  // PT — NHR closed; D8 has no special rate by default
  PT: (e) => {
    e.tax.status = 'standard';
    e.tax.rate = null;
    note(
      e,
      'tax',
      'NHR closed to new applicants (2024). The D8 confers no special rate by default — standard progressive IRS applies if you become tax-resident (>183 days). The IFICI ("NHR 2.0") 20% rate only covers qualifying science/tech roles.',
      'NHR закрыт для новых заявителей (2024). Виза D8 сама по себе не даёт особой ставки — при налоговом резидентстве (>183 дней) применяется обычный прогрессивный IRS. Ставка 20% по IFICI («NHR 2.0») доступна только для квалифицированных научных/технических специальностей.',
      'NHR закритий для нових заявників (2024). Віза D8 сама по собі не дає особливої ставки — за податкового резидентства (>183 днів) застосовується звичайний прогресивний IRS. Ставка 20% за IFICI («NHR 2.0») доступна лише для кваліфікованих наукових/технічних спеціальностей.',
    );
  },

  // EE — exemption conditional on non-residency
  EE: (e) => {
    note(
      e,
      'tax',
      'No Estonian tax while a non-resident (<183 days). Staying 183+ days triggers tax residency at a 22% flat rate (2025) on worldwide income.',
      'Без эстонского налога, пока вы нерезидент (<183 дней). Пребывание 183+ дней ведёт к налоговому резидентству со ставкой 22% (2025) на мировой доход.',
      'Без естонського податку, поки ви нерезидент (<183 днів). Перебування 183+ днів призводить до податкового резидентства зі ставкою 22% (2025) на світовий дохід.',
    );
  },

  // RO — income is 3× the annually rising average gross salary
  RO: (e) => {
    e.incomeRequirement.monthly = 5000;
    e.incomeRequirement.annual = 60000;
    note(
      e,
      'incomeRequirement',
      "At least 3× Romania's average gross monthly salary; the reference is revised upward annually (≈€5,000+ in 2026, up from ~€3,700).",
      'Не менее 3× средней валовой месячной зарплаты Румынии; ориентир ежегодно повышается (≈€5 000+ в 2026, ранее ~€3 700).',
      'Щонайменше 3× середньої валової місячної зарплати Румунії; орієнтир щороку підвищується (≈€5 000+ у 2026, раніше ~€3 700).',
    );
  },

  // CY — official scheme page
  CY: (e) => {
    e.officialUrl = 'https://www.gov.cy/mip-md/en/';
  },

  // GE — former program defunct; 365-day visa-free has no income requirement
  GE: (e) => {
    e.incomeRequirement.monthly = null;
    e.incomeRequirement.annual = null;
    note(
      e,
      'incomeRequirement',
      "The 365-day visa-free stay has no income requirement. The former \"Remotely from Georgia\" program (which asked $2,000/mo) is no longer active.",
      'Безвизовое пребывание на 365 дней не имеет требования к доходу. Прежняя программа «Remotely from Georgia» (требовала $2 000/мес.) больше не действует.',
      'Безвізове перебування на 365 днів не має вимоги до доходу. Колишня програма «Remotely from Georgia» (вимагала $2 000/міс.) більше не діє.',
    );
  },

  // NO — official figure is NOK 325,400/yr profit; 1-year permit
  NO: (e) => {
    e.duration.initial = 12;
    e.incomeRequirement.monthly = 27117;
    e.incomeRequirement.annual = 325400;
    note(
      e,
      'incomeRequirement',
      'NOK 325,400/yr pre-tax profit (the UDI self-employed skilled-worker requirement). This is a self-employment permit normally issued for one year, not a dedicated nomad visa.',
      'Прибыль до налогов NOK 325 400/год (требование UDI для самозанятых квалифицированных специалистов). Это разрешение для самозанятых, обычно выдаётся на один год, а не отдельная номад-виза.',
      'Прибуток до оподаткування NOK 325 400/рік (вимога UDI для самозайнятих кваліфікованих фахівців). Це дозвіл для самозайнятих, зазвичай видається на один рік, а не окрема номад-віза.',
    );
  },

  // AM — flag the 1 Aug 2026 reform
  AM: (e) => {
    note(
      e,
      'incomeRequirement',
      'No dedicated digital nomad visa; residence is via private-entrepreneur registration or a 180-day/year visa-free stay. No minimum income required. From 1 Aug 2026 the entrepreneur-residence route adds higher fees (AMD 150,000/250,000) and a ~AMD 1,000,000 turnover/balance requirement under new quotas.',
      'Отдельной номад-визы нет; пребывание через регистрацию ИП или безвизовый режим 180 дней в году. Минимальный доход не требуется. С 1 августа 2026 для пути ИП-резидентства вводятся более высокие сборы (AMD 150 000/250 000) и требование оборота/баланса ~AMD 1 000 000 в рамках новых квот.',
      'Окремої номад-візи немає; перебування через реєстрацію ФОП або безвізовий режим 180 днів на рік. Мінімальний дохід не потрібен. З 1 серпня 2026 для шляху ФОП-резидентства вводяться вищі збори (AMD 150 000/250 000) та вимога обороту/балансу ~AMD 1 000 000 у межах нових квот.',
    );
  },

  // ZA — ZAR 650,796/yr is official; the ZAR 1,000,000 draft was withdrawn
  ZA: (e) => {
    note(
      e,
      'incomeRequirement',
      '≈ZAR 650,796/yr is the official requirement; an earlier ZAR 1,000,000/yr draft figure was withdrawn.',
      '≈650 796 ZAR/год — официальное требование; ранее предлагавшаяся цифра 1 000 000 ZAR/год была отозвана.',
      '≈650 796 ZAR/рік — офіційна вимога; раніше пропонована цифра 1 000 000 ZAR/рік була відкликана.',
    );
  },

  // MY — add the monthly pass fee
  MY: (e) => {
    note(
      e,
      'cost',
      'RM1,000 processing fee for the main applicant; +RM500 per dependent. Plus a MYR 30 per person/month pass fee after approval.',
      'Сбор за обработку RM1 000 для основного заявителя; +RM500 за каждого иждивенца. Плюс сбор за пасс MYR 30 на человека в месяц после одобрения.',
      'Збір за обробку RM1 000 для основного заявника; +RM500 за кожного утриманця. Плюс збір за пас MYR 30 на особу на місяць після схвалення.',
    );
  },

  // EC — drop the incorrect "REMPE" label
  EC: (e) => {
    e.visaName = 'Digital Nomad Visa (Visa Nómada)';
  },

  // Official-URL corrections (cross-confirmed by multiple sources)
  AG: (e) => {
    e.officialUrl = 'https://nomad.gov.ag';
  },
  DM: (e) => {
    e.officialUrl = 'https://windominica.gov.dm';
  },
  BS: (e) => {
    e.officialUrl = 'https://www.bahamasbeats.com';
  },
  IS: (e) => {
    e.officialUrl = 'https://island.is/en/get-long-term-visa-for-remote-workers';
  },
};

const applied: string[] = [];
for (const e of details) {
  const fn = patches[e.code];
  if (fn) {
    fn(e);
    e.lastUpdated = TODAY;
    applied.push(e.code);
  }
}

fs.writeFileSync(DETAILS_FILE, JSON.stringify(details, null, 2) + '\n', 'utf8');
console.log(`✓ patched ${applied.length}: ${applied.join(', ')}`);
