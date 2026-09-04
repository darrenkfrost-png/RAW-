import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-12 relative z-50">
      <Link 
        to="/" 
        className="flex items-center gap-2 text-meta-premium opacity-40 hover:opacity-100 transition-opacity group"
        aria-label="Home"
      >
        <Home className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <ChevronRight className="w-3 h-3 text-red-500/40" />
          {item.path && !item.active ? (
            <Link 
              to={item.path}
              className="font-mono text-[0.6875rem] text-meta-premium opacity-40 hover:opacity-100 transition-opacity uppercase tracking-[0.2em]"
            >
              {item.label}
            </Link>
          ) : (
            <span 
              aria-current="page"
              className="font-mono text-[0.6875rem] text-red-500 font-black uppercase tracking-[0.2em] drop-shadow-[0_0_8px_#dc2626]"
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
