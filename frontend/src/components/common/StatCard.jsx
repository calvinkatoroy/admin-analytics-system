import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

const StatCard = ({ title, value, icon: Icon, change, trend, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={clsx('p-3 rounded-md', colorClasses[color])}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-2xl font-semibold text-gray-900">
                {value}
              </dd>
            </dl>
          </div>
          {change !== undefined && (
            <div className="flex items-center">
              {trend === 'up' ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span className={clsx(
                'text-sm font-medium ml-1',
                trend === 'up' ? 'text-green-600' : 'text-red-600'
              )}>
                {change}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;