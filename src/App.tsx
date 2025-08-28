import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { ProcessingSession } from './types';
import { Project, projects } from './lib/supabase';
import { saveGeneratedContent } from './services/projectContentService';
import { HomePage, ProjectsPage, FlowchartsPage, SettingsPage } from './pages';
import OnboardingWrapper from './pages/OnboardingWrapper';
import { MainLayout } from './layouts';

function App() {
  // Authentication states
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Project states
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectContent, setSelectedProjectContent] = useState<{
    project: Project;
    contentType: 'pr' | 'tasks' | 'flowchart';
  } | null>(null);

  // New states for advanced features
  const [currentSession, setCurrentSession] = useState<ProcessingSession | null>(null);



  // New handlers for advanced features
  const handleStartSession = () => {
    const newSession: ProcessingSession = {
      id: `session-${Date.now()}`,
      title: 'Nova Sessão de Processamento',
      description: 'Sessão criada automaticamente',
      status: 'preparing',
      currentStep: 'Preparação do Material',
      documents: [],
      videos: [],
      supportMaterials: {
        tasks: {
          id: 'default-tasks',
          name: 'Material de Apoio - Tasks',
          type: 'tasks',
          content: 'Material padrão para geração de tasks',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        flowchart: {
          id: 'default-flowchart',
          name: 'Material de Apoio - Fluxograma',
          type: 'flowchart',
          content: 'Material padrão para geração de fluxograma',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        pr: {
          id: 'default-pr',
          name: 'Material de Apoio - PR',
          type: 'pr',
          content: 'Material padrão para geração de PR',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCurrentSession(newSession);
  };

  const handleUpdateSession = (session: ProcessingSession) => {
    setCurrentSession(session);
  };

  // Project handlers
  const handleCreateProject = (projectName: string, mode: 'briefy' | 'manual') => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: projectName,
      description: `Projeto criado via ${mode === 'briefy' ? 'Briefy' : 'Manual'}`,
      user_id: user?.id || 'current-user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCurrentProject(newProject);
    console.log(`Projeto criado: ${projectName} no modo ${mode}`);
  };

  const handleProjectCreated = async (project: Project, scope: any) => {
    console.log('Projeto sendo processado:', project);
    console.log('Dados do scope:', scope);

    let savedProject = project;

    try {
      // Salvar o projeto no banco de dados primeiro
      const { data: dbProject, error } = await projects.create(project.name, project.description);

      if (error) {
        console.error('Erro ao salvar projeto no banco:', error);
        // Mesmo com erro, continuar com o fluxo para não bloquear o usuário
      } else {
        console.log('Projeto salvo no banco:', dbProject);
        savedProject = dbProject;
        setCurrentProject(dbProject);
      }

      // Salvar o conteúdo gerado (PR, fluxograma, tasks) no banco
      if (scope && savedProject) {
        try {
          console.log('Salvando conteúdo gerado no banco...');

          // Preparar dados no formato esperado pelo saveGeneratedContent
          const generatedContent = {
            pr: scope.pr || '',
            flowchart: scope.flowchart || { nodes: [], edges: [] },
            epics: scope.epics || [],
            tasks: scope.tasks || []
          };

          const saveResult = await saveGeneratedContent(savedProject.id, generatedContent, {
            savePR: true,
            saveFlowchart: true,
            saveTasks: true
          });

          if (saveResult.success) {
            console.log('✅ Conteúdo salvo com sucesso:', {
              pr: !!saveResult.pr,
              flowchart: !!saveResult.flowchart,
              epics: saveResult.epics?.length || 0,
              tasks: saveResult.tasks?.length || 0
            });
          } else {
            console.error('❌ Erro ao salvar conteúdo:', saveResult.errors);
          }
        } catch (contentError) {
          console.error('❌ Erro ao salvar conteúdo gerado:', contentError);
        }
      }

    } catch (error) {
      console.error('Erro crítico ao processar projeto:', error);
    }

    console.log('Projeto criado com sucesso:', savedProject);

    // Navegar automaticamente para a página do projeto após criação
    setTimeout(() => {
      window.location.href = '/projetos';
    }, 1000); // Pequeno delay para permitir que o usuário veja a confirmação
  };





  // Authentication handlers
  const handleLoginSuccess = (authUser: any) => {
    setUser(authUser);
    setIsAuthenticated(true);
  };

  // Login Screen - Only show when not authenticated (exclusive page)
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Component that uses navigation hooks
  const AppWithNavigation = () => {
    const navigate = useNavigate();

    const handleProjectSelectedWithNav = (project: Project, contentType?: 'pr' | 'tasks' | 'flowchart') => {
      console.log('App: handleProjectSelectedWithNav called', { project: project.name, contentType });

      if (contentType) {
        console.log('App: setting selected project content');
        // Set the selected project content to show in the current page
        setSelectedProjectContent({ project, contentType });
        setSelectedProject(null); // Clear selected project since we have content

        // Navigate based on content type
        switch (contentType) {
          case 'pr':
            // Navigate to projects page to show PR content
            navigate('/projetos');
            break;
          case 'tasks':
            // Navigate to projects page to show tasks content
            navigate('/projetos');
            break;
          case 'flowchart':
            // Stay on projects page to show flowchart content
            navigate('/projetos');
            break;
          default:
            navigate('/projetos');
            break;
        }
      } else {
        console.log('App: setting selected project (no content type)');
        // Just set the selected project - this will show the content selection screen
        setSelectedProject(project);
        setSelectedProjectContent(null); // Clear any previous content selection
        navigate('/projetos');
      }
    };

    const handleCreateNewProjectWithNav = () => {
      navigate('/');
    };

    return (
      <MainLayout breadcrumbContext={{ selectedProject: selectedProject ?? undefined, currentProject: currentProject ?? undefined }}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                user={user}
                currentProject={currentProject}
                currentSession={currentSession}
                onStartSession={handleStartSession}
                onCreateProject={handleCreateProject}
                onProjectCreated={handleProjectCreated}
                onUpdateSession={handleUpdateSession}
                onCreateNewProject={handleCreateNewProjectWithNav}
                onProjectSelected={handleProjectSelectedWithNav}
              />
            }
          />

          <Route
            path="/projetos"
            element={
              <ProjectsPage
                user={user}
                onProjectSelected={handleProjectSelectedWithNav}
                onCreateNewProject={handleCreateNewProjectWithNav}
                selectedProject={selectedProject}
                selectedProjectContent={selectedProjectContent}
                onBack={() => {
                  console.log('App: onBack called');
                  if (selectedProjectContent) {
                    console.log('App: clearing selectedProjectContent');
                    setSelectedProjectContent(null);
                  } else if (selectedProject) {
                    console.log('App: clearing selectedProject');
                    setSelectedProject(null);
                  }
                }}
              />
            }
          />

          <Route
            path="/fluxogramas"
            element={
              <FlowchartsPage
                user={user}
                onProjectSelected={handleProjectSelectedWithNav}
              />
            }
          />

          {/* Onboarding routes for breadcrumb & header control */}
          <Route
            path="/onboarding/:mode"
            element={<OnboardingWrapper
              onStartSession={handleStartSession}
              onCreateProject={handleCreateProject}
              onProjectCreated={handleProjectCreated}
              currentSession={currentSession}
              onUpdateSession={handleUpdateSession}
              currentProject={currentProject}
            />}
          />

          <Route
            path="/configuracoes"
            element={<SettingsPage />}
          />

          {/* Redirect to home for any unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    );
  };

  return (
    <Router>
      <AppWithNavigation />
    </Router>
  );
}

export default App;
