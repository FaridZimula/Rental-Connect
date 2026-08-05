import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';

type LayoutProps = {
  children: ReactNode;
  hideFader?: boolean;
};

const Layout = ({ children, hideFader = false }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <motion.main 
        className="flex-grow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.main>
      {!hideFader && (
        <div className="h-16 bg-gradient-to-t from-white to-transparent" />
      )}
      <Footer />
    </div>
  );
};

export default Layout;