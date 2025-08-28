import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, History, Settings } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

interface MainLayoutProps {
  children: React.ReactNode;
  // Optional context passed from App for resolving dynamic labels
  breadcrumbContext?: import('../lib/breadcrumbs').BreadcrumbContext;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, breadcrumbContext }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Breadcrumbs fixed to top, spanning content area to the right of the sidebar
          Do not render on the Projects page (we want the Projects page to use its own header layout) */}
      {location.pathname !== '/projetos' && (
        <div className="fixed top-0 left-64 right-0 z-20">
          <Breadcrumbs context={breadcrumbContext} />
        </div>
      )}
      {/* Navigation - Only show when authenticated */}
      <nav className="bg-white shadow-sm fixed top-0 left-0 h-full w-64 border-r border-gray-200 z-10">
        {/* Logo Section */}
        <div className="flex items-center justify-center py-6 px-4 border-b border-gray-200">
          <img
            src="https://devfy.co/wp-content/uploads/2024/07/Logo-1.png"
            alt="Briefy Logo"
            className="w-32 h-32 object-contain"
          />
        </div>

        <div className="flex flex-col py-6 px-4 space-y-2">
          <button
            onClick={() => handleNavigation('/')}
            className={`flex items-center py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
              location.pathname === '/'
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Home className="w-5 h-5 mr-3" />
            Início
          </button>

          <button
            onClick={() => handleNavigation('/projetos')}
            className={`flex items-center py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
              location.pathname === '/projetos'
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <History className="w-5 h-5 mr-3" />
            Projetos
          </button>



          <button
            onClick={() => handleNavigation('/configuracoes')}
            className={`flex items-center py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
              location.pathname === '/configuracoes'
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Configurações
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 ml-64 mr-0 pt-28 px-12 pb-12 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
