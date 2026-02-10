import React from 'react';

interface CircularProgressProps {
    size?: number;
    strokeWidth?: number;
    percentage?: number;
    color?: string;
    showText?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
    size = 48,
    strokeWidth = 4,
    percentage = 0,
    color = "text-blue-600",
    showText = true,
}) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-slate-100 dark:text-slate-800"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={`${color} transition-all duration-1000 ease-out`}
                />
            </svg>
            {showText && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-black text-slate-900 dark:text-white leading-none">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
        </div>
    );
};

export default CircularProgress;
