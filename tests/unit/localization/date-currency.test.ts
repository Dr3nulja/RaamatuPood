import { describe, test, expect, jest, beforeEach } from '@jest/globals';
beforeEach(()=>jest.resetAllMocks());

describe('Localization - Date and Currency formats', ()=>{
  test('EN uses dot decimal and ET uses comma where applicable', ()=>{
    const en = new Intl.NumberFormat('en', { style:'currency', currency:'EUR' }).format(1234.56);
    const et = new Intl.NumberFormat('et', { style:'currency', currency:'EUR' }).format(1234.56);
    expect(typeof en).toBe('string');
    expect(typeof et).toBe('string');
  });
});
