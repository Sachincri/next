import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
}

export function Loader({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false 
}: LoaderProps) {
  const sizeclassNamees = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const containerclassNamees = fullScreen
    ? 'fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerclassNamees}>
      <div
        className={`${sizeclassNamees[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
      />
      {text && (
        <p className="mt-4 text-sm text-gray-600 font-medium">{text}</p>
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
  return <Loader size="sm" text="" />;
}
