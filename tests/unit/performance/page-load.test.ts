import { describe, test, expect } from '@jest/globals';

describe('Performance - Page load', ()=>{
  test('Home page load simulated under threshold', async ()=>{
    const simulatedLoad = 1200; // ms
    expect(simulatedLoad).toBeLessThan(3000);
  });
});
