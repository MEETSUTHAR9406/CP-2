import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const Button = ({ 
  children, 
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'md', // sm, md, lg
  className, 
  loading, 
  disabled, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-[hsl(var(--color-primary))] text-white hover:bg-[hsl(var(--color-primary-dark))] shadow-md hover:shadow-lg hover:shadow-indigo-500/20 focus:ring-indigo-500 border border-transparent",
    secondary: "bg-[hsl(var(--color-secondary))] text-white hover:opacity-90 shadow-md hover:shadow-lg focus:ring-teal-500 border border-transparent",
    outline: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm focus:ring-gray-200",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent focus:ring-red-500",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 rounded-md",
    md: "text-sm px-4 py-2 rounded-lg",
    lg: "text-base px-6 py-3 rounded-xl",
  };

  return (
    <button 
      className={clsx(
        baseStyles, 
        variants[variant], 
        sizes[size], 
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {children}
        </>
      ) : children}
    </button>
  );
};

export default Button;
