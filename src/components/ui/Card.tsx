import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

type CardProps = {
  children: ReactNode;
  className?: string;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onClick?: () => void;
};

const Card = ({
  children,
  className = '',
  elevation = 'md',
  interactive = false,
  onClick,
}: CardProps) => {
  const elevationClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  const baseClasses = 'bg-white border border-zinc-200 text-zinc-900 rounded-2xl overflow-hidden';
  const interactiveClasses = interactive ? 'cursor-pointer transition-transform duration-300 hover:border-[#f06023]' : '';

  return interactive ? (
    <motion.div
      className={clsx(baseClasses, elevationClasses[elevation], interactiveClasses, className)}
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(240, 96, 35, 0.15)' }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  ) : (
    <div
      className={clsx(baseClasses, elevationClasses[elevation], className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;