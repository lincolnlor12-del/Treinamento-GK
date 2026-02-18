
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, UserCircle } from 'lucide-react';
import { NAVIGATION } from './constants';
import Dashboard from './pages/Dashboard';
import GoalkeeperList from './pages/GoalkeeperList';
import CoachPage from './pages/CoachPage';
import EvaluationPage from './pages/EvaluationPage';
import TrainingPage from './pages/TrainingPage';
import ScoutPage from './pages/ScoutPage';
import ReportsPage from './pages/ReportsPage';
import InterdisciplinaryPage from './pages/InterdisciplinaryPage';
import { GoalkeeperProvider } from './context/GoalkeeperContext';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (o: boolean) => void }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className={`
        fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 transition duration-200 ease-in-out z-30
        w-64 bg-black border-r border-gray-800 flex flex-col
      `}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 gold-gradient rounded-full flex items-center justify-center font-bold text-black text-xl shadow-lg">
            GK
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold leading-tight">GK PERFORMANCE</span>
            <span className="gold-text text-xs tracking-widest font-semibold uppercase">PRO</span>
          </div>
        </div>

        <nav className="mt-6 flex-1 px-4 space-y-1">
          {NAVIGATION.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-gray-900 to-black text-white border border-gray-800 shadow-md' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'}
                `}
              >
                <span className={isActive ? 'gold-text' : ''}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.name}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-gray-600" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
              <UserCircle size={20} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-white truncate">Treinador Principal</span>
              <span className="text-xs text-gray-500 truncate">Elite Academy</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const Header = ({ onOpenSidebar }: { onOpenSidebar: () => void }) => {
  return (
    <header className="h-16 border-b border-gray-800 bg-black/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <button 
        onClick={onOpenSidebar}
        className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white"
      >
        <Menu size={24} />
      </button>
      
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold text-white hidden sm:block">Painel de Controle</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Sistema Ativo</span>
        </div>
      </div>
    </header>
  );
};

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <GoalkeeperProvider>
      <HashRouter>
        <div className="flex h-screen bg-black overflow-hidden">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <Header onOpenSidebar={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-black">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/goleiros" element={<GoalkeeperList />} />
                <Route path="/treinadores" element={<CoachPage />} />
                <Route path="/avaliacoes" element={<EvaluationPage />} />
                <Route path="/treinamentos" element={<TrainingPage />} />
                <Route path="/scout" element={<ScoutPage />} />
                <Route path="/interdisciplinar" element={<InterdisciplinaryPage />} />
                <Route path="/relatorios" element={<ReportsPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </HashRouter>
    </GoalkeeperProvider>
  );
};

export default App;
