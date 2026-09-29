import React, { useState } from 'react';
import CustomCursor from './components/CustomCursor';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import DashboardView from './pages/DashboardView';
import ProjectOverviewView from './pages/ProjectOverviewView';
import ErrorsView from './pages/ErrorsView';
import RepairProcessView from './pages/RepairProcessView';
import TestResultsView from './pages/TestResultsView';
import ActivityLogsView from './pages/ActivityLogsView';
import HindsightView from './pages/HindsightView';
import ShowcaseGridView from './pages/ShowcaseGridView';

export default function App() {
  const [activeTab, setActiveTab] = useState('showcase');
  const [activeProject, setActiveProject] = useState('ecommerce');
  const [selectedError, setSelectedError] = useState(null);

  const handleSelectError = (error) => {
    setSelectedError(error);
    setActiveTab('repairs');
  };

  const handleStartAnalysis = () => {
    setActiveTab('dashboard');
  };

  if (activeTab === 'landing') {
    return (
      <>
        <CustomCursor />
        <LandingPage onStartAnalysis={handleStartAnalysis} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0b0f17] text-slate-100 font-sans">
      <CustomCursor />
      
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <Navbar 
          activeProject={activeProject} 
          setActiveProject={setActiveProject} 
          onAnalyzeClick={handleStartAnalysis} 
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {activeTab === 'showcase' && <ShowcaseGridView onNavigate={setActiveTab} />}
          {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
          {activeTab === 'projects' && <ProjectOverviewView onStartAnalysis={handleStartAnalysis} />}
          {activeTab === 'code-analysis' && <ProjectOverviewView onStartAnalysis={handleStartAnalysis} />}
          {activeTab === 'errors' && <ErrorsView onSelectError={handleSelectError} />}
          {activeTab === 'repairs' && <RepairProcessView onBackToErrors={() => setActiveTab('errors')} />}
          {activeTab === 'test-results' && <TestResultsView />}
          {activeTab === 'activity-logs' && <ActivityLogsView />}
          {activeTab === 'hindsight' && <HindsightView />}
          {activeTab === 'settings' && <ProjectOverviewView onStartAnalysis={handleStartAnalysis} />}
        </main>
      </div>
    </div>
  );
}
