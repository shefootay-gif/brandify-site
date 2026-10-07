# Brandify — وثيقة التخطيط (Phase 2 → Phase 6)

> الحالة: **تمت الموافقة والتنفيذ** · آخر تحديث: 2026-10-06
>
> **اختلافات عن الخطة أثناء التنفيذ:**
> - قاعدة البيانات المحلية: PostgreSQL حقيقي من حزمة npm (بدل PGlite) لأنه يدعم عدة اتصالات مثل الإنتاج تمامًا.
> - أُزيلت View Transitions بين الصفحات (كانت تسبب أخطاء في المتصفح مقابل فائدة بسيطة).
> - أُضيف جدول `cta_events` لعدّ نقرات واتساب الحقيقية في لوحة التحكم (بدون بيانات شخصية).
> - أُضيفت إدارة المستخدمين (مدير / محرر) وصفحة بحث في لوحة التحكم.
> - واجهة لوحة التحكم بالعربية، وكل المحتوى يُحرَّر باللغتين.

---

## 0. ملخص قرارات الـDiscovery

| المحور | القرار |
|---|---|
| الشريحة القائدة | أصحاب البيزنس الخدمي أولًا، ثم E-commerce |
| رسالة الـHero | "نبني البراند ونخليه يبيع" |
| السوق | المنيا أولًا ← مصر كلها · العملة: الجنيه · Local SEO من البداية |
| النبرة | فصحى خفيفة في العناوين والشرح، لمسة مصرية في الـCTA |
| الدليل | ~7 مشاريع حقيقية + آراء عملاء قابلة للنشر · لا لوجوهات (القسم مخفي تلقائيًا) |
| المجالات الحقيقية | تسويق الكورسات/الأكاديميات · معارض الأثاث · تجار الأجهزة الكهربائية والمنزلية |
| المؤسس | يظهر في Home وAbout (الاسم واللقب Placeholder في الـCMS) |
| الخدمات | 5 أقسام رئيسية (انظر §4) |
| الأسعار | لا تُعرض · حقل ميزانية بنطاقات بالجنيه |
| Portfolio مبدئي | 5 Concept Projects منشورة بعلامة "مشروع تصوري" · بدون أرقام أو نتائج |
| الفورم | خطوتان · 3 حقول إجبارية فقط |
| بعد الإرسال | رسالة شكر + زر "كمّل على واتساب" برسالة فيها الاسم والخدمة |
| الـDashboard | Admin واحد · نظام Roles جاهز (Admin / Editor) |
| الحركة | متوسطة ومدروسة · بدون 3D/WebGL |
| أكواد التتبع | من Settings في الـDashboard · الأسرار في `.env` فقط |

---

## 1. Website Strategy

**الموقع = أداة مبيعات، وليس معرض أعمال.**

المشكلة: الدليل الحالي قليل (7 مشاريع، بدون لوجوهات). الحل: نبني الثقة من 4 مصادر بدل الاعتماد على الأرقام:

1. **وضوح الفكرة** — اللوجو نفسه يحكي القصة: فقاعة محادثة (نتواصل) + زر تشغيل (نصنع المحتوى) + بطاقة سعر (نبيع). هذا يصبح العمود الفقري للموقع: **نتكلم. نصنع. نبيع.**
2. **وجه حقيقي** — المؤسس وفيديوهاته عن الميديا باينج. في سوق محلي، الشخص يبيع أكثر من الشعار.
3. **طريقة عمل شفافة** — Process واضح يقول للعميل بالضبط ماذا سيحدث بعد أن يتواصل.
4. **جودة العرض** — مشاريع قليلة لكن معروضة بشكل ممتاز.

**الـCTA Hierarchy:**

| المستوى | العنصر | المكان |
|---|---|---|
| Primary | كلمنا على واتساب | Hero · نهاية كل صفحة خدمة · Final CTA · زر ثابت على الموبايل بعد أول شاشة |
| Secondary | ابدأ مشروعك (الفورم) | الـNavbar · نهاية Case Studies · صفحة Contact |
| Tertiary | شوف شغلنا / اعرف أكثر | داخل الأقسام للتنقل فقط |

لا يوجد زر تواصل في كل قسم — فقط في نقاط القرار.

---

## 2. Sitemap

اللغة في الرابط: `/ar/...` و`/en/...` · الرابط الرئيسي `/` يحوّل إلى `/ar`.

