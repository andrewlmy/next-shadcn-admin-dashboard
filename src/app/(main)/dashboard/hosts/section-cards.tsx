"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import type { HostRow } from "@/lib/hosts-pg";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface SectionCardsProps {
  totalHosts?: number;
  badHosts?: number;
  badHostsData?: HostRow[];
}

export function SectionCards({ totalHosts = 0, badHosts = 0, badHostsData = [] }: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card min-w-[10rem] flex-row items-center gap-4 py-2 px-4 sm:min-w-[14rem]">
        <CardHeader className="flex min-w-0 flex-row items-center gap-2 p-0">
          <CardDescription className="mb-0 min-w-[7.5rem] shrink-0 text-sm">Total Hosts:</CardDescription>
          <CardTitle className="text-xl font-semibold tabular-nums">{totalHosts.toLocaleString()}</CardTitle>
        </CardHeader>
      </Card>

      <Card className="@container/card min-w-[10rem] flex-row items-center gap-4 py-2 px-4 sm:min-w-[14rem]">
        <CardHeader className="flex min-w-0 flex-row items-center gap-2 p-0">
          <CardDescription className="mb-0 min-w-[7.5rem] shrink-0 text-sm">Bad Hosts:</CardDescription>
          <Drawer direction="right">
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                className="text-xl font-semibold tabular-nums hover:bg-accent h-auto p-0"
              >
                {badHosts.toLocaleString()}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="sm:max-w-lg" data-vaul-no-drag>
              <DrawerHeader>
                <DrawerTitle>Bad Hosts ({badHosts})</DrawerTitle>
                <DrawerDescription>
                  Nodes not updated in the last 15 minutes
                </DrawerDescription>
              </DrawerHeader>
              <div
                className="max-h-[60vh] overflow-y-auto px-4 pb-4"
                data-vaul-no-drag
                style={{ userSelect: "text" }}
              >
                {badHostsData.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No bad hosts</p>
                ) : (
                  <ul className="space-y-3">
                    {badHostsData.map((host) => (
                      <li
                        key={host.id}
                        className="flex flex-col gap-1 rounded-lg border p-3 text-sm"
                      >
                        <div className="font-medium">{host.header}</div>
                        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                          {host.idc && <span>IDC: {host.idc}</span>}
                          {host.k8sCluster && <span>Cluster: {host.k8sCluster}</span>}
                          <span>Status: {host.status}</span>
                          <span>
                            Last seen:{" "}
                            {host.updatedAt
                              ? new Date(host.updatedAt).toLocaleString()
                              : "—"}
                          </span>
                        </div>
                        {host.publicIp && (
                          <div className="text-muted-foreground text-xs">
                            Public IP: {host.publicIp}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </DrawerContent>
          </Drawer>
        </CardHeader>
      </Card>

      {/* <Card className="@container/card">
        <CardHeader>
          <CardDescription>Healthy Hosts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">45,678</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card> */}

      {/* <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">4.5%</CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card> */}
    </div>
  );
}
