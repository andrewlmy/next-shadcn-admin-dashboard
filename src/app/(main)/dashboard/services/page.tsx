import { DataTable } from "./data-table";
import { getServices, getServicesCounts } from "@/lib/services-pg";

export default async function ServicesPage() {
  let data: {
    id: number;
    name: string;
    status: string;
    port: string;
    projectId: number;
    enablePressureTest: boolean;
    enableContrastTest: number;
    createdAt: Date;
    updatedAt: Date;
  }[] = [];
  let totalServices = 0;
  let enabledServices = 0;
  let disabledServices = 0;

  try {
    const [rows, counts] = await Promise.all([getServices(), getServicesCounts()]);
    data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.status,
      port: r.port,
      projectId: r.projectId,
      enablePressureTest: r.enablePressureTest,
      enableContrastTest: r.enableContrastTest,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
    totalServices = counts.total;
    enabledServices = counts.enabled;
    disabledServices = counts.disabled;
  } catch (error) {
    console.error("Error fetching services from PostgreSQL:", error);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* <SectionCards 
           totalServices={totalServices}
           enabledServices={enabledServices}
           disabledServices={disabledServices}
           /> */}
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
