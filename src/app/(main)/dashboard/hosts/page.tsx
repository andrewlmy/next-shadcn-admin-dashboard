import { ChartAreaInteractive } from "./chart-area-interactive";
import { DataTable } from "./data-table";
import { db } from "@/lib/db";

import { SectionCards } from "./section-cards";

export default async function Page() {
  // Only select and map fields required by the client table schema to ensure
  // serializable props and avoid leaking unused columns (e.g., Date fields).
  let data: { id: number; 
      sn: string; 
      ip: string ; 
      ipv4Public: string;
      cpuCore: number;
      memoryTotalSize: number;
    }[] = []

  try {
    const rows = await db.host.findMany({
      select: { id: true, 
                sn: true, 
                ipv4: true, 
                ipv4Public: true, 
                cpuCore: true,
                memoryTotalSize: true,
                localDiskSize: true,
              },
      orderBy: { id: "desc" },
    });
    data = rows.map((r) => ({ id: r.id, 
                              sn: r.sn ?? "", 
                              ip: r.ipv4, 
                              publicIp: r.ipv4Public ?? "",
                              cpuCore: r.cpuCore ?? 0,
                              memory: r.memoryTotalSize ?? 0,
                              diskVolume: r.localDiskSize ?? 0
                            
                            }));
  } catch (error) {
    console.error("Error fetching data from MySQL:", error);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          {/* <div className="px-4 lg:px-6"> */}
            {/* <ChartAreaInteractive /> */}
          {/* </div> */}
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
