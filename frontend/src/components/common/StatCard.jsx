import React, { useState, useEffect } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  trend, 
  color = 'blue', 
  subtitle,
  animate = false,
  live = false
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Animate value counting effect
  useEffect(() => {
    if (animate && value) {
      const numericValue = typeof value === 'string' ? 
        parseInt(value.replace(/[^\d]/g, '')) : value;
      
      let start = 0;
      const duration = 1500;
      const increment = numericValue / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          setDisplayValue(numericValue);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value, animate]);

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600',
      ring: 'ring-blue-500/20'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      gradient: 'from-green-500 to-green-600',
      ring: 'ring-green-500/20'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600',
      ring: 'ring-purple-500/20'
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600',
      ring: 'ring-orange-500/20'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      gradient: 'from-red-500 to-red-600',
      ring: 'ring-red-500/20'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      gradient: 'from-yellow-500 to-yellow-600',
      ring: 'ring-yellow-500/20'
    }
  };

  const formatDisplayValue = () => {
    if (animate && typeof value === 'string' && value.includes('K')) {
      const numericPart = displayValue;
      if (numericPart >= 1000) {
        return `${(numericPart / 1000).toFixed(1)}K`;
      }
      return numericPart.toLocaleString();
    }
    if (animate && typeof value === 'string' && value.includes('M')) {
      const numericPart = displayValue;
      if (numericPart >= 1000000) {
        return `${(numericPart / 1000000).toFixed(1)}M`;
      }
      if (numericPart >= 1000) {
        return `${(numericPart / 1000).toFixed(1)}K`;
      }
      return numericPart.toLocaleString();
    }
    return animate ? displayValue.toLocaleString() : value;
  };

  return (
    <div 
      className={clsx(
        "relative overflow-hidden bg-white rounded-2xl border border-gray-200 transition-all duration-300 cursor-pointer group",
        isHovered ? "shadow-xl ring-4" : "shadow-md hover:shadow-lg",
        isHovered && colorClasses[color].ring,
        "hover:-translate-y-1"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gray-50 rounded-full opacity-50"></div>
      <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-16 h-16 bg-gray-50 rounded-full opacity-30"></div>
      
      {/* Live indicator */}
      {live && (
        <div className="absolute top-4 right-4 flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-green-600">LIVE</span>
        </div>
      )}

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Icon */}
            <div className={clsx(
              "inline-flex p-3 rounded-xl transition-all duration-300 mb-4",
              colorClasses[color].bg,
              isHovered && `bg-gradient-to-br ${colorClasses[color].gradient}`
            )}>
              <Icon className={clsx(
                "w-6 h-6 transition-all duration-300",
                isHovered ? "text-white scale-110" : colorClasses[color].text
              )} />
            </div>

            {/* Title */}
            <div className="space-y-1 mb-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-gray-500">{subtitle}</p>
              )}
            </div>

            {/* Value */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className={clsx(
                  "text-3xl lg:text-4xl font-black transition-all duration-300",
                  isHovered ? colorClasses[color].text : "text-gray-900"
                )}>
                  {formatDisplayValue()}
                </span>
                {animate && displayValue !== value && (
                  <div className="flex items-center">
                    <div className="spinner w-4 h-4"></div>
                  </div>
                )}
              </div>

              {/* Change indicator */}
              {change !== undefined && (
                <div className="flex items-center gap-1">
                  <div className={clsx(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold",
                    trend === 'up' 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  )}>
                    {trend === 'up' ? (
                      <ArrowUpIcon className="w-3 h-3" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3" />
                    )}
                    <span>{Math.abs(change)}%</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    vs last period
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Ring for Live Data */}
          {live && (
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  className="text-green-500"
                  strokeDasharray="75, 100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0 18 18;360 18 18"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </path>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Hover Effect Bar */}
        <div className={clsx(
          "absolute bottom-0 left-0 h-1 transition-all duration-300 bg-gradient-to-r",
          colorClasses[color].gradient,
          isHovered ? "w-full" : "w-0"
        )}></div>
      </div>
    </div>
  );
};

export default StatCard;