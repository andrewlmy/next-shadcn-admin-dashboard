import { DataTable } from "./data-table";

export default async function EnvTemplatesPage() {
  let data: {
    id: number;
    name: string;
  }[] = []

  try {
    // Fetch templates from our API route
    // In Next.js server components, we need absolute URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    (process.env.VERCEL_URL 
                      ? `https://${process.env.VERCEL_URL}`
                      : 'http://localhost:3000');
    
    const response = await fetch(`${baseUrl}/api/env-templates`, {
      cache: 'no-store', // Always fetch fresh data for now
    });

    if (response.ok) {
      data = await response.json();
    } else {
      console.error("Error fetching env templates:", response.statusText);
    }
  } catch (error) {
    console.error("Error fetching env templates from API:", error);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <h1 className="text-2xl font-bold tracking-tight">Ads Env Templates</h1>
            <p className="text-muted-foreground">
              Manage and view environment templates from the Pangaea API.
            </p>
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
