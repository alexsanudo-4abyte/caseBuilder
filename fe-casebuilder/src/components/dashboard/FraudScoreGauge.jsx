import React from 'react';

export default function FraudScoreGauge({ score = 0, size = 'md', showLabel = true }) {
  const sizes = {
    sm: { width: 80, stroke: 6, fontSize: 'text-lg' },
    md: { width: 120, stroke: 8, fontSize: 'text-2xl' },
    lg: { width: 160, stroke: 10, fontSize: 'text-3xl' },
  };

  const config = sizes[size] || sizes.md;
  const radius = (config.width - config.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = ((100 - score) / 100) * circumference;

  const getColor = () => {
    if (score >= 70) return { stroke: '#ef4444', bg: '#fef2f2', text: 'text-red-600' };
    if (score >= 40) return { stroke: '#f59e0b', bg: '#fffbeb', text: 'text-amber-600' };
    return { stroke: '#10b981', bg: '#f0fdf4', text: 'text-emerald-600' };
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: config.width, height: config.width }}>
        <svg 
          className="transform -rotate-90"
          width={config.width} 
          height={config.width}
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={config.stroke}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.width / 2}
            r={radius}
            stroke={color.stroke}
            strokeWidth={config.stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`${config.fontSize} font-bold ${color.text}`}>
            {score}
          </span>
          {showLabel && (
            <span className="text-xs text-slate-500">Risk Score</span>
          )}
        </div>
      </div>
    </div>
  );
}