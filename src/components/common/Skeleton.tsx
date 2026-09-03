import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export function Skeleton({ className = '', variant = 'rounded' }: SkeletonProps) {
  const variantClasses = {
    rectangular: '',
    circular: 'rounded-full',
    rounded: 'rounded-[2rem]',
  };

  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      className={`bg-editorial-card border border-editorial-border-light relative overflow-hidden ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    >
      <motion.div
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-editorial-text/[0.08] to-transparent"
      />
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col h-full bg-editorial-card border border-editorial-border-light rounded-[2.5rem] p-8 shadow-depth-2 backdrop-blur-3xl">
      <Skeleton className="aspect-[4/5] w-full mb-12" variant="rounded" />
      <div className="space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mt-auto pt-10 border-t border-white/[0.05] space-y-8">
        <div className="flex justify-between items-center">
            <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-24" />
            </div>
            <Skeleton className="w-16 h-16" variant="rounded" />
        </div>
        <div className="grid grid-cols-3 gap-5">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
