import React from 'react';
import ProjectList from '../components/ProjectList';
import ProjectPR from '../components/ProjectPR';
import ProjectTasks from '../components/ProjectTasks';
import ProjectFlowchart from '../components/ProjectFlowchart';
import { Project } from '../lib/supabase';

interface ProjectsPageProps {
  user: any;
  onProjectSelected: (project: Project, contentType?: 'pr' | 'tasks' | 'flowchart') => void;
  onCreateNewProject: () => void;
  selectedProject?: Project | null;
  selectedProjectContent?: {
    project: Project;
    contentType: 'pr' | 'tasks' | 'flowchart';
  } | null;
  onBack?: () => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({
  user,
  onProjectSelected,
  onCreateNewProject,
  selectedProject,
  selectedProjectContent,
  onBack
}) => {
  console.log('ProjectsPage: Component rendered', {
    userId: user?.id,
    selectedProjectId: selectedProject?.id,
    selectedProjectContentType: selectedProjectContent?.contentType,
    hasOnBack: !!onBack
  });


  const handleBackToProjectSelection = React.useCallback(() => {
    console.log('ProjectsPage: handleBackToProjectSelection called');
    // Limpa o selectedProjectContent para voltar para a seleção de conteúdo
    if (onBack) {
      onBack();
    }
  }, [onBack]);

  // If there's selected project content, show that specific content
  if (selectedProjectContent) {
    switch (selectedProjectContent.contentType) {
      case 'pr':
        return <ProjectPR project={selectedProjectContent.project} onBack={handleBackToProjectSelection} />;
      case 'tasks':
        return <ProjectTasks project={selectedProjectContent.project} onBack={handleBackToProjectSelection} />;
      case 'flowchart':
        return <ProjectFlowchart project={selectedProjectContent.project} onBack={handleBackToProjectSelection} />;
      default:
        return <ProjectList user={user} onProjectSelected={onProjectSelected} onCreateNewProject={onCreateNewProject} />;
    }
  }

  // If there's a selected project but no content, show the content selection
  if (selectedProject) {
    return (
      <div className="min-h-[calc(100vh-200px)]">
        <ProjectList
          user={user}
          onProjectSelected={onProjectSelected}
          onCreateNewProject={onCreateNewProject}
          selectedProject={selectedProject}
          showContentSelection={true}
        />
      </div>
    );
  }

  // Default: show project list
  return (
    <div className="min-h-[calc(100vh-200px)]">
      <ProjectList
        user={user}
        onProjectSelected={onProjectSelected}
        onCreateNewProject={onCreateNewProject}
      />
    </div>
  );
};

export default ProjectsPage;
