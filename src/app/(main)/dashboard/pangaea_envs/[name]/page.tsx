import { PangaeaEnvDetailsPage } from "./pangaea-env-details-page";

export default async function PangaeaEnvPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  return <PangaeaEnvDetailsPage envName={decodeURIComponent(name)} />;
}
