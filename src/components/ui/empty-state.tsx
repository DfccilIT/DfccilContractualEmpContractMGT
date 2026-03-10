import { FilePlus } from 'lucide-react';
import React from 'react';

const EmptyState = ({ message = 'No data found' }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <FilePlus className="w-16 h-16 text-gray-400 mb-4" />
      <div className="text-gray-500 text-lg font-medium italic">{message}</div>
    </div>
  );
};

export default EmptyState;
