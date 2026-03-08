import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastLayout,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const safeVariant =
          variant === "destructive" || variant === "info" ? variant : "default";

        return (
          <Toast key={id} variant={safeVariant} {...props}>
            <ToastLayout variant={safeVariant}>
              <div className="space-y-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action}
            </ToastLayout>
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}