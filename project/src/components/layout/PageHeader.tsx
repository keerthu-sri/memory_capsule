import React from 'react';
import { Search } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

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
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchText, setSearchText] = React.useState(searchParams.get("q") || "");

  React.useEffect(() => {
    setSearchText(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = () => {
    const q = searchText.trim();
    navigate(q ? `${location.pathname}?q=${encodeURIComponent(q)}` : location.pathname);
  };

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
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") handleSearch();
          }}
          className="theme-input w-full rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[var(--app-accent)] transition-colors backdrop-blur-md"
        />
      </div>
    </div>
  );
};
