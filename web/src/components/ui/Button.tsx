import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

type ButtonProps = {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  disabled = false,
  className = '',
  onClick,
}: ButtonProps) => {
  const baseClasses = 'rounded-full font-medium transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-[#f06023] hover:bg-[#d94b12] text-white font-bold shadow-[0_0_12px_rgba(240,96,35,0.35)] focus:ring-[#f06023]',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-[#f06023] border border-zinc-700 focus:ring-[#f06023]',
    outline: 'border border-[#f06023]/60 text-[#f06023] hover:bg-[#f06023]/10 focus:ring-[#f06023]',
    ghost: 'text-[#f06023] hover:bg-zinc-800/60 focus:ring-[#f06023]',
  };
  
  const sizeClasses = {
    sm: 'text-xs px-3 py-1',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabledClasses,
        widthClasses,
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </motion.button>
  );
};

export default Button;