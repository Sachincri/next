"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  url?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb = ({ items, className }: BreadcrumbProps) => {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // If custom items are provided, use them
  if (items && items.length > 0) {
    return (
      <nav className={`flex items-center text-[13px] text-gray-500 dark:text-slate-400 space-x-0.5 overflow-hidden whitespace-nowrap ${className || ''}`}>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <div key={idx} className="flex items-center min-w-0">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-slate-600 mx-0.5 shrink-0" />}
              {isLast ? (
                <span className="text-gray-400 dark:text-slate-500 font-normal truncate" title={item.label}>
                  {item.label}
                </span>
              ) : item.url ? (
                <Link
                  href={item.url}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="shrink-0 text-gray-400 dark:text-slate-500">{item.label}</span>
              )}
            </div>
          );
        })}
      </nav>
    );
  }

  // Fallback to URL-based segments (original logic)
  return (
    <nav className={`flex items-center text-[13px] text-gray-400 dark:text-slate-500 space-x-0.5 ${className || ''}`}>
      <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
        Home
      </Link>

      {segments.map((segment, idx) => {
        const href = "/" + segments.slice(0, idx + 1).join("/");
        const isLast = idx === segments.length - 1;
        const label =
          isNaN(Number(segment))
            ? segment.charAt(0).toUpperCase() + segment.slice(1)
            : "Details";

        return (
          <div key={idx} className="flex items-center">
            <ChevronRight className="w-3 h-3 text-gray-400 dark:text-slate-600 mx-0.2" />
            {isLast ? (
              <span className="text-gray-400 dark:text-slate-500 font-normal">{label}</span>
            ) : (
              <Link
                href={href}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
