// Editable page content (CMS "content blocks"): schema + default copy.
// Every block is validated on save and merged with its defaults on read.
import { z } from "zod";
import { localized } from "@/lib/validation/common";
import { L } from "@/lib/i18n";

const item = z.object({ title: localized(160), description: localized(800) });
const heading = { title: localized(200), subtitle: localized(600) };

export const homeSchema = z.object({
  hero: z.object({
    eyebrow: localized(120),
    title: localized(160),
    subtitle: localized(400),
    secondaryCta: localized(60),
    motto: z.array(localized(30)).length(3),
  }),
  reels: z.object({ ...heading, visible: z.boolean(), mediaIds: z.array(z.uuid()).max(12) }),
  pillars: z.object({
    ...heading,
    items: z
      .array(z.object({ verb: localized(30), description: localized(400), serviceSlugs: z.array(z.string()).max(6) }))
      .length(3),
  }),
  work: z.object(heading),
  industries: z.object({ ...heading, visible: z.boolean(), items: z.array(item).max(12) }),
  process: z.object(heading),
  founder: z.object({ title: localized(160), quote: localized(400) }),
  testimonials: z.object(heading),
  clients: z.object({ title: localized(160) }),
  faq: z.object(heading),
  finalCta: z.object(heading),
});
export type HomeContent = z.infer<typeof homeSchema>;

export const processSchema = z.object({
  title: localized(160),
  subtitle: localized(600),
  steps: z.array(item).min(3).max(8),
  promise: localized(600),
});
export type ProcessContent = z.infer<typeof processSchema>;

export const aboutSchema = z.object({
  hero: z.object(heading),
  who: z.object({ title: localized(160), body: localized(1500) }),
  what: z.object({ title: localized(160), body: localized(1500) }),
  why: z.object({ title: localized(160), items: z.array(item).max(8) }),
  principles: z.object({ title: localized(160), items: z.array(item).max(8) }),
  difference: z.object({ title: localized(160), body: localized(1500) }),
});
export type AboutContent = z.infer<typeof aboutSchema>;

export const legalSchema = z.object({
  title: localized(160),
  // Sanitised HTML from the rich text editor.
  body: localized(40000),
  updatedAt: z.string().max(20),
});
export type LegalContent = z.infer<typeof legalSchema>;

export const blockSchemas = {
  home: homeSchema,
  process: processSchema,
  about: aboutSchema,
  "legal.privacy": legalSchema,
  "legal.terms": legalSchema,
} as const;
export type BlockKey = keyof typeof blockSchemas;
export type BlockData<K extends BlockKey> = z.infer<(typeof blockSchemas)[K]>;

// ─── Default copy ───────────────────────────────────────────

const it = (tAr: string, tEn: string, dAr: string, dEn: string) => ({
  title: L(tAr, tEn),
  description: L(dAr, dEn),
});

