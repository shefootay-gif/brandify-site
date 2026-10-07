import { L } from "@/lib/i18n";
import type { Localized, ProjectCaseStudy } from "../schema/types";

// Concept projects: invented brands that illustrate how Brandify thinks.
// They are clearly labelled "Concept" on the site and carry NO results,
// metrics or client claims. Replace them from the dashboard with real work.
export type SeedProject = {
  slug: string;
  title: Localized;
  clientName: string;
  industry: Localized;
  summary: Localized;
  description: Localized;
  challenge: Localized;
  solution: Localized;
  tools: string[];
  tags: string[];
  accentColor: "navy" | "midnight" | "ocean" | "orange" | "paper";
  isFeatured: boolean;
  caseStudy: ProjectCaseStudy | null;
  categories: string[];
  services: string[];
};

export const seedProjects: SeedProject[] = [
  {
    slug: "sullam-academy",
    title: L("أكاديمية سُلَّم", "Sullam Academy"),
    clientName: "Sullam Academy (Concept)",
    industry: L("أكاديمية كورسات أونلاين", "Online course academy"),
    summary: L(
      "تصور لحملة إطلاق دفعة جديدة لأكاديمية كورسات أونلاين، تبني الثقة بالمحتوى قبل أن تطلب الحجز.",
      "A concept launch campaign for an online course academy — building trust with content before asking anyone to enrol.",
    ),
    description: L(
      "<p>أكاديمية تقدم كورسات عملية أونلاين وتطلق دفعات جديدة كل عدة أسابيع. الهدف من التصور: ملء مقاعد الدفعة دون الاعتماد على الخصومات.</p>",
      "<p>An academy running practical online courses, launching a new cohort every few weeks. The aim of this concept: fill each cohort without leaning on discounts.</p>",
    ),
    challenge: L(
      "الأكاديميات تبيع وعدًا بنتيجة في المستقبل، والعميل لا يحجز قبل أن يثق في المدرب والمحتوى. إعلان «احجز الآن» وحده لا يكفي.",
      "Academies sell the promise of a future outcome, and nobody enrols before they trust the trainer and the material. A 'book now' ad on its own isn't enough.",
    ),
    solution: L(
      "رحلة من ثلاث مراحل: محتوى مجاني يُظهر قيمة المدرب، ثم إعادة استهداف من تفاعل بإجابات عن الأسئلة الشائعة، ثم عرض حجز بموعد محدد عبر واتساب.",
      "A three-stage journey: free content that shows the trainer's value, retargeting for people who engaged with answers to common questions, then a time-bound enrolment offer over WhatsApp.",
    ),
    tools: ["Meta Ads Manager", "WhatsApp Business", "Canva", "CapCut"],
    tags: ["Launch", "Lead generation", "Education"],
    accentColor: "navy",
    isFeatured: true,
    caseStudy: {
      strategy: L(
        "تقسيم الجمهور إلى ثلاث شرائح: من لا يعرف الأكاديمية، ومن تفاعل مع المحتوى، ومن تواصل ولم يحجز. لكل شريحة رسالة وإعلان مختلف.",
        "Split the audience into three groups — people who don't know the academy, people who engaged with content, and people who reached out but didn't enrol — with a different message and ad for each.",
      ),
      creative: L(
        "فكرة بصرية تقوم على «السُّلَّم»: كل درجة خطوة في رحلة الطالب. ألوان هادئة، ونصوص قصيرة وواضحة، والمدرب في قلب كل فيديو.",
        "A visual idea built on the 'ladder': every step is a stage in the student's journey. Calm colours, short clear copy, and the trainer at the heart of every video.",
      ),
      execution: L(
        "ريلز قصيرة للمدرب، وإعلانات Meta بهدف الرسائل، وردود جاهزة على واتساب لتسريع الحجز، وصفحة هبوط بسيطة لكل دفعة.",
        "Short reels featuring the trainer, Meta ads optimised for messages, saved WhatsApp replies to speed up enrolment, and a simple landing page for each cohort.",
      ),
    },
    categories: ["marketing", "media-buying", "content"],
    services: ["ads-performance", "content-production", "brand-strategy"],
  },
  {
    slug: "kasr-studio",
    title: L("كَسر ستوديو", "Kasr Studio"),
    clientName: "Kasr Studio (Concept)",
    industry: L("براند ملابس رجالي — ستريت وير", "Men's streetwear brand"),
    summary: L(
      "تصور لإطلاق براند ملابس رجالي ستريت وير يبيع أونلاين بالكامل.",
      "A concept launch for a men's streetwear brand that sells entirely online.",
    ),
    description: L(
      "<p>براند ملابس رجالي جديد يستهدف الشباب ويبيع من متجره الإلكتروني وصفحاته فقط، دون فروع.</p>",
      "<p>A new menswear label aimed at young men, selling only through its online store and social pages — no physical branches.</p>",
    ),
    challenge: L(
      "سوق الملابس أونلاين مزدحم، والعميل يقارن بسرعة. البراند الجديد يحتاج سببًا واضحًا ليتوقف عنده المشتري، وثقة كافية ليطلب أونلاين.",
      "Online fashion is crowded and shoppers compare fast. A new brand needs a clear reason to stop the scroll — and enough trust to order online.",
    ),
    solution: L(
      "هوية جريئة باسم «كَسر» بمعنى كسر المألوف، ومتجر سريع على الموبايل، وحملات TikTok وMeta بمحتوى من الشارع لا من الاستوديو.",
      "A bold identity called 'Kasr' — breaking the expected — a fast mobile store, and TikTok and Meta campaigns shot on the street, not in a studio.",
    ),
    tools: ["Meta Ads Manager", "TikTok Ads", "Shopify", "CapCut"],
    tags: ["Brand launch", "E-commerce", "Fashion"],
    accentColor: "midnight",
    isFeatured: true,
    caseStudy: {
      strategy: L(
        "التركيز على الشباب في المدن برسالة واحدة: «البس اللي يشبهك»، مع سياسة استبدال واضحة في كل إعلان لتقليل التردد في الطلب أونلاين.",
        "Focus on young urban men with a single message — 'wear what feels like you' — and a clear exchange policy in every ad to reduce hesitation about ordering online.",
      ),
      creative: L(
        "خطوط عريضة وألوان محدودة، وتصوير في أماكن حقيقية بإضاءة طبيعية، وحركة كاميرا سريعة تناسب طبيعة تيك توك.",
        "Heavy type and a tight colour palette, shot in real locations under natural light, with fast camera movement that suits TikTok.",
      ),
      execution: L(
        "متجر إلكتروني بصفحات منتجات واضحة وجداول مقاسات مفصلة، وربط Pixel، وحملة إطلاق على مرحلتين: تعريف بالبراند ثم بيع.",
        "An online store with clear product pages and detailed size guides, Pixel tracking, and a two-phase launch: awareness first, then sales.",
      ),
    },
    categories: ["ecommerce", "branding", "media-buying"],
    services: ["brand-strategy", "ads-performance", "ecommerce-web"],
  },
  {
    slug: "luna-smile-dental",
    title: L("عيادة لونا سمايل", "Luna Smile Dental"),
    clientName: "Luna Smile Dental (Concept)",
    industry: L("عيادة أسنان", "Dental clinic"),
    summary: L(
      "تصور لحضور رقمي لعيادة أسنان يطمئن المريض قبل أول زيارة.",
      "A concept digital presence for a dental clinic that puts patients at ease before their first visit.",
    ),
    description: L(
      "<p>عيادة أسنان في مدينة متوسطة الحجم تريد أن تكون الخيار الأول للعائلات في منطقتها.</p>",
      "<p>A dental clinic in a mid-sized city that wants to become the first choice for families in its area.</p>",
    ),
    challenge: L(
      "الخوف من طبيب الأسنان يجعل المريض يؤجل الزيارة، وفي النهاية يختار العيادة التي يشعر معها بالأمان قبل أن يدخلها.",
      "Fear of the dentist makes people put off visits — and in the end they choose the clinic they already feel safe with before walking in.",
    ),
    solution: L(
      "محتوى يعرّف بالطبيب والفريق، وفيديوهات قصيرة تشرح الإجراءات ببساطة، وإعلانات محلية تستهدف المنطقة المحيطة بالعيادة مع حجز مباشر على واتساب.",
      "Content that introduces the dentist and team, short videos explaining procedures simply, and local ads targeting the surrounding area with direct WhatsApp booking.",
    ),
    tools: ["Meta Ads Manager", "WhatsApp Business", "CapCut"],
    tags: ["Healthcare", "Local", "Social media"],
    accentColor: "ocean",
    isFeatured: true,
    caseStudy: null,
    categories: ["social-media", "content", "video"],
    services: ["social-media", "content-production", "ads-performance"],
  },
  {
    slug: "tannour-al-beit",
    title: L("تنّور البيت", "Tannour Al-Beit"),
    clientName: "Tannour Al-Beit (Concept)",
    industry: L("مطعم مخبوزات", "Bakery restaurant"),
    summary: L(
      "تصور لهوية ومحتوى مطعم مخبوزات منزلية بروح دافئة وقريبة.",
      "A concept identity and content direction for a home-style bakery with a warm, familiar feel.",
    ),
    description: L(
      "<p>مطعم مخبوزات يقدّم الفطائر والمعجنات بطريقة البيت، ويعتمد على الطلبات الخارجية والزبائن الدائمين.</p>",
      "<p>A bakery serving pies and pastries the home-made way, relying on deliveries and regulars.</p>",
    ),
    challenge: L(
      "المنافسة بين المطاعم المحلية تعتمد على الذوق والسعر، وصور الطعام العادية لا تميّز مطعمًا عن آخر.",
      "Local restaurants compete on taste and price, and ordinary food photos don't set one apart from the next.",
    ),
    solution: L(
      "هوية مستوحاة من فرن الطين، وتصوير يركّز على لحظة خروج المخبوزات من التنور، وريلز قصيرة للتحضير تفتح الشهية.",
      "An identity inspired by the clay oven, photography built around the moment the bread comes out, and short prep reels that build appetite.",
    ),
    tools: ["Adobe Illustrator", "Lightroom", "CapCut"],
    tags: ["Restaurant", "Identity", "Food content"],
    accentColor: "orange",
    isFeatured: false,
    caseStudy: null,
    categories: ["branding", "content", "video"],
    services: ["brand-strategy", "content-production"],
  },
  {
    slug: "sitra-modest-wear",
    title: L("سِترة", "Sitra"),
    clientName: "Sitra (Concept)",
    industry: L("براند أزياء نسائية محتشمة", "Women's modest fashion brand"),
    summary: L(
      "تصور لمحتوى وإعلانات براند أزياء محتشمة يبيع عبر إنستجرام وتيك توك.",
      "A concept content and ads direction for a modest fashion brand selling through Instagram and TikTok.",
    ),
    description: L(
      "<p>براند أزياء محتشمة يبيع أغلب طلباته من خلال الرسائل على إنستجرام وتيك توك.</p>",
      "<p>A modest fashion label that takes most of its orders through Instagram and TikTok messages.</p>",
    ),
    challenge: L(
      "العميلة تريد أن ترى القطعة على شخص حقيقي، وتسأل عن الخامة والمقاس قبل الشراء، وأغلب البيع يتم في الرسائل.",
      "Customers want to see each piece on a real person and ask about fabric and sizing before buying — and most sales happen in DMs.",
    ),
    solution: L(
      "ريلز لتجربة القطع على موديلز بمقاسات مختلفة، ومحتوى يشرح الخامات، وإعلانات بهدف الرسائل مع ردود جاهزة على الأسئلة المتكررة لتسريع الطلب.",
      "Try-on reels with models of different sizes, content that explains the fabrics, and message-objective ads with saved replies to common questions to speed up orders.",
    ),
    tools: ["Meta Ads Manager", "TikTok Ads", "Instagram"],
    tags: ["Fashion", "Social commerce", "Reels"],
    accentColor: "paper",
    isFeatured: false,
    caseStudy: null,
    categories: ["ecommerce", "content", "social-media", "media-buying"],
    services: ["content-production", "ads-performance", "social-media"],
  },
];
