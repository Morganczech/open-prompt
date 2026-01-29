"use client"; // Mark as a Client Component

/**
 * App component
 * Main application entry point that orchestrates contexts and components
 */

import React, { useEffect } from "react";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import { TreeProvider, useTreeContext } from "@/contexts/TreeContext";
import { PromptProvider } from "@/contexts/PromptContext";
import Sidebar from "@/components/Sidebar";
import PromptEditor from "@/components/PromptEditor";
import ComponentModal from "@/components/Modal/ComponentModal";
import SettingsModal from "@/components/Modal/SettingsModal";
import CommunityComponentsModal from "@/components/Modal/CommunityComponentsModal";
import MenuBar from '@/components/MenuBar';
import "./App.scss";

// Inner App component that uses the contexts
const AppContent: React.FC = () => {
  const { settings, setSettingsModalOpen, setCommunityModalOpen } = useAppContext();
  const { handleNodeDrop } = useTreeContext();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false); // Mobile sidebar state

  // Set up event listeners for drag and drop operations between tree and sections
  useEffect(() => {
    const handleNodeDropped = (e: CustomEvent) => {
      if (e.detail && e.detail.draggedNodeId && e.detail.targetNodeId) {
        handleNodeDrop(e.detail.draggedNodeId, e.detail.targetNodeId);
      }
    };

    // Listen for custom node-dropped event
    window.addEventListener('node-dropped' as any, handleNodeDropped as EventListener);

    return () => {
      window.removeEventListener('node-dropped' as any, handleNodeDropped as EventListener);
    };
  }, [handleNodeDrop]);

  // Apply theme from settings
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <main>
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />
      <div
        className={`mobile-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <PromptEditor />
      <MenuBar
        openSettings={() => setSettingsModalOpen(true)}
        openCommunityLibrary={() => setCommunityModalOpen(true)}
        toggleSidebar={toggleSidebar}
      />
      <ComponentModal />
      <SettingsModal />
      <CommunityComponentsModal />
    </main>
  );
};


// Root App component with context providers
const App: React.FC = () => {
  return (
    <AppProvider>
      <TreeProvider>
        <PromptProvider>
          <AppContent />
        </PromptProvider>
      </TreeProvider>
    </AppProvider>
  );
};

export default App;