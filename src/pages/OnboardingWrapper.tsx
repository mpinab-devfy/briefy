import React from 'react';
import { useParams } from 'react-router-dom';
import InteractiveOnboarding from '../components/InteractiveOnboarding';
import { ProcessingSession } from '../types';
import { Project } from '../lib/supabase';

interface OnboardingWrapperProps {
  onStartSession: () => void;
  onCreateProject: (projectName: string, mode: 'briefy' | 'manual') => void;
  onProjectCreated: (project: Project, scope: any) => void;
  currentSession?: ProcessingSession | null;
  onUpdateSession: (session: ProcessingSession) => void;
  currentProject?: Project | null;
}

const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({
  onStartSession,
  onCreateProject,
  onProjectCreated,
  currentSession,
  onUpdateSession,
  currentProject
}) => {
  const { mode } = useParams<{ mode?: string }>();

  // We render the InteractiveOnboarding component directly. The component
  // itself handles internal mode state, but navigation is provided by the
  // component when users click a mode. This wrapper exists so the route
  // /onboarding/:mode is a first-class route and breadcrumbs update
  // correctly while keeping the HomePage header hidden.

  return (
    <div className="min-h-[calc(100vh-200px)] px-4 py-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Optional small heading for onboarding pages */}
        <div className="mb-6">
          {/* Keep the global breadcrumb (in MainLayout) responsible for context */}
        </div>

        <InteractiveOnboarding
          onStartSession={onStartSession as any}
          onCreateProject={onCreateProject as any}
          onProjectCreated={onProjectCreated as any}
          currentSession={currentSession || undefined}
          onUpdateSession={onUpdateSession as any}
          currentProject={currentProject}
        />
      </div>
    </div>
  );
};

export default OnboardingWrapper;


