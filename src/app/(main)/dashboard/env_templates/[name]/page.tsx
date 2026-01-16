import { notFound } from "next/navigation";
import { TemplateDetailsPage } from "./template-details-page";

export default async function EnvTemplateDetailsPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const resolved = await params;
  const templateName = decodeURIComponent(resolved.name);

  if (!templateName) {
    notFound();
  }

  return <TemplateDetailsPage templateName={templateName} />;
}
