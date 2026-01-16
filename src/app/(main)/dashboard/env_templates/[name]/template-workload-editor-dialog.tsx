"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface TemplateWorkloadEditorDialogProps {
  templateName: string;
  workloadName: string;
  deployOrder: number;
  deployNode: number;
  type: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    deployOrder: number;
    deployNode: number;
    type: string;
  }) => Promise<void>;
}

export function TmplateWorkloadEditorDialog({
  templateName,
  workloadName,
  deployOrder: initialDeployOrder,
  deployNode: initialDeployNode,
  type: initialType,
  open,
  onOpenChange,
  onSave,
}: TemplateWorkloadEditorDialogProps) {
  const [deployOrder, setDeployOrder] = useState(String(initialDeployOrder));
  const [deployNode, setDeployNode] = useState(String(initialDeployNode));
  const [type, setType] = useState(initialType);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDeployOrder(String(initialDeployOrder));
      setDeployNode(String(initialDeployNode));
      setType(initialType);
      setError(null);
    }
  }, [open, initialDeployOrder, initialDeployNode, initialType, workloadName]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const order = parseInt(deployOrder, 10);
      const node = parseInt(deployNode, 10);

      if (isNaN(order) || isNaN(node)) {
        throw new Error("Deploy Order and Node must be valid numbers");
      }

      await onSave({
        deployOrder: order,
        deployNode: node,
        type,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit: {workloadName}</DialogTitle>
          <DialogDescription>
            Template: {templateName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deploy-order">Deploy Order</Label>
              <Input
                id="deploy-order"
                type="number"
                value={deployOrder}
                onChange={(e) => setDeployOrder(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deploy-node">Node</Label>
              <Input
                id="deploy-node"
                type="number"
                value={deployNode}
                onChange={(e) => setDeployNode(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workload-type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger id="workload-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="infra">Infra</SelectItem>
                  <SelectItem value="biz_service">Biz Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
