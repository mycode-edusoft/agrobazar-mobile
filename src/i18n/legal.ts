// Statik hüquqi mətnlər. Qaydalar sənədləri aqrobazar.com-dan götürülüb (legalDocs.ts).
import { webLegalDocuments } from './legalDocs';

export const aboutSections = [
  {
    title: '1. Layihə haqqında',
    body: 'Aqrobazar layihəsi Azərbaycanda kənd təsərrüfatı məhsullarının alqı-satqısı üçün yaradılmış onlayn platformadır. Platforma fermerləri, istehsalçıları və alıcıları bir araya gətirərək məhsulların daha sürətli, şəffaf və rahat şəkildə təqdim olunmasına imkan yaradır. İstifadəçilər Aqrobazar vasitəsilə mövcud elanlara baxa, satıcılarla birbaşa əlaqə saxlaya və regionlar üzrə axtarış edə bilərlər.',
  },
  {
    title: 'Layihənin məqsədi',
    body: 'Layihənin əsas məqsədi kənd təsərrüfatı bazarında rəqəmsal alətlərin tətbiqini gücləndirmək və məhsulların daha geniş auditoriyaya çatdırılmasına dəstək olmaqdır. Aqrobazar həm fərdi, həm də korporativ istifadəçilər üçün nəzərdə tutulub və bazar prosesini daha çevik idarə etməyə kömək edir.',
  },
  {
    title: 'Hüquqi məlumatlar',
    body: 'Aqrobazar platforması "AQROBAZAR" MMC (VÖEN: 3105691301) tərəfindən idarə olunur və Azərbaycan Respublikasının qanunvericiliyinə uyğun fəaliyyət göstərir. Platformada göstərilən xidmətlər və təqdim olunan funksionallıqlar mövcud qanunvericiliyin tələblərinə uyğun şəkildə həyata keçirilir.',
  },
];

export interface LegalSection {
  title: string;
  /** Sətirlər "\n" ilə; "– " — siyahı bəndi, "## " — alt başlıq */
  body: string;
}

export interface LegalDocument {
  title: string;
  intro: string;
  sections: LegalSection[];
}

/**
 * aqrobazar.com/qaydalar ilə eyni 8 sənəd, eyni sırada. Açarlar backend `pages.StaticPage.PageType`-a
 * uyğundur (user_agreement, listing_rules, …) — mətn backend-ə köçəndə `static-pages/type/<type>/` ilə qoşulacaq.
 */
export const LEGAL_TABS = ['agreement', 'listing', 'paid', 'refund', 'privacy', 'prohibited', 'business', 'disputes'] as const;
export type LegalTab = (typeof LEGAL_TABS)[number];

export const legalDocuments: Record<LegalTab, LegalDocument> = webLegalDocuments;

export const contactInfo = {
  phone: '+994103120606',
  email: 'info@aqrobazar.com',
  address: 'Novxanı, Saray Bağlar Massivi, ev 3140 E',
  facebook: 'https://facebook.com/aqrobazar',
  instagram: 'https://instagram.com/aqrobazar',
  tiktok: 'https://tiktok.com/@aqrobazar',
};
