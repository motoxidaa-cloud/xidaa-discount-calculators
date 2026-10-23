import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Printer, 
  RotateCcw, 
  CheckCircle2, 
  TrendingDown, 
  Truck, 
  BatteryCharging, 
  Info, 
  Edit3, 
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { formatINR, formatINRWords } from '../utils/currency';

export const ResultsScreen: React.FC = () => {
  const { 
    orderInput, 
    calculationResult, 
    editCurrentOrder, 
    startNewOrder, 
    saveCurrentOrder, 
    setActiveView 
  } = useApp();

  const [justSaved, setJustSaved] = useState(false);

  const handleSaveOrder = () => {
    saveCurrentOrder();
    setJustSaved(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#16a34a', '#2563eb', '#ffffff'],
    });
    setTimeout(() => setJustSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      
      {/* Header bar with Back / Edit */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <button
          type="button"
          onClick={editCurrentOrder}
          className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 hover:text-red-600 transition-colors py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Edit Order</span>
        </button>

        <span className="text-xs font-mono font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
          {orderInput.orderRef}
        </span>
      </div>

      {/* HERO CARD: FINAL PAYABLE AMOUNT OR ENTER PRICES BANNER */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-200 shadow-sm space-y-4">
        {calculationResult.hasAllPrices && calculationResult.finalPayableAmount !== null ? (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Final Payable Amount
              </span>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Saved {formatINR(calculationResult.totalCustomerDiscountBenefit)}
              </span>
            </div>

            <div className="mt-2 text-3xl sm:text-4xl font-black text-gray-900 tracking-tight font-mono">
              {formatINR(calculationResult.finalPayableAmount)}
            </div>

            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
              <span>{formatINRWords(calculationResult.finalPayableAmount)}</span>
              {calculationResult.gstTreatment !== 'None' && (
                <span className="font-semibold text-gray-600">
                  {calculationResult.gstTreatment === 'Exclusive' ? '+ GST Applicable' : 'GST Included'}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 space-y-2">
            <div className="flex items-start space-x-2 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold">Prices Pending for Final Invoice</h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Enter prices to calculate final payable amount. (Unit prices for scooters/batteries can be added anytime in the form).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={editCurrentOrder}
              className="text-xs font-bold text-amber-900 underline hover:text-black flex items-center space-x-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Tap here to add unit prices</span>
            </button>
          </div>
        )}

        {/* Customer & Date header */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Dealer / Customer</span>
            <span className="font-bold text-gray-900">{orderInput.customerName || 'Direct B2B Order'}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Date</span>
            <span className="font-medium text-gray-800">{orderInput.orderDate}</span>
          </div>
        </div>
      </div>

      {/* GRID: QUANTITY BREAKDOWN */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
          Order Units Breakdown
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">DL Scooters</span>
            <span className="text-xl font-black font-mono text-blue-950 mt-1 block">
              {calculationResult.totalDlScooters}
            </span>
            <span className="text-[10px] text-blue-600 font-medium">₹500 limit</span>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">Other Scooters</span>
            <span className="text-xl font-black font-mono text-amber-950 mt-1 block">
              {calculationResult.totalOtherScooters}
            </span>
            <span className="text-[10px] text-amber-600 font-medium">₹1,000 limit</span>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-gray-600 block">Total Scooters</span>
            <span className="text-xl font-black font-mono text-gray-900 mt-1 block">
              {calculationResult.totalScooters}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">All Models</span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Batteries</span>
            <span className="text-xl font-black font-mono text-emerald-950 mt-1 block">
              {calculationResult.totalBatteries}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">₹500 disc/unit</span>
          </div>
        </div>

        {/* Batteries by variant list (if any) */}
        {calculationResult.batteryBreakdown.length > 0 && (
          <div className="pt-2 text-xs text-gray-600 flex items-center space-x-2 flex-wrap">
            <span className="font-bold text-gray-700">Battery Variants:</span>
            {calculationResult.batteryBreakdown.map((b, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px] font-medium">
                {b.quantity}x {b.variant}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* COMMERCIAL DISCOUNT & FREIGHT SUMMARY TABLE */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 border-b border-gray-100 pb-2">
          Financial & Freight Settlement Breakdown
        </h3>

        <div className="space-y-3 text-xs divide-y divide-gray-100">
          
          {/* Scooter Discount Allowance */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="font-bold text-gray-900">Scooter Discount Allowance</span>
              <div className="text-[11px] text-gray-500">
                {calculationResult.totalDlScooters} DL + {calculationResult.totalOtherScooters} Other scooters
              </div>
            </div>
            <span className="font-mono font-bold text-gray-900 text-sm">
              {formatINR(calculationResult.scooterDiscountAllowance)}
            </span>
          </div>

          {/* Actual Scooter Discount Applied */}
          <div className="flex items-center justify-between pt-2 pl-3 border-l-2 border-emerald-500">
            <div>
              <span className="font-semibold text-emerald-900 flex items-center space-x-1">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>Actual Scooter Discount Applied to Invoice</span>
              </span>
              <div className="text-[10px] text-gray-500">
                {calculationResult.transportSharingApplied
                  ? `Allowance (${formatINR(calculationResult.scooterDiscountAllowance)}) − 50% Transport Support (${formatINR(calculationResult.companyTransportSupport)})`
                  : 'Full scooter discount allowance applied to vehicle invoice'}
              </div>
            </div>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              − {formatINR(calculationResult.actualScooterDiscountApplied)}
            </span>
          </div>

          {/* Battery Discount Allowance & Applied */}
          {calculationResult.batteryDiscountAllowance > 0 && (
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="font-bold text-gray-900 flex items-center space-x-1">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Battery Discount Allowance (Applied to Invoice)</span>
                </span>
                <div className="text-[10px] text-gray-500">
                  {calculationResult.totalBatteries} eligible batteries @ ₹500 (Kept separate from transport)
                </div>
              </div>
              <span className="font-mono font-bold text-emerald-700 text-sm">
                − {formatINR(calculationResult.actualBatteryDiscountApplied)}
              </span>
            </div>
          )}

          {/* Transport Charges Breakdown (5-Step Formula) */}
          <div className="pt-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-900 flex items-center space-x-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Transport Logistics Charges</span>
                </span>
                <div className="text-[10px] text-gray-500">
                  {orderInput.transportDistanceKm} km • {calculationResult.truckSummary}
                </div>
              </div>
            </div>

            {/* 5 Distinct Transport Breakdown Values */}
            <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-200/80 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-gray-700">
                <span>1. Base Transport Charge:</span>
                <span className="font-mono font-medium">{formatINR(calculationResult.baseTransportCost)}</span>
              </div>

              <div className="flex items-center justify-between text-gray-700">
                <span>2. Additional {calculationResult.transportExtraPercent}% Charge:</span>
                <span className="font-mono font-medium text-amber-700">+ {formatINR(calculationResult.transportExtraCharge)}</span>
              </div>

              <div className="flex items-center justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
                <span>3. Transport Subtotal:</span>
                <span className="font-mono">{formatINR(calculationResult.transportSubtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-gray-700">
                <span>4. GST ({calculationResult.transportGstPercent}%):</span>
                <span className="font-mono font-medium text-blue-700">+ {formatINR(calculationResult.transportGstAmount)}</span>
              </div>

              <div className="flex items-center justify-between font-extrabold text-gray-950 pt-1.5 border-t border-gray-300 text-xs">
                <span>5. Final Transport Cost:</span>
                <span className="font-mono text-red-600 font-bold">{formatINR(calculationResult.totalTransportCost)}</span>
              </div>
            </div>

            {/* Company Support row */}
            {calculationResult.companyTransportSupport > 0 && (
              <div className="flex items-center justify-between pl-3 border-l-2 border-blue-400 text-blue-900 text-xs">
                <div>
                  <span className="font-semibold">Company 50% Transport Support</span>
                  <div className="text-[10px] text-blue-700">
                    Absorbed by Xidaa from scooter discount allowance
                  </div>
                </div>
                <span className="font-mono font-bold text-blue-800">
                  − {formatINR(calculationResult.companyTransportSupport)}
                </span>
              </div>
            )}

            {/* Customer Transport Payment */}
            <div className="flex items-center justify-between pl-3 border-l-2 border-gray-400 font-bold text-gray-900 text-xs">
              <div>
                <span>Customer Transport Payment</span>
                <div className="text-[10px] text-gray-500 font-normal">
                  {calculationResult.transportSharingApplied ? 'Remaining 50% freight' : 'Full 100% freight'}
                </div>
              </div>
              <span className="font-mono">
                + {formatINR(calculationResult.customerTransportPayment)}
              </span>
            </div>
          </div>

          {/* Total Dealership Benefit */}
          <div className="flex items-center justify-between pt-3 font-extrabold text-sm text-gray-900 bg-gray-50/70 p-3 rounded-xl border border-gray-200">
            <span className="text-gray-800">Total Dealership Benefit Received:</span>
            <span className="font-mono text-emerald-700 text-base">
              {formatINR(calculationResult.totalCustomerDiscountBenefit)}
            </span>
          </div>

        </div>
      </div>

      {/* POLICY CALLOUT */}
      <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 flex items-start space-x-2">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Policy Status:</strong> {calculationResult.eligibilityMessage}
        </p>
      </div>

      {/* MAIN ACTION BUTTONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        {/* Edit Order */}
        <button
          type="button"
          onClick={editCurrentOrder}
          className="py-3 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Order</span>
        </button>

        {/* Save Calculation */}
        <button
          type="button"
          onClick={handleSaveOrder}
          className={`py-3 px-3 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            justSaved
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
          }`}
        >
          {justSaved ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Order</span>
            </>
          )}
        </button>

        {/* Start New Order */}
        <button
          type="button"
          onClick={() => startNewOrder(false)}
          className="py-3 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start New</span>
        </button>

        {/* Print / Download Summary */}
        <button
          type="button"
          onClick={() => setActiveView('print-summary')}
          className="py-3 px-3 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / PDF</span>
        </button>
      </div>

    </div>
  );
};