export const defaultHome: HomeContent = {
  hero: {
    eyebrow: L("وكالة تسويق وإبداع · المنيا، مصر", "Marketing & creative agency · Minya, Egypt"),
    title: L("نبني علامتك التجارية… ونجعلها تبيع.", "We build brands that sell."),
    subtitle: L(
      "استراتيجية ومحتوى وإعلانات تعمل معًا كمنظومة واحدة، لتتحوّل المشاهدات إلى عملاء، والعملاء إلى مبيعات.",
      "Strategy, content and ads working as one system — turning attention into customers, and customers into sales.",
    ),
    secondaryCta: L("شوف شغلنا", "See our work"),
    motto: [L("نتكلم.", "Talk."), L("نصنع.", "Create."), L("نبيع.", "Sell.")],
  },
  reels: {
    title: L("من الكواليس", "From the studio"),
    subtitle: L("لقطات حقيقية من شغلنا اليومي.", "Real moments from our day-to-day work."),
    visible: true,
    mediaIds: [],
  },
  pillars: {
    title: L("ثلاث كلمات تختصر ما نفعله", "Three words for everything we do"),
    subtitle: L(
      "كل خدمة نقدمها تخدم واحدة من هذه المراحل، وكلها تخدم هدفًا واحدًا: أن يبيع البراند.",
      "Every service we offer serves one of these stages — and all of them serve one goal: a brand that sells.",
    ),
    items: [
      {
        verb: L("نتكلم", "Talk"),
        description: L(
          "نفهم جمهورك جيدًا، ثم نصيغ رسالة يفهمها ويتذكرها، ونبني لها هوية تُعرف من أول نظرة.",
          "We get to know your audience, then shape a message they understand and remember — with an identity they recognise at a glance.",
        ),
        serviceSlugs: ["brand-strategy", "social-media"],
      },
      {
        verb: L("نصنع", "Create"),
        description: L(
          "محتوى وفيديو وتصميم يوقف التمرير ويقول شيئًا، مصنوع لسوقك وليس منسوخًا من غيره.",
          "Content, video and design that stop the scroll and actually say something — made for your market, not copied from someone else's.",
        ),
        serviceSlugs: ["content-production"],
      },
      {
        verb: L("نبيع", "Sell"),
        description: L(
          "إعلانات مدروسة ومتاجر جاهزة للبيع تحوّل الاهتمام إلى رسائل وطلبات حقيقية.",
          "Considered ad campaigns and sale-ready stores that turn interest into real messages and orders.",
        ),
        serviceSlugs: ["ads-performance", "ecommerce-web"],
      },
    ],
  },
  work: {
    title: L("أعمال مختارة", "Selected work"),
    subtitle: L("نماذج من طريقة تفكيرنا وتنفيذنا.", "A look at how we think and how we execute."),
  },
  industries: {
    title: L("أيًّا كان نشاطك، نبدأ من سوقك", "Whatever you do, we start with your market"),
    subtitle: L(
      "لكل نشاط جمهوره وطريقته في الشراء. لهذا نبني الخطة على طبيعة البيزنس، لا على قالب جاهز.",
      "Every business has its own buyers and its own way of buying. So we build the plan around yours — not around a template.",
    ),
    visible: true,
    items: [
      it("الأكاديميات والكورسات", "Academies & courses",
        "ملء المقاعد في كل دفعة جديدة بإعلانات ومحتوى يبني الثقة قبل الحجز.",
        "Filling every new cohort with ads and content that build trust before anyone enrols."),
      it("معارض الأثاث", "Furniture showrooms",
        "تحويل التصفح إلى زيارات للمعرض بمحتوى يُظهر القطعة في بيتها الحقيقي.",
        "Turning scrolling into showroom visits with content that shows each piece in a real home."),
      it("الأجهزة الكهربائية والمنزلية", "Electronics & home appliances",
        "عروض واضحة وحملات موسمية تصل للمشتري في لحظة القرار.",
        "Clear offers and seasonal campaigns that reach buyers right when they decide."),
      it("العيادات والأطباء", "Clinics & doctors",
        "حضور موثوق يجعل المريض يختارك قبل أن يتصل.",
        "A trustworthy presence that makes patients choose you before they even call."),
      it("المطاعم والكافيهات", "Restaurants & cafés",
        "محتوى يفتح الشهية ويملأ الطاولات، وليس الصفحة فقط.",
        "Content that builds appetite — and fills tables, not just feeds."),
      it("المتاجر الإلكترونية", "Online stores",
        "من الإعلان إلى صفحة الدفع: رحلة شراء واضحة بلا عوائق.",
        "From the ad to the checkout: a clear buying journey with no friction."),
      it("البراندات الشخصية", "Personal brands",
        "صوت واضح ومحتوى منتظم يبني لك اسمًا يعرفه جمهورك.",
        "A clear voice and consistent content that make your name known to the right people."),
      it("الشركات الخدمية", "Service businesses",
        "رسالة بسيطة تشرح قيمتك وتجلب استفسارات جادة.",
        "A simple message that explains your value and brings in serious enquiries."),
    ],
  },
  process: {
    title: L("كيف نعمل", "How we work"),
    subtitle: L(
      "طريقة واضحة من أول رسالة حتى النمو، تعرف فيها ماذا يحدث ولماذا.",
      "A clear path from the first message to growth — you always know what's happening and why.",
    ),
  },
  founder: {
    title: L("من يقف خلف Brandify", "The person behind Brandify"),
    quote: L(
      "التسويق ليس منشورات جميلة، بل قرارات مدروسة. كل جنيه في الإعلان يجب أن يعرف طريقه.",
      "Marketing isn't pretty posts — it's considered decisions. Every pound you spend on ads should know exactly where it's going.",
    ),
  },
  testimonials: {
    title: L("ماذا يقول عملاؤنا", "What our clients say"),
    subtitle: L("", ""),
  },
  clients: { title: L("عملوا معنا", "Brands we've worked with") },
  faq: {
    title: L("أسئلة تصلنا كثيرًا", "Questions we often get"),
    subtitle: L("", ""),
  },
  finalCta: {
    title: L("جاهز نبدأ؟", "Ready when you are."),
    subtitle: L(
      "احكِ لنا عن نشاطك في رسالة واحدة على واتساب، ونقترح عليك أول خطوة مناسبة.",
      "Tell us about your business in one WhatsApp message, and we'll suggest the right first step.",
    ),
  },
};

