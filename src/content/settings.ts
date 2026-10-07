// Site-wide settings: schema (validation) + defaults (used by seed and as a
// fallback so a missing key can never break the site).
import { z } from "zod";
import { localized, optionalUrl } from "@/lib/validation/common";
import { L } from "@/lib/i18n";

export const socialPlatforms = [
  "facebook",
  "instagram",
  "tiktok",
  "linkedin",
  "youtube",
  "x",
  "behance",
  "snapchat",
  "threads",
] as const;

export const builtInFieldKeys = [
  "name",
  "whatsapp",
  "businessType",
  "service",
  "company",
  "budget",
  "email",
  "preferredContact",
  "message",
] as const;
export type BuiltInFieldKey = (typeof builtInFieldKeys)[number];
/** Fields the lead pipeline depends on; they cannot be disabled. */
export const lockedFieldKeys: readonly BuiltInFieldKey[] = ["name", "whatsapp"];

const option = z.object({ value: z.string().trim().min(1).max(60), label: localized(120) });

export const formFieldSchema = z.object({
  key: z.string().regex(/^(?:[a-zA-Z]+|custom_[a-z0-9_]+)$/),
  builtIn: z.boolean(),
  type: z.enum(["text", "email", "tel", "textarea", "select"]),
  label: localized(120),
  placeholder: localized(200),
  enabled: z.boolean(),
  required: z.boolean(),
  step: z.union([z.literal(1), z.literal(2)]),
  options: z.array(option).max(30).default([]),
});
export type FormField = z.infer<typeof formFieldSchema>;

const trackingId = (re: RegExp) =>
  z
    .string()
    .trim()
    .max(40)
    .refine((v) => v === "" || re.test(v), "invalid id")
    .default("");

export const siteSettingsSchema = z.object({
  brand: z.object({
    name: z.string().trim().min(1).max(60),
    tagline: localized(160),
    // Optional uploaded overrides; the built-in Brandify logo is used otherwise.
    logoMediaId: z.uuid().nullable().default(null),
    logoOnDarkMediaId: z.uuid().nullable().default(null),
    faviconMediaId: z.uuid().nullable().default(null),
  }),
  contact: z.object({
    whatsapp: z.string().trim().min(6).max(25),
    email: z.email().or(z.literal("")),
    phone: z.string().trim().max(25).default(""),
    address: localized(300),
    mapUrl: optionalUrl,
    hours: localized(200),
  }),
  social: z
    .array(
      z.object({
        platform: z.enum(socialPlatforms),
        url: z.url().max(500),
        visible: z.boolean().default(true),
      }),
    )
    .max(12),
  cta: z.object({
    whatsappLabel: localized(60),
    whatsappMessage: localized(500),
    formLabel: localized(60),
    stickyWhatsapp: z.boolean().default(true),
  }),
  form: z.object({
    fields: z.array(formFieldSchema).max(30),
    successTitle: localized(160),
    successMessage: localized(500),
    whatsappFollowup: localized(500),
  }),
  tracking: z.object({
    ga4Id: trackingId(/^G-[A-Z0-9]{4,20}$/),
    gtmId: trackingId(/^GTM-[A-Z0-9]{4,12}$/),
    metaPixelId: trackingId(/^\d{6,20}$/),
    tiktokPixelId: trackingId(/^[A-Z0-9]{10,30}$/),
  }),
  seo: z.object({
    titleTemplate: localized(120),
    defaultTitle: localized(120),
    defaultDescription: localized(300),
    ogImageMediaId: z.uuid().nullable().default(null),
  }),
  footer: z.object({
    description: localized(400),
    note: localized(200),
  }),
});
export type SiteSettings = z.infer<typeof siteSettingsSchema>;

const opt = (value: string, ar: string, en: string) => ({ value, label: L(ar, en) });

