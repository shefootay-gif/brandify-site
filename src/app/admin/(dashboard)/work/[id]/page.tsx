import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/shell";
import { buttonClasses } from "@/components/ui/button";
import { ExternalIcon } from "@/components/ui/icons";
import { ProjectForm } from "../project-form";
import { loadProject, loadProjectOptions } from "../load";

export const metadata: Metadata = { title: "تعديل مشروع" };

export default async function EditProjectPage({ params }: PageProps<"/admin/work/[id]">) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [project, options] = await Promise.all([loadProject(id), loadProjectOptions()]);
  if (!project) notFound();
  return (
    <>
      <PageHeader
        back={{ href: "/admin/work", label: "الأعمال" }}
        title={project.title.ar || project.title.en}
        actions={
          project.status === "published" ? (
            <a href={`/ar/work/${project.slug}`} target="_blank" rel="noopener" className={buttonClasses("subtle", "sm")}>
              <ExternalIcon size={16} /> عرض في الموقع
            </a>
          ) : null
        }
      />
      <ProjectForm key={id} id={id} initial={project} {...options} />
    </>
  );
}
