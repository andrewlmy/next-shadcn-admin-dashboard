"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, ArrowLeft, FileEdit, Trash2, Upload } from "lucide-react";
import { TmplateWorkloadEditorDialog } from "./template-workload-editor-dialog";

type Template = {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  name: string;
  workload_name: string;
  deploy_order: number;
  type: string;
  deploy_node: number;
  yaml_content: string;
};

type TemplateDetails = {
  basics: Template[] | null;
  infras: Template[] | null;
  biz_services: Template[] | null;
};

interface TemplateDetailsPageProps {
  templateName: string;
}

export function TemplateDetailsPage({
  templateName,
}: TemplateDetailsPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TemplateDetails | null>(null);
  const [yamlEditorOpen, setYamlEditorOpen] = useState(false);
  const [selectedWorkload, setSelectedWorkload] = useState<Template | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workloadToDelete, setWorkloadToDelete] = useState<Template | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingYaml, setUploadingYaml] = useState(false);
  const [uploadingWorkloadName, setUploadingWorkloadName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workloadForYamlUploadRef = useRef<Template | null>(null);

  useEffect(() => {
    fetchTemplateDetails();
  }, [templateName]);

  // Rerender from POST create workload response (no extra GET)
  useEffect(() => {
    const handler = (e: CustomEvent<{ templateName: string; data: TemplateDetails }>) => {
      if (e.detail?.templateName === templateName && e.detail?.data) {
        setData(e.detail.data);
      }
    };
    window.addEventListener('env-template-updated', handler as EventListener);
    return () => window.removeEventListener('env-template-updated', handler as EventListener);
  }, [templateName]);

  const fetchTemplateDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/env-templates/${templateName}`, {
        cache: "no-store", // Ensure refetch after Update YAML returns latest data
      });
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

  const handleEditYaml = async (template: Template) => {
    // Fetch the latest workload details including YAML content
    try {
      const response = await fetch(
        `/api/env-templates/${encodeURIComponent(templateName)}/workloads/${encodeURIComponent(template.workload_name)}`
      );
      if (response.ok) {
        const workloadData = await response.json();
        // Update the selected workload with the fetched data
        setSelectedWorkload({
          ...template,
          yaml_content: workloadData.yaml_content || template.yaml_content,
          deploy_order: workloadData.deploy_order ?? template.deploy_order,
          deploy_node: workloadData.deploy_node ?? template.deploy_node,
          type: workloadData.type || template.type,
        });
      } else {
        // If fetch fails, use the existing template data
        setSelectedWorkload(template);
      }
    } catch (err) {
      console.error('Failed to fetch workload details:', err);
      // If fetch fails, use the existing template data
      setSelectedWorkload(template);
    }
    setYamlEditorOpen(true);
  };

  const handleSaveYaml = async (data: {
    deployOrder: number;
    deployNode: number;
    type: string;
  }) => {
    if (!selectedWorkload) return;

    const response = await fetch(
      `/api/env-templates/${encodeURIComponent(templateName)}/workloads/${encodeURIComponent(selectedWorkload.workload_name)}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deploy_order: data.deployOrder,
          deploy_node: data.deployNode,
          type: data.type,
        }),
      }
    );

    if (!response.ok) {
      let errMsg = 'Failed to save';
      try {
        const text = await response.text();
        const data = JSON.parse(text);
        errMsg = data.error || errMsg;
      } catch {
        // non-JSON or empty body
      }
      throw new Error(errMsg);
    }

    // Refresh the template details after saving
    await fetchTemplateDetails();
  };

  const handleUpdateYamlClick = (template: Template) => {
    workloadForYamlUploadRef.current = template;
    fileInputRef.current?.click();
  };

  const handleYamlFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const workload = workloadForYamlUploadRef.current;
    workloadForYamlUploadRef.current = null;
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !workload) return;

    setUploadingYaml(true);
    setUploadingWorkloadName(workload.workload_name);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `/api/env-templates/${encodeURIComponent(templateName)}/workloads/${encodeURIComponent(workload.workload_name)}/yaml`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!response.ok) {
        let errMsg = "Failed to update YAML";
        try {
          const text = await response.text();
          const data = JSON.parse(text);
          errMsg = data.error || errMsg;
        } catch {
          // ignore
        }
        throw new Error(errMsg);
      }

      await fetchTemplateDetails();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update YAML");
    } finally {
      setUploadingYaml(false);
      setUploadingWorkloadName(null);
    }
  };

  const handleDeleteClick = (template: Template) => {
    setWorkloadToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workloadToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/env-templates/${encodeURIComponent(templateName)}/workloads/${encodeURIComponent(workloadToDelete.workload_name)}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete workload');
      }

      // Refresh the template details after deletion
      await fetchTemplateDetails();
      setDeleteDialogOpen(false);
      setWorkloadToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete workload");
    } finally {
      setDeleting(false);
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
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{template.workload_name}</h4>
                  <Badge variant="outline">{template.type}</Badge>
                  <Badge variant="secondary">Node {template.deploy_node}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Deploy Order: {template.deploy_order}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditYaml(template)}
                  className="gap-2"
                >
                  <FileEdit className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateYamlClick(template)}
                  disabled={uploadingYaml}
                  className="gap-2"
                >
                  {uploadingYaml && uploadingWorkloadName === template.workload_name ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Update YAML
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(template)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
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
    <div className="flex flex-1 flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept=".yaml,.yml"
        className="hidden"
        onChange={handleYamlFileSelect}
        aria-label="Choose YAML file"
      />
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/env_templates")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Template: {templateName}</h1>
            <p className="text-muted-foreground">
              View details for all workloads in this template
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading template details...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-16 px-4">
              <p className="text-destructive mb-4">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTemplateDetails}
              >
                Retry
              </Button>
            </div>
          )}

          {!loading && !error && data && (
            <div className="px-4 lg:px-6">
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
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      {renderTemplateList(data.basics || [], "basic")}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="infras" className="mt-0">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      {renderTemplateList(data.infras || [], "infra")}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="biz_services" className="mt-0">
                    <ScrollArea className="h-[calc(100vh-300px)]">
                      {renderTemplateList(data.biz_services || [], "biz_service")}
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      {/* YAML Editor Dialog */}
      {selectedWorkload && (
        <TmplateWorkloadEditorDialog
          templateName={templateName}
          workloadName={selectedWorkload.workload_name}
          deployOrder={selectedWorkload.deploy_order}
          deployNode={selectedWorkload.deploy_node}
          type={selectedWorkload.type}
          open={yamlEditorOpen}
          onOpenChange={setYamlEditorOpen}
          onSave={handleSaveYaml}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workload</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the workload{" "}
              <span className="font-semibold">
                {workloadToDelete?.workload_name}
              </span>{" "}
              from template <span className="font-semibold">{templateName}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
