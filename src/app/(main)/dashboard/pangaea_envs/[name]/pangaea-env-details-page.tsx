"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ExternalLink } from "lucide-react";

type Node = {
  ID: number;
  ip: string;
  env_id: number;
  dc: string;
};

type Image = {
  name: string;
  image: string;
  is_latest: boolean;
};

type PublicEndpoint = {
  nodeName: string;
  addresses: string[];
  port: number;
  protocol: string;
  podName: string;
  allNodes: boolean;
};

type Workload = {
  workload_id: number;
  name: string;
  images: Image[];
  publicEndpoints: PublicEndpoint[] | null;
  status: string;
  extra_env_variables: string;
};

type PangaeaEnvData = {
  env: {
    id: number;
    name: string;
    host_count: number;
    owner: string;
    config_branch: string;
    status: number;
  };
  nodes: Node[];
  workloads: {
    biz_services: Workload[];
    infras: Workload[];
    basics: Workload[];
  };
};

interface PangaeaEnvDetailsPageProps {
  envName: string;
}

const statusMap: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  0: { label: "Inactive", variant: "secondary" },
  1: { label: "Active", variant: "default" },
  2: { label: "Maintenance", variant: "outline" },
};

export function PangaeaEnvDetailsPage({
  envName,
}: PangaeaEnvDetailsPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PangaeaEnvData | null>(null);

  useEffect(() => {
    fetchEnvDetails();
  }, [envName]);

  const fetchEnvDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/pangaea-envs/${encodeURIComponent(envName)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch environment details: ${response.statusText}`);
      }
      const envData = await response.json();
      setData(envData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load environment details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">Loading environment details...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-destructive">{error || "Failed to load environment"}</div>
      </div>
    );
  }

  const renderWorkload = (workload: Workload) => {
    const statusBadge = workload.status === "True" ? (
      <Badge variant="default">Running</Badge>
    ) : workload.status === "False" ? (
      <Badge variant="destructive">Stopped</Badge>
    ) : workload.status ? (
      <Badge variant="secondary">{workload.status}</Badge>
    ) : null;

    return (
      <div
        className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{workload.name}</h4>
              {statusBadge}
            </div>
            
            {workload.images && workload.images.length > 0 && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Images:</div>
                {workload.images.map((img, idx) => (
                  <div key={idx} className="text-sm flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {img.name}: {img.image}
                    </code>
                    {img.is_latest && <Badge variant="outline" className="text-xs">Latest</Badge>}
                  </div>
                ))}
              </div>
            )}

            {workload.publicEndpoints && workload.publicEndpoints.length > 0 && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">Endpoints:</div>
                {workload.publicEndpoints.map((ep, idx) => {
                  const address = ep.addresses[0];
                  const url = `http://${address}:${ep.port}`;
                  return (
                    <div key={idx} className="text-sm flex items-center gap-2">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80 hover:underline cursor-pointer"
                      >
                        {address}:{ep.port}/{ep.protocol}
                      </a>
                      <span className="text-muted-foreground text-xs">({ep.nodeName})</span>
                    </div>
                  );
                })}
              </div>
            )}

            {workload.extra_env_variables && (
              <div className="text-xs text-muted-foreground">
                Extra Env Vars: {workload.extra_env_variables}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWorkloads = (workloads: Workload[], type: string) => {
    if (!workloads || workloads.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No {type} workloads found
        </div>
      );
    }
    return <div className="space-y-4">{workloads.map((workload) => (
      <div key={workload.workload_id}>
        {renderWorkload(workload)}
      </div>
    ))}</div>;
  };

  const envStatus = statusMap[data.env.status] || { label: `Status ${data.env.status}`, variant: "secondary" as const };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/pangaea_envs")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Environment: {data.env.name}</h1>
            <p className="text-muted-foreground">
              View details and workloads for this pangaea environment.
            </p>
          </div>

          <div className="px-4 lg:px-6 space-y-4">
            {/* Environment Info */}
            <div className="border rounded-lg p-3 bg-card">
              <h2 className="text-base font-semibold mb-2">Environment Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="flex flex-col gap-0.5">
                  <div className="text-xs text-muted-foreground leading-tight">ID</div>
                  <div className="text-sm font-semibold leading-tight">{data.env.id}</div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-xs text-muted-foreground leading-tight">Owner</div>
                  <div className="text-sm font-semibold leading-tight">{data.env.owner}</div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-xs text-muted-foreground leading-tight">Host Count</div>
                  <div className="text-sm font-semibold leading-tight">{data.env.host_count}</div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-xs text-muted-foreground leading-tight">Config Branch</div>
                  <Badge variant="outline" className="text-xs w-fit leading-tight h-5">{data.env.config_branch}</Badge>
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-xs text-muted-foreground leading-tight">Status</div>
                  <Badge variant={envStatus.variant} className="text-xs w-fit leading-tight h-5">{envStatus.label}</Badge>
                </div>
              </div>
            </div>

            {/* Nodes */}
            {data.nodes && data.nodes.length > 0 && (
              <div className="border rounded-lg p-4 bg-card">
                <h2 className="text-lg font-semibold mb-3">Nodes ({data.nodes.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {data.nodes.map((node) => (
                    <div key={node.ID} className="border rounded p-2.5 bg-background hover:bg-accent/50 transition-colors flex items-center justify-between gap-2">
                      <div className="font-medium text-sm">{node.ip}</div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-xs">ID:{node.ID}</Badge>
                        <Badge variant="outline" className="text-xs">{node.dc}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workloads */}
            <div className="border rounded-lg p-4 space-y-4">
              <h2 className="text-lg font-semibold">Workloads</h2>
              <Tabs defaultValue="biz_services" className="w-full">
                <TabsList>
                  <TabsTrigger value="biz_services">
                    Biz Services ({data.workloads.biz_services?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="infras">
                    Infras ({data.workloads.infras?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="basics">
                    Basics ({data.workloads.basics?.length || 0})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="biz_services" className="mt-4">
                  <ScrollArea className="h-[600px]">
                    {renderWorkloads(data.workloads.biz_services || [], "biz service")}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="infras" className="mt-4">
                  <ScrollArea className="h-[600px]">
                    {renderWorkloads(data.workloads.infras || [], "infra")}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="basics" className="mt-4">
                  <ScrollArea className="h-[600px]">
                    {renderWorkloads(data.workloads.basics || [], "basic")}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
