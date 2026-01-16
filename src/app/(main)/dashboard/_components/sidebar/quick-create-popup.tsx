"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface QuickCreatePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickCreatePopup({ open, onOpenChange }: QuickCreatePopupProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [ipList, setIpList] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Service form state
  const [serviceName, setServiceName] = useState("");
  const [portNumber, setPortNumber] = useState("");
  const [allowPressureTest, setAllowPressureTest] = useState(false);
  
  // Extract the current section from the pathname
  const getCurrentLocation = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const section = segments[1]; // e.g., 'dashboard', 'auth', etc.
      const subsection = segments[2]; // e.g., 'biz-data', 'crm', etc.
      
      // Special handling for env_templates with template name
      if (section === 'dashboard' && subsection === 'env_templates' && segments[3]) {
        return `${section}/${subsection}/${segments[3]}`;
      }
      
      if (subsection) {
        return `${section}/${subsection}`;
      }
      return section;
    }
    return 'dashboard';
  };

  const currentLocation = getCurrentLocation();
  
  // Check if we're on specific pages
  const isHostsPage = pathname.includes('/dashboard/hosts');
  const isServicesPage = pathname.includes('/dashboard/services');
  const isEnvTemplatesPage = pathname.includes('/dashboard/env_templates/');
  const isPangaeaEnvsPage = pathname.includes('/dashboard/pangaea_envs');
  
  // Extract template name from pathname (e.g., /dashboard/env_templates/ql-test -> ql-test)
  const getTemplateName = () => {
    if (isEnvTemplatesPage) {
      const segments = pathname.split('/').filter(Boolean);
      const templateIndex = segments.indexOf('env_templates');
      if (templateIndex >= 0 && segments[templateIndex + 1]) {
        return segments[templateIndex + 1];
      }
    }
    return null;
  };
  
  const templateName = getTemplateName();
  
  // Workload form state
  const [workloadName, setWorkloadName] = useState("");
  const [workloadNode, setWorkloadNode] = useState("");
  const [workloadDeployOrder, setWorkloadDeployOrder] = useState("");
  const [workloadType, setWorkloadType] = useState("basic");

  // Pangaea Env form state
  const [envName, setEnvName] = useState("");
  const [envOwner, setEnvOwner] = useState("");
  const [configBranch, setConfigBranch] = useState("");
  const [envTemplate, setEnvTemplate] = useState("");
  const [requirements, setRequirements] = useState("");
  const [envTemplatesOptions, setEnvTemplatesOptions] = useState<{ id: number; name: string }[]>([]);
  const [configBranchOptions, setConfigBranchOptions] = useState<string[]>([]);

  // Fetch env templates and config branches when pangaea envs dialog opens
  useEffect(() => {
    if (open && isPangaeaEnvsPage) {
      fetch("/api/env-templates")
        .then((res) => (res.ok ? res.json() : []))
        .then((list: { id: number; name: string }[]) => setEnvTemplatesOptions(Array.isArray(list) ? list : []))
        .catch(() => setEnvTemplatesOptions([]));
      fetch("/api/config-branches")
        .then((res) => (res.ok ? res.json() : []))
        .then((branches: string[]) => setConfigBranchOptions(Array.isArray(branches) ? branches : []))
        .catch(() => setConfigBranchOptions([]));
    }
  }, [open, isPangaeaEnvsPage]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setWorkloadName("");
      setWorkloadNode("");
      setWorkloadDeployOrder("");
      setWorkloadType("basic");
      setEnvName("");
      setEnvOwner("");
      setConfigBranch("");
      setEnvTemplate("");
      setRequirements("");
    }
  }, [open]);
  
  const handleIpSubmit = async () => {
    if (!ipList.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Pushing IPs to server:', ipList);
      // Reset form and close dialog
      setIpList("");
      onOpenChange(false);
    } catch (error) {
      console.error('Error pushing IPs:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleServiceSubmit = async () => {
    if (!serviceName.trim() || !portNumber.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Creating service:', {
        name: serviceName,
        port: portNumber,
        allowPressureTest
      });
      // Reset form and close dialog
      setServiceName("");
      setPortNumber("");
      setAllowPressureTest(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePangaeaEnvSubmit = async () => {
    if (!envName.trim()) return;
    if (!envTemplate?.trim()) {
      alert("Please select an Env Template.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pangaea-envs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: envName.trim(),
          owner: envOwner.trim() || "",
          ads_template: envTemplate.trim(),
          config_branch: configBranch?.trim() || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || res.statusText);
      }
      setEnvName("");
      setEnvOwner("");
      setConfigBranch("");
      setEnvTemplate("");
      setRequirements("");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error creating pangaea env:", error);
      alert(error instanceof Error ? error.message : "Failed to create pangaea env");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkloadSubmit = async () => {
    if (!workloadName.trim() || !workloadNode.trim() || !workloadDeployOrder.trim() || !templateName) return;
    
    setIsSubmitting(true);
    try {
      const node = parseInt(workloadNode, 10);
      const deployOrder = parseInt(workloadDeployOrder, 10);
      
      if (isNaN(node) || isNaN(deployOrder)) {
        throw new Error('Node and Deploy Order must be valid numbers');
      }

      const response = await fetch(
        `/api/env-templates/${encodeURIComponent(templateName)}/workloads`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: workloadName.trim(),
            node: node,
            deploy_order: deployOrder,
            type: workloadType,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create workload');
      }

      const res = await response.json();
      // Rerender template details view with returned data (avoids extra GET)
      if (res.data && templateName) {
        window.dispatchEvent(
          new CustomEvent('env-template-updated', {
            detail: { templateName, data: res.data },
          })
        );
      }

      // Reset form and close dialog
      setWorkloadName("");
      setWorkloadNode("");
      setWorkloadDeployOrder("");
      setWorkloadType("basic");
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating workload:', error);
      alert(error instanceof Error ? error.message : 'Failed to create workload');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome!</DialogTitle>
          <DialogDescription>
            You are currently at: <span className="font-medium text-foreground">{currentLocation}</span>
          </DialogDescription>
        </DialogHeader>
        
        {isHostsPage ? (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Add Host IPs</CardTitle>
              <CardDescription>
                Enter a list of IP addresses to push to the server
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ip-list">IP Addresses</Label>
                <Textarea
                  id="ip-list"
                  placeholder="192.168.1.1&#10;192.168.1.2&#10;10.0.0.1&#10;..."
                  value={ipList}
                  onChange={(e) => setIpList(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-muted-foreground">
                  Enter one IP address per line
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleIpSubmit}
                  disabled={!ipList.trim() || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Pushing..." : "Push to Server"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : isServicesPage ? (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Create Service</CardTitle>
              <CardDescription>
                Add a new service to the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-name">Service Name</Label>
                <Input
                  id="service-name"
                  placeholder="e.g., web-server, api-gateway"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="port-number">Port Number</Label>
                <Input
                  id="port-number"
                  type="number"
                  placeholder="e.g., 8080, 3000"
                  value={portNumber}
                  onChange={(e) => setPortNumber(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pressure-test"
                  checked={allowPressureTest}
                  onCheckedChange={(checked) => setAllowPressureTest(checked as boolean)}
                />
                <Label htmlFor="pressure-test" className="text-sm">
                  Allow pressure test
                </Label>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleServiceSubmit}
                  disabled={!serviceName.trim() || !portNumber.trim() || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Creating..." : "Create Service"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : isPangaeaEnvsPage ? (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Create Pangaea Env</CardTitle>
              <CardDescription>
                Create a new pangaea environment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="env-name">Name of Env</Label>
                <Input
                  id="env-name"
                  placeholder="e.g., dev, staging"
                  value={envName}
                  onChange={(e) => setEnvName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="env-owner">Owner (optional)</Label>
                <Input
                  id="env-owner"
                  placeholder="e.g., your name"
                  value={envOwner}
                  onChange={(e) => setEnvOwner(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="config-branch">Config-lib branch</Label>
                <Select value={configBranch || undefined} onValueChange={setConfigBranch}>
                  <SelectTrigger id="config-branch">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {configBranchOptions.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="env-template">Env Template</Label>
                <Select value={envTemplate || undefined} onValueChange={setEnvTemplate}>
                  <SelectTrigger id="env-template">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {envTemplatesOptions.map((t) => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="Optional requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handlePangaeaEnvSubmit}
                  disabled={!envName.trim() || !envTemplate?.trim() || isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Creating..." : "Create Env"}
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : isEnvTemplatesPage && templateName ? (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Create Workload</CardTitle>
              <CardDescription>
                Add a new workload to template: <span className="font-medium">{templateName}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workload-name">Workload Name</Label>
                <Input
                  id="workload-name"
                  placeholder="e.g., sag-dsp-retrieve"
                  value={workloadName}
                  onChange={(e) => setWorkloadName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="workload-node">Node</Label>
                  <Input
                    id="workload-node"
                    type="number"
                    placeholder="e.g., 0, 1, 2, 3"
                    value={workloadNode}
                    onChange={(e) => setWorkloadNode(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workload-deploy-order">Deploy Order</Label>
                  <Input
                    id="workload-deploy-order"
                    type="number"
                    placeholder="e.g., 1, 2, 3"
                    value={workloadDeployOrder}
                    onChange={(e) => setWorkloadDeployOrder(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="workload-type">Type</Label>
                <Select value={workloadType} onValueChange={setWorkloadType}>
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
              <div className="flex gap-2">
                <Button 
                  onClick={handleWorkloadSubmit}
                  disabled={
                    !workloadName.trim() || 
                    !workloadNode.trim() || 
                    !workloadDeployOrder.trim() || 
                    isSubmitting
                  }
                  className="flex-1"
                >
                  {isSubmitting ? "Creating..." : "Create Workload"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Create</CardTitle>
              <CardDescription>
                What would you like to create?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col items-center gap-1">
                  <span className="text-xs">📊</span>
                  <span className="text-xs">Dashboard</span>
                </Button>
                <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col items-center gap-1">
                  <span className="text-xs">📈</span>
                  <span className="text-xs">Report</span>
                </Button>
                <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col items-center gap-1">
                  <span className="text-xs">👥</span>
                  <span className="text-xs">User</span>
                </Button>
                <Button variant="outline" size="sm" className="h-auto p-3 flex flex-col items-center gap-1">
                  <span className="text-xs">⚙️</span>
                  <span className="text-xs">Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
