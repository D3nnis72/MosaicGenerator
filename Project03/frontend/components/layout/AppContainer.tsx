import { cn } from "@/lib/utils";

interface AppContainerProps {
  className?: string;
  children: React.ReactNode;
}

export function AppContainer({ className, children }: AppContainerProps) {
  return (
    <div className={cn("mx-auto max-w-6xl px-6 py-10 lg:py-14", className)}>
      {children}
    </div>
  );
}
