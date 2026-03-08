import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckCircle2, AlertTriangle, X, Info } from "lucide-react";

import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-20 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-[560px] -translate-x-1/2 flex-col gap-3 p-0 sm:top-24",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  [
    "group pointer-events-auto relative overflow-hidden rounded-[28px] border shadow-[0_20px_60px_-18px_rgba(15,23,42,0.22)] backdrop-blur-xl",
    "transition-all duration-300",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-80 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "border-emerald-200/80 bg-white/95 text-slate-900",
        destructive:
          "border-red-200/80 bg-white/95 text-slate-900",
        info:
          "border-blue-200/80 bg-white/95 text-slate-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, children, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      duration={5000}
      {...props}
    >
      <div className="absolute inset-x-0 top-0 h-1 origin-left animate-[toast-progress_5s_linear_forwards] bg-gradient-to-r from-emerald-500 via-blue-500 to-cyan-500 group-[.destructive]:from-red-500 group-[.destructive]:via-red-400 group-[.destructive]:to-rose-500 group-[.info]:from-blue-500 group-[.info]:via-cyan-500 group-[.info]:to-sky-500" />
      {children}
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    toast-close=""
    className={cn(
      "absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-ring",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-[28px] font-bold leading-tight tracking-[-0.02em] text-slate-900", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, children, ...props }, ref) => {
  const text =
    typeof children === "string" ? children.toLowerCase() : "";

  const isPredictionComplete =
    text.includes("results are ready to view") ||
    text.includes("prediction complete");

  return (
    <ToastPrimitives.Description
      ref={ref}
      className={cn("text-base leading-7 text-slate-600", className)}
      {...props}
    >
      <div className="space-y-3">
        <p>{children}</p>

        {isPredictionComplete && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <span>
                <span className="font-semibold text-amber-900">
                  Disclaimer:
                </span>{" "}
                This AI prediction is for informational purposes only and should
                not replace professional medical advice. Please consult a
                healthcare provider.
              </span>
            </div>
          </div>
        )}
      </div>
    </ToastPrimitives.Description>
  );
});
ToastDescription.displayName = ToastPrimitives.Description.displayName;

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;

const ToastIcon = ({
  variant = "default",
}: {
  variant?: "default" | "destructive" | "info";
}) => {
  if (variant === "destructive") {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
    );
  }

  if (variant === "info") {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
        <Info className="h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100">
      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
    </div>
  );
};

const ToastLayout = ({
  variant = "default",
  children,
}: {
  variant?: "default" | "destructive" | "info";
  children: React.ReactNode;
}) => {
  return (
    <div className="relative flex gap-4 px-6 py-6 pr-14">
      <ToastIcon variant={variant} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
};

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastLayout,
};