import React from 'react';
import clsx from 'clsx';

const Input = React.forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[hsl(var(--color-text-muted))] mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={clsx(
          "w-full px-4 py-2.5 rounded-lg border bg-white/50 backdrop-blur-sm transition-all duration-200",
          "focus:ring-2 focus:ring-[hsl(var(--color-primary))] focus:border-transparent outline-none",
          "placeholder-[hsl(var(--color-text-muted))/50]",
          error 
            ? "border-red-500 focus:ring-red-500" 
            : "border-[hsl(var(--color-border))]",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

export default Input;
