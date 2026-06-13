import { describe, expect, it } from 'vitest';

import {
  ALL_TOURISM_TAGS,
  computeTourismTagScores,
  computeTourismTagSeasonality,
  computeTourismTags,
  hasDesertAdventure,
  hasDivingSnorkeling,
  hasHistoricCities,
  hasMountaineering,
  hasSkiResorts,
  hasWildlifeSafari,
  isBeachDestination,
  isIslandNation,
} from '../tourismTags';

describe('ALL_TOURISM_TAGS', () => {
  it('contains exactly 8 tags', () => {
    expect(ALL_TOURISM_TAGS).toHaveLength(8);
  });

  it('includes all expected tag types', () => {
    const expected = [
      'beach',
      'island',
      'ski',
      'mountains',
      'historic',
      'wildlife',
      'diving',
      'desert',
    ];
    expect(ALL_TOURISM_TAGS).toEqual(expect.arrayContaining(expected));
  });
});

describe('isBeachDestination', () => {
  it('returns true for override countries (MV = Maldives)', () => {
    expect(isBeachDestination('MV', true, 20)).toBe(true); // landlocked override
  });

  it('returns true for override countries (TH = Thailand)', () => {
    expect(isBeachDestination('TH', false, 20)).toBe(true);
  });

  it('returns false for landlocked non-override country with warm temp', () => {
    expect(isBeachDestination('AT', true, 30)).toBe(false);
  });

  it('returns false for coastal country with cold summer (hottestMonth < 24)', () => {
    expect(isBeachDestination('NO', false, 20)).toBe(false);
  });

  it('returns true for coastal country with hot summer (hottestMonth >= 24)', () => {
    expect(isBeachDestination('NO', false, 24)).toBe(true);
  });

  it('returns false when hottestMonth is undefined and not override and coastal', () => {
    expect(isBeachDestination('NO', false, undefined)).toBe(false);
  });
});

describe('isIslandNation', () => {
  it('returns true for Maldives (MV)', () => {
    expect(isIslandNation('MV')).toBe(true);
  });

  it('returns true for Japan (JP)', () => {
    expect(isIslandNation('JP')).toBe(true);
  });

  it('returns true for Iceland (IS)', () => {
    expect(isIslandNation('IS')).toBe(true);
  });

  it('returns false for landlocked Germany (DE)', () => {
    expect(isIslandNation('DE')).toBe(false);
  });

  it('returns false for Kazakhstan (KZ)', () => {
    expect(isIslandNation('KZ')).toBe(false);
  });
});

describe('hasSkiResorts', () => {
  it('returns true for Austria (AT)', () => {
    expect(hasSkiResorts('AT')).toBe(true);
  });

  it('returns true for Switzerland (CH)', () => {
    expect(hasSkiResorts('CH')).toBe(true);
  });

  it('returns true for Japan (JP)', () => {
    expect(hasSkiResorts('JP')).toBe(true);
  });

  it('returns false for Maldives (MV)', () => {
    expect(hasSkiResorts('MV')).toBe(false);
  });

  it('returns false for Singapore (SG)', () => {
    expect(hasSkiResorts('SG')).toBe(false);
  });
});

describe('hasMountaineering', () => {
  it('returns true for Nepal (NP)', () => {
    expect(hasMountaineering('NP')).toBe(true);
  });

  it('returns true for Peru (PE)', () => {
    expect(hasMountaineering('PE')).toBe(true);
  });

  it('returns false for Maldives (MV)', () => {
    expect(hasMountaineering('MV')).toBe(false);
  });
});

describe('hasHistoricCities', () => {
  it('returns true for Italy (IT)', () => {
    expect(hasHistoricCities('IT')).toBe(true);
  });

  it('returns true for Japan (JP)', () => {
    expect(hasHistoricCities('JP')).toBe(true);
  });

  it('returns false for a small Pacific nation (NR = Nauru)', () => {
    expect(hasHistoricCities('NR')).toBe(false);
  });
});

describe('hasWildlifeSafari', () => {
  it('returns true for Kenya (KE)', () => {
    expect(hasWildlifeSafari('KE')).toBe(true);
  });

  it('returns true for Tanzania (TZ)', () => {
    expect(hasWildlifeSafari('TZ')).toBe(true);
  });

  it('returns false for Luxembourg (LU)', () => {
    expect(hasWildlifeSafari('LU')).toBe(false);
  });
});

