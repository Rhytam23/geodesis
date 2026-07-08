import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-all ${className}`}>
    {children}
  </div>
);
