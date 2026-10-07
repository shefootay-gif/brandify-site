import { L } from "@/lib/i18n";
import type { Localized, LocalizedItem } from "../schema/types";

const it = (tAr: string, tEn: string, dAr: string, dEn: string): LocalizedItem => ({
  title: L(tAr, tEn),
  description: L(dAr, dEn),
});

export type SeedService = {
  slug: string;
  icon: "bubble" | "play" | "tag";
  title: Localized;
  shortDescription: Localized;
  body: Localized;
  subServices: LocalizedItem[];
  benefits: LocalizedItem[];
  deliverables: Localized[];
  process: LocalizedItem[];
  ctaLabel: Localized;
  whatsappMessage: Localized;
  faqs: Array<{ q: Localized; a: Localized }>;
};

export const seedServices: SeedService[] = [
  {
    slug: "brand-strategy",
    icon: "bubble",
    title: L("البراند والاستراتيجية", "Brand & Strategy"),
    shortDescription: L(
      "هوية واضحة ورسالة مقنعة وخطة تسويق يعرف فيها كل جنيه طريقه.",
      "A clear identity, a convincing message and a marketing plan where every pound has a job.",
    ),
    body: L(
      "قبل أي إعلان أو منشور، لازم يكون واضحًا: من أنت؟ لمن تبيع؟ ولماذا يختارك العميل؟ نبني معك الأساس الذي يقف عليه كل شيء بعده: هوية بصرية تُعرف، ورسالة تُفهم، وخطة تسويق مبنية على جمهورك وميزانيتك الفعلية.",
      "Before any ad or post, a few things need to be clear: who you are, who you sell to, and why customers should choose you. We build the foundation everything else stands on — a recognisable identity, a message people get, and a marketing plan built around your real audience and budget.",
    ),
    subServices: [
      it("بناء الهوية البصرية", "Brand identity",
        "الشعار والألوان والخطوط والأسلوب البصري، مع دليل استخدام واضح.",
        "Logo, colours, typography and visual style — with clear usage guidelines."),
      it("استراتيجية التسويق", "Marketing strategy",
        "تحديد الجمهور والقنوات والميزانية والأهداف في خطة عملية.",
        "Audience, channels, budget and goals, set out in a practical plan."),
      it("الاستراتيجية الإبداعية", "Creative strategy",
        "الفكرة الكبيرة والزوايا والرسائل التي تبني عليها الحملات والمحتوى.",
        "The big idea, the angles and the messages your campaigns and content are built on."),
    ],
    benefits: [
      it("براند يُعرف من أول نظرة", "A brand people recognise instantly",
        "هوية متسقة تجعل عملاءك يتذكرونك ويثقون بك.",
        "A consistent identity that helps customers remember — and trust — you."),
      it("رسالة واحدة في كل مكان", "One message everywhere",
        "نفس الصوت ونفس الوعد في الإعلان والمنشور والمتجر.",
        "The same voice and the same promise across ads, posts and your store."),
      it("قرارات مبنية على خطة", "Decisions backed by a plan",
        "تعرف أين تصرف ميزانيتك ولماذا، بدل التجربة العشوائية.",
        "You know where your budget goes and why — instead of guessing."),
    ],
    deliverables: [
      L("دليل الهوية البصرية", "Brand identity guidelines"),
      L("ملفات الشعار بجميع الصيغ", "Logo files in every format"),
      L("وثيقة الاستراتيجية التسويقية", "Marketing strategy document"),
      L("خريطة الجمهور والرسائل", "Audience & messaging map"),
      L("خطة القنوات والميزانية", "Channel & budget plan"),
    ],
    process: [
      it("جلسة اكتشاف", "Discovery session", "نفهم نشاطك وأهدافك وجمهورك.", "We get to know your business, goals and audience."),
      it("بحث وتحليل", "Research", "ندرس السوق والمنافسين وفرص التميز.", "We study the market, competitors and where you can stand out."),
      it("البناء", "Build", "نصمم الهوية ونكتب الاستراتيجية ونراجعها معك.", "We design the identity, write the strategy and review it with you."),
      it("التسليم", "Handover", "نسلّمك كل الملفات ودليلًا واضحًا للاستخدام.", "You get every file plus a clear guide for using them."),
    ],
    ctaLabel: L("ابدأ ببناء البراند", "Start with your brand"),
    whatsappMessage: L(
      "مرحبًا Brandify، أريد الاستفسار عن خدمة البراند والاستراتيجية.",
      "Hi Brandify, I'd like to ask about your brand & strategy service.",
    ),
    faqs: [
      {
        q: L("هل يمكن تطوير هوية موجودة بدل بناء واحدة جديدة؟", "Can you refresh an existing identity instead of starting over?"),
        a: L(
          "نعم. كثيرًا ما يكون الأنسب تطوير الهوية الحالية والحفاظ على ما يعرفه عملاؤك، ونحدد ذلك معك بعد جلسة الاكتشاف.",
          "Yes. Often the best move is to evolve what you have and keep what customers already recognise — we decide that together after discovery.",
        ),
      },
    ],
  },
  {
    slug: "content-production",
    icon: "play",
    title: L("المحتوى والإنتاج", "Content & Production"),
    shortDescription: L(
      "محتوى وفيديو وتصميم يوقف التمرير ويحمل رسالتك بوضوح.",
      "Content, video and design that stop the scroll and carry your message clearly.",
    ),
    body: L(
      "المحتوى هو أول ما يراه عميلك، وغالبًا هو ما يقرر بسببه أن يكمل أو يمرّ. نخطط ونكتب ونصوّر ونصمم محتوى مصنوعًا لجمهورك، من الريلز القصيرة إلى الفيديو الإعلاني والتصميمات، مع استخدام أدوات الذكاء الاصطناعي حيث تضيف قيمة حقيقية.",
      "Content is the first thing customers see — and usually what decides whether they stop or scroll past. We plan, write, shoot and design content made for your audience, from short reels to ad films and graphics, using AI tools where they genuinely add value.",
    ),
    subServices: [
      it("صناعة المحتوى", "Content creation",
        "أفكار وخطط محتوى ونصوص مكتوبة لجمهورك ومنصتك.",
        "Ideas, content calendars and copy written for your audience and platform."),
      it("إنتاج الفيديو", "Video production",
        "تصوير ومونتاج فيديوهات إعلانية وتعريفية بجودة احترافية.",
        "Shooting and editing ad films and brand videos to a professional standard."),
      it("الريلز", "Reels",
        "فيديوهات قصيرة مصممة للانتشار على إنستجرام وتيك توك وفيسبوك.",
        "Short-form video built to travel on Instagram, TikTok and Facebook."),
      it("التصميم الجرافيكي", "Graphic design",
        "تصميمات السوشيال ميديا والإعلانات والمطبوعات بهوية متسقة.",
        "Social, ad and print design that stays on-brand."),
      it("محتوى وفيديو بالذكاء الاصطناعي", "AI video & content",
        "إنتاج أسرع وأفكار بصرية جديدة باستخدام أدوات الذكاء الاصطناعي.",
        "Faster production and fresh visual ideas using AI tools."),
    ],
    benefits: [
      it("محتوى يوقف التمرير", "Content that stops the scroll",
        "أول ثانيتين مدروسة لتمسك انتباه المشاهد.",
        "The first two seconds are designed to hold attention."),
      it("إنتاج متكامل", "End-to-end production",
        "من الفكرة والنص حتى التصوير والمونتاج والتسليم.",
        "From idea and script through to shoot, edit and delivery."),
      it("هوية متسقة", "Consistent identity",
        "كل قطعة محتوى تشبه البراند وتقوّيه.",
        "Every piece looks like your brand — and strengthens it."),
    ],
    deliverables: [
      L("خطة محتوى شهرية", "Monthly content plan"),
      L("نصوص وسكريبتات الفيديو", "Copy and video scripts"),
      L("فيديوهات وريلز جاهزة للنشر", "Ready-to-post videos and reels"),
      L("تصميمات بمقاسات كل منصة", "Designs sized for every platform"),
      L("الملفات المصدرية عند الطلب", "Source files on request"),
    ],
    process: [
      it("التخطيط", "Plan", "نحدد الأفكار والأهداف وجدول النشر.", "We agree on ideas, goals and the posting schedule."),
      it("الكتابة", "Write", "نكتب النصوص والسكريبتات ونعتمدها معك.", "We write copy and scripts and sign them off with you."),
      it("الإنتاج", "Produce", "تصوير وتصميم ومونتاج.", "Shooting, design and editing."),
      it("المراجعة والتسليم", "Review & deliver", "جولة مراجعة ثم تسليم جاهز للنشر.", "A review round, then delivery ready to post."),
    ],
    ctaLabel: L("اطلب خطة محتوى", "Ask for a content plan"),
    whatsappMessage: L(
      "مرحبًا Brandify، أريد الاستفسار عن خدمة المحتوى والإنتاج.",
      "Hi Brandify, I'd like to ask about your content & production service.",
    ),
    faqs: [
      {
        q: L("هل تصورون في مكان العميل؟", "Do you shoot on location?"),
        a: L(
          "نعم، نصوّر في مكان نشاطك عندما يخدم ذلك المحتوى، ونتفق مسبقًا على الجدول والتفاصيل.",
          "Yes — we shoot at your premises when that serves the content, with the schedule and details agreed in advance.",
        ),
      },
    ],
  },
  {
    slug: "ads-performance",
    icon: "tag",
    title: L("الإعلانات والأداء", "Ads & Performance"),
    shortDescription: L(
      "حملات Meta وTikTok مبنية على هدف واضح، ومتابعة مستمرة لكل جنيه.",
      "Meta and TikTok campaigns built on a clear goal, with every pound tracked.",
    ),
    body: L(
      "الإعلان الناجح ليس زر «ترويج». نبني حملاتك على هدف واضح وجمهور مدروس وإبداع مختبر، ثم نتابع الأرقام باستمرار: نزيد الصرف على ما ينجح، ونوقف ما لا ينجح، ونشرح لك ما يحدث بلغة بسيطة.",
      "A good ad isn't a 'boost' button. We build campaigns on a clear goal, a well-defined audience and tested creative — then watch the numbers continuously, scaling what works, stopping what doesn't, and explaining it all in plain language.",
    ),
    subServices: [
      it("الميديا باينج", "Media buying",
        "تخطيط الميزانية وتوزيعها على المنصات والجماهير المناسبة.",
        "Planning and allocating budget across the right platforms and audiences."),
      it("إعلانات Meta", "Meta ads",
        "حملات فيسبوك وإنستجرام للرسائل والطلبات والمبيعات.",
        "Facebook and Instagram campaigns for messages, leads and sales."),
      it("إعلانات TikTok", "TikTok ads",
        "حملات تيك توك بمحتوى أصلي يناسب طبيعة المنصة.",
        "TikTok campaigns with native creative that fits the platform."),
      it("التسويق بالأداء", "Performance marketing",
        "إعداد أدوات القياس والتتبع والتحسين المستمر على الأرقام.",
        "Tracking setup, measurement and continuous optimisation."),
    ],
    benefits: [
      it("وضوح في الأرقام", "Clarity on the numbers",
        "تقارير مفهومة تعرف منها ماذا حققت ميزانيتك.",
        "Reports you can actually read, showing what your budget achieved."),
      it("ميزانية في مكانها", "Budget where it counts",
        "نوجّه الصرف لما يأتي بنتيجة، لا لما يبدو جميلًا.",
        "Spend goes to what gets results, not what looks nice."),
      it("اختبار وتحسين", "Test and improve",
        "نختبر الإبداع والجمهور باستمرار لنحسّن الأداء.",
        "We keep testing creative and audiences to improve performance."),
    ],
    deliverables: [
      L("خطة حملات وميزانية", "Campaign & budget plan"),
      L("إعداد Pixel وأدوات التتبع", "Pixel and tracking setup"),
      L("إدارة الحملات يوميًا", "Day-to-day campaign management"),
      L("تقارير أداء دورية", "Regular performance reports"),
      L("توصيات للتحسين", "Optimisation recommendations"),
    ],
    process: [
      it("الهدف", "Goal", "نحدد ماذا نريد من الحملة وكيف نقيسه.", "We define what the campaign must achieve and how we'll measure it."),
      it("الإعداد", "Setup", "الحسابات والتتبع والجماهير والإبداع.", "Accounts, tracking, audiences and creative."),
      it("الإطلاق", "Launch", "نطلق الحملات ونراقب الأيام الأولى عن قرب.", "Campaigns go live and we watch the first days closely."),
      it("التحسين", "Optimise", "نعدّل ونوسّع بناءً على النتائج.", "We adjust and scale based on results."),
    ],
    ctaLabel: L("ناقش حملتك القادمة", "Talk about your next campaign"),
    whatsappMessage: L(
      "مرحبًا Brandify، أريد الاستفسار عن خدمة الإعلانات (Meta / TikTok).",
      "Hi Brandify, I'd like to ask about your ads service (Meta / TikTok).",
    ),
    faqs: [
      {
        q: L("هل ميزانية الإعلان منفصلة عن أتعاب الإدارة؟", "Is the ad budget separate from your management fee?"),
        a: L(
          "نعم. ميزانية الإعلان تُدفع للمنصة مباشرة، وأتعاب الإدارة منفصلة، ونوضح الاثنين قبل البدء.",
          "Yes. Ad spend is paid to the platform directly and our management fee is separate — we spell out both before we start.",
        ),
      },
    ],
  },
  {
    slug: "social-media",
    icon: "bubble",
    title: L("إدارة السوشيال ميديا", "Social Media Management"),
    shortDescription: L(
      "حضور منتظم وصوت واضح ومجتمع يتفاعل مع البراند.",
      "A consistent presence, a clear voice and a community that engages.",
    ),
    body: L(
      "صفحاتك هي واجهة البراند اليومية. ندير حساباتك بخطة واضحة: ماذا ننشر، ومتى، ولماذا. ونحافظ على صوت واحد للبراند، ونتابع التفاعل، ونطوّر المحتوى بناءً على ما يحبه جمهورك فعلًا.",
      "Your pages are your brand's everyday shopfront. We run your accounts on a clear plan — what to post, when and why — keep one consistent brand voice, follow engagement and evolve the content based on what your audience actually responds to.",
    ),
    subServices: [
      it("خطة وجدول نشر", "Content calendar",
        "خطة شهرية واضحة لما يُنشر على كل منصة.",
        "A clear monthly plan for every platform."),
      it("النشر والإدارة", "Publishing & management",
        "النشر في الأوقات المناسبة وتنظيم الحسابات.",
        "Posting at the right times and keeping accounts in order."),
      it("إدارة التفاعل", "Community management",
        "متابعة التعليقات والرسائل بأسلوب يناسب البراند.",
        "Handling comments and messages in your brand's voice."),
      it("تقارير شهرية", "Monthly reports",
        "ملخص للأداء وما تعلمناه وما سنغيّره.",
        "A summary of performance, learnings and next steps."),
    ],
    benefits: [
      it("حضور منتظم", "Show up consistently",
        "لا انقطاع ولا نشر عشوائي.",
        "No gaps, no random posting."),
      it("صوت واحد للبراند", "One brand voice",
        "كل منشور ورد يشبه البراند.",
        "Every post and reply sounds like you."),
      it("وقت أكثر لعملك", "More time for your business",
        "نتولى الإدارة اليومية وتتفرغ أنت لنشاطك.",
        "We handle the day-to-day so you can focus on running the business."),
    ],
    deliverables: [
      L("خطة محتوى شهرية", "Monthly content plan"),
      L("تصميمات ونصوص المنشورات", "Post designs and captions"),
      L("جدولة ونشر", "Scheduling and publishing"),
      L("تقرير أداء شهري", "Monthly performance report"),
    ],
    process: [
      it("مراجعة الحسابات", "Audit", "نراجع حساباتك الحالية ونحدد الفرص.", "We review your current accounts and spot opportunities."),
      it("الخطة", "Plan", "نضع خطة المحتوى والنبرة وجدول النشر.", "We set the content plan, tone and calendar."),
      it("التنفيذ", "Run", "النشر وإدارة التفاعل يوميًا.", "Daily publishing and community management."),
      it("المراجعة", "Review", "تقرير شهري وتحسين الخطة.", "A monthly report and an improved plan."),
    ],
    ctaLabel: L("خلّينا ندير صفحاتك", "Let us run your pages"),
    whatsappMessage: L(
      "مرحبًا Brandify، أريد الاستفسار عن خدمة إدارة السوشيال ميديا.",
      "Hi Brandify, I'd like to ask about your social media management service.",
    ),
    faqs: [
      {
        q: L("ما المنصات التي تديرونها؟", "Which platforms do you manage?"),
        a: L(
          "فيسبوك وإنستجرام وتيك توك بشكل أساسي، ونحدد معك المنصات الأنسب لنشاطك وجمهورك.",
          "Mainly Facebook, Instagram and TikTok — we pick the right platforms for your business and audience together.",
        ),
      },
    ],
  },
  {
    slug: "ecommerce-web",
    icon: "tag",
    title: L("التجارة الإلكترونية والمواقع", "E-commerce & Web"),
    shortDescription: L(
      "متاجر ومواقع جاهزة للبيع، وتسويق يأتي بالطلبات.",
      "Sale-ready stores and websites — and the marketing that brings in orders.",
    ),
    body: L(
      "المتجر الإلكتروني ليس مجرد صفحات منتجات. نجهّز لك متجرًا أو موقعًا سهل الاستخدام وسريعًا ومربوطًا بأدوات القياس، ثم نسوّق له بحملات ومحتوى يقودان العميل من الإعلان حتى إتمام الطلب.",
      "An online store is more than product pages. We set up a fast, easy-to-use store or website connected to proper tracking — then market it with campaigns and content that take customers from the ad all the way to checkout.",
    ),
    subServices: [
      it("تسويق المتاجر الإلكترونية", "E-commerce marketing",
        "حملات ومحتوى مخصص لزيادة الطلبات من متجرك.",
        "Campaigns and content designed to grow orders from your store."),
      it("حلول التجارة الإلكترونية", "E-commerce solutions",
        "إعداد المتجر وتنظيم المنتجات وربط أدوات القياس.",
        "Store setup, product organisation and tracking integration."),
      it("تطوير المواقع", "Website development",
        "مواقع تعريفية وصفحات هبوط سريعة ومتجاوبة مع الموبايل.",
        "Fast, mobile-friendly company websites and landing pages."),
    ],
    benefits: [
      it("رحلة شراء بلا عوائق", "A frictionless buying journey",
        "من أول ضغطة حتى صفحة الدفع.",
        "From the first click to the checkout page."),
      it("سرعة وتجربة موبايل", "Fast and mobile-first",
        "لأن أغلب عملائك يشترون من الموبايل.",
        "Because most of your customers buy on their phones."),
      it("قياس دقيق", "Accurate tracking",
        "تعرف من أين يأتي كل طلب.",
        "Know where every order comes from."),
    ],
    deliverables: [
      L("متجر أو موقع جاهز للإطلاق", "A launch-ready store or website"),
      L("ربط Pixel وأدوات التحليل", "Pixel and analytics integration"),
      L("صفحات منتجات وصفحات هبوط", "Product and landing pages"),
      L("خطة تسويق للإطلاق", "Launch marketing plan"),
    ],
    process: [
      it("التخطيط", "Plan", "نحدد هيكل المتجر والمنتجات ورحلة العميل.", "We map the store structure, products and customer journey."),
      it("التصميم والبناء", "Design & build", "نصمم ونبني ونختبر على كل الأجهزة.", "We design, build and test on every device."),
      it("الإطلاق", "Launch", "نطلق المتجر مع حملة مدروسة.", "The store goes live with a planned campaign."),
      it("النمو", "Grow", "نحسّن التحويل ونوسّع الحملات.", "We improve conversion and scale campaigns."),
    ],
    ctaLabel: L("ابدأ متجرك", "Start your store"),
    whatsappMessage: L(
      "مرحبًا Brandify، أريد الاستفسار عن خدمة المتاجر الإلكترونية والمواقع.",
      "Hi Brandify, I'd like to ask about your e-commerce & web service.",
    ),
    faqs: [
      {
        q: L("هل تعملون على متجري الحالي؟", "Can you work on my existing store?"),
        a: L(
          "نعم، نبدأ بمراجعة متجرك الحالي ونقترح التحسينات قبل أي حملة.",
          "Yes — we start by reviewing your current store and recommend improvements before any campaign.",
        ),
      },
    ],
  },
];

