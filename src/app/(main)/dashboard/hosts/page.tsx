import { Suspense } from "react";

import { type HostRow, getBadHosts, getHosts } from "@/lib/hosts-pg";

import { HostsContent } from "./hosts-content";

export default async function Page() {
  let data: HostRow[] = [];

  try {
    data = await getHosts();
  } catch (error) {
    console.error("Error fetching hosts from PostgreSQL:", error);
  }

  return (
    <Suspense fallback={<div className="flex flex-1 items-center justify-center py-12">Loading...</div>}>
      <HostsContent data={data} />
    </Suspense>
  );
}