```
/ar  (/en)
├── /                         الرئيسية
├── /about                    عن Brandify + المؤسس + طريقة التفكير
├── /services                 الخدمات (5 أقسام)
│   └── /services/[slug]      صفحة القسم (الخدمات الفرعية + FAQ + مشاريع مرتبطة)
├── /work                     الأعمال (فلترة حسب Category)
│   └── /work/[slug]          صفحة المشروع — تتحول تلقائيًا لـCase Study كاملة لو مفعّلة
├── /case-studies             قائمة المشاريع المفعّل لها Case Study فقط
├── /process                  طريقة العمل بالتفصيل
├── /testimonials             آراء العملاء (تظهر في القائمة فقط لو فيه بيانات منشورة)
├── /contact                  قنوات التواصل + FAQ عام
├── /start-project            فورم الاستفسار (خطوتان)
├── /privacy                  سياسة الخصوصية
├── /terms                    الشروط والأحكام
└── 404

/admin
├── /login
├── /                         Overview
├── /leads  ·  /leads/[id]
├── /work                     Projects + Case Studies + Categories
├── /services
├── /testimonials
├── /clients
├── /team
├── /content                  Home · About · Process · Footer · Industries · Legal pages
├── /faqs
├── /seo
├── /media
└── /settings                 Brand · Contact · Social · CTA · Form fields · Tracking · Account
```

**لم أضف:** صفحة مستقلة لكل مجال (Industries) أو صفحة FAQ مستقلة — موجودة كأقسام الآن، والـArchitecture جاهزة لتحويلها لصفحات (Landing Pages) لاحقًا للـSEO.

---

## 3. User Journey

```
زائر (إعلان / بحث "شركة تسويق في المنيا" / إنستجرام)
  │
  ├─ 5 ثوانٍ: Hero ← يفهم: وكالة تسويق، تبني وتبيع، وفيه واتساب مباشر
  │
  ├─ يتعرف على نفسه: "حلول حسب نوع البيزنس" (أكاديمية؟ معرض؟ متجر؟)
  │
  ├─ يستكشف: الأقسام الثلاثة (نتكلم/نصنع/نبيع) ← صفحة الخدمة
  │
  ├─ يتأكد: الأعمال ← Case Study ← المؤسس ← آراء العملاء
  │
  └─ يقرر:
       ├─ مستعجل / موبايل  → واتساب (رسالة جاهزة حسب الصفحة + تسجيل المصدر)
       └─ يريد يشرح        → الفورم ← يُحفظ Lead ← زر "كمّل على واتساب"
```

**تسجيل مصدر الـLead:** الصفحة · الزر الذي ضغطه · UTM parameters (لو جاي من إعلان).

---

## 4. Information Architecture

### الخدمات (5 أقسام)

| # | القسم | الخدمات الفرعية | رمز اللوجو |
|---|---|---|---|
| 1 | البراند والاستراتيجية | Branding · Marketing Strategy · Creative Strategy | فقاعة (نتكلم) |
| 2 | المحتوى والإنتاج | Content Creation · Video Production · Reels · Graphic Design · AI Video/Content | تشغيل (نصنع) |
| 3 | الإعلانات والأداء | Media Buying · Meta Ads · TikTok Ads · Performance Marketing | سعر (نبيع) |
| 4 | إدارة السوشيال ميديا | Social Media Management | فقاعة (نتكلم) |
| 5 | التجارة الإلكترونية والمواقع | E-commerce Marketing · E-commerce Solutions · Website Development | سعر (نبيع) |

### الصفحة الرئيسية — ترتيب الأقسام

| # | القسم | الخلفية | ملاحظة |
|---|---|---|---|
| 1 | **Hero** | كحلي | العنوان + سطر القيمة + واتساب + "شوف شغلنا" + حركة اللوجو |
| 2 | **شريط الريلز** | كحلي | فيديوهات حقيقية من شغلك (Lazy, بدون تشغيل تلقائي بالصوت) |
| 3 | **نتكلم. نصنع. نبيع.** | فاتح | الأقسام الخمسة مجمّعة تحت الأفعال الثلاثة |
| 4 | **أعمال مختارة** | فاتح | 3–5 مشاريع Featured |
| 5 | **حلول حسب نوع البيزنس** | فاتح | المجالات الحقيقية أولًا |
| 6 | **طريقة العمل** | كحلي | 6 خطوات بخط تقدّم يتحرك مع الـScroll |
| 7 | **المؤسس** | فاتح | صورة + فكرة + مقطع فيديو |
| 8 | **آراء العملاء** | فاتح | يختفي تلقائيًا لو لا يوجد منشور |
| 9 | **لوجوهات العملاء** | — | **مخفي** حتى تُضاف بيانات |
| 10 | **أسئلة شائعة** | فاتح | 4–6 أسئلة |
| 11 | **Final CTA** | كحلي | واتساب + الفورم |

