/**
 * Reproducible corrections for nomad-visa data, verified against official /
 * authoritative 2025–2026 sources.
 *
 * Updates src/data/nomadVisaDetails.json and src/data/nomadVisa.json:
 *  - removes discontinued programs (KY — Cayman GCCP suspended since Oct 2022)
 *  - replaces TH (LTR, a high-earner visa) with the Destination Thailand Visa
 *    (DTV), the actual digital-nomad visa launched July 2024
 *  - corrects income thresholds, fees, durations, tax treatment and program
 *    names, keeping ru/ua translations in sync (localizeVisa falls back to EN
 *    only when a translation is absent, so stale translations must be updated)
 *
 * Usage: npx tsx scripts/fix-nomad-visas.ts
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const DETAILS_FILE = path.join(DATA_DIR, 'nomadVisaDetails.json');
const LIST_FILE = path.join(DATA_DIR, 'nomadVisa.json');

/* eslint-disable @typescript-eslint/no-explicit-any */
type Entry = any;
const TODAY = '2026-05-29';

const details: Entry[] = JSON.parse(fs.readFileSync(DETAILS_FILE, 'utf8'));
const list: { countries: string[] } = JSON.parse(fs.readFileSync(LIST_FILE, 'utf8'));

const ensure = (e: Entry): Entry => {
  e.i18n = e.i18n || {};
  e.i18n.ru = e.i18n.ru || {};
  e.i18n.ua = e.i18n.ua || {};
  return e;
};

// Set a section's `notes` in EN + ru + ua. section: 'cost'|'incomeRequirement'|'tax'
function note(e: Entry, section: string, en: string, ru: string, ua: string): void {
  e[section].notes = en;
  ensure(e);
  e.i18n.ru[section] = e.i18n.ru[section] || {};
  e.i18n.ru[section].notes = ru;
  e.i18n.ua[section] = e.i18n.ua[section] || {};
  e.i18n.ua[section].notes = ua;
}

type Tri = { en: string; ru: string; ua: string };

// Replace an element (matched by substring) in benefits or eligibility.requirements, per-language.
function arrReplace(e: Entry, field: 'benefits' | 'requirements', match: Tri, repl: Tri): void {
  const apply = (arr: string[] | undefined, m: string, r: string) =>
    arr ? arr.map((s) => (s.includes(m) ? r : s)) : arr;
  ensure(e);
  if (field === 'benefits') {
    e.benefits = apply(e.benefits, match.en, repl.en);
    e.i18n.ru.benefits = apply(e.i18n.ru.benefits, match.ru, repl.ru);
    e.i18n.ua.benefits = apply(e.i18n.ua.benefits, match.ua, repl.ua);
  } else {
    e.eligibility.requirements = apply(e.eligibility.requirements, match.en, repl.en);
    if (e.i18n.ru.eligibility?.requirements)
      e.i18n.ru.eligibility.requirements = apply(
        e.i18n.ru.eligibility.requirements,
        match.ru,
        repl.ru,
      );
    if (e.i18n.ua.eligibility?.requirements)
      e.i18n.ua.eligibility.requirements = apply(
        e.i18n.ua.eligibility.requirements,
        match.ua,
        repl.ua,
      );
  }
}

function reqAppend(e: Entry, v: Tri): void {
  ensure(e);
  e.eligibility.requirements.push(v.en);
  if (e.i18n.ru.eligibility?.requirements) e.i18n.ru.eligibility.requirements.push(v.ru);
  if (e.i18n.ua.eligibility?.requirements) e.i18n.ua.eligibility.requirements.push(v.ua);
}

