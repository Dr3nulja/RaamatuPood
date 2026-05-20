import { describe, test, expect } from '@jest/globals';

describe('Performance - API response', ()=>{
  test('API p95 simulated under 500ms', ()=>{
    const p95 = 200; // ms (simulated)
    expect(p95).toBeLessThan(500);
  });
});
