"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import type { HostRow } from "@/lib/hosts-pg";

import { DataTable } from "./data-table";
import { SectionCards } from "./section-cards";

export function HostsContent({ data }: { data: HostRow[] }) {
  const searchParams = useSearchParams();
  const ipFilterRaw = searchParams.get("ip")?.trim() ?? "";

  const ipFilters = useMemo(() => {
    if (!ipFilterRaw) return [];
    return ipFilterRaw.split(/[\s,]+/).filter((s) => s.length > 0);
  }, [ipFilterRaw]);

  const filteredData = useMemo(() => {
    if (ipFilters.length === 0) return data;
    const filterSet = new Set(ipFilters);
    return data.filter(
      (r) =>
        filterSet.has(r.ip) ||
        (r.publicIp != null && r.publicIp !== "" && filterSet.has(r.publicIp))
    );
  }, [data, ipFilters]);

  const badHostsData = useMemo(() => {
    const cutoff = new Date(Date.now() - 15 * 60 * 1000);
    return data.filter((h) => !h.updatedAt || new Date(h.updatedAt) < cutoff);
  }, [data]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards
            totalHosts={data.length}
            badHosts={badHostsData.length}
            badHostsData={badHostsData}
          />
          <DataTable data={filteredData} />
        </div>
      </div>
    </div>
  );
}
