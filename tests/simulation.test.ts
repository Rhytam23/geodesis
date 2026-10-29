import { describe, it, expect } from 'vitest';
import { SimulationAdapter } from '../src/integrations/simulation/SimulationAdapter';

const run = (input: Record<string, number>) => new SimulationAdapter().runSimulation({ year: 2030, ...input });

describe('SimulationAdapter what-if model', () => {
  it('a drought lowers yield versus a wetter scenario and keeps falling year over year', async () => {
    const drought = await run({ rainfallDelta: -25, salinityDelta: 0.8, awdAdoption: 35, baselineYield: 3.6 });
    const wetter = await run({ rainfallDelta: 10, salinityDelta: 0.8, awdAdoption: 35, baselineYield: 3.6 });
    expect(drought[0].yield).toBeLessThan(wetter[0].yield);
    expect(drought[1].yield).toBeLessThanOrEqual(drought[0].yield);
    expect(drought[2].yield).toBeLessThanOrEqual(drought[1].yield);
    expect(drought[0].yield).toBeLessThan(3.6);
  });

  it('more salinity lowers yield and raises risk', async () => {
    const low = await run({ rainfallDelta: 0, salinityDelta: 0.2, awdAdoption: 35 });
    const high = await run({ rainfallDelta: 0, salinityDelta: 2.5, awdAdoption: 35 });
    expect(high[0].yield).toBeLessThan(low[0].yield);
    expect(high[0].riskScore).toBeGreaterThan(low[0].riskScore);
  });

  it('AWD saves water and risk and water use are monotonic across years', async () => {
    const noAwd = await run({ rainfallDelta: -15, salinityDelta: 0.8, awdAdoption: 0 });
    const awd = await run({ rainfallDelta: -15, salinityDelta: 0.8, awdAdoption: 80 });
    expect(awd[0].waterUse).toBeLessThan(noAwd[0].waterUse);
    expect(awd[1].riskScore).toBeGreaterThanOrEqual(awd[0].riskScore);
    expect(awd[2].riskScore).toBeGreaterThanOrEqual(awd[1].riskScore);
    expect(awd[2].waterUse).toBeGreaterThanOrEqual(awd[1].waterUse);
  });

  it('returns three consecutive years starting from the requested year', async () => {
    const r = await run({});
    expect(r.map((x) => x.year)).toEqual([2030, 2031, 2032]);
  });
});
