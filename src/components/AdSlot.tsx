import React from 'react';
import { useApp } from '../context/AppContext';

interface AdSlotProps {
  slotKey: string;
  placementName?: string;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ slotKey, placementName = 'Sponsor Advertisement', className = '' }) => {
  const { adsEnabled } = useApp();

  // If ads are globally disabled or integration not yet approved, render nothing to avoid layout shifts
  if (!adsEnabled) {
    return null;
  }

  return (
    <div className={`my-6 mx-auto w-full max-w-4xl p-3 bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center transition-all ${className}`}>
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
        {placementName}
      </span>
      <div className="min-h-[90px] flex items-center justify-center text-xs text-slate-400">
        <span>Ad space reserved (Google AdSense pending publisher verification)</span>
      </div>
    </div>
  );
};
