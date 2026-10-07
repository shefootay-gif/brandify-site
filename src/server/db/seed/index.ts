// Seeds default content. Safe to run repeatedly: it only fills empty tables
// and never touches leads or users.
//   npm run db:seed              → fill what's missing
//   npm run db:seed -- --reset   → wipe CMS content (not leads/users) and re-seed
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import pg from "pg";
import * as schema from "../schema";
import { blockDefaults } from "@/content/blocks";
import { defaultSettings } from "@/content/settings";
import { L } from "@/lib/i18n";
import { seedCategories, seedGeneralFaqs, seedServices } from "./services";
import { seedProjects } from "./projects";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });
const reset = process.argv.includes("--reset");

async function isEmpty(table: PgTable) {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(table);
  return (row?.n ?? 0) === 0;
}

async function main() {
  if (reset) {
    console.log("[seed] resetting CMS content…");
    await db.execute(sql`truncate project_categories, project_services, project_media, projects, categories, faqs, services, testimonials, clients, team_members, content_blocks, seo_entries, settings cascade`);
  }

  await db.insert(schema.settings).values({ key: "site", value: defaultSettings }).onConflictDoNothing();
  for (const [key, data] of Object.entries(blockDefaults)) {
    await db.insert(schema.contentBlocks).values({ key, data }).onConflictDoNothing();
  }

  if (await isEmpty(schema.services)) {
    for (const [i, s] of seedServices.entries()) {
      const [row] = await db
        .insert(schema.services)
        .values({
          slug: s.slug,
          icon: s.icon,
          title: s.title,
          shortDescription: s.shortDescription,
          body: s.body,
          subServices: s.subServices,
          benefits: s.benefits,
          deliverables: s.deliverables,
          process: s.process,
          ctaLabel: s.ctaLabel,
          whatsappMessage: s.whatsappMessage,
          seoTitle: L("", ""),
          seoDescription: s.shortDescription,
          sortOrder: i,
        })
        .returning();
      for (const [j, f] of s.faqs.entries()) {
        await db.insert(schema.faqs).values({ question: f.q, answer: f.a, serviceId: row!.id, sortOrder: j });
      }
    }
    console.log(`[seed] services: ${seedServices.length}`);
  }

  if (await isEmpty(schema.categories)) {
    await db.insert(schema.categories).values(seedCategories.map((c, i) => ({ ...c, sortOrder: i })));
    console.log(`[seed] categories: ${seedCategories.length}`);
  }

  const generalFaqCount = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.faqs)
    .where(sql`${schema.faqs.serviceId} is null`);
  if ((generalFaqCount[0]?.n ?? 0) === 0) {
    await db.insert(schema.faqs).values(
      seedGeneralFaqs.map((f, i) => ({ question: f.q, answer: f.a, showOnHome: true, sortOrder: i })),
    );
    console.log(`[seed] general FAQs: ${seedGeneralFaqs.length}`);
  }

  if (await isEmpty(schema.projects)) {
    const cats = await db.select().from(schema.categories);
    const svcs = await db.select().from(schema.services);
    for (const [i, p] of seedProjects.entries()) {
      const [row] = await db
        .insert(schema.projects)
        .values({
          slug: p.slug,
          title: p.title,
          clientName: p.clientName,
          industry: p.industry,
          summary: p.summary,
          description: p.description,
          challenge: p.challenge,
          solution: p.solution,
          results: L("", ""),
          tools: p.tools,
          tags: p.tags,
          isConcept: true,
          isFeatured: p.isFeatured,
          hasCaseStudy: Boolean(p.caseStudy),
          caseStudy: p.caseStudy,
          accentColor: p.accentColor,
          seoDescription: p.summary,
          status: "published",
          publishedAt: new Date(),
          sortOrder: i,
        })
        .returning();
      const catIds = p.categories.map((slug) => cats.find((c) => c.slug === slug)?.id).filter(Boolean) as string[];
      const svcIds = p.services.map((slug) => svcs.find((s) => s.slug === slug)?.id).filter(Boolean) as string[];
      if (catIds.length) await db.insert(schema.projectCategories).values(catIds.map((categoryId) => ({ projectId: row!.id, categoryId })));
      if (svcIds.length) await db.insert(schema.projectServices).values(svcIds.map((serviceId) => ({ projectId: row!.id, serviceId })));
    }
    console.log(`[seed] concept projects: ${seedProjects.length}`);
  }

  if (await isEmpty(schema.teamMembers)) {
    // Founder placeholder — hidden until the real name/photo are added.
    await db.insert(schema.teamMembers).values({
      name: L("[اسم المؤسس]", "[Founder name]"),
      role: L("المؤسس", "Founder"),
      bio: L("", ""),
      isFounder: true,
      visible: false,
    });
    console.log("[seed] founder placeholder (hidden)");
  }

  if (await isEmpty(schema.testimonials)) {
    // Draft placeholder — never published automatically.
    await db.insert(schema.testimonials).values({
      name: "[اسم العميل]",
      company: "[اسم الشركة]",
      position: L("[المنصب]", "[Position]"),
      quote: L(
        "[نموذج — استبدل هذا النص برأي عميل حقيقي ثم انشره]",
        "[Placeholder — replace with a real client testimonial before publishing]",
      ),
      status: "draft",
    });
    console.log("[seed] testimonial placeholder (draft)");
  }

  console.log("[seed] done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
