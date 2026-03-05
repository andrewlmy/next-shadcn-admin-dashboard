"use client";
import * as React from "react";

import { LayoutDashboard, ChartBar, Gauge, ShoppingBag, GraduationCap, Forklift, Search, Server } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const searchItems = [
  { group: "Dashboards", icon: LayoutDashboard, label: "Default" },
  // { group: "Dashboards", icon: ChartBar, label: "CRM", disabled: true },
  { group: "Dashboards", icon: Gauge, label: "Analytics", disabled: true },
  // { group: "Dashboards", icon: ShoppingBag, label: "E-Commerce", disabled: true },
  { group: "Dashboards", icon: Server, label: "Hosts", disabled: false },
  { group: "Dashboards", icon: Forklift, label: "Logistics", disabled: true },
  { group: "Authentication", label: "Login v1" },
  { group: "Authentication", label: "Login v2" },
  { group: "Authentication", label: "Register v1" },
  { group: "Authentication", label: "Register v2" },
];

export function SearchDialog() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [ipSearchOpen, setIpSearchOpen] = React.useState(false);
  const [ipInput, setIpInput] = React.useState("");

  const isHostsPage = pathname?.includes("/dashboard/hosts");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isHostsPage) {
          setIpSearchOpen((o) => !o);
        } else {
          setOpen((o) => !o);
        }
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isHostsPage]);

  function handleOpenChange(open: boolean) {
    if (isHostsPage) {
      setIpSearchOpen(open);
      if (!open) setIpInput("");
    } else {
      setOpen(open);
    }
  }

  function handleIpSearch(e: React.FormEvent) {
    e.preventDefault();
    const ip = ipInput.trim();
    if (ip) {
      router.push(`/dashboard/hosts?ip=${encodeURIComponent(ip)}`);
    } else {
      router.push("/dashboard/hosts");
    }
    setIpSearchOpen(false);
  }

  if (isHostsPage) {
    return (
      <>
        <Button
          variant="link"
          className="text-muted-foreground !px-0 font-normal hover:no-underline"
          onClick={() => setIpSearchOpen(true)}
        >
          <Search className="size-4" />
          Search
          <kbd className="bg-muted inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] font-medium select-none">
            <span className="text-xs">⌘</span>J
          </kbd>
        </Button>
        <Dialog open={ipSearchOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Search by IPs or Public IPs</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleIpSearch} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ip-search">IP addresses (comma or space separated)</Label>
                <Input
                  id="ip-search"
                  placeholder="e.g. 10.80.208, 10.186.24 192.168.1"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="submit">Search</Button>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button
        variant="link"
        className="text-muted-foreground !px-0 font-normal hover:no-underline"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        Search
        <kbd className="bg-muted inline-flex h-5 items-center gap-1 rounded border px-1.5 text-[10px] font-medium select-none">
          <span className="text-xs">⌘</span>J
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search dashboards, users, and more…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {[...new Set(searchItems.map((item) => item.group))].map((group, i) => (
            <React.Fragment key={group}>
              {i !== 0 && <CommandSeparator />}
              <CommandGroup heading={group} key={group}>
                {searchItems
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <CommandItem className="!py-1.5" key={item.label} onSelect={() => setOpen(false)}>
                      {item.icon && <item.icon />}
                      <span>{item.label}</span>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
