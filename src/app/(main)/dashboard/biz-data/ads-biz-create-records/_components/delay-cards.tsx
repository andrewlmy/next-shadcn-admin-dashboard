"use client";

import * as React from "react";
import { Clock, AlertTriangle, CheckCircle2, Activity } from "lucide-react";

import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DelaySummary {
  totalRecords: number;
  avgExportToCompress: number;
  avgCompressToReport: number;
  maxExportToCompress: number;
  maxCompressToReport: number;
}

interface DelayCardsProps {
  summary: DelaySummary | null;
  loading?: boolean;
}

function formatDelay(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function DelayCards({ summary, loading }: DelayCardsProps) {
  if (loading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <CardDescription>Loading...</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                --
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const avgTotalDelay = summary.avgExportToCompress + summary.avgCompressToReport;
  const maxTotalDelay = summary.maxExportToCompress + summary.maxCompressToReport;

  // Thresholds for warning/critical (configurable)
  const warningThreshold = 30; // 30 minutes
  const criticalThreshold = 60; // 60 minutes

  const getDelayStatus = (delay: number) => {
    if (delay >= criticalThreshold) return "critical";
    if (delay >= warningThreshold) return "warning";
    return "normal";
  };

  const exportToCompressStatus = getDelayStatus(summary.avgExportToCompress);
  const compressToReportStatus = getDelayStatus(summary.avgCompressToReport);
  const totalStatus = getDelayStatus(avgTotalDelay);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Avg Export → Compress</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatDelay(summary.avgExportToCompress)}
          </CardTitle>
          <Badge
            variant={
              exportToCompressStatus === "critical"
                ? "destructive"
                : exportToCompressStatus === "warning"
                ? "default"
                : "secondary"
            }
            className="w-fit mt-2"
          >
            {exportToCompressStatus === "critical"
              ? "Critical"
              : exportToCompressStatus === "warning"
              ? "Warning"
              : "Normal"}
          </Badge>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Max: {formatDelay(summary.maxExportToCompress)}</span>
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Avg Compress → Report</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatDelay(summary.avgCompressToReport)}
          </CardTitle>
          <Badge
            variant={
              compressToReportStatus === "critical"
                ? "destructive"
                : compressToReportStatus === "warning"
                ? "default"
                : "secondary"
            }
            className="w-fit mt-2"
          >
            {compressToReportStatus === "critical"
              ? "Critical"
              : compressToReportStatus === "warning"
              ? "Warning"
              : "Normal"}
          </Badge>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Max: {formatDelay(summary.maxCompressToReport)}</span>
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Records Processed</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary.totalRecords.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>In selected time range</span>
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Avg Total Delay</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatDelay(avgTotalDelay)}
          </CardTitle>
          <Badge
            variant={
              totalStatus === "critical" ? "destructive" : totalStatus === "warning" ? "default" : "secondary"
            }
            className="w-fit mt-2"
          >
            {totalStatus === "critical" ? "Critical" : totalStatus === "warning" ? "Warning" : "Normal"}
          </Badge>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            <span>Max: {formatDelay(maxTotalDelay)}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
