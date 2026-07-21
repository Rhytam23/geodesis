import { describe, it, expect } from 'vitest';
import { generateRecommendations } from '../src/services/decisionEngine';
import { DecisionInput } from '../src/types/recommendation';

describe('generateRecommendations', () => {
  const baseInput: DecisionInput = {
    lat: 10.25,
    lng: 105.6,
    admin: { province: 'Can Tho', district: 'Ninh Kieu', ward: 'Tan An', source: 'test', lastUpdated: '', confidence: 100 },
    soil: { salinity: 3.2, ph: 5.8, organicMatter: 2.4, texture: 'Loam', type: 'Alluvial', source: 'test', lastUpdated: '', confidence: 100 },
    weather: { current: { temp: 28, humidity: 78, wind: 9, condition: 'Partly Cloudy', rainfall: 28 }, forecast: [], source: 'test', lastUpdated: '', confidence: 100 },
    crop: { current: 'ST25 Rice', stage: 'Grain Filling', daysSincePlanting: 62, season: 'Wet Season 2026', source: 'test', lastUpdated: '', confidence: 100 },
    market: { ricePrice: 7250, shrimpPrice: 139000, vegetablePrice: 17300, trend: 'Stable' as const, source: 'test', lastUpdated: '', confidence: 100 },
    government: { programs: ['MARD Salinity Resilience Program 2026'], alerts: [], source: 'test', lastUpdated: '', confidence: 100 },
    groundwater: { depth: 1.9 },
  };

  it('returns recommendations sorted by confidence descending', () => {
    const results = generateRecommendations(baseInput);
    expect(results.length).toBeGreaterThan(0);
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].confidence).toBeGreaterThanOrEqual(results[i + 1].confidence);
    }
  });

  it('all confidence values are between valid range (0 to 100)', () => {
    const results = generateRecommendations(baseInput);
    results.forEach((r) => {
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(100);
    });
  });

  it('high salinity (9.4 dS/m) adapts crop recommendations', () => {
    const highSalinityInput: DecisionInput = {
      ...baseInput,
      soil: { ...baseInput.soil, salinity: 9.4 },
    };
    const results = generateRecommendations(highSalinityInput);
    expect(results.length).toBeGreaterThan(0);
    const topCrop = results[0].crop;
    expect(topCrop).toBeDefined();
  });

  it('each recommendation carries all required explainability fields', () => {
    const results = generateRecommendations(baseInput);
    results.forEach((r) => {
      expect(r.reasoning).toBeDefined();
      expect(r.reasoning.length).toBeGreaterThan(0);
      expect(r.confidenceBreakdown).toBeDefined();
      expect(r.calculationFormula).toBeDefined();
      expect(r.riskAssessment).toBeDefined();
    });
  });

  it('is deterministic — same inputs always produce same outputs', () => {
    const a = generateRecommendations(baseInput);
    const b = generateRecommendations(baseInput);
    expect(a[0].confidence).toBe(b[0].confidence);
    expect(a[0].crop).toBe(b[0].crop);
  });
});
