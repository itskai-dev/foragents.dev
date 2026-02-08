"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useToast, type Toast } from "@/contexts/toast-context";

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-[#06D6A0]/10",
    borderColor: "border-[#06D6A0]",
    iconColor: "text-[#06D6A0]",
    progressColor: "bg-[#06D6A0]",
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-[#EC4899]/10",
    borderColor: "border-[#EC4899]",
    iconColor: "text-[#EC4899]",
    progressColor: "bg-[#EC4899]",
  },
  info: {
    icon: Info,
    bgColor: "bg-[#3B82F6]/10",
    borderColor: "border-[#3B82F6]",
    iconColor: "text-[#3B82F6]",
    progressColor: "bg-[#3B82F6]",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-[#F59E0B]/10",
    borderColor: "border-[#F59E0B]",
    iconColor: "text-[#F59E0B]",
    progressColor: "bg-[#F59E0B]",
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToast();
  const [progress, setProgress] = useState(100);
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const duration = toast.duration || 3000;

  useEffect(() => {
    if (duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div
      className={`relative flex items-start gap-3 rounded-lg border ${config.borderColor} ${config.bgColor} backdrop-blur-sm p-4 shadow-lg transition-all duration-300 ease-out animate-slideInRight min-w-[320px] max-w-[420px]`}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
      <p className="flex-1 text-sm text-foreground leading-relaxed">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/20 rounded-b-lg overflow-hidden">
          <div
            className={`h-full ${config.progressColor} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
