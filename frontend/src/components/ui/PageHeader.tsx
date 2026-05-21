import { type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-slide-up",
        className
      )}
    >
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
          {Icon && (
            <span className="p-2.5 rounded-xl bg-gradient-to-br from-sky-500/15 to-indigo-500/15 text-sky-600 dark:text-sky-400">
              <Icon className="w-7 h-7" />
            </span>
          )}
          <span className="gradient-text">{title}</span>
        </h1>
        {subtitle && (
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
