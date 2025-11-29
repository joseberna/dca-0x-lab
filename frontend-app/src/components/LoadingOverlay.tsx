import React from 'react';
import Image from 'next/image';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm fade-in">
      <div className="flex flex-col items-center gap-6 p-8 rounded-2xl">
        <div className="relative w-24 h-24 animate-spin-slow">
           <Image 
             src="/assets/bitcoin-logo.png" 
             alt="Loading" 
             fill
             className="object-contain"
           />
        </div>
        {message && (
          <p className="text-xl font-medium text-white animate-pulse text-center">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};
