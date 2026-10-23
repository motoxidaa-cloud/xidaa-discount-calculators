import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Copy, 
  ArrowLeft, 
  Download, 
  Upload, 
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/currency';

export const OrderHistory: React.FC = () => {
  const { 
    savedOrders, 
    loadSavedOrder, 
    duplicateSavedOrder, 
    deleteSavedOrder, 
    startNewOrder,
    exportOrdersToJSON, 
    importOrdersFromJSON,
    setActiveView 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = savedOrders.filter(order => {
    const s = searchTerm.toLowerCase();
    const cust = order.orderInput.customerName.toLowerCase();
    const ref = order.orderInput.orderRef.toLowerCase();
    const models = order.orderInput.scooterItems.map(i => i.modelName.toLowerCase()).join(' ');
    return cust.includes(s) || ref.includes(s) || models.includes(s);
  });

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      importOrdersFromJSON(content);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeleteWithConfirm = (id: string, ref: string) => {
    if (window.confirm(`Delete saved order "${ref}"?`)) {
      deleteSavedOrder(id);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-20">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveView('home')}
          className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 hover:text-red-600 transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Home</span>
        </button>

        <button
          type="button"
          onClick={() => startNewOrder(false)}
          className="flex items-center space-x-1 text-xs font-bold text-red-600 hover:text-red-700"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Order</span>
        </button>
      </div>

      {/* Title & Import/Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
            <History className="w-5 h-5 text-red-600" />
            <span>Saved Order Calculations</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {savedOrders.length} saved order calculations in local history.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={exportOrdersToJSON}
            className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center space-x-1"
            title="Export to JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <label className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          </label>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search dealer, reference, or model..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-xl pl-9 pr-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-600 shadow-2xs"
        />
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-3">
          <div className="w-10 h-10 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
            <History className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-800">No Saved Calculations</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">
            {savedOrders.length === 0
              ? 'Start a new calculation and click "Save Order" to record orders here.'
              : 'No orders match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const res = order.calculationResult;
            const inp = order.orderInput;
            return (
              <div
                key={order.id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3 hover:border-gray-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">
                      {inp.customerName || 'Direct B2B Order'}
                    </div>
                    <div className="text-[11px] font-mono text-gray-500 mt-0.5">
                      {inp.orderRef} • {inp.orderDate}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-gray-900">
                      {res.finalPayableAmount !== null ? formatINR(res.finalPayableAmount) : 'Pending Prices'}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold">
                      Disc: {formatINR(res.totalCustomerDiscountBenefit)}
                    </div>
                  </div>
                </div>

                {/* Scooter & Battery breakdown */}
                <div className="p-2.5 bg-gray-50 rounded-xl text-xs text-gray-700 space-y-1">
                  <div className="font-semibold flex items-center justify-between">
                    <span>Models ({res.totalScooters} scooters):</span>
                    <span className="font-mono text-emerald-700">Allowance: {formatINR(res.scooterDiscountAllowance)}</span>
                  </div>
                  <div className="text-[11px] text-gray-600">
                    {inp.scooterItems.map((s) => `${s.quantity}x ${s.modelName} (${s.category})`).join(', ')}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => duplicateSavedOrder(order.id)}
                      className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center space-x-1"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                      <span>Duplicate</span>
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteWithConfirm(order.id, inp.orderRef)}
                      className="text-xs font-semibold text-gray-400 hover:text-red-600 flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => loadSavedOrder(order.id)}
                    className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-2xs"
                  >
                    <span>View & Edit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
