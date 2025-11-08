"use client";

import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error";

interface NotificationToastProps {
  message: string;
  variant?: ToastVariant;
  onDismiss: () => void;
  autoHideMs?: number;
}

export function NotificationToast({ message, variant = "success", onDismiss, autoHideMs = 6000 }: NotificationToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, autoHideMs);
    return () => window.clearTimeout(timer);
  }, [onDismiss, autoHideMs]);

  const Icon = variant === "success" ? CheckCircle2 : AlertTriangle;

  return (
    <div
      className={cn(
        "pointer-events-auto inline-flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg",
        variant === "success"
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
          : "border-red-500/40 bg-red-500/10 text-red-200"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm font-medium">{message}</span>
      <Button type="button" variant="ghost" size="sm" className="h-auto px-2" onClick={onDismiss}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
