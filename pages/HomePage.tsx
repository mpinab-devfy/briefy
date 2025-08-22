import React from 'react';
import InteractiveOnboarding from '../components/InteractiveOnboarding';
import { ProcessingSession } from '../types';
import { Project } from '../lib/supabase';

interface HomePageProps {
  user: any;
  currentProject: Project | null;
  currentSession: ProcessingSession | null;
  onStartSession: () => void;
  onCreateProject: (projectName: string, mode: 'briefy' | 'manual') => void;
  onProjectCreated: (project: Project, scope: any) => void;
  onUpdateSession: (session: ProcessingSession) => void;
  onCreateNewProject: () => void;
  onProjectSelected: (project: Project, contentType?: 'pr' | 'tasks' | 'flowchart') => void;
}

const HomePage: React.FC<HomePageProps> = ({
  user,
  currentProject,
  currentSession,
  onStartSession,
  onCreateProject,
  onProjectCreated,
  onUpdateSession,
  onCreateNewProject,
  onProjectSelected
}) => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid xl:grid-cols-1 lg:grid-cols-1 gap-8 items-center justify-items-center">
          <div className="xl:col-span-2 lg:col-span-1 w-full max-w-4xl">
            <InteractiveOnboarding
              onStartSession={onStartSession}
              onCreateProject={onCreateProject}
              onProjectCreated={onProjectCreated}
              currentSession={currentSession || undefined}
              onUpdateSession={onUpdateSession}
              currentProject={currentProject}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