export const defaultProcess: ProcessContent = {
  title: L("كيف نعمل", "How we work"),
  subtitle: L(
    "ست مراحل واضحة. لا مفاجآت، ولا خطوات غامضة: تعرف دائمًا أين وصلنا وما التالي.",
    "Six clear stages. No surprises, no black boxes — you always know where we are and what comes next.",
  ),
  steps: [
    it("الاكتشاف", "Discovery",
      "نسمع منك أولًا، ونفهم نشاطك وجمهورك ومنافسيك قبل أن نقترح أي شيء.",
      "We listen first — your business, your customers, your competitors — before we propose anything."),
    it("الاستراتيجية", "Strategy",
      "نحدد الجمهور والرسالة والقنوات والميزانية في خطة واحدة واضحة تتفق عليها معنا.",
      "Audience, message, channels and budget, set out in one clear plan we agree on together."),
    it("الإبداع", "Creative",
      "نكتب ونصمم ونصوّر المحتوى الذي يحمل الرسالة بأفضل شكل.",
      "We write, design and shoot the content that carries the message best."),
    it("التنفيذ", "Launch",
      "نطلق الحملات وننشر المحتوى وفق جدول متفق عليه مسبقًا.",
      "Campaigns go live and content ships on a schedule agreed in advance."),
    it("القياس والتحسين", "Optimise",
      "نتابع الأداء باستمرار، نزيد ما ينجح ونوقف ما لا ينجح.",
      "We track performance continuously — scaling what works and cutting what doesn't."),
    it("النمو", "Grow",
      "نبني على ما تعلمناه لنكبّر النتائج خطوة بخطوة.",
      "We build on what we've learned to grow results, one step at a time."),
  ],
  promise: L(
    "في كل مرحلة ستعرف ما الذي نعمل عليه، ولماذا، وما الخطوة التالية.",
    "At every stage you'll know what we're working on, why, and what comes next.",
  ),
};

