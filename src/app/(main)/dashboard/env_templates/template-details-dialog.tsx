"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

type Template = {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  name: string;
  workload_name: string;
  deploy_order: number;
  kind: string;
  type: string;
  deploy_node: number;
  yaml_content: string;
};

type TemplateDetails = {
  basics: Template[];
  infras: Template[];
  biz_services: Template[];
};

interface TemplateDetailsDialogProps {
  templateName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateDetailsDialog({
  templateName,
  open,
  onOpenChange,
}: TemplateDetailsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TemplateDetails | null>(null);

  useEffect(() => {
    if (open && templateName) {
      fetchTemplateDetails();
    }
  }, [open, templateName]);

  const fetchTemplateDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/env-templates/${templateName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch template details: ${response.statusText}`);
      }
      const templateData = await response.json();
      setData(templateData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load template details");
    } finally {
      setLoading(false);
    }
  };

  const renderTemplateList = (templates: Template[], type: string) => {
    if (templates.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No {type} templates found
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.ID}
            className="border rounded-lg p-4 space-y-2 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{template.workload_name}</h4>
                  <Badge variant="outline">{template.kind}</Badge>
                  <Badge variant="secondary">Node {template.deploy_node}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Deploy Order: {template.deploy_order}
                </div>
              </div>
            </div>
            {template.yaml_content && (
              <div className="mt-2">
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    View YAML Content
                  </summary>
                  <pre className="mt-2 p-3 bg-muted rounded-md overflow-x-auto text-xs">
                    {template.yaml_content}
                  </pre>
                </details>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Created: {new Date(template.CreatedAt).toLocaleString()} | 
              Updated: {new Date(template.UpdatedAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Template: {templateName}</DialogTitle>
          <DialogDescription>
            View details for all workloads in this template
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading template details...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTemplateDetails}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && data && (
          <Tabs defaultValue="basics" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basics">
                Basics ({data.basics?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="infras">
                Infras ({data.infras?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="biz_services">
                Biz Services ({data.biz_services?.length || 0})
              </TabsTrigger>
            </TabsList>
            <div className="mt-4">
              <TabsContent value="basics" className="mt-0">
                <ScrollArea className="h-[60vh]">
                  {renderTemplateList(data.basics || [], "basic")}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="infras" className="mt-0">
                <ScrollArea className="h-[60vh]">
                  {renderTemplateList(data.infras || [], "infra")}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="biz_services" className="mt-0">
                <ScrollArea className="h-[60vh]">
                  {renderTemplateList(data.biz_services || [], "biz_service")}
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
