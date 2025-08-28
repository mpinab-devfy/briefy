export const STATIC_BREADCRUMB_MAP: Record<string, string> = {
  '': 'Início',
  projetos: 'Projetos',
  fluxogramas: 'Fluxogramas',
  configuracoes: 'Configurações',
  pr: 'PR',
  tasks: 'Tasks',
  flowchart: 'Fluxograma'
};

export interface BreadcrumbContext {
  selectedProject?: { id?: string; name?: string } | null;
  currentProject?: { id?: string; name?: string } | null;
}

// Default resolver: tries static map first, then context (project names), then fallback formatting
export async function defaultLabelResolver(
  segment: string,
  _index: number,
  pathname: string,
  context?: BreadcrumbContext
): Promise<string> {
  if (!segment) return 'Início';

  // Check static map
  if (STATIC_BREADCRUMB_MAP[segment]) return STATIC_BREADCRUMB_MAP[segment];

  // If segment matches selectedProject id or currentProject id, return its name
  if (context) {
    if (context.selectedProject && context.selectedProject.id === segment && context.selectedProject.name) {
      return context.selectedProject.name;
    }
    if (context.currentProject && context.currentProject.id === segment && context.currentProject.name) {
      return context.currentProject.name;
    }
  }

  // If pathname contains pattern /projetos/:id and this segment looks like an id, try to surface as "Projeto {id}"
  const isLikelyId = /^\d+$/.test(segment) || /^[0-9a-fA-F-]{6,}$/.test(segment);
  if (isLikelyId) {
    return `ID: ${segment}`;
  }

  // Fallback: transform kebab/camel case to human readable
  const transformed = segment
    .replace(/[-_]/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return transformed;
}


