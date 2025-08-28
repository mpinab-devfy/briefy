import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { defaultLabelResolver, STATIC_BREADCRUMB_MAP, BreadcrumbContext } from '../lib/breadcrumbs';

interface BreadcrumbsProps {
  maxItems?: number;
  separator?: React.ReactNode;
  labelResolver?: (segment: string, index: number, pathname: string, context?: BreadcrumbContext) => Promise<string> | string;
  staticMap?: Record<string, string>;
  context?: BreadcrumbContext;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  maxItems = 4,
  separator,
  labelResolver,
  staticMap,
  context
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const segments = React.useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    // Include root as empty string to map to Início
    return [''].concat(parts);
  }, [pathname]);

  const [labels, setLabels] = React.useState<string[]>([]);

  React.useEffect(() => {
    let mounted = true;
    const resolver = labelResolver || defaultLabelResolver;

    Promise.all(
      segments.map((seg, idx) => {
        // staticMap precedence
        if (staticMap && staticMap[seg]) return Promise.resolve(staticMap[seg]);
        if (STATIC_BREADCRUMB_MAP[seg]) return Promise.resolve(STATIC_BREADCRUMB_MAP[seg]);
        const res = resolver(seg, idx, pathname, context);
        return Promise.resolve(res);
      })
    ).then((resolved) => {
      if (mounted) setLabels(resolved as string[]);
    });

    return () => {
      mounted = false;
    };
  }, [segments.join('/'), labelResolver, staticMap, pathname, context]);

  const items = segments.map((seg, idx) => {
    const to = '/' + segments.slice(1, idx + 1).join('/');
    const label = labels[idx] || seg || 'Início';
    return { seg, idx, to: to === '/' ? '/' : to, label };
  });

  const visibleItems = items;
  const sep = separator || <ChevronRight className="w-4 h-4 text-gray-400" />;

  return (
    <div className="w-full bg-white py-8 border-b border-gray-200">
      <div className="w-full pl-8 pr-6">
        <nav aria-label="Breadcrumb" className="mb-0">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
          {visibleItems.map((it, i) => {
            const isLast = i === visibleItems.length - 1;
            return (
              <li key={`${it.seg}-${i}`} className="flex items-center">
                {!isLast ? (
                  <button
                    onClick={() => navigate(it.to)}
                    className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none focus:underline"
                  >
                    {it.label}
                  </button>
                ) : (
                  <span aria-current="page" className="text-sm text-gray-800 font-medium">
                    {it.label}
                  </span>
                )}

                {i < visibleItems.length - 1 && <span className="mx-2">{sep}</span>}
              </li>
            );
          })}
        </ol>
      </nav>
      </div>
    </div>
  );
};

export default Breadcrumbs;


