"use client"
import { useEffect, useState } from "react";
import { Home, Package, ShoppingBag, Truck } from "lucide-react";

interface TrackStepperProps {
  activeStep: number;
  orderOn?: string;
  processingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}
const TrackStepper: React.FC<TrackStepperProps> = ({
  activeStep,
  orderOn,
  processingAt,
  shippedAt,
  deliveredAt,
}) => {
  const formatDate = (dt?: string): string | null => {
    if (!dt) return null;
    const date = new Date(dt);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const steps = [
    {
      status: "Ordered",
      dt: formatDate(orderOn),
      icon: <ShoppingBag className="w-5 h-5" />,
      description: "Order placed successfully"
    },
    {
      status: "Processing",
      dt: formatDate(processingAt),
      icon: <Package className="w-5 h-5" />,
      description: "Preparing your order"
    },
    {
      status: "Shipped",
      dt: formatDate(shippedAt),
      icon: <Truck className="w-5 h-5" />,
      description: "Package in transit"
    },
    {
      status: "Delivered",
      dt: formatDate(deliveredAt),
      icon: <Home className="w-5 h-5" />,
      description: "Package delivered"
    },
  ];

  return (
    <>
      {/* Desktop / Large screen - Horizontal */}
      <div className="hidden lg:block w-full">
        <div className="flex items-start justify-between relative px-4">
          {steps.map((item, index) => (
            <div key={index} className="flex flex-col items-center relative flex-1 min-w-0">
              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div className="absolute top-6 left-1/2 w-full h-1 -translate-y-1/2 z-0"
                  style={{ left: '50%', right: '-50%', width: 'calc(100% - 24px)', marginLeft: '12px' }}>
                  <div className="h-full bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${activeStep > index ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gray-200'
                        }`}
                      style={{
                        width: activeStep > index ? '100%' : '0%'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Step Icon */}
              <div className={`
                relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg
                ${activeStep >= index
                  ? 'bg-gradient-to-br from-green-400 to-green-600 text-white ring-4 ring-green-100'
                  : 'bg-white text-gray-400 border-2 border-gray-200'
                }
              `}>
                {item.icon}
              </div>

              {/* Step Content */}
              <div className="mt-4 text-center max-w-32">
                <h4 className={`font-semibold text-sm mb-1 ${activeStep >= index ? 'text-green-700' : 'text-gray-500'
                  }`}>
                  {item.status}
                </h4>
                <p className="text-xs text-gray-500 mb-2">
                  {item.description}
                </p>
                {activeStep >= index && item.dt && (
                  <div className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                    {item.dt}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile / Small screen - Vertical */}
      <div className="lg:hidden w-full">
        <div className="space-y-0">
          {steps.map((item, index) => (
            <div key={index} className="flex items-start space-x-4 pb-8 last:pb-0">
              <div className="flex flex-col items-center">
                {/* Step Icon */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-md
                  ${activeStep >= index
                    ? 'bg-gradient-to-br from-green-400 to-green-600 text-white ring-2 ring-green-100'
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                  }
                `}>
                  {item.icon}
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="w-1 bg-gray-200 mt-2 relative rounded-full" style={{ height: '60px' }}>
                    <div
                      className={`w-full rounded-full transition-all duration-1000 ease-out ${activeStep > index ? 'bg-gradient-to-b from-green-400 to-green-500' : 'bg-gray-200'
                        }`}
                      style={{
                        height: activeStep > index ? '100%' : '0%'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-h-[40px]">
                <h4 className={`font-semibold mb-1 ${activeStep >= index ? 'text-green-700' : 'text-gray-500'
                  }`}>
                  {item.status}
                </h4>
                <p className="text-sm text-gray-500 mb-2">
                  {item.description}
                </p>
                {activeStep >= index && item.dt && (
                  <div className="inline-block text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-md">
                    {item.dt}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
interface OrderTrackerProps {
  status: string;
  orderOn?: string;
  processingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({
  status = "Processing",
  orderOn,
  processingAt,
  shippedAt,
  deliveredAt
}) => {
  const getActiveStep = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 3;
      case 'shipped': return 2;
      case 'processing': return 1;
      case 'cancelled': return 0; // Or handle differently
      default: return 0;
    }
  };

  const currentStep = getActiveStep(status);

  const getStepStatus = () => {
    if (status.toLowerCase() === 'cancelled') return "Order Cancelled";
    const statuses = ["Order Placed", "Processing Order", "Package Shipped", "Order Delivered"];
    return statuses[currentStep] || "Order Placed";
  };

  const isCancelled = status.toLowerCase() === 'cancelled';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 border-b border-gray-100 ${isCancelled ? 'bg-red-50' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
        <div>
          <h3 className={`text-lg font-semibold ${isCancelled ? 'text-red-900' : 'text-gray-900'}`}>{isCancelled ? 'Order Cancelled' : 'Track Your Order'}</h3>
          <p className={`text-sm mt-1 ${isCancelled ? 'text-red-700' : 'text-gray-600'}`}>{getStepStatus()}</p>
        </div>
      </div>

      {/* Stepper Content */}
      <div className="p-6">
        <TrackStepper
          activeStep={currentStep}
          orderOn={orderOn}
          processingAt={processingAt}
          shippedAt={shippedAt}
          deliveredAt={deliveredAt}
        />
      </div>

      {/* Footer */}
      {!isCancelled && (
        <div className="px-6 pb-6">
          <div className={`p-4 rounded-lg transition-all duration-500 ${currentStep === 3
            ? 'bg-green-50 border border-green-200'
            : 'bg-blue-50 border border-blue-200'
            }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${currentStep === 3 ? 'text-green-900' : 'text-blue-900'
                  }`}>
                  {currentStep === 3 ? '🎉 Successfully Delivered!' : '📦 In Progress'}
                </p>
                <p className={`text-sm mt-1 ${currentStep === 3 ? 'text-green-700' : 'text-blue-700'
                  }`}>
                  {currentStep === 3 ? 'Thank you for your order!' : 'We are working on your order'}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-medium ${currentStep === 3 ? 'text-green-600' : 'text-blue-600'
                  }`}>
                  {currentStep === 3 ? '✅ Completed' : '🚚 Smart Shop Delivery'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
