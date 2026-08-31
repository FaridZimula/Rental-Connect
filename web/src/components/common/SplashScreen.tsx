import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Display splashscreen for 2.5 seconds — timer runs exactly once
    const timer = setTimeout(() => {
      setIsLoading(false);
      onCompleteRef.current();
    }, 2500);

    return () => clearTimeout(timer);
  }, []); // empty deps: run once on mount

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, transition: { duration: 0.4 } },
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-white z-[99999] overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Logo Only */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center justify-center p-6"
          >
            <img
              src="/images/RENTAL CONNECT LOGO.png"
              alt="Rental Connect"
              className="h-28 sm:h-36 md:h-44 w-auto object-contain max-w-[85vw]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;