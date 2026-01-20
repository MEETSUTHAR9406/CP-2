import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className, hover = false, ...props }) => {
  return (
    <div 
      className={clsx(
        "bg-white rounded-2xl border border-[hsl(var(--color-border))] transition-all duration-300",
        hover ? "hover:shadow-xl hover:-translate-y-1 hover:border-gray-300" : "shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
