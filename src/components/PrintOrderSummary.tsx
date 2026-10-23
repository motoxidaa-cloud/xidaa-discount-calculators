import React from 'react';
import { Printer, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR, formatINRWords } from '../utils/currency';

export const PrintOrderSummary: React.FC = () => {
  const { orderInput, calculationResult, setActiveView } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Action Controls (Hidden when printing) */}
      <div className="no-print flex items-center justify-between pb-3 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveView('results')}
          className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 hover:text-red-600 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Results</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center space-x-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Sheet Card (White enterprise sheet layout) */}
      <div className="print-page bg-white text-gray-900 rounded-2xl p-8 sm:p-10 shadow-lg border border-gray-200 space-y-7 font-sans">
        
        {/* Document Header & Branding */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-red-600 gap-4">
          <div className="flex items-center space-x-4">
            <img 
              src="/assets/xidaa-logo-dark.png" 
              alt="Xidaa Moto" 
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-black tracking-tight text-gray-900">
                XIDAA MOTO PRIVATE LIMITED
              </h1>
              <p className="text-xs uppercase font-extrabold tracking-widest text-red-600">
                Ride the Electric Thunder
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                +91 9717724633 • info@xidaaindia.com • www.xidaaindia.com
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="inline-block bg-red-100 text-red-800 text-xs font-black uppercase tracking-wider px-3 py-1 rounded border border-red-300">
              Internal Calculation / Subject to Approval
            </div>
            <div className="text-[11px] font-mono text-gray-500 mt-1">
              Doc Ref: {orderInput.orderRef}
            </div>
            <div className="text-[11px] text-gray-500">
              Date: {orderInput.orderDate}
            </div>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-[11px] text-amber-900 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 flex-shrink-0" />
          <p>
            <strong>COMMERCIAL NOTICE:</strong> This calculation summary represents an internal commercial discount authorization and freight logistics evaluation sheet. 
            <strong> IT IS NOT A TAX INVOICE OR BILL OF SUPPLY.</strong>
          </p>
        </div>

        {/* Dealership Details Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              Dealership / Customer
            </span>
            <div className="text-sm font-bold text-gray-900 mt-1">
              {orderInput.customerName || 'Direct Dealership Order'}
            </div>
            <div className="text-gray-600 text-[11px] mt-0.5">Authorized Xidaa Dealership Network</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              Order Quantities Overview
            </span>
            <div className="text-sm font-bold text-gray-900 mt-1">
              {calculationResult.totalScooters} Scooters Total
            </div>
            <div className="text-gray-600 text-[11px] mt-0.5">
              {calculationResult.totalDlScooters} DL Units • {calculationResult.totalOtherScooters} Other Units • {calculationResult.totalBatteries} Batteries
            </div>
          </div>
        </div>

        {/* Scooter Items Table */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase font-extrabold text-gray-800 tracking-wider">
            1. Scooter Order Line Items
          </h3>
          <table className="w-full text-xs text-left border-collapse border border-gray-200">
            <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
              <tr>
                <th className="py-2 px-3 border-r border-gray-200">Scooter Model</th>
                <th className="py-2 px-3 border-r border-gray-200">Category</th>
                <th className="py-2 px-3 text-center border-r border-gray-200">Quantity</th>
                <th className="py-2 px-3 text-right border-r border-gray-200">Unit Price</th>
                <th className="py-2 px-3 text-right">Max Allowance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-800">
              {orderInput.scooterItems.map((item, idx) => {
                const limit = item.category === 'DL Model' ? 500 : 1000;
                return (
                  <tr key={idx}>
                    <td className="py-2 px-3 border-r border-gray-200 font-bold">{item.modelName}</td>
                    <td className="py-2 px-3 border-r border-gray-200">{item.category}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold border-r border-gray-200">{item.quantity}</td>
                    <td className="py-2 px-3 text-right font-mono border-r border-gray-200">
                      {item.unitPrice ? formatINR(item.unitPrice) : '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                      {formatINR(item.quantity * limit)}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 font-bold">
                <td colSpan={2} className="py-2 px-3 border-r border-gray-200">Total Scooter Quota</td>
                <td className="py-2 px-3 text-center font-mono border-r border-gray-200">{calculationResult.totalScooters}</td>
                <td className="py-2 px-3 text-right font-mono border-r border-gray-200">
                  {calculationResult.grossScooterAmount ? formatINR(calculationResult.grossScooterAmount) : '—'}
                </td>
                <td className="py-2 px-3 text-right font-mono text-emerald-800">
                  {formatINR(calculationResult.scooterDiscountAllowance)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Battery Items Table if any */}
        {orderInput.batteryIncluded && calculationResult.totalBatteries > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-extrabold text-gray-800 tracking-wider">
              2. Battery Order Line Items
            </h3>
            <table className="w-full text-xs text-left border-collapse border border-gray-200">
              <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                <tr>
                  <th className="py-2 px-3 border-r border-gray-200">Battery Variant</th>
                  <th className="py-2 px-3 text-center border-r border-gray-200">Quantity</th>
                  <th className="py-2 px-3 text-center border-r border-gray-200">Eligible Disc. Qty</th>
                  <th className="py-2 px-3 text-right border-r border-gray-200">Unit Price</th>
                  <th className="py-2 px-3 text-right">Battery Allowance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {orderInput.batteryItems.map((b, bIdx) => (
                  <tr key={bIdx}>
                    <td className="py-2 px-3 border-r border-gray-200 font-bold">{b.variant}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold border-r border-gray-200">{b.quantity}</td>
                    <td className="py-2 px-3 text-center font-mono border-r border-gray-200">{b.eligibleDiscountQuantity}</td>
                    <td className="py-2 px-3 text-right font-mono border-r border-gray-200">
                      {b.unitPrice ? formatINR(b.unitPrice) : '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800">
                      {formatINR(b.eligibleDiscountQuantity * 500)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Transport & Commercial Summary */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase font-extrabold text-gray-800 tracking-wider">
            3. Transport & Settlement Summary
          </h3>
          <table className="w-full text-xs text-left border-collapse border border-gray-200">
            <tbody className="divide-y divide-gray-200 text-gray-800">
              <tr>
                <td className="py-2 px-3 font-medium text-gray-700">1. Base Transport Charge ({orderInput.transportDistanceKm} km • {calculationResult.truckSummary})</td>
                <td className="py-2 px-3 text-right font-mono">{formatINR(calculationResult.baseTransportCost)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-gray-700">2. Additional {calculationResult.transportExtraPercent}% Charge</td>
                <td className="py-2 px-3 text-right font-mono">+ {formatINR(calculationResult.transportExtraCharge)}</td>
              </tr>
              <tr className="bg-gray-50/70 font-semibold">
                <td className="py-2 px-3">3. Transport Subtotal</td>
                <td className="py-2 px-3 text-right font-mono">{formatINR(calculationResult.transportSubtotal)}</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-medium text-gray-700">4. Transport GST ({calculationResult.transportGstPercent}%)</td>
                <td className="py-2 px-3 text-right font-mono">+ {formatINR(calculationResult.transportGstAmount)}</td>
              </tr>
              <tr className="bg-gray-100 font-extrabold text-gray-900">
                <td className="py-2 px-3">5. Final Transport Cost</td>
                <td className="py-2 px-3 text-right font-mono">{formatINR(calculationResult.totalTransportCost)}</td>
              </tr>
              {calculationResult.companyTransportSupport > 0 && (
                <tr className="bg-blue-50/60">
                  <td className="py-2 px-3 font-semibold text-blue-900">
                    Less: 50% Company Transport Support (Absorbed by Xidaa)
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-blue-800">
                    − {formatINR(calculationResult.companyTransportSupport)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="py-2 px-3 font-bold">Net Customer Transport Payment</td>
                <td className="py-2 px-3 text-right font-mono font-bold">+ {formatINR(calculationResult.customerTransportPayment)}</td>
              </tr>
              <tr className="bg-emerald-50/60 font-bold text-emerald-900">
                <td className="py-2 px-3">Actual Scooter Invoice Discount Applied</td>
                <td className="py-2 px-3 text-right font-mono text-emerald-800">− {formatINR(calculationResult.actualScooterDiscountApplied)}</td>
              </tr>
              {calculationResult.actualBatteryDiscountApplied > 0 && (
                <tr className="bg-emerald-50/60 font-bold text-emerald-900">
                  <td className="py-2 px-3">Actual Battery Invoice Discount Applied</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-800">− {formatINR(calculationResult.actualBatteryDiscountApplied)}</td>
                </tr>
              )}
              <tr className="bg-gray-900 text-white font-bold text-sm">
                <td className="py-3 px-3 uppercase tracking-wider">Final Payable Amount</td>
                <td className="py-3 px-3 text-right font-mono text-base text-red-400">
                  {calculationResult.finalPayableAmount !== null
                    ? formatINR(calculationResult.finalPayableAmount)
                    : 'Prices Pending'}
                </td>
              </tr>
            </tbody>
          </table>

          {calculationResult.finalPayableAmount !== null && (
            <div className="text-right text-xs text-gray-600 font-medium">
              In Words: <strong>{formatINRWords(calculationResult.finalPayableAmount)}</strong>
            </div>
          )}
        </div>

        {/* Triple Signatures */}
        <div className="pt-8 grid grid-cols-3 gap-6 text-center text-xs text-gray-700">
          <div className="space-y-8">
            <div className="h-8 border-b border-gray-400"></div>
            <div>
              <div className="font-bold text-gray-900">Commercial Sales Desk</div>
              <div className="text-[10px] text-gray-500">Prepared By</div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="h-8 border-b border-gray-400"></div>
            <div>
              <div className="font-bold text-gray-900">Accounts & Logistics</div>
              <div className="text-[10px] text-gray-500">Verified</div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="h-8 border-b border-gray-400"></div>
            <div>
              <div className="font-bold text-gray-900">Authorized Dealership Signatory</div>
              <div className="text-[10px] text-gray-500">Confirmed & Accepted</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