export const defaultAbout: AboutContent = {
  hero: {
    title: L("وكالة تفكّر كصاحب بيزنس", "An agency that thinks like a business owner"),
    subtitle: L(
      "نهتم بالشكل الجميل، لكن ما يهمنا أكثر هو ما يحدث بعده: رسالة تصل، وعميل يتواصل، وبيع يتم.",
      "We care about looking good — but we care more about what happens next: a message that lands, a customer who reaches out, a sale that closes.",
    ),
  },
  who: {
    title: L("من نحن", "Who we are"),
    body: L(
      "Brandify وكالة تسويق وإبداع من المنيا. نعمل مع أصحاب البيزنس الخدمي والمتاجر الإلكترونية، ونساعدهم على بناء براند واضح ومحتوى مقنع وإعلانات تأتي بعملاء.",
      "Brandify is a marketing and creative agency based in Minya, Egypt. We work with service businesses and online stores, helping them build a clear brand, convincing content and ads that bring in customers.",
    ),
  },
  what: {
    title: L("ماذا نفعل", "What we do"),
    body: L(
      "نجمع الاستراتيجية والمحتوى والإنتاج والإعلانات تحت سقف واحد، حتى تعمل كلها في نفس الاتجاه بدل أن تتوزع بين أكثر من مورد.",
      "We bring strategy, content, production and advertising under one roof, so everything pulls in the same direction instead of being split between several suppliers.",
    ),
  },
  why: {
    title: L("لماذا Brandify", "Why Brandify"),
    items: [
      it("فريق واحد بدل خمسة موردين", "One team instead of five suppliers",
        "الاستراتيجية والتصميم والفيديو والإعلانات في مكان واحد، برسالة واحدة.",
        "Strategy, design, video and ads in one place, telling one story."),
      it("وضوح في الخطة والميزانية", "Clarity on plan and budget",
        "تعرف أين تذهب ميزانيتك، ولماذا، وما الذي نقيسه.",
        "You know where your budget goes, why, and what we're measuring."),
      it("محتوى مصنوع لسوقك", "Content made for your market",
        "نفهم جمهورك المحلي ونخاطبه بلغته، لا بلغة القوالب الجاهزة.",
        "We understand your local audience and speak their language — not a template's."),
      it("تواصل مباشر وسريع", "Direct, fast communication",
        "واتساب مباشر مع من يعمل على مشروعك، بدون وسطاء.",
        "A direct WhatsApp line to the people working on your project — no middlemen."),
    ],
  },
  principles: {
    title: L("كيف نفكر", "How we think"),
    items: [
      it("الوضوح قبل الإبداع", "Clarity before creativity",
        "إذا لم يفهم العميل الرسالة في ثوانٍ، فالتصميم الجميل لن ينقذها.",
        "If customers can't get the message in seconds, beautiful design won't save it."),
      it("كل محتوى له هدف", "Every piece has a purpose",
        "لا ننشر لمجرد النشر؛ كل منشور وفيديو له دور في رحلة العميل.",
        "We don't post for the sake of posting — every post and video has a job in the customer journey."),
      it("الأرقام تقرر", "Numbers decide",
        "نختبر ونقيس، ونترك النتائج تقرر الخطوة التالية، لا الأذواق.",
        "We test and measure, and let results — not taste — decide the next move."),
      it("نبدأ بما ينجح ثم نكبر", "Start with what works, then scale",
        "نبدأ بخطوات محسوبة على ميزانيتك، ونكبر مع ما يثبت نجاحه.",
        "We start with measured steps that fit your budget, and scale what proves itself."),
    ],
  },
  difference: {
    title: L("ما الذي يميزنا", "What makes us different"),
    body: L(
      "لأن هويتنا نفسها مبنية على ثلاث كلمات: نتكلم، نصنع، نبيع. نحن لا نتوقف عند التصميم أو النشر؛ نتابع حتى تتحول الرسالة إلى بيع.",
      "Our own identity is built on three words: talk, create, sell. We don't stop at the design or the post — we follow through until the message turns into a sale.",
    ),
  },
};

const today = "2026-10-06";

