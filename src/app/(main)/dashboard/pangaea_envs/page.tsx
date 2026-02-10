import { DataTable } from "./data-table";

export default async function PangaeaEnvsPage() {
  let data: {
    id: number;
    name: string;
    host_count: number;
    owner: string;
    config_branch: string;
    status: number;
  }[] = []

  try {
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                (process.env.VERCEL_URL 
                  ? `https://${process.env.VERCEL_URL}`
                  : 'http://ops3-19ee08662.qiyi.virtual:3000');
    
    const response = await fetch(`${baseUrl}/api/pangaea-envs`, {
      cache: 'no-store',
    });

    if (response.ok) {
      data = await response.json();
    } else {
      console.error("Error fetching pangaea envs:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching pangaea envs from API:", error);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold tracking-tight">Pangaea Environments</h1>
            <p className="text-muted-foreground">
              Manage and view pangaea environments from the Pangaea API.
            </p>
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