export const seedCategories = [
  { slug: "branding", name: L("براندينج", "Branding") },
  { slug: "marketing", name: L("تسويق", "Marketing") },
  { slug: "media-buying", name: L("ميديا باينج", "Media Buying") },
  { slug: "content", name: L("محتوى", "Content") },
  { slug: "video", name: L("فيديو", "Video") },
  { slug: "ecommerce", name: L("تجارة إلكترونية", "E-commerce") },
  { slug: "social-media", name: L("سوشيال ميديا", "Social Media") },
  { slug: "web-design", name: L("تصميم مواقع", "Web Design") },
  { slug: "other", name: L("أخرى", "Other") },
];

export const seedGeneralFaqs: Array<{ q: Localized; a: Localized }> = [
  {
    q: L("هل أحتاج ميزانية كبيرة للبدء؟", "Do I need a big budget to start?"),
    a: L(
      "لا. نبني الخطة على ميزانيتك الفعلية ونبدأ بأفضل استخدام لها، ثم نكبر تدريجيًا مع ما يثبت نجاحه.",
      "No. We build the plan around the budget you actually have, start with the best use of it, and scale up as things prove themselves.",
    ),
  },
  {
    q: L("هل تعملون مع عملاء خارج المنيا؟", "Do you work with clients outside Minya?"),
    a: L(
      "نعم. مقرنا في المنيا، ونستطيع خدمة العملاء في أي مكان في مصر عن بُعد، مع اجتماعات أونلاين ومتابعة على واتساب.",
      "Yes. We're based in Minya and can work with clients anywhere in Egypt remotely, with online meetings and WhatsApp follow-up.",
    ),
  },
  {
    q: L("متى تبدأ النتائج في الظهور؟", "When will I start seeing results?"),
    a: L(
      "يعتمد ذلك على نشاطك وميزانيتك ونقطة البداية. في مرحلة الاكتشاف نتفق على أهداف واقعية وجدول زمني واضح قبل أن نبدأ.",
      "It depends on your business, budget and starting point. During discovery we agree on realistic goals and a clear timeline before we begin.",
    ),
  },
  {
    q: L("هل يمكنني طلب خدمة واحدة فقط؟", "Can I hire you for just one service?"),
    a: L(
      "بالتأكيد. يمكنك البدء بخدمة واحدة مثل الإعلانات أو المحتوى، ونقترح أي إضافة فقط عندما يكون لها سبب واضح.",
      "Absolutely. You can start with a single service such as ads or content — we'll only suggest adding more when there's a clear reason.",
    ),
  },
  {
    q: L("كيف نبدأ؟", "How do we get started?"),
    a: L(
      "راسلنا على واتساب أو املأ نموذج المشروع. نتواصل معك لنفهم احتياجك، ثم نرسل لك اقتراحًا مناسبًا.",
      "Message us on WhatsApp or fill in the project form. We'll get in touch to understand what you need, then send you a tailored proposal.",
    ),
  },
];
