import { isKnownAzOperator, maskAzPhone, parseAzPhoneDigits } from '@/lib/format';

describe('AZ telefon sahəsi (Tap.az məntiqi)', () => {
  it.each([
    ['(05', '5'],
    ['(0557293791', '557293791'],
    ['+994 55 729 37 91', '557293791'], // klaviatura autofill-i
    ['(0055 729 37 91', '557293791'], // "(0" üzərinə 0-lı yapışdırma
    ['(', ''], // "(0" silinməyə çalışılır
    ['(055) 729-37-91999', '557293791'], // 9 rəqəmdən artıq kəsilir
  ])('%s → %s', (text, digits) => {
    expect(parseAzPhoneDigits(text)).toBe(digits);
  });

  it('maskalayır', () => {
    expect(maskAzPhone('')).toBe('(0');
    expect(maskAzPhone('55')).toBe('(055');
    expect(maskAzPhone('557')).toBe('(055) 7');
    expect(maskAzPhone('557293791')).toBe('(055) 729-37-91');
  });

  it('separator silinəndə rəqəm silinir (ilişmir)', () => {
    // "(055) 7" → backspace → "(055) " → 2 rəqəm → "(055"
    expect(maskAzPhone(parseAzPhoneDigits('(055) '))).toBe('(055');
  });

  it('operatoru yoxlayır', () => {
    expect(isKnownAzOperator('5')).toBe(true);
    expect(isKnownAzOperator('55')).toBe(true);
    expect(isKnownAzOperator('10')).toBe(true);
    expect(isKnownAzOperator('33')).toBe(false);
  });
});
