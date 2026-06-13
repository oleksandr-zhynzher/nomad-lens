import { describe, expect, it } from 'vitest';

import { localData } from '../localData';

describe('localData', () => {
  describe('getHdi', () => {
    it('returns an entry for a known country code', () => {
      const result = localData.getHdi('US');
      expect(result).toBeDefined();
      expect(result?.code).toBe('US');
    });

    it('returns undefined for an unknown country code', () => {
      expect(localData.getHdi('ZZ')).toBeUndefined();
    });
  });

  describe('getHappiness', () => {
    it('returns an entry for a known country code', () => {
      const result = localData.getHappiness('FI');
      expect(result).toBeDefined();
    });

    it('returns undefined for an unknown code', () => {
      expect(localData.getHappiness('ZZ')).toBeUndefined();
    });
  });

  describe('getPeace', () => {
    it('returns an entry for a known country code', () => {
      const result = localData.getPeace('IS');
      expect(result).toBeDefined();
    });

    it('returns undefined for unknown', () => {
      expect(localData.getPeace('ZZ')).toBeUndefined();
    });
  });

  describe('getCrime', () => {
    it('returns an entry for a known country code', () => {
      const result = localData.getCrime('JP');
      expect(result).toBeDefined();
    });

    it('returns undefined for unknown', () => {
      expect(localData.getCrime('ZZ')).toBeUndefined();
    });
  });

  describe('getCpi', () => {
    it('returns an entry for a known country code', () => {
      const result = localData.getCpi('DK');
      expect(result).toBeDefined();
    });

    it('returns undefined for unknown', () => {
      expect(localData.getCpi('ZZ')).toBeUndefined();
    });
  });

  describe('getEpi', () => {
    it('returns an entry for a known country code', () => {
      const result = localData.getEpi('CH');
      expect(result).toBeDefined();
    });

    it('returns undefined for unknown', () => {
      expect(localData.getEpi('ZZ')).toBeUndefined();
    });
  });

  describe('getDigitalFreedom', () => {
    it('returns an entry for a known country code', () => {
      const result = localData.getDigitalFreedom('US');
      expect(result).toBeDefined();
    });

    it('returns undefined for unknown', () => {
      expect(localData.getDigitalFreedom('ZZ')).toBeUndefined();
    });
  });

  describe('getPersonalFreedom', () => {
    it('returns an entry for a known country code', () => {
      expect(localData.getPersonalFreedom('NZ')).toBeDefined();
    });

    it('returns undefined for unknown', () => {
      expect(localData.getPersonalFreedom('ZZ')).toBeUndefined();
    });
  });

  describe('getSocialTolerance', () => {
    it('returns an entry for a known country code', () => {
      expect(localData.getSocialTolerance('NL')).toBeDefined();
    });

    it('returns undefined for unknown', () => {
      expect(localData.getSocialTolerance('ZZ')).toBeUndefined();
    });
  });

  describe('getTaxBurden', () => {
    it('returns an entry for a known country code', () => {
      expect(localData.getTaxBurden('DE')).toBeDefined();
    });

    it('returns undefined for unknown', () => {
      expect(localData.getTaxBurden('ZZ')).toBeUndefined();
    });
  });

  describe('getStartup', () => {
    it('returns an entry for a known country code', () => {
      expect(localData.getStartup('US')).toBeDefined();
    });

    it('returns undefined for unknown', () => {
      expect(localData.getStartup('ZZ')).toBeUndefined();
    });
  });

  describe('getAirport', () => {
    it('returns an entry for a known country code', () => {
      expect(localData.getAirport('US')).toBeDefined();
    });

    it('returns undefined for unknown', () => {
      expect(localData.getAirport('ZZ')).toBeUndefined();
    });
  });

  describe('getHeritage', () => {
    it('returns an entry for a known country code', () => {
      expect(localData.getHeritage('IT')).toBeDefined();
    });

    it('returns undefined for unknown', () => {
      expect(localData.getHeritage('ZZ')).toBeUndefined();
    });
  });

  describe('getIntangibleHeritage', () => {
    it('returns an entry for a known country code', () => {
      expect(localData.getIntangibleHeritage('CN')).toBeDefined();
    });

    it('returns undefined for unknown', () => {
      expect(localData.getIntangibleHeritage('ZZ')).toBeUndefined();
    });
  });

  describe('getBiodiversity', () => {
    it('returns an entry for a known country code', () => {
      expect(localData.getBiodiversity('BR')).toBeDefined();
    });

    it('returns undefined for unknown', () => {
      expect(localData.getBiodiversity('ZZ')).toBeUndefined();
    });
  });

  describe('hasNomadVisa', () => {
    it('is case-insensitive', () => {
      // Check any code present — we test that lowercase lookups work
      const upper = localData.hasNomadVisa('PT');
      const lower = localData.hasNomadVisa('pt');
      expect(upper).toBe(lower);
    });

    it('returns false for clearly non-existent code', () => {
      expect(localData.hasNomadVisa('ZZ')).toBe(false);
    });
  });

  describe('isSchengen', () => {
    it('returns true for a Schengen country', () => {
      expect(localData.isSchengen('DE')).toBe(true);
    });

    it('returns false for a non-Schengen country', () => {
      expect(localData.isSchengen('US')).toBe(false);
    });

    it('is case-insensitive', () => {
      expect(localData.isSchengen('de')).toBe(localData.isSchengen('DE'));
    });
  });

  describe('getTouristVisaDays', () => {
    it('returns null for an unknown country code', () => {
      expect(localData.getTouristVisaDays('ZZ')).toBeNull();
    });

    it('returns a number or null for known codes', () => {
      const result = localData.getTouristVisaDays('US');
      expect(result === null || typeof result === 'number').toBe(true);
    });

    it('is case-insensitive', () => {
      const upper = localData.getTouristVisaDays('US');
      const lower = localData.getTouristVisaDays('us');
      expect(upper).toBe(lower);
    });
  });

  describe('getNomadVisaDetails', () => {
    it('is case-insensitive', () => {
      const upper = localData.getNomadVisaDetails('PT');
      const lower = localData.getNomadVisaDetails('pt');
      expect(upper).toEqual(lower);
    });

    it('returns undefined for unknown code', () => {
      expect(localData.getNomadVisaDetails('ZZ')).toBeUndefined();
    });
  });

  describe('getAiMetrics', () => {
    it('is case-insensitive', () => {
      const upper = localData.getAiMetrics('US');
      const lower = localData.getAiMetrics('us');
      expect(upper).toEqual(lower);
    });

    it('returns undefined for unknown code', () => {
      expect(localData.getAiMetrics('ZZ')).toBeUndefined();
    });
  });

  describe('getTourismAiMetrics', () => {
    it('is case-insensitive', () => {
      const upper = localData.getTourismAiMetrics('TH');
      const lower = localData.getTourismAiMetrics('th');
      expect(upper).toEqual(lower);
    });

    it('returns undefined for unknown code', () => {
      expect(localData.getTourismAiMetrics('ZZ')).toBeUndefined();
    });
  });

  describe('getCostOfLiving', () => {
    it('is case-insensitive', () => {
      const upper = localData.getCostOfLiving('US');
      const lower = localData.getCostOfLiving('us');
      expect(upper).toEqual(lower);
    });

    it('returns undefined for unknown code', () => {
      expect(localData.getCostOfLiving('ZZ')).toBeUndefined();
    });
  });
});