### Concept Projects (المقترح)

| # | النوع | المجال | الخدمات المعروضة |
|---|---|---|---|
| 1 | خدمي | أكاديمية كورسات أونلاين | استراتيجية + إعلانات + محتوى |
| 2 | خدمي | عيادة أسنان | سوشيال ميديا + ريلز + إعلانات |
| 3 | خدمي | مطعم محلي | براندينج + محتوى + تصوير |
| 4 | E-commerce | براند ملابس رجالي (Streetwear) | براندينج + إعلانات + متجر |
| 5 | E-commerce | براند ملابس نسائي (Modest wear) | محتوى + Meta/TikTok Ads |

أسماء البراندات مخترعة وغير مشابهة لشركات حقيقية · علامة "مشروع تصوري" · بدون أي Results.

---

## 5. Visual Direction

### الفكرة

**الهوية مبنية من أشكال اللوجو نفسه — بدون Blobs أو Gradients عشوائية.**

| شكل من اللوجو | استخدامه في الواجهة |
|---|---|
| **فقاعة المحادثة** (زاوية واحدة حادة) | شكل أزرار الـCTA الرئيسية وبطاقات الأقوال |
| **زر التشغيل** ▶ | مؤشر الفيديو + رمز الأسهم في الروابط |
| **بطاقة السعر** (حافة مشطوفة + ثقب) | Tags التصنيفات والفلاتر |
| **الإزاحة بين B والتاج** | إزاحة خفيفة للبرتقالي خلف العناصر المهمة (Offset layer) |

### الطابع

- تايبوجرافي كبيرة وجريئة هي البطل، وليس الصور.
- مساحات بيضاء واسعة، شبكة واضحة، أرقام كبيرة للترقيم (01 — 06).
- تبديل إيقاعي بين أقسام كحلية وأقسام فاتحة.
- صور وفيديوهات حقيقية فقط — لا Stock.
- البرتقالي ≤ 10% من أي شاشة.

### الحركة

| الحركة | التنفيذ |
|---|---|
| **التوقيع:** تجمّع أجزاء اللوجو في الـHero (فقاعة ← تشغيل ← تاج) | CSS/SVG · مرة واحدة · ~1.2 ث |
| ظهور الأقسام عند الـScroll | IntersectionObserver + CSS |
| زر واتساب مغناطيسي (Desktop فقط) | JS خفيف |
| Hover المشاريع: كشف الصورة + عنوان ينزلق | CSS |
| خط التقدّم في الـProcess | CSS scroll-driven مع fallback |
| `prefers-reduced-motion` | كل الحركة تتوقف ويظهر المحتوى فورًا |

**بدون** Framer Motion أو GSAP — كل الحركة CSS + JS خفيف جدًا.

---

## 6. Design System

### الألوان (مستخرجة من اللوجو)

| Token | القيمة | الاستخدام |
|---|---|---|
| `navy-900` | `#021D4E` | **Primary** — لون اللوجو · الخلفيات الكحلية · النصوص الأساسية |
| `navy-950` | `#01122F` | أعمق للـFooter والتباين |
| `navy-700` | `#1B3A73` | Hover/حدود على الكحلي |
| `orange-500` | `#FF6B00` | **Accent** — لون اللوجو · خلفية الـCTA |
| `orange-600` | `#E55F00` | Hover على الـCTA |
| `orange-700` | `#B84A00` | برتقالي **كنص** على خلفية فاتحة (تباين AA) |
| `paper` | `#FAF8F5` | خلفية فاتحة دافئة |
| `white` | `#FFFFFF` | بطاقات/فورم |
| `ink-600` | `#4A5571` | نص ثانوي |
| `ink-400` | `#8A93A8` | Caption / Placeholder |
| `line` | `#E6E3DD` | حدود على الفاتح |
| `success` / `warning` / `danger` | `#1F8A5B` / `#C98A00` / `#C8372D` | حالات النظام والـDashboard |

