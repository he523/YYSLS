"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Application {
  id: string;
  applicantName: string;
  contactInfo: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

const STATUS_CONFIG = {
  pending: { label: "待审批", variant: "secondary" as const, icon: Clock },
  approved: { label: "已通过", variant: "default" as const, icon: CheckCircle },
  rejected: { label: "已拒绝", variant: "destructive" as const, icon: XCircle },
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/applications");
      if (res.ok) {
        setApplications(await res.json());
      }
    } catch {
      // 后端未就绪
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setProcessing(id);
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "approve" ? "approved" : "rejected" }),
      });

      if (!res.ok) throw new Error("操作失败");

      toast.success(action === "approve" ? "已通过" : "已拒绝");
      fetchApplications();
    } catch {
      toast.error("操作失败，请重试");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">申请审批</h1>
        <p className="text-muted-foreground text-sm mt-1">
          处理入会申请
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            暂无申请
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {applications.map(app => {
            const config = STATUS_CONFIG[app.status];
            const Icon = config.icon;
            return (
              <Card key={app.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{app.applicantName}</CardTitle>
                      <CardDescription className="mt-0.5">
                        联系方式：{app.contactInfo} · {new Date(app.createdAt).toLocaleDateString("zh-CN")}
                      </CardDescription>
                    </div>
                    <Badge variant={config.variant}>
                      <Icon className="size-3" />
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3">
                    {app.reason}
                  </p>

                  {app.status === "pending" && (
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleAction(app.id, "approve")}
                        disabled={processing === app.id}
                      >
                        {processing === app.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CheckCircle className="size-4" />
                        )}
                        通过
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(app.id, "reject")}
                        disabled={processing === app.id}
                      >
                        <XCircle className="size-4" />
                        拒绝
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
