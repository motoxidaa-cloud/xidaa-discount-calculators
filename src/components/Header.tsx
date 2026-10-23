import React from 'react';
import { 
  PlusCircle, 
  History, 
  Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    startNewOrder, 
    savedOrders 
  } = useApp();

  return (
    <header className="no-print bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand Identity */}
          <div 
            className="flex items-center space-x-3 cursor-pointer py-1"
            onClick={() => setActiveView('home')}
          >
            <img 
              src="/assets/xidaa-logo-dark.png" 
              alt="Xidaa Moto" 
              className="h-7 sm:h-8 w-auto object-contain"
            />
            <div className="hidden xs:flex flex-col border-l border-gray-200 pl-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-red-600">
                Discount Calculator
              </span>
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold">
                Ride the Electric Thunder
              </span>
            </div>
          </div>

          {/* Quick Actions Header Navigation */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {activeView !== 'order-form' && (
              <button
                type="button"
                onClick={() => startNewOrder(false)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Order</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveView('history')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeView === 'history'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <History className="w-4 h-4 text-gray-500" />
              <span className="hidden sm:inline">Saved</span>
              {savedOrders.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 bg-gray-200 text-gray-800 text-[10px] rounded-full font-bold">
                  {savedOrders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveView('admin-settings')}
              title="Admin Settings"
              className={`p-2 rounded-lg text-xs transition-colors ${
                activeView === 'admin-settings'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