export const defaultPrivacy: LegalContent = {
  title: L("سياسة الخصوصية", "Privacy Policy"),
  updatedAt: today,
  body: L(
    `<p>توضح هذه السياسة كيف تجمع Brandify البيانات التي تشاركها معنا عبر هذا الموقع وكيف نستخدمها ونحميها.</p>
<h2>البيانات التي نجمعها</h2>
<ul><li>البيانات التي تُدخلها في نموذج الاستفسار، مثل الاسم ورقم الواتساب والبريد الإلكتروني واسم البراند وتفاصيل المشروع.</li><li>بيانات تقنية عامة مثل نوع المتصفح والصفحة التي جئت منها، لتحسين الموقع.</li><li>إذا فُعّلت أدوات القياس (مثل Google Analytics أو Meta Pixel أو TikTok Pixel)، فقد تجمع هذه الأدوات بيانات استخدام وفق سياساتها الخاصة.</li></ul>
<h2>كيف نستخدم البيانات</h2>
<ul><li>للرد على استفسارك والتواصل معك بالطريقة التي اخترتها.</li><li>لإعداد عرض أو اقتراح مناسب لمشروعك.</li><li>لتحسين الموقع وقياس أداء حملاتنا التسويقية.</li></ul>
<h2>مشاركة البيانات</h2>
<p>لا نبيع بياناتك ولا نؤجرها لأي طرف. قد نستخدم مزودي خدمات موثوقين (مثل الاستضافة أو البريد الإلكتروني) لتشغيل الموقع فقط.</p>
<h2>حقوقك</h2>
<p>يمكنك طلب الاطلاع على بياناتك أو تعديلها أو حذفها في أي وقت بالتواصل معنا.</p>
<h2>التواصل</h2>
<p>لأي سؤال عن هذه السياسة، تواصل معنا عبر البريد الإلكتروني أو واتساب الموضحين في صفحة التواصل.</p>`,
    `<p>This policy explains how Brandify collects, uses and protects the information you share with us through this website.</p>
<h2>What we collect</h2>
<ul><li>Information you enter in our enquiry form, such as your name, WhatsApp number, email, brand name and project details.</li><li>General technical data such as browser type and referring page, used to improve the website.</li><li>If measurement tools are enabled (such as Google Analytics, Meta Pixel or TikTok Pixel), they may collect usage data under their own policies.</li></ul>
<h2>How we use it</h2>
<ul><li>To reply to your enquiry and contact you the way you prefer.</li><li>To prepare a proposal that fits your project.</li><li>To improve the website and measure our marketing performance.</li></ul>
<h2>Sharing</h2>
<p>We never sell or rent your data. We may use trusted service providers (such as hosting or email) solely to operate the website.</p>
<h2>Your rights</h2>
<p>You can ask to access, correct or delete your data at any time by contacting us.</p>
<h2>Contact</h2>
<p>For any question about this policy, reach us by email or WhatsApp as listed on our contact page.</p>`,
  ),
};

export const defaultTerms: LegalContent = {
  title: L("الشروط والأحكام", "Terms & Conditions"),
  updatedAt: today,
  body: L(
    `<p>باستخدامك لموقع Brandify فإنك توافق على الشروط التالية.</p>
<h2>استخدام الموقع</h2>
<p>محتوى هذا الموقع للتعريف بخدمات Brandify. يُمنع استخدام الموقع بأي طريقة تضر به أو بمستخدميه.</p>
<h2>الملكية الفكرية</h2>
<p>جميع النصوص والتصميمات والأعمال المعروضة مملوكة لـ Brandify أو لعملائها، ولا يجوز نسخها أو إعادة استخدامها دون إذن كتابي.</p>
<h2>المشاريع التصورية</h2>
<p>بعض الأعمال المعروضة مُعلّمة بـ«مشروع تصوري»، وهي أعمال توضيحية لطريقة تفكيرنا وليست لعملاء حقيقيين.</p>
<h2>النتائج</h2>
<p>تختلف نتائج التسويق حسب النشاط والسوق والميزانية، ولا يمثل أي محتوى على الموقع ضمانًا لنتائج محددة. تُحدَّد تفاصيل كل مشروع في اتفاق مستقل.</p>
<h2>التعديلات</h2>
<p>قد نحدّث هذه الشروط من وقت لآخر، ويسري التحديث من تاريخ نشره على هذه الصفحة.</p>`,
    `<p>By using the Brandify website, you agree to the following terms.</p>
<h2>Use of the website</h2>
<p>This website presents Brandify's services. You may not use it in any way that harms the site or its users.</p>
<h2>Intellectual property</h2>
<p>All text, designs and work shown here belong to Brandify or its clients and may not be copied or reused without written permission.</p>
<h2>Concept projects</h2>
<p>Some work is labelled "Concept". These pieces illustrate how we think and are not work for real clients.</p>
<h2>Results</h2>
<p>Marketing results vary by business, market and budget. Nothing on this website is a guarantee of specific results. The details of every project are set out in a separate agreement.</p>
<h2>Changes</h2>
<p>We may update these terms from time to time. Updates take effect from the date they are published on this page.</p>`,
  ),
};

export const blockDefaults: { [K in BlockKey]: BlockData<K> } = {
  home: defaultHome,
  process: defaultProcess,
  about: defaultAbout,
  "legal.privacy": defaultPrivacy,
  "legal.terms": defaultTerms,
};
