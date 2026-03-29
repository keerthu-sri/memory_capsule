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
          <p className="text-slate-400 text-lg">{subtitle}</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="w-full bg-[#0f172a80] border border-[#33415580] rounded-2xl pl-12 pr-4 py-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#7919e6] transition-colors backdrop-blur-md"
        />
      </div>
    </div>
  );
};