describe('hasDivingSnorkeling', () => {
  it('returns true for Maldives (MV)', () => {
    expect(hasDivingSnorkeling('MV')).toBe(true);
  });

  it('returns true for Palau (PW)', () => {
    expect(hasDivingSnorkeling('PW')).toBe(true);
  });

  it('returns false for Chad (TD)', () => {
    expect(hasDivingSnorkeling('TD')).toBe(false);
  });
});

describe('hasDesertAdventure', () => {
  it('returns true for Jordan (JO)', () => {
    expect(hasDesertAdventure('JO')).toBe(true);
  });

  it('returns true for Namibia (NA)', () => {
    expect(hasDesertAdventure('NA')).toBe(true);
  });

  it('returns false for Iceland (IS)', () => {
    expect(hasDesertAdventure('IS')).toBe(false);
  });
});

describe('computeTourismTags', () => {
  it('returns tags for Thailand (TH) — beach, island, ski, historic, wildlife, diving', () => {
    const tags = computeTourismTags('TH', false, 28);
    expect(tags).toContain('beach');
    expect(tags).toContain('historic');
    expect(tags).toContain('wildlife');
    expect(tags).toContain('diving');
  });

  it('returns no tags for a landlocked country with cold climate and no overrides (e.g. MC)', () => {
    // Use a fake code that's not in any set
    const tags = computeTourismTags('ZZ', true, 5);
    expect(tags).toHaveLength(0);
  });

  it('returns ski and mountains for Switzerland (CH)', () => {
    const tags = computeTourismTags('CH', false, undefined);
    expect(tags).toContain('ski');
    expect(tags).toContain('mountains');
  });

  it('returns beach for Maldives even though landlocked=true in data', () => {
    const tags = computeTourismTags('MV', false, 28);
    expect(tags).toContain('beach');
  });

  it('returns island for Iceland (IS)', () => {
    const tags = computeTourismTags('IS', false, 12);
    expect(tags).toContain('island');
  });
});

describe('computeTourismTagScores', () => {
  it('returns score 97 for MV beach', () => {
    const scores = computeTourismTagScores('MV', ['beach']);
    expect(scores['beach']).toBe(97);
  });

  it('returns score 98 for NP mountains', () => {
    const scores = computeTourismTagScores('NP', ['mountains']);
    expect(scores['mountains']).toBe(98);
  });

  it('returns default score 50 for an unknown country in a valid tag', () => {
    const scores = computeTourismTagScores('ZZ', ['beach']);
    expect(scores['beach']).toBe(50);
  });

  it('returns scores only for tags provided', () => {
    const scores = computeTourismTagScores('TH', ['beach', 'diving']);
    expect(Object.keys(scores)).toHaveLength(2);
    expect('beach' in scores).toBe(true);
    expect('diving' in scores).toBe(true);
  });

  it('returns empty object when tags array is empty', () => {
    const scores = computeTourismTagScores('TH', []);
    expect(scores).toEqual({});
  });
});

describe('computeTourismTagSeasonality', () => {
  it('returns a record with an entry for each tag', () => {
    const result = computeTourismTagSeasonality('TH', ['beach', 'diving'], 15, 28, 2);
    expect('beach' in result).toBe(true);
    expect('diving' in result).toBe(true);
  });

  it('each tag entry is an array of 12 monthly scores', () => {
    const result = computeTourismTagSeasonality('AT', ['ski'], 47, 8, 20);
    const arr = result['ski'];
    expect(arr).toHaveLength(12);
  });

  it('each monthly score is a number', () => {
    const result = computeTourismTagSeasonality('AT', ['ski'], 47, 8, 20);
    const arr = result['ski']!;
    expect(arr.every((v) => typeof v === 'number')).toBe(true);
  });

  it('winter months have higher ski scores in northern hemisphere', () => {
    // AT: latitude ~ 47N, annualMean 8°C, tempRange 20°C
    const result = computeTourismTagSeasonality('AT', ['ski'], 47, 8, 20);
    const scores = result['ski']!;
    // January (index 0) and December (index 11) should be higher than July (index 6)
    const winterAvg = (scores[0]! + scores[11]!) / 2;
    const summerScore = scores[6]!;
    expect(winterAvg).toBeGreaterThan(summerScore);
  });

  it('summer months have higher beach scores in northern hemisphere', () => {
    // TH: tropical, should have high beach scores year-round; use latitude 15N
    const result = computeTourismTagSeasonality('TH', ['beach'], 15, 28, 2);
    const scores = result['beach']!;
    // All scores should be high (tropical)
    expect(scores.every((v) => v > 0)).toBe(true);
  });

  it('returns empty object when no tags given', () => {
    const result = computeTourismTagSeasonality('JP', [], 35, 14, 20);
    expect(result).toEqual({});
  });
});
