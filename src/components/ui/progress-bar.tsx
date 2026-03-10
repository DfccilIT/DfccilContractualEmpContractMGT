import React from 'react';

interface ProgressBarProps {
  value: number; // Current progress value
  max: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max }) => {
  const progressPercentage = Math.round((value / max) * 100); // Calculate progress percentage

  return (
    <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3 mt-2">
      <div
        className="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all"
        style={{ width: `${progressPercentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
