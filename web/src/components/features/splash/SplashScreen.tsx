import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type SplashScreenProps = {
  onComplete: () => void;
};

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [showSplash, setShowSplash] = useState(true);
  const text = "HostelConnect";
  const letters = Array.from(text);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setTimeout(onComplete, 1000); // Allow exit animation to complete
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const letterVariants = {
    hidden: { 
      opacity: 0,
      y: 50,
      rotateX: -90
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: -50,
      rotateX: 90,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center z-50"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            {/* Animated Text */}
            <div className="flex justify-center mb-4">
              {letters.map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="inline-block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white"
                  style={{
                    perspective: "1000px",
                    transformStyle: "preserve-3d"
                  }}
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </div>
            
            {/* Tagline */}
            <motion.p
              className="text-white/80 text-lg sm:text-xl md:text-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              exit={{ opacity: 0, y: -20 }}
            >
              Find your perfect student accommodation
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;