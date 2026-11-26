import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  inline?: boolean;
}

export function Loader({
  size = 'lg',
  text = 'Loading...',
  fullScreen = false,
  inline = false
}: LoaderProps) {
  const sizeClasses = {
    sm: 'w-7 h-7 border-[3px]',
    md: 'w-14 h-14 border-4',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-[5px]'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-background/90 backdrop-blur-xs flex flex-col items-center justify-center z-50'
    : inline
      ? 'flex flex-col items-center justify-center p-4'
      : 'min-h-[75vh] w-full flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div
        className={`${sizeClasses[size]} border-slate-200 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin`}
      />
      {text && (
        <p className="mt-4 text-base text-muted-foreground font-medium">{text}</p>
      )}
    </div>
  );
}

// Full screen loader for page transitions
export function PageLoader() {
  return <Loader fullScreen size="lg" text="Loading page..." />;
}

// Small inline loader
export function InlineLoader() {
  return <Loader inline size="sm" text="" />;
}
