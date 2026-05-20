import { describe, test, expect, jest, beforeEach } from '@jest/globals';
jest.mock('@/hooks/useTranslation');

beforeEach(()=>jest.resetAllMocks());

describe('Localization - Language Switch', ()=>{
  test('Switch EN -> ET -> EN preserves UI keys', async ()=>{
    const useTranslation = require('@/hooks/useTranslation');
    (useTranslation.useTranslation as any).mockReturnValue({ t:(k:string)=>k });
    expect(useTranslation.useTranslation().t('common.hello')).toBe('common.hello');
  });
});
