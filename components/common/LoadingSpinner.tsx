// components/ui/LoadingSpinner.tsx
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
  spinnerClassName?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function LoadingSpinner({
  text = "Cargando...",
  className,
  spinnerClassName,
  textClassName,
  size = "md",
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex h-full items-center justify-center", className)}>
      <div className="text-center">
        <div
          className={cn(
            "animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4",
            sizeClasses[size],
            spinnerClassName,
          )}
        />
        <p className={cn("text-muted-foreground", textClassName)}>{text}</p>
      </div>
    </div>
  );
}