export const defaultSettings: SiteSettings = {
  brand: {
    name: "Brandify",
    tagline: L("نتكلم. نصنع. نبيع.", "Talk. Create. Sell."),
    logoMediaId: null,
    logoOnDarkMediaId: null,
    faviconMediaId: null,
  },
  contact: {
    whatsapp: "01090459654",
    email: "brandifyagency9@gmail.com",
    phone: "",
    address: L("المنيا، مصر", "Minya, Egypt"),
    mapUrl: "",
    hours: L("", ""),
  },
  social: [
    { platform: "facebook", url: "https://www.facebook.com/share/1GrCvjHhTR/?mibextid=wwXIfr", visible: true },
    { platform: "instagram", url: "https://www.instagram.com/brandify1_8", visible: true },
  ],
  cta: {
    whatsappLabel: L("كلمنا على واتساب", "Chat on WhatsApp"),
    whatsappMessage: L(
      "مرحبًا Brandify، أريد الاستفسار عن خدمات التسويق.",
      "Hi Brandify, I'd like to ask about your marketing services.",
    ),
    formLabel: L("ابدأ مشروعك", "Start a project"),
    stickyWhatsapp: true,
  },
  form: {
    fields: [
      field("name", "text", 1, true, L("الاسم", "Your name"), L("اسمك بالكامل", "Full name")),
      field("whatsapp", "tel", 1, true, L("رقم الواتساب", "WhatsApp number"), L("01xxxxxxxxx", "+20 1xx xxx xxxx")),
      field("businessType", "select", 1, false, L("نوع البيزنس", "Business type"), L("اختر نوع نشاطك", "Choose your business type"), [
        opt("academy", "أكاديمية / كورسات", "Academy / courses"),
        opt("furniture", "معرض أثاث", "Furniture showroom"),
        opt("appliances", "أجهزة كهربائية ومنزلية", "Electronics & home appliances"),
        opt("clinic", "عيادة / طبيب", "Clinic / doctor"),
        opt("restaurant", "مطعم / كافيه", "Restaurant / café"),
        opt("ecommerce", "متجر إلكتروني", "Online store"),
        opt("personal-brand", "براند شخصي", "Personal brand"),
        opt("services", "شركة خدمات", "Service business"),
        opt("other", "أخرى", "Other"),
      ]),
      field("service", "select", 1, true, L("الخدمة المطلوبة", "What do you need?"), L("اختر الخدمة", "Choose a service")),
      field("company", "text", 2, false, L("اسم البراند / الشركة", "Brand / company name"), L("", "")),
      field("budget", "select", 2, false, L("الميزانية الشهرية التقريبية", "Approximate monthly budget"), L("اختر نطاقًا", "Choose a range"), [
        opt("lt5k", "أقل من 5,000 ج.م", "Under EGP 5,000"),
        opt("5k-15k", "5,000 – 15,000 ج.م", "EGP 5,000 – 15,000"),
        opt("15k-30k", "15,000 – 30,000 ج.م", "EGP 15,000 – 30,000"),
        opt("gt30k", "أكثر من 30,000 ج.م", "Over EGP 30,000"),
        opt("unsure", "لست متأكدًا بعد", "Not sure yet"),
      ]),
      field("email", "email", 2, false, L("البريد الإلكتروني", "Email"), L("اختياري", "Optional")),
      field("preferredContact", "select", 2, false, L("طريقة التواصل المفضلة", "Preferred contact method"), L("", ""), [
        opt("whatsapp", "واتساب", "WhatsApp"),
        opt("call", "مكالمة هاتفية", "Phone call"),
        opt("email", "البريد الإلكتروني", "Email"),
      ]),
      field("message", "textarea", 2, false, L("حدثنا عن مشروعك", "Tell us about your project"), L(
        "ما الذي تبيعه؟ ومن عميلك؟ وما الذي تريد تحقيقه؟",
        "What do you sell, who buys it, and what do you want to achieve?",
      )),
    ],
    successTitle: L("وصلنا طلبك، شكرًا لك", "Got it — thank you"),
    successMessage: L(
      "سنراجع تفاصيل مشروعك ونتواصل معك قريبًا. لو تحب نبدأ الآن، كمّل المحادثة معنا على واتساب.",
      "We'll review your project and get back to you soon. Want to start now? Continue the conversation on WhatsApp.",
    ),
    whatsappFollowup: L(
      "مرحبًا Brandify، أنا {name}. أرسلت لكم طلبًا من الموقع بخصوص: {service}.",
      "Hi Brandify, this is {name}. I just sent an enquiry from your website about: {service}.",
    ),
  },
  tracking: { ga4Id: "", gtmId: "", metaPixelId: "", tiktokPixelId: "" },
  seo: {
    titleTemplate: L("%s | Brandify", "%s | Brandify"),
    defaultTitle: L(
      "Brandify — وكالة تسويق وإبداع في المنيا",
      "Brandify — Marketing & Creative Agency in Egypt",
    ),
    defaultDescription: L(
      "Brandify وكالة تسويق وإبداع من المنيا: براندينج، محتوى وفيديو، إعلانات Meta وTikTok، إدارة سوشيال ميديا، ومتاجر إلكترونية — منظومة واحدة تجعل البراند يبيع.",
      "Brandify is a marketing and creative agency from Minya, Egypt: branding, content and video, Meta and TikTok ads, social media and e-commerce — one system built to make brands sell.",
    ),
    ogImageMediaId: null,
  },
  footer: {
    description: L(
      "وكالة تسويق وإبداع تجمع الاستراتيجية والمحتوى والإعلانات في منظومة واحدة هدفها أن يبيع البراند.",
      "A marketing and creative agency bringing strategy, content and ads together — built around one goal: brands that sell.",
    ),
    note: L("", ""),
  },
};

function field(
  key: BuiltInFieldKey,
  type: FormField["type"],
  step: 1 | 2,
  required: boolean,
  label: FormField["label"],
  placeholder: FormField["placeholder"],
  options: FormField["options"] = [],
): FormField {
  return { key, builtIn: true, type, label, placeholder, enabled: true, required, step, options };
}
