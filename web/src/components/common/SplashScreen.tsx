import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  // const text = "HostelConnect"; // Removed H1 text
  // const letters = Array.from(text); // Removed H1 text

  useEffect(() => {
    // Simulate loading process for exactly 4 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
      onComplete();
    }, 4000); // 4 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  // const letterVariants = { // Removed H1 text variants
  //   hidden: { opacity: 0, y: 20 },
  //   visible: (i: number) => ({
  //     opacity: 1,
  //     y: 0,
  //     transition: {
  //       delay: i * 0.1,
  //       duration: 0.5,
  //       ease: "easeInOut",
  //     },
  //   }),
  // };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 flex flex-col items-center justify-center bg-black text-white z-50 overflow-hidden"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Logo */}
          <motion.div
            className="relative mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="absolute -inset-6 bg-[#f06023]/30 blur-2xl rounded-full animate-pulse" />
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl bg-gradient-to-tr from-[#f06023] via-amber-500 to-orange-400 p-1 shadow-[0_0_40px_rgba(240,96,35,0.6)]">
              <div className="w-full h-full bg-black rounded-[22px] flex items-center justify-center">
                <span className="text-[#f06023] font-black text-5xl tracking-tighter">RC</span>
              </div>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white"
          >
            Rental <span className="text-[#f06023]">Connect</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-zinc-400 text-sm mt-2 tracking-wide font-medium"
          >
            Connect & Rent Property, Vehicles, Land & Equipment
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen; 