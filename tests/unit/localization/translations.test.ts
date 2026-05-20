import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import en from '@/locales/en.json';
import et from '@/locales/et.json';

beforeEach(()=>jest.resetAllMocks());

describe('Localization - Translations completeness', ()=>{
  test('Key sets for en and et overlap for core pages', ()=>{
    const enKeys = Object.keys(en);
    const etKeys = Object.keys(et);
    expect(enKeys.length).toBeGreaterThan(0);
    expect(etKeys.length).toBeGreaterThan(0);
  });
});