**قاعدة تباين:** زر الـCTA البرتقالي يكون **نصه كحلي** (تباين ~5.9:1)، وليس أبيض (2.9:1 ← يفشل AA).

### الخطوط

| الاستخدام | العربي | الإنجليزي |
|---|---|---|
| Display / Headings | **El Messiri** (اختيار العميل — بدّل Alexandria) | **Outfit** (قريب من Wordmark اللوجو) |
| Body / UI | **El Messiri** | **Outfit** |

كلها Self-hosted عبر `next/font` · Subsetting · `font-display: swap`.

### Typography Scale (Fluid — موبايل ← ديسكتوب)

| المستوى | الحجم | الوزن | Line-height |
|---|---|---|---|
| Display | 44 → 96px | 800 | 1.05 (AR: 1.2) |
| H1 | 36 → 64px | 700 | 1.1 (AR: 1.25) |
| H2 | 28 → 44px | 700 | 1.15 (AR: 1.3) |
| H3 | 20 → 28px | 600 | 1.3 (AR: 1.45) |
| Body | 16 → 18px (AR: 17 → 19px) | 400 | 1.6 (AR: 1.8) |
| Small | 14px (AR: 15px) | 400 | 1.5 |
| Caption | 12px (AR: 13px) | 500 | 1.4 |

### باقي الـTokens

| Token | القيم |
|---|---|
| Spacing | مقياس 4px: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160 |
| Radius | `sm 6` · `md 10` · `lg 16` · `bubble` (3 زوايا 16 + زاوية 2) · `full` |
| Shadows | `sm` للـDashboard · `lift` عند الـHover · لا ظلال ملونة/Neon |
| Borders | 1px `line` · 2px للـFocus |
| Focus | حلقة برتقالية 2px + offset 2px — ظاهرة دائمًا مع الكيبورد |
| Transitions | `fast 150ms` · `base 250ms` · `slow 500ms` · easing `cubic-bezier(.2,.7,.2,1)` |
| Breakpoints | `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536` |
| Touch targets | ≥ 44×44px |

**الـDashboard:** نفس الـTokens والخطوط، لكن خلفية فاتحة دائمًا، أحجام أصغر، بدون حركة استعراضية، والكحلي للـSidebar.

---

## 7. Technical Architecture

| الطبقة | الاختيار |
|---|---|
| Framework | Next.js (App Router) + TypeScript + React Server Components |
| Styling | Tailwind CSS v4 + CSS variables (Tokens) |
| Database | PostgreSQL · **Drizzle ORM** · Migrations |
| DB محليًا | PostgreSQL حقيقي من حزمة `embedded-postgres` (بدون تثبيت على الجهاز) |
| DB Production | Postgres سحابي (يُقرَّر في مرحلة الـDeployment) |
| Auth | **Better Auth** — Email/Password · Argon2/Scrypt · Sessions في DB · httpOnly cookies · Rate limit على Login |
| Authorization | Middleware يحمي `/admin` + فحص الصلاحية في كل Server Action |
| Validation | **Zod** — نفس الـSchema للـClient والـServer |
| Media | Storage Adapter (محلي الآن ← S3/R2 لاحقًا) · `sharp` لضغط الصور وتحويلها WebP/AVIF · حدود حجم للفيديو |
| Rich Text | Tiptap (داخل الـDashboard فقط — لا يُحمّل في الموقع العام) |
| i18n | Routing بالـ`[locale]` · نصوص الواجهة الثابتة في ملفات JSON · المحتوى من الـDB |
| SEO | `generateMetadata` لكل صفحة · `sitemap.ts` · `robots.ts` · JSON-LD (Organization, LocalBusiness, Service, CreativeWork, FAQPage, BreadcrumbList) · `hreflang` |
| Spam | Honeypot + فحص زمن الإرسال + Rate limit لكل IP (بدون CAPTCHA مزعجة) |
| Notifications | `NotificationService` Interface — الآن: تسجيل في الـActivity · لاحقًا: Email (Resend مثلًا) بدون تغيير الكود |
| Tracking | GA4 / GTM / Meta Pixel / TikTok Pixel — تُحمّل فقط لو الـID موجود في Settings |
| Version Control | Git (تم تثبيته) |

### هيكل المجلدات

