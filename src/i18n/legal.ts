// Statik hüquqi mətnlər — Figma-dan çıxarılıb. Yalnız "İstifadəçi Razılaşması" tam mövcuddur,
// digər tab-lar üçün məzmun dizaynerdən/PM-dən gözlənilir.
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
  body: string;
}

export interface LegalDocument {
  title: string;
  intro: string;
  sections: LegalSection[];
}

const pending = 'Bu bölmənin mətni hazırlanır.';

export const legalDocuments: Record<'agreement' | 'listing' | 'paid' | 'balance', LegalDocument> = {
  agreement: {
    title: 'İstifadəçi Razılaşması',
    intro:
      '1.1. Bu İstifadəçi Razılaşması (bundan sonra — "Razılaşma") "AQROBAZAR" Məhdud Məsuliyyətli Cəmiyyəti (VÖEN: 3105691301) tərəfindən idarə olunan, aqrobazar.com domenində fəaliyyət göstərən Aqrobazar onlayn platformasından istifadə qaydalarını və tərəflərin hüquq və öhdəliklərini müəyyən edir. Platformadan istifadə etməklə, qeydiyyatdan keçməklə, elan yerləşdirməklə və ya Platformanın hər hansı funksionallığından istifadə etməklə İstifadəçi: bu Razılaşmanı oxuduğunu; şərtləri başa düşdüyünü; tam və qeyd-şərtsiz qəbul etdiyini təsdiq edir. Bu Razılaşma Azərbaycan Respublikasının qanunvericiliyinə uyğun olaraq elektron müqavilə qüvvəsinə malikdir.',
    sections: [
      { title: 'Ümumi müddəalar', body: pending },
      { title: 'Terminlər və anlayışlar', body: pending },
      {
        title: 'Platformanın hüquqi statusu',
        body: '3.1. Aqrobazar marketplace/platforma funksiyası həyata keçirir və məhsul satıcısı hesab edilmir. 3.2. Platforma Satıcı ilə Alıcı arasında vasitəçi texnoloji platformadır. 3.3. Platforma: məhsulların keyfiyyətinə; təhlükəsizliyinə; qanuniliyinə; uyğunluğuna; sertifikatlarına; mövcudluğuna; çatdırılmasına; ödəniş münasibətlərinə zəmanət vermir. 3.4. Satıcı ilə Alıcı arasında yaranan münasibətlər həmin tərəflər arasında formalaşır. 3.5. Platforma istifadəçilər arasında yaranan: mübahisələrə; zərərə; dələduzluq hallarına; ödəniş problemlərinə; məhsul qüsurlarına görə birbaşa məsuliyyət daşımır. 3.6. Administrasiya Platformada yerləşdirilmiş istənilən elanı əvvəlcədən xəbərdarlıq etmədən yoxlamaq, gizlətmək, məhdudlaşdırmaq və ya silmək hüququna malikdir.',
      },
      { title: 'İstifadəçi hesabı və qeydiyyat', body: pending },
      { title: 'Elan yerləşdirilməsi', body: pending },
      { title: 'İstifadəçinin hüquq və öhdəlikləri', body: pending },
      { title: 'Qadağan fəaliyyətlər', body: pending },
      { title: 'Moderasiya və Platforma hüquqları', body: pending },
      { title: 'Ödənişli xidmətlər', body: pending },
      { title: 'Məxfilik və məlumatların emalı', body: pending },
      { title: 'Əqli mülkiyyət hüquqları', body: pending },
      { title: 'Məsuliyyətin məhdudlaşdırılması', body: pending },
      { title: 'Fors-major halları', body: pending },
      { title: 'Mübahisələrin həlli', body: pending },
      { title: 'Razılaşmaya dəyişikliklər', body: pending },
      { title: 'Əlaqə məlumatları', body: pending },
    ],
  },
  listing: { title: 'Elan Yerləşdirmə Qaydaları', intro: pending, sections: [] },
  paid: { title: 'Ödənişli Xidmətlər', intro: pending, sections: [] },
  balance: { title: 'Balans', intro: pending, sections: [] },
};

export const contactInfo = {
  phone: '+994103120606',
  email: 'info@aqrobazar.com',
  address: 'Novxanı, Saray Bağlar Massivi, ev 3140 E',
  facebook: 'https://facebook.com/aqrobazar',
  instagram: 'https://instagram.com/aqrobazar',
  tiktok: 'https://tiktok.com/@aqrobazar',
};
