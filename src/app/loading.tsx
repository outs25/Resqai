import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
        <span className="font-caption text-caption text-text-citizen-muted font-mono tracking-wider">
          Connecting to Emergency Grid...
        </span>
      </div>
    </div>
  );
}
