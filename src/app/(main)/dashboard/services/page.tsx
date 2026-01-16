import { DataTable } from "./data-table";
import { SectionCards } from "./section-cards";
import { db } from "@/lib/db";

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
  }[] = []

// Fetch total count and other statistics
  let totalServices = 0;
  let enabledServices = 0;
  let disabledServices = 0;

  try {
    const [rows, totalCount, enabledCount, disabledCount]  = await Promise.all([
      db.service.findMany({
        select: {
            id: true,
            name: true,
            disable: true,
            port: true,
            projectId: true,
            enablePressureTest: true,
            enableContrastTest: true,
            dateCreate: true,
            dateLastUpdate: true,
        },
      orderBy: { id: "asc" },
    }),
    db.service.count(),
    db.service.count({ where: { disable: false } }),
    db.service.count({ where: { disable: true } }),
  ]);

    data = rows.map((r) => ({
      id: r.id,
      name: r.name,
      status: r.disable ? 'disabled' : 'enabled',
      port: r.port,
      projectId: r.projectId,
      enablePressureTest: r.enablePressureTest,
      enableContrastTest: r.enableContrastTest,
      createdAt: r.dateCreate,
      updatedAt: r.dateLastUpdate,
    }));
    // Calculate statistics
    totalServices = totalCount;
    enabledServices = enabledCount;
    disabledServices = disabledCount;
  } catch (error) {
    console.error("Error fetching services from MySQL:", error);
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