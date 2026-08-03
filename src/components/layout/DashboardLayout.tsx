import React, { ReactElement, ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';

type DashboardLayoutProps = {
  children: ReactNode;
  sidebar: ReactElement; // Changed to ReactElement to allow cloning
};

const DashboardLayout = ({ children, sidebar }: DashboardLayoutProps) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Clone the sidebar to inject the onLinkClick prop
  const sidebarWithClickHandler = React.cloneElement(sidebar, {
    onLinkClick: () => setIsMobileSidebarOpen(false),
  });

  return (
    <div className="min-h-screen flex bg-[#09090b] text-zinc-100">
      {/* --- Desktop Sidebar (Visible on lg screens and up) --- */}
      <aside className="w-64 flex-shrink-0 bg-zinc-950 border-r border-zinc-800 hidden lg:flex lg:flex-col">
        {sidebarWithClickHandler}
      </aside>

      {/* --- Mobile Sidebar (Toggles on small screens) --- */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            
            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 w-80 max-w-[90vw] h-full bg-zinc-950 border-r border-zinc-800 z-50 lg:hidden flex flex-col"
            >
              <div className="flex-1 overflow-y-auto">
                {sidebarWithClickHandler}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- Main Content --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-black border-b border-zinc-800 p-4 sticky top-0 z-30">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="text-zinc-400 hover:text-orange-500 mr-4"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-white">Hostel<span className="text-orange-500">Connect</span></h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow overflow-auto bg-[#09090b]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
