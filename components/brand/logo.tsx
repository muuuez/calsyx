import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-12 w-12 text-lg",
} as const;

export function Logo({ size = "md", className }: LogoProps): React.ReactElement {
  const sizeClass = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border border-neutral-300 bg-white font-semibold text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50",
        sizeClass,
        className
      )}
    >
      {/* Replace this with your actual logo image */}
      {/* 
        Example:
        <Image 
          src="/logo.svg" 
          alt="Calsyx logo" 
          width={32} 
          height={32}
          className="h-full w-full object-contain"
        />
      */}
      C
    </div>
  );
}
