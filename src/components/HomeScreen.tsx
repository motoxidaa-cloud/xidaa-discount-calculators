import React from 'react';
import { 
  PlusCircle, 
  History, 
  Settings, 
  ArrowRight, 
  Truck, 
  BatteryCharging
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/currency';

export const HomeScreen: React.FC = () => {
  const { 
    startNewOrder, 
    savedOrders, 
    loadSavedOrder, 
    setActiveView 
  } = useApp();

  return (
    <div className="max-w-xl mx-auto space-y-6 sm:space-y-8 py-2 sm:py-6">
      
      {/* Brand Hero Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200/80 shadow-xs text-center space-y-5">
        <div className="flex justify-center">
          <img 
            src="/assets/xidaa-logo-dark.png" 
            alt="Xidaa Moto" 
            className="h-12 sm:h-14 w-auto object-contain"
          />
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
            Xidaa Discount Calculator
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-red-600 mt-1">
            Ride The Electric Thunder
          </p>
          <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
            Internal B2B commercial quotation, freight logistics & smart transport-sharing calculation engine.
          </p>
        </div>

        {/* PROMINENT MAIN BUTTON: Create New Order */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => startNewOrder(true)}
            className="w-full py-4 px-6 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-base rounded-xl shadow-md shadow-red-600/25 flex items-center justify-center space-x-2.5 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {/* Quick Value Features (Clean minimal cards) */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-1.5">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-gray-800">Multi-Model</div>
          <div className="text-[10px] text-gray-500 mt-0.5">DL & Other items</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1.5">
            <BatteryCharging className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-gray-800">Battery Quota</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Separate ₹500 disc</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-1.5">
            <Truck className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-gray-800">50% Transport</div>
          <div className="text-[10px] text-gray-500 mt-0.5">Sharing engine</div>
        </div>
      </div>

      {/* Recent Calculations Section (if any exist) */}
      {savedOrders.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-bold text-gray-900">Recent Calculations</h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
            >
              <span>View All ({savedOrders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {savedOrders.slice(0, 3).map((order) => {
              const res = order.calculationResult;
              const inp = order.orderInput;
              return (
                <div
                  key={order.id}
                  onClick={() => loadSavedOrder(order.id)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 rounded-lg px-2 -mx-2 transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-gray-900">{inp.customerName || 'Unnamed Order'}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5 flex items-center space-x-2">
                      <span>{inp.orderRef}</span>
                      <span>•</span>
                      <span>{res.totalScooters} scooters</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-gray-900">
                      {res.finalPayableAmount !== null ? formatINR(res.finalPayableAmount) : 'Pending Prices'}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      Disc: {formatINR(res.totalCustomerDiscountBenefit)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Settings Link */}
      <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 pt-2">
        <button
          type="button"
          onClick={() => setActiveView('admin-settings')}
          className="hover:text-gray-800 flex items-center space-x-1 transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Rules & Admin Settings</span>
        </button>
        <span>•</span>
        <button
          type="button"
          onClick={() => setActiveView('history')}
          className="hover:text-gray-800 flex items-center space-x-1 transition-colors"
        >
          <History className="w-3.5 h-3.5" />
          <span>All Saved Orders</span>
        </button>
      </div>

    </div>
  );
};
