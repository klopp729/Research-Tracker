import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import ProjectView from "@/pages/ProjectView";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/Sidebar";
import { useState } from "react";

function Router() {
  // State to control mobile sidebar visibility
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated by making a test API call
    fetch('/api/projects')
      .then(res => {
        setIsAuthenticated(res.status !== 401);
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">研究計画管理システム</h1>
          <p className="text-gray-600 mb-4">続行するにはログインしてください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar (when opened) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="flex justify-end p-4">
            <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500">
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          <Sidebar onItemClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h1 className="text-lg font-semibold text-primary">研究計画管理</h1>
          <button 
            className="text-gray-500"
            onClick={() => setMobileMenuOpen(true)}
          >
            <i className="ri-menu-line text-xl"></i>
          </button>
        </div>

        {/* Routes */}
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/projects/:id" component={ProjectView} />
          <Route component={NotFound} />
        </Switch>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden flex justify-around items-center py-3 bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0">
          <button className="flex flex-col items-center justify-center text-primary">
            <i className="ri-list-check text-xl"></i>
            <span className="text-xs mt-1">タスク</span>
          </button>
          <button className="flex flex-col items-center justify-center text-gray-500">
            <i className="ri-calendar-line text-xl"></i>
            <span className="text-xs mt-1">カレンダー</span>
          </button>
          <button className="flex flex-col items-center justify-center text-gray-500">
            <i className="ri-bar-chart-horizontal-line text-xl"></i>
            <span className="text-xs mt-1">ガント</span>
          </button>
          <button className="flex flex-col items-center justify-center text-gray-500">
            <i className="ri-folder-line text-xl"></i>
            <span className="text-xs mt-1">プロジェクト</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
