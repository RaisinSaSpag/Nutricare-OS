import React from 'react';

interface BiometricRingProps {
  progress: number; // 0 to 100+
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  valueDisplay?: string;
  sublabel?: string;
}

export const BiometricRing: React.FC<BiometricRingProps> = ({
  progress,
  size = 110,
  strokeWidth = 9,
  color = '#0D9488',
  trackColor = '#F1F5F9',
  label,
  valueDisplay,
  sublabel
}) => {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress Stroke with Rounded Ends */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          {valueDisplay ? (
            <span className="text-sm font-extrabold text-slate-800 tracking-tight leading-none">
              {valueDisplay}
            </span>
          ) : (
            <span className="text-sm font-extrabold text-slate-800 tracking-tight leading-none">
              {Math.round(progress)}%
            </span>
          )}
          {sublabel && (
            <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      </div>

      {label && (
        <span className="text-xs font-semibold text-slate-700 mt-2 text-center">
          {label}
        </span>
      )}
    </div>
  );
};
