import React from 'react';
import { Search } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  searchPlaceholder = "Search..."
}) => {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold mb-3 tracking-tight">{title}</h1>
          <p className="theme-muted text-lg">{subtitle}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 theme-muted" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="theme-input w-full rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[var(--app-accent)] transition-colors backdrop-blur-md"
        />
      </div>
    </div>
  );
};