```
src/
├── app/
│   ├── [locale]/(site)/...      الموقع العام
│   ├── admin/(auth)/login
│   ├── admin/(dashboard)/...    الـDashboard
│   └── api/                     Auth + Upload فقط
├── components/
│   ├── ui/                      Primitives (Button, Input, Dialog, Toast...)
│   ├── site/                    أقسام الموقع
│   └── admin/                   مكونات الـDashboard
├── server/
│   ├── db/                      schema + client + migrations + seed
│   ├── services/                منطق الأعمال (leads, projects, media...)
│   ├── auth/
│   └── notifications/
├── lib/                         validation (zod) · i18n · seo · whatsapp · utils
├── styles/                      tokens.css
└── messages/                    ar.json · en.json
```

---

## 8. Database Schema (مختصر)

**قرار مهم:** الحقول ثنائية اللغة تُخزَّن كـ`jsonb` بالشكل `{ "ar": "...", "en": "..." }` بدل أعمدة `title_ar` و`title_en`. السبب: إضافة لغة ثالثة لاحقًا لا تحتاج تعديل قاعدة البيانات.

| الجدول | أهم الحقول | العلاقات |
|---|---|---|
| `users` | name, email, role (admin/editor), image | ← sessions, accounts (Better Auth) |
| `leads` | name, company, whatsapp, email, business_type, service_id, budget, message, preferred_contact, status, source_page, source_cta, utm (jsonb), locale | → services · ← lead_notes |
| `lead_notes` | lead_id, user_id, body | → leads, users |
| `service_categories` | slug, name*, description*, icon, order, visible, seo_id | ← services |
| `services` | category_id, slug, title*, short*, body*, benefits*[], deliverables*[], process*[], cta*, order, visible | → service_categories · ↔ projects |
| `categories` | slug, name*, order (فلاتر الـPortfolio) | ↔ projects |
| `projects` | slug, title*, client_name, industry*, summary*, challenge*, solution*, results* (اختياري), tools[], tags[], is_concept, is_featured, has_case_study, case_study (jsonb: strategy*, creative*, execution*), status, order, cover_media_id, seo_id | ↔ categories · ↔ services · ← project_media |
| `project_media` | project_id, media_id, order, caption* | → projects, media |
| `testimonials` | name, company, position*, quote*, photo_media_id, rating, project_id?, status, order | → media, projects |
| `clients` | name, logo_media_id, url, visible, order | → media |
| `team_members` | name*, role*, bio*, photo_media_id, is_founder, visible, order | → media |
| `faqs` | question*, answer*, scope (general/service), service_category_id?, visible, order | → service_categories |
| `content_blocks` | key (home.hero, about.story...), data (jsonb ثنائي اللغة), updated_by | → users |
| `media` | key, url, type, mime, size, width, height, alt*, folder, variants (jsonb) | |
| `seo_entries` | route_key, title*, description*, og_image_id, noindex | → media |
| `settings` | key, value (jsonb) — brand, contact, social[], cta, tracking, form_config, footer | |
| `activity_log` | user_id, action, entity, entity_id, meta | → users |

`*` = حقل ثنائي اللغة.

---

## 9. ترتيب التنفيذ

1. Setup المشروع + Tokens + الخطوط + i18n
2. Database + Migrations + Seed (الخدمات، الـConcept Projects، المحتوى الافتراضي بالعربي والإنجليزي)
3. Auth + حماية `/admin`
4. الموقع العام (الصفحات بالترتيب: Home ← Services ← Work ← باقي الصفحات)
5. الـDashboard + CMS + Media Library
6. Lead Management
7. SEO + Performance + Accessibility
8. Testing + QA شامل + Self-critique وإصلاح

---

## 10. قرارات تحتاج موافقتك

1. **اتجاه العنوان الرئيسي (Hero):**
   - AR: «نبني علامتك التجارية… ونجعلها تبيع.»
   - EN: «We build brands that sell.»
   - تحته الشعار الثلاثي: **نتكلم. نصنع. نبيع.** / **Talk. Create. Sell.**
2. **روابط الموقع:** `/ar` و`/en`، والعربي هو اللغة الافتراضية.
3. **الخطوط:** Alexandria + IBM Plex Sans Arabic + Outfit (مجانية)، مع إمكانية التبديل لـNizar Cocon لاحقًا.
4. **أشكال الهوية:** الفقاعة والتشغيل والتاج كأساس للأزرار والتاجات (§5).
5. **الـConcept Projects الخمسة** كما في الجدول (§4).
6. **صفحة Testimonials** تظهر في القائمة تلقائيًا فقط عندما يكون فيه آراء منشورة.
