'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <Loader2 className={`animate-spin ${sizes[size]} ${className}`} />
  );
}

interface LoadingOverlayProps {
  message?: string;
  progress?: number;
}

export function LoadingOverlay({ message = 'Loading...', progress }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-purple-200"
            style={{ borderTopColor: 'transparent' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-purple-500"
            style={{ borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
        <p className="text-gray-700 dark:text-gray-200 font-medium">{message}</p>
        {typeof progress === 'number' && (
          <div className="mt-4">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{Math.round(progress)}%</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', variant = 'rectangular', width, height }: SkeletonProps) {
  const baseClasses = 'skeleton animate-pulse bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1em' : '100%'),
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} style={style} />
  );
}

interface SceneSkeletonProps {
  count?: number;
}

export function SceneSkeleton({ count = 3 }: SceneSkeletonProps) {
  return (
    <div className="flex gap-3 overflow-x-auto py-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-40">
          <Skeleton height={90} className="mb-2" />
          <Skeleton variant="text" width="80%" height={12} className="mb-1" />
          <Skeleton variant="text" width="60%" height={10} />
        </div>
      ))}
    </div>
  );
}

interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function ButtonWithLoading({
  isLoading,
  children,
  loadingText,
  className = '',
  disabled,
  onClick,
}: ButtonLoadingProps) {
  return (
    <button
      className={`relative ${className}`}
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>{children}</span>
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" />
          {loadingText && <span>{loadingText}</span>}
        </span>
      )}
    </button>
  );
}

export default LoadingSpinner;
