import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/shell";
import { ProjectForm } from "../project-form";
import { emptyProject, loadProjectOptions } from "../load";

export const metadata: Metadata = { title: "مشروع جديد" };

export default async function NewProjectPage() {
  const options = await loadProjectOptions();
  return (
    <>
      <PageHeader back={{ href: "/admin/work", label: "الأعمال" }} title="مشروع جديد" description="يُحفظ كمسودة حتى تغيّر الحالة إلى «منشور»." />
      <ProjectForm id={null} initial={emptyProject()} {...options} />
    </>
  );
}
