import { DataTable } from "./data-table";
import { getHosts } from "@/lib/hosts-pg";

import { SectionCards } from "./section-cards";

export default async function Page() {
  let data: {
    id: number;
    sn: string;
    ip: string;
    publicIp: string;
    cpuCore: number;
    memory: number;
    diskVolume: number;
    header: string;
    status: string;
    idc?: string;
    remarks?: string;
    tags?: string[];
    services?: string[];
  }[] = [];

  try {
    data = await getHosts();
  } catch (error) {
    console.error("Error fetching hosts from PostgreSQL:", error);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