const patches: Record<string, (e: Entry) => void> = {
  // ── Germany: no statutory minimum income ────────────────────────────────
  DE: (e) => {
    note(
      e,
      'incomeRequirement',
      'Germany sets no fixed statutory minimum for the freelance visa; financial sustainability is assessed case-by-case (~€2,500–3,000/mo is a common benchmark).',
      'В Германии нет фиксированного минимального дохода для визы фрилансера; финансовую состоятельность оценивают индивидуально (ориентир ~2 500–3 000 €/мес.).',
      'У Німеччині немає фіксованого мінімального доходу для візи фрілансера; фінансову спроможність оцінюють індивідуально (орієнтир ~2 500–3 000 €/міс.).',
    );
  },

  // ── Montenegro: renewable (2+2 yrs); income rebased Aug 2024 ─────────────
  ME: (e) => {
    e.duration.maxExtension = 24;
    e.duration.renewable = true;
    e.incomeRequirement.monthly = 2520;
    e.incomeRequirement.annual = 30240;
    note(
      e,
      'incomeRequirement',
      "≈3× Montenegro's average net salary under the August 2024 rulebook (previously €1,350).",
      'Примерно 3× средней чистой зарплаты Черногории по правилам от августа 2024 (ранее 1 350 €).',
      'Приблизно 3× середньої чистої зарплати Чорногорії за правилами від серпня 2024 (раніше 1 350 €).',
    );
  },

  // ── Czechia: 2,500 CZK was the permit fee, not income ───────────────────
  CZ: (e) => {
    e.incomeRequirement.monthly = null;
    e.incomeRequirement.annual = null;
    note(
      e,
      'incomeRequirement',
      'No monthly income minimum; requires proof of funds of ≈ CZK 156,500 (~€6,200) — 50× the subsistence minimum — for the long-stay business (živnostenské) visa.',
      'Нет минимального месячного дохода; требуется подтверждение средств ≈156 500 CZK (~6 200 €) — 50× прожиточного минимума — для долгосрочной бизнес-визы (živnostenské).',
      'Немає мінімального місячного доходу; потрібне підтвердження коштів ≈156 500 CZK (~6 200 €) — 50× прожиткового мінімуму — для довгострокової бізнес-візи (živnostenské).',
    );
  },

  // ── Malta: 4-yr cap; flat 10% tax (first 12 months exempt) ──────────────
  MT: (e) => {
    e.duration.maxExtension = 36;
    e.tax.status = 'special';
    e.tax.rate = 10;
    note(
      e,
      'tax',
      'Flat 10% tax on authorised remote-work income (2023 Nomad Residence Permit Income Tax Rules); the first 12 months are tax-exempt.',
      'Фиксированные 10% на доход от разрешённой удалённой работы (Правила 2023 г. о налоге для Nomad Residence Permit); первые 12 месяцев — без налога.',
      'Фіксовані 10% на дохід від дозволеної віддаленої роботи (Правила 2023 р. про податок для Nomad Residence Permit); перші 12 місяців — без податку.',
    );
  },

  // ── Italy: no automatic special regime ──────────────────────────────────
  IT: (e) => {
    e.tax.status = 'standard';
    e.tax.rate = null;
    note(
      e,
      'tax',
      'The visa grants no special rate; standard progressive IRPEF applies if you become tax-resident (>183 days). The "regime forfettario" (5–15%) and "impatriati" reliefs are separate opt-in regimes.',
      'Виза не даёт особой ставки; при налоговом резидентстве (>183 дней) применяется обычный прогрессивный IRPEF. Режимы «forfettario» (5–15%) и «impatriati» — отдельные опции.',
      'Віза не дає особливої ставки; за податкового резидентства (>183 днів) застосовується звичайний прогресивний IRPEF. Режими «forfettario» (5–15%) та «impatriati» — окремі опції.',
    );
  },

  // ── Latvia: progressive PIT, no flat 23% nomad rate ─────────────────────
  LV: (e) => {
    e.tax.rate = null;
    note(
      e,
      'tax',
      'Progressive personal income tax (20–31%); foreign income is not taxed unless you become a tax resident (>183 days). No special nomad regime.',
      'Прогрессивный подоходный налог (20–31%); иностранный доход не облагается, пока вы не стали налоговым резидентом (>183 дней). Особого режима для кочевников нет.',
      'Прогресивний податок на доходи (20–31%); іноземний дохід не оподатковується, доки ви не стали податковим резидентом (>183 днів). Окремого режиму для кочівників немає.',
    );
  },

  // ── Cyprus: 3-yr cap; no special exemption regime ───────────────────────
  CY: (e) => {
    e.duration.maxExtension = 24;
    e.tax.status = 'standard';
    e.tax.rate = null;
    note(
      e,
      'tax',
      'No special nomad tax regime; tax residents (>183 days, or the 60-day rule) are taxed at progressive rates up to 35%. Non-dom status exempts dividends/interest, but employment income is taxed.',
      'Особого налогового режима для кочевников нет; налоговые резиденты (>183 дней или правило 60 дней) платят по прогрессивной ставке до 35%. Статус non-dom освобождает дивиденды/проценты, но зарплата облагается.',
      'Окремого податкового режиму для кочівників немає; податкові резиденти (>183 днів або правило 60 днів) платять за прогресивною ставкою до 35%. Статус non-dom звільняє дивіденди/відсотки, але зарплата оподатковується.',
    );
  },

  // ── Albania: Unique Permit; threshold not clearly published ─────────────
  AL: (e) => {
    e.duration.maxExtension = 48;
    note(
      e,
      'incomeRequirement',
      'Official threshold not clearly published; cited figures vary (≈€320–€820/mo). Issued as a Unique Permit (Leje Unike) with a 12-month tax-residency exemption from issue.',
      'Официальный порог чётко не опубликован; называемые цифры расходятся (≈320–820 €/мес.). Выдаётся как единое разрешение (Leje Unike) с 12-месячным освобождением от налогового резидентства.',
      'Офіційний поріг чітко не опубліковано; названі цифри різняться (≈320–820 €/міс.). Видається як єдиний дозвіл (Leje Unike) із 12-місячним звільненням від податкового резидентства.',
    );
  },

  // ── Georgia: program superseded by 365-day visa-free; 1% needs IE reg ────
  GE: (e) => {
    note(
      e,
      'tax',
      'Foreign-source personal income is generally untaxed (territorial system). The 1% rate applies only if you separately register as an Individual Entrepreneur with Small Business Status (turnover up to GEL 500,000).',
      'Иностранный личный доход обычно не облагается (территориальная система). Ставка 1% применяется только при отдельной регистрации ИП со статусом малого бизнеса (оборот до 500 000 GEL).',
      'Іноземний особистий дохід зазвичай не оподатковується (територіальна система). Ставка 1% застосовується лише за окремої реєстрації ФОП зі статусом малого бізнесу (оборот до 500 000 GEL).',
    );
  },

  // ── Norway: independent-contractor permit; Svalbard is separate ─────────
  NO: (e) => {
    note(
      e,
      'tax',
      '22% flat tax on ordinary income plus progressive bracket tax (trinnskatt) on personal income (top effective ~47%). This is the mainland self-employed/independent-contractor permit — Svalbard is a separate visa-free zone and does not grant mainland residence.',
      '22% на обычный доход плюс прогрессивный «trinnskatt» на личный доход (макс. эффективная ~47%). Это материковое разрешение для самозанятых/подрядчиков — Свальбард это отдельная безвизовая зона и не даёт материкового ВНЖ.',
      '22% на звичайний дохід плюс прогресивний «trinnskatt» на особистий дохід (макс. ефективна ~47%). Це материковий дозвіл для самозайнятих/підрядників — Свальбард це окрема безвізова зона і не дає материкового ВНП.',
    );
  },

  // ── Serbia: no dedicated DNV; €3,500 figure unofficial ──────────────────
  RS: (e) => {
    e.incomeRequirement.monthly = null;
    e.incomeRequirement.annual = null;
    note(
      e,
      'incomeRequirement',
      'Serbia has no dedicated digital nomad visa; residence is via the self-employment/freelance route. No official minimum income — the often-cited €3,500/mo is unofficial; the paušal entrepreneur path requires only modest proof of funds.',
      'В Сербии нет отдельной номад-визы; ВНЖ оформляется по пути самозанятости/фриланса. Официального минимума дохода нет — часто упоминаемые 3 500 €/мес. неофициальны; путь paušal-предпринимателя требует лишь скромного подтверждения средств.',
      'У Сербії немає окремої номад-візи; ВНП оформлюється шляхом самозайнятості/фрілансу. Офіційного мінімуму доходу немає — часто згадувані 3 500 €/міс. неофіційні; шлях paušal-підприємця потребує лише скромного підтвердження коштів.',
    );
  },

  // ── Armenia: no dedicated DNV; no income minimum ────────────────────────
  AM: (e) => {
    note(
      e,
      'incomeRequirement',
      'No dedicated digital nomad visa; residence is via private-entrepreneur registration or a 180-day/year visa-free stay. No minimum income required.',
      'Отдельной номад-визы нет; пребывание через регистрацию ИП или безвизовый режим 180 дней в году. Минимальный доход не требуется.',
      'Окремої номад-візи немає; перебування через реєстрацію ФОП або безвізовий режим 180 днів на рік. Мінімальний дохід не потрібен.',
    );
  },

  // ── Lithuania: no formal DNV; self-employment TRP ───────────────────────
  LT: (e) => {
    e.incomeRequirement.monthly = null;
    e.incomeRequirement.annual = null;
    note(
      e,
      'incomeRequirement',
      'Lithuania has no formal digital nomad visa; this is a temporary residence permit via self-employment (individuali veikla). No fixed statutory DNV income threshold (≈2× the average salary is commonly cited).',
      'В Литве нет официальной номад-визы; это ВНЖ через самозанятость (individuali veikla). Установленного законом порога дохода нет (часто упоминают ≈2× средней зарплаты).',
      'У Литві немає офіційної номад-візи; це ВНП через самозайнятість (individuali veikla). Установленого законом порогу доходу немає (часто згадують ≈2× середньої зарплати).',
    );
  },

  // ── Anguilla: correct program name; no income minimum ───────────────────
  AI: (e) => {
    e.visaName = 'Work From Anguilla';
    e.officialUrl = 'https://ivisitanguilla.com/work-from-anguilla';
    e.incomeRequirement.monthly = null;
    e.incomeRequirement.annual = null;
    note(
      e,
      'incomeRequirement',
      'No minimum income requirement; applicants must show the ability to support themselves.',
      'Минимальный доход не требуется; нужно подтвердить способность себя обеспечивать.',
      'Мінімальний дохід не потрібен; потрібно підтвердити здатність себе забезпечувати.',
    );
    note(
      e,
      'cost',
      'Individual; $3,000 for families up to 4 (+$250 per extra dependent).',
      'Индивидуально; $3 000 для семьи до 4 человек (+$250 за каждого доп. иждивенца).',
      'Індивідуально; $3 000 для сім’ї до 4 осіб (+$250 за кожного дод. утриманця).',
    );
  },

  // ── Curaçao: still active; no official income minimum ───────────────────
  CW: (e) => {
    e.incomeRequirement.monthly = null;
    e.incomeRequirement.annual = null;
    note(
      e,
      'incomeRequirement',
      'No official minimum income; applicants must show sufficient means (an informal ~€2,600/mo guidance is sometimes cited).',
      'Официального минимума дохода нет; нужно подтвердить достаточные средства (иногда упоминают неофициальный ориентир ~2 600 €/мес.).',
      'Офіційного мінімуму доходу немає; потрібно підтвердити достатні кошти (іноді згадують неофіційний орієнтир ~2 600 €/міс.).',
    );
  },

  // ── Saint Lucia: no specified income minimum ────────────────────────────
  LC: (e) => {
    e.incomeRequirement.monthly = null;
    e.incomeRequirement.annual = null;
    note(
      e,
      'incomeRequirement',
      'No specified minimum income; applicants must show sufficient funds to be self-supporting.',
      'Минимум дохода не указан; нужно подтвердить достаточные средства для самообеспечения.',
      'Мінімум доходу не зазначено; потрібно підтвердити достатні кошти для самозабезпечення.',
    );
  },

  // ── Bahamas: no official income minimum; up to 3 yrs ────────────────────
  BS: (e) => {
    e.duration.maxExtension = 24;
    e.incomeRequirement.monthly = null;
    e.incomeRequirement.annual = null;
    note(
      e,
      'incomeRequirement',
      'No official minimum income; applicants must show sufficient funds (unofficial guidance ~$3,000/mo).',
      'Официального минимума дохода нет; нужно подтвердить достаточные средства (неофициальный ориентир ~$3 000/мес.).',
      'Офіційного мінімуму доходу немає; потрібно підтвердити достатні кошти (неофіційний орієнтир ~$3 000/міс.).',
    );
  },

  // ── Dominica: separate $100 application fee ─────────────────────────────
  DM: (e) => {
    note(
      e,
      'cost',
      '$800 single / $1,200 family, plus a $100 non-refundable application fee.',
      '$800 одиночно / $1 200 семья, плюс невозвратный сбор за заявление $100.',
      '$800 одноосібно / $1 200 сім’я, плюс неповоротний збір за заяву $100.',
    );
  },

  // ── Barbados: programme authorised through end-2026 ─────────────────────
  BB: (e) => {
    note(
      e,
      'cost',
      '$2,000 individual / $3,000 family (one-time, covers the full 12 months). Programme currently authorised through 31 Dec 2026.',
      '$2 000 индивидуально / $3 000 семья (разово, на все 12 месяцев). Программа действует до 31 декабря 2026.',
      '$2 000 індивідуально / $3 000 сім’я (одноразово, на всі 12 місяців). Програма діє до 31 грудня 2026.',
    );
  },

  // ── Kenya: $1,200 total cost; no fixed statutory income ─────────────────
  KE: (e) => {
    e.cost.amount = 1200;
    note(
      e,
      'cost',
      '$200 processing fee + $1,000 annual issuance fee.',
      'Сбор за обработку $200 + ежегодный сбор за выдачу $1 000.',
      'Збір за обробку $200 + щорічний збір за видачу $1 000.',
    );
    note(
      e,
      'incomeRequirement',
      'No fixed statutory minimum; applicants must show consistent remote income (~$2,000/mo is commonly cited).',
      'Установленного законом минимума нет; нужно подтвердить стабильный удалённый доход (часто упоминают ~$2 000/мес.).',
      'Установленого законом мінімуму немає; потрібно підтвердити стабільний віддалений дохід (часто згадують ~$2 000/міс.).',
    );
  },

  // ── South Africa: tax not an automatic exemption ───────────────────────
  ZA: (e) => {
    note(
      e,
      'tax',
      'Not an automatic exemption: South African tax depends on the SARS residence tests (183 days, incl. 60+ continuous, over 12 months) and any applicable tax treaty.',
      'Это не автоматическое освобождение: налогообложение в ЮАР зависит от тестов резидентства SARS (183 дня, в т.ч. 60+ непрерывно, за 12 месяцев) и применимых налоговых соглашений.',
      'Це не автоматичне звільнення: оподаткування в ПАР залежить від тестів резидентства SARS (183 дні, зокрема 60+ безперервно, за 12 місяців) та застосовних податкових угод.',
    );
    note(
      e,
      'incomeRequirement',
      '≈ZAR 650,796/yr (operational figure); the promulgated regulation cites ZAR 1,000,000/yr.',
      '≈650 796 ZAR/год (рабочая цифра); в опубликованном регламенте указано 1 000 000 ZAR/год.',
      '≈650 796 ZAR/рік (робоча цифра); у опублікованому регламенті зазначено 1 000 000 ZAR/рік.',
    );
  },

  // ── Cape Verde: bank-balance test, not monthly salary ──────────────────
  CV: (e) => {
    note(
      e,
      'incomeRequirement',
      'Requirement is an average bank balance of ≈€1,500 over the prior 6 months (individual; ≈€2,700 for a family), not a monthly salary.',
      'Требуется средний остаток на счёте ≈1 500 € за последние 6 месяцев (индивидуально; ≈2 700 € для семьи), а не месячная зарплата.',
      'Потрібен середній залишок на рахунку ≈1 500 € за останні 6 місяців (індивідуально; ≈2 700 € для сім’ї), а не місячна зарплата.',
    );
    note(
      e,
      'cost',
      '€20 visa fee; a separate ~€34 airport security fee also applies.',
      'Визовый сбор 20 €; дополнительно ~34 € аэропортовый сбор безопасности.',
      'Візовий збір 20 €; додатково ~34 € аеропортовий збір безпеки.',
    );
  },

  // ── Namibia: correct USD conversion (~$180) ────────────────────────────
  NA: (e) => {
    note(e, 'cost', 'NAD 3,300 (≈ US$180).', '3 300 NAD (≈ $180).', '3 300 NAD (≈ $180).');
  },

  // ── Seychelles: no official income minimum ─────────────────────────────
  SC: (e) => {
    e.incomeRequirement.monthly = null;
    e.incomeRequirement.annual = null;
    note(
      e,
      'incomeRequirement',
      'No official minimum income; applicants must show proof of employment and sufficient funds.',
      'Официального минимума дохода нет; нужно подтвердить занятость и достаточные средства.',
      'Офіційного мінімуму доходу немає; потрібно підтвердити зайнятість і достатні кошти.',
    );
  },

  // ── UAE / Dubai: fee composition + 2026 bank-statement rule ────────────
  AE: (e) => {
    note(
      e,
      'cost',
      '~$287 core fee plus medical insurance, Emirates ID and processing (≈$600 total).',
      '~$287 основной сбор плюс медстраховка, Emirates ID и обработка (всего ≈$600).',
      '~$287 основний збір плюс медстраховка, Emirates ID та обробка (загалом ≈$600).',
    );
    reqAppend(e, {
      en: '6 months of recent bank statements (rule effective 2026)',
      ru: 'Банковские выписки за последние 6 месяцев (правило с 2026)',
      ua: 'Банківські виписки за останні 6 місяців (правило з 2026)',
    });
  },

  // ── Malaysia: fee is per main applicant; non-tech income tier ──────────
  MY: (e) => {
    note(
      e,
      'cost',
      'RM1,000 processing fee for the main applicant; +RM500 per dependent.',
      'Сбор за обработку RM1 000 для основного заявителя; +RM500 за каждого иждивенца.',
      'Збір за обробку RM1 000 для основного заявника; +RM500 за кожного утриманця.',
    );
    note(
      e,
      'incomeRequirement',
      '≥US$24,000/yr for tech/digital roles (≈$2,000/mo); non-tech roles require ≈US$60,000/yr.',
      '≥$24 000/год для tech/диджитал-специальностей (≈$2 000/мес.); для не-tech ≈$60 000/год.',
      '≥$24 000/рік для tech/діджитал-спеціальностей (≈$2 000/міс.); для не-tech ≈$60 000/рік.',
    );
  },

  // ── Indonesia: official PNBP fee; correct portal; exit-and-reapply ─────
  ID: (e) => {
    e.cost.amount = 430;
    e.officialUrl = 'https://evisa.imigrasi.go.id';
    note(
      e,
      'cost',
      'Official PNBP fee IDR 7,000,000 (~$430) for the 1-year permit; total self-processing ~$600 incl. re-entry permit.',
      'Официальный сбор PNBP 7 000 000 IDR (~$430) за разрешение на 1 год; самостоятельное оформление всего ~$600 с учётом разрешения на повторный въезд.',
      'Офіційний збір PNBP 7 000 000 IDR (~$430) за дозвіл на 1 рік; самостійне оформлення загалом ~$600 з урахуванням дозволу на повторний в’їзд.',
    );
    note(
      e,
      'incomeRequirement',
      'US$60,000/yr ($5,000/mo) plus ~$2,000 in savings (3-month balance). No in-country extension — you must exit and reapply.',
      '$60 000/год ($5 000/мес.) плюс ~$2 000 сбережений (остаток за 3 месяца). Продления внутри страны нет — нужно выехать и подать заново.',
      '$60 000/рік ($5 000/міс.) плюс ~$2 000 заощаджень (залишок за 3 місяці). Продовження всередині країни немає — потрібно виїхати й подати заново.',
    );
  },

  // ── Taiwan: tax benefit is 5 years (not 3) ─────────────────────────────
  TW: (e) => {
    arrReplace(
      e,
      'benefits',
      {
        en: '50% tax exemption on income >$94k for first 3 years',
        ru: '50% налоговая льгота на доход >$94 тыс. первые 3 года',
        ua: '50% податкова пільга на дохід >$94 тис. перші 3 роки',
      },
      {
        en: '50% tax exemption on income >$94k for first 5 years',
        ru: '50% налоговая льгота на доход >$94 тыс. первые 5 лет',
        ua: '50% податкова пільга на дохід >$94 тис. перші 5 років',
      },
    );
  },

  // ── Sri Lanka: launched Feb 2026; income $2,000; tax not exempt ─────────
  LK: (e) => {
    e.incomeRequirement.monthly = 2000;
    e.incomeRequirement.annual = 24000;
    e.tax.status = 'standard';
    e.tax.rate = null;
    note(
      e,
      'incomeRequirement',
      'Minimum US$2,000/month from foreign remote work.',
      'Минимум $2 000/мес. от удалённой работы за рубежом.',
      'Мінімум $2 000/міс. від віддаленої роботи за кордоном.',
    );
    note(
      e,
      'tax',
      'Holders must register with Inland Revenue; tax residents (183+ days) are taxed on worldwide income (6–36%). Treatment of foreign remote income is still evolving.',
      'Держатели обязаны зарегистрироваться в налоговой; налоговые резиденты (183+ дней) платят с мирового дохода (6–36%). Режим иностранного удалённого дохода пока уточняется.',
      'Власники зобов’язані зареєструватися в податковій; податкові резиденти (183+ днів) платять зі світового доходу (6–36%). Режим іноземного віддаленого доходу ще уточнюється.',
    );
  },

  // ── Costa Rica: family income is $4,000/mo (not $5,000) ────────────────
  CR: (e) => {
    note(
      e,
      'incomeRequirement',
      'Or $4,000/month for applicants with dependents.',
      'Или $4 000/мес. для семей.',
      'Або $4 000/міс. для сімей.',
    );
  },

  // ── Colombia: fix $684 line; add study fee ─────────────────────────────
  CO: (e) => {
    arrReplace(
      e,
      'requirements',
      {
        en: 'Proof of income ≥$684/month',
        ru: 'Подтверждение дохода ≥$684/мес.',
        ua: 'Підтвердження доходу ≥$684/міс.',
      },
      {
        en: 'Proof of income ≥$1,400/month (3× minimum wage)',
        ru: 'Подтверждение дохода ≥$1 400/мес. (3× МРОТ)',
        ua: 'Підтвердження доходу ≥$1 400/міс. (3× мінімальної зарплати)',
      },
    );
    note(
      e,
      'cost',
      'Visa issuance fee $177 + $54 study fee (~$231 total).',
      'Сбор за выдачу визы $177 + сбор за рассмотрение $54 (всего ~$231).',
      'Збір за видачу візи $177 + збір за розгляд $54 (загалом ~$231).',
    );
  },

  // ── Argentina: no official minimum income; updated URL ─────────────────
  AR: (e) => {
    e.officialUrl =
      'https://www.argentina.gob.ar/servicio/obtener-una-residencia-transitoria-como-nomada-digital';
    e.incomeRequirement.monthly = null;
    e.incomeRequirement.annual = null;
    note(
      e,
      'incomeRequirement',
      'No official minimum income — only proof of remote activity (contract or income receipts) is required.',
      'Официального минимума дохода нет — нужно лишь подтверждение удалённой деятельности (контракт или поступления дохода).',
      'Офіційного мінімуму доходу немає — потрібне лише підтвердження віддаленої діяльності (контракт або надходження доходу).',
    );
    arrReplace(
      e,
      'requirements',
      {
        en: 'Proof of income ≥$1,500/month',
        ru: 'Подтверждение дохода ≥$1 500/мес.',
        ua: 'Підтвердження доходу ≥$1 500/міс.',
      },
      {
        en: 'Proof of remote work activity (contract or income receipts)',
        ru: 'Подтверждение удалённой деятельности (контракт или поступления дохода)',
        ua: 'Підтвердження віддаленої діяльності (контракт або надходження доходу)',
      },
    );
  },

  // ── Brazil: >183-day tax-residency caveat ──────────────────────────────
  BR: (e) => {
    note(
      e,
      'tax',
      'No Brazilian income tax for non-residents; staying >183 days triggers tax residency on worldwide income.',
      'Для нерезидентов налога в Бразилии нет; пребывание >183 дней ведёт к налоговому резидентству на мировой доход.',
      'Для нерезидентів податку в Бразилії немає; перебування >183 днів призводить до податкового резидентства на світовий дохід.',
    );
  },

  // ── Uruguay: ~11-year tax holiday or 7% flat ───────────────────────────
  UY: (e) => {
    note(
      e,
      'tax',
      '0% on foreign income; new tax residents get a holiday for the year of residency plus the following 10 years (≈11 years), or may elect a flat 7% IRPF.',
      '0% на иностранный доход; новые налоговые резиденты получают льготу на год резидентства плюс 10 следующих лет (≈11 лет) либо могут выбрать фиксированные 7% IRPF.',
      '0% на іноземний дохід; нові податкові резиденти отримують пільгу на рік резидентства плюс 10 наступних років (≈11 років) або можуть обрати фіксовані 7% IRPF.',
    );
  },

  // ── El Salvador: renewable up to ~4 years ──────────────────────────────
  SV: (e) => {
    e.duration.maxExtension = 36;
  },

  // ── Panama: total cost ~$300 ───────────────────────────────────────────
  PA: (e) => {
    note(
      e,
      'cost',
      '$250 immigration (SNM) fee + $50 immigration card (~$300 total).',
      'Сбор миграционной службы (SNM) $250 + миграционная карта $50 (всего ~$300).',
      'Збір міграційної служби (SNM) $250 + міграційна картка $50 (загалом ~$300).',
    );
  },

  // ── Ecuador: cost ~$320; renewable once (+24 months) ───────────────────
  EC: (e) => {
    e.cost.amount = 320;
    e.duration.maxExtension = 24;
    note(
      e,
      'cost',
      '$50 application + $270 visa grant (~$320 total).',
      'Заявление $50 + выдача визы $270 (всего ~$320).',
      'Заява $50 + видача візи $270 (загалом ~$320).',
    );
  },

  // ── Belize: $500/adult; not extendable ─────────────────────────────────
  BZ: (e) => {
    e.cost.amount = 500;
    e.duration.maxExtension = 0;
    e.duration.renewable = false;
    note(
      e,
      'cost',
      '$500 per adult (+$200 per child); not extendable.',
      '$500 за взрослого (+$200 за ребёнка); продление невозможно.',
      '$500 за дорослого (+$200 за дитину); продовження неможливе.',
    );
    note(
      e,
      'incomeRequirement',
      '$75,000/yr individual; $100,000/yr if applying with dependents.',
      '$75 000/год индивидуально; $100 000/год при подаче с иждивенцами.',
      '$75 000/рік індивідуально; $100 000/рік при подачі з утриманцями.',
    );
  },

  // ── Thailand: replace LTR (high-earner) with the DTV digital-nomad visa ─
  TH: (e) => {
    e.visaName = 'Destination Thailand Visa (DTV)';
    e.officialUrl = 'https://www.thaievisa.go.th/';
    e.duration = { initial: 60, maxExtension: 0, renewable: true };
    e.cost = {
      currency: 'THB',
      amount: 10000,
      notes:
        '~$280–300; varies by embassy. Each 180-day stay can be extended once (+180 days) for ฿1,900.',
    };
    e.incomeRequirement = {
      currency: 'THB',
      monthly: null,
      annual: null,
      notes: 'No income requirement; show ฿500,000 (~$14,000) in savings.',
    };
    e.tax = {
      status: 'exempt',
      rate: 0,
      notes:
        'Foreign remote-work income is generally not taxed unless you become a tax resident (183+ days) and remit it in the same year. No Thai work permit is granted.',
    };
    e.eligibility = {
      minAge: 20,
      requirements: [
        'Remote work for a foreign employer/clients, OR a Thai "soft power" activity (Muay Thai, Thai cooking, medical treatment, etc.)',
        '฿500,000 (~$14,000) in savings',
        'Valid passport (6+ months)',
        'Proof of remote work or qualifying activity',
      ],
    };
    e.benefits = [
      '5-year validity, multiple entry',
      '180 days per entry, extendable once (+180 days)',
      'Low savings threshold, no income requirement',
      'Dependents (spouse and children) can apply',
      'No work permit needed for foreign employment',
    ];
    e.applicationProcess = {
      online: true,
      processingTime: '~2–4 weeks',
      documents: [
        'Passport',
        'Proof of ฿500,000 savings (bank statement)',
        'Employment/freelance contract or activity proof',
        'Proof of current location',
      ],
    };
    e.i18n = {
      ru: {
        cost: {
          notes:
            '~$280–300; зависит от посольства. Каждое пребывание 180 дней можно продлить один раз (+180 дней) за ฿1 900.',
        },
        incomeRequirement: {
          notes: 'Требований к доходу нет; нужно показать ฿500 000 (~$14 000) сбережений.',
        },
        tax: {
          notes:
            'Иностранный доход от удалённой работы обычно не облагается, если вы не стали налоговым резидентом (183+ дней) и не перевели его в том же году. Разрешение на работу не выдаётся.',
        },
        eligibility: {
          requirements: [
            'Удалённая работа на иностранного работодателя/клиентов ИЛИ деятельность в сфере «мягкой силы» Таиланда (муай-тай, тайская кухня, лечение и т.д.)',
            '฿500 000 (~$14 000) сбережений',
            'Действующий паспорт (6+ месяцев)',
            'Подтверждение удалённой работы или квалифицирующей деятельности',
          ],
        },
        benefits: [
          'Срок действия 5 лет, многократный въезд',
          '180 дней на въезд, продление один раз (+180 дней)',
          'Низкий порог сбережений, без требований к доходу',
          'Могут подать иждивенцы (супруг(а) и дети)',
          'Разрешение на работу для иностранного работодателя не нужно',
        ],
        applicationProcess: {
          processingTime: '~2–4 недели',
          documents: [
            'Паспорт',
            'Подтверждение сбережений ฿500 000 (выписка из банка)',
            'Трудовой/фриланс-контракт или подтверждение деятельности',
            'Подтверждение текущего местонахождения',
          ],
        },
      },
      ua: {
        cost: {
          notes:
            '~$280–300; залежить від посольства. Кожне перебування 180 днів можна продовжити один раз (+180 днів) за ฿1 900.',
        },
        incomeRequirement: {
          notes: 'Вимог до доходу немає; потрібно показати ฿500 000 (~$14 000) заощаджень.',
        },
        tax: {
          notes:
            'Іноземний дохід від віддаленої роботи зазвичай не оподатковується, якщо ви не стали податковим резидентом (183+ днів) і не переказали його того ж року. Дозвіл на роботу не видається.',
        },
        eligibility: {
          requirements: [
            'Віддалена робота на іноземного роботодавця/клієнтів АБО діяльність у сфері «м’якої сили» Таїланду (муай-тай, тайська кухня, лікування тощо)',
            '฿500 000 (~$14 000) заощаджень',
            'Дійсний паспорт (6+ місяців)',
            'Підтвердження віддаленої роботи або кваліфікаційної діяльності',
          ],
        },
        benefits: [
          'Термін дії 5 років, багаторазовий в’їзд',
          '180 днів на в’їзд, продовження один раз (+180 днів)',
          'Низький поріг заощаджень, без вимог до доходу',
          'Можуть подати утриманці (подружжя та діти)',
          'Дозвіл на роботу для іноземного роботодавця не потрібен',
        ],
        applicationProcess: {
          processingTime: '~2–4 тижні',
          documents: [
            'Паспорт',
            'Підтвердження заощаджень ฿500 000 (виписка з банку)',
            'Трудовий/фриланс-контракт або підтвердження діяльності',
            'Підтвердження поточного місцезнаходження',
          ],
        },
      },
    };
  },
};

// ── apply ───────────────────────────────────────────────────────────────
const REMOVE = new Set(['KY']); // Cayman GCCP discontinued (suspended Oct 2022)

const applied: string[] = [];
let kept: Entry[] = [];
for (const e of details) {
  if (REMOVE.has(e.code)) continue;
  const fn = patches[e.code];
  if (fn) {
    fn(e);
    e.lastUpdated = TODAY;
    applied.push(e.code);
  }
  kept.push(e);
}

list.countries = list.countries.filter((c) => !REMOVE.has(c));

fs.writeFileSync(DETAILS_FILE, JSON.stringify(kept, null, 2) + '\n', 'utf8');
fs.writeFileSync(LIST_FILE, JSON.stringify(list, null, 2) + '\n', 'utf8');

console.log(`✓ details: ${kept.length} entries (removed: ${[...REMOVE].join(',') || 'none'})`);
console.log(`✓ patched: ${applied.length} → ${applied.join(', ')}`);
console.log(`✓ list: ${list.countries.length} countries`);
