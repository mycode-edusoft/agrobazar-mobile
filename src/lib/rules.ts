// BRD-dən gələn qaydalar. Rəqəmlər defoltdur — API cavabı gələndə üstünlük API-dadır.
export const OTP = {
  length: 6,
  resendCooldownSeconds: 60,
  maxResends: 3,
  maxWrongAttempts: 3,
  blockMinutes: 5,
} as const;

export const LISTING_DEFAULTS = {
  minImages: 2,
  maxImages: 8,
  maxVideoBytes: 5 * 1024 * 1024,
  activeDays: 30,
} as const;

export const STORE_DEFAULTS = {
  maxImageBytes: 500 * 1024,
} as const;

export const PROFILE_DEFAULTS = {
  maxAvatarBytes: 500 * 1024,
} as const;

// Figma sırası: Aktiv · Müddəti bitmiş · Yoxlanışda olan · (4-cü tab dizaynda kəsilib — "Dərc…")
export const MY_LISTING_TABS = ['active', 'expired', 'draft', 'rejected'] as const;

export const PROMOTION_DAY_BLOCKS = [1, 7, 15, 30] as const;

export const AZ_REGIONS = [
  'Abşeron', 'Ağcabədi', 'Ağdam', 'Ağdaş', 'Ağstafa', 'Ağsu', 'Astara', 'Babək', 'Bakı',
  'Balakən', 'Beyləqan', 'Bərdə', 'Biləsuvar', 'Cəbrayıl', 'Cəlilabad', 'Culfa', 'Daşkəsən',
  'Füzuli', 'Gədəbəy', 'Gəncə', 'Goranboy', 'Göyçay', 'Göygöl', 'Hacıqabul', 'Xaçmaz',
  'Xankəndi', 'Xızı', 'Xocalı', 'Xocavənd', 'İmişli', 'İsmayıllı', 'Kəlbəcər', 'Kəngərli',
  'Kürdəmir', 'Laçın', 'Lənkəran', 'Lerik', 'Masallı', 'Mingəçevir', 'Naftalan', 'Naxçıvan',
  'Neftçala', 'Oğuz', 'Ordubad', 'Qax', 'Qazax', 'Qəbələ', 'Qobustan', 'Quba', 'Qubadlı',
  'Qusar', 'Saatlı', 'Sabirabad', 'Salyan', 'Samux', 'Sədərək', 'Siyəzən', 'Sumqayıt',
  'Şabran', 'Şahbuz', 'Şamaxı', 'Şəki', 'Şəmkir', 'Şərur', 'Şirvan', 'Şuşa', 'Tərtər',
  'Tovuz', 'Ucar', 'Yardımlı', 'Yevlax', 'Zaqatala', 'Zəngilan', 'Zərdab',
] as const;
