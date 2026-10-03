import type { BillingCycle, Plan } from '@/types/domain';

/**
 * Seçilmiş dövr üçün qiymət və üstündən xətt çəkiləcək köhnə qiymət.
 * İllikdə köhnə qiymət = 12 aylıq ödəniş (endirim görünsün); aylıqda — backend-in endirimdən əvvəlki qiyməti.
 */
export function planPrice(plan: Plan, cycle: BillingCycle): { price: number; old: number | null } {
  if (cycle === 'yearly') {
    const full = plan.monthlyPrice * 12;
    return { price: plan.yearlyPrice, old: full > plan.yearlyPrice ? full : null };
  }
  return { price: plan.monthlyPrice, old: plan.oldMonthlyPrice != null && plan.oldMonthlyPrice > plan.monthlyPrice ? plan.oldMonthlyPrice : null };
}
