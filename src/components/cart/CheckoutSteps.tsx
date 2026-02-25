'use client';

import React from 'react';
import { Truck, FileText, CreditCard, Check } from 'lucide-react';

interface CheckoutStepsProps {
  activeStep: number;
}

export function CheckoutSteps({ activeStep }: CheckoutStepsProps) {
  const steps = [
    {
      label: 'Shipping',
      icon: Truck,
    },
    {
      label: 'Order Summary',
      icon: FileText,
    },
    {
      label: 'Payment',
      icon: CreditCard,
    },
  ];

  return (
    <div className="w-full">
      <div className="relative flex justify-between items-center max-w-3xl mx-auto">
        {/* Background Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-slate-800 -translate-y-1/2 rounded-full -z-10" />

        {/* Progress Line */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-green-500 dark:bg-green-400 -translate-y-1/2 rounded-full -z-10 transition-all duration-500 ease-out"
          style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;

          return (
            <div key={index} className="flex flex-col items-center gap-2 bg-slate-50 dark:bg-slate-950 px-2 z-10 transition-colors duration-300">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110'
                  : isCompleted
                    ? 'bg-green-500 dark:bg-green-600 border-green-500 dark:border-green-600 text-white'
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-500'
                  }`}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>

              <span
                className={`text-xs sm:text-sm font-semibold transition-colors duration-300 ${isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400 dark:text-slate-500'
                  }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
