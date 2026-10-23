import React, { useState } from 'react';
import { 
  Building2, 
  Calendar, 
  Hash, 
  Plus, 
  Trash2, 
  Truck, 
  BatteryCharging, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  RotateCw, 
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateOrderRef } from '../utils/orderDefaults';
import { CATALOGUE_SCOOTER_MODELS } from '../data/catalogueModels';
import type { BatteryVariant } from '../types';
import { formatINR } from '../utils/currency';

export const OrderForm: React.FC = () => {
  const { 
    orderInput, 
    updateOrderInput, 
    calculationResult, 
    appConfig,
    addScooterItem,
    updateScooterItem,
    removeScooterItem,
    addBatteryItem,
    updateBatteryItem,
    removeBatteryItem,
    setSingleTruck,
    autoOptimizeFleet,
    calculateAndShowResults,
    isCalculating,
    calculationError,
    clearCalculationError
  } = useApp();

  // Collapsible state for Transport & Advanced details
  const [isTransportOpen, setIsTransportOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);

  const batteryVariants: BatteryVariant[] = [
    '60V 30Ah LFP',
    '60V 45Ah LFP',
    '60V 55Ah pouch cell',
  ];

  const handleRegenerateRef = () => {
    updateOrderInput({ orderRef: generateOrderRef() });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    calculateAndShowResults();
  };

  const selectedPrimaryTruck = orderInput.truckAllocations[0] || {
    truckId: 'truck-12',
    truckName: '12-Scooter Truck',
    capacity: 12,
    ratePerKm: 40,
    count: 1,
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl mx-auto space-y-5 pb-28 sm:pb-12">
      
      {/* Calculation Error Alert if any */}
      {calculationError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start justify-between text-xs text-red-800 shadow-xs">
          <div className="flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Calculation Check:</strong>
              <span>{calculationError}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={clearCalculationError}
            className="text-red-500 hover:text-red-800 font-bold ml-2 text-base leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Top Card: Order & Customer Information */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900">Customer & Order Details</h2>
          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-semibold">
              {orderInput.orderRef}
            </span>
            <button
              type="button"
              onClick={handleRegenerateRef}
              title="New Reference"
              className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-3.5">
          {/* Customer / Dealer Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-red-600" />
              <span>Customer / Dealer Name *</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Aodn Motors, Pune"
              value={orderInput.customerName}
              onChange={(e) => updateOrderInput({ customerName: e.target.value })}
              className="w-full bg-gray-50/60 border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all font-medium"
            />
          </div>

          {/* Date and Ref Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-red-600" />
                <span>Order Date</span>
              </label>
              <input
                type="date"
                value={orderInput.orderDate}
                onChange={(e) => updateOrderInput({ orderDate: e.target.value })}
                className="w-full bg-gray-50/60 border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-red-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-600 mb-1 flex items-center space-x-1">
                <Hash className="w-3 h-3 text-red-600" />
                <span>Order Reference</span>
              </label>
              <input
                type="text"
                value={orderInput.orderRef}
                onChange={(e) => updateOrderInput({ orderRef: e.target.value })}
                className="w-full bg-gray-50/60 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-900 focus:bg-white focus:outline-none focus:border-red-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: SCOOTER ORDER ITEMS (Repeatable List) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-900">Scooter Order Items</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Add multiple scooter models and assign quantities per model.
            </p>
          </div>

          <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
            {calculationResult.totalScooters} Units Total
          </span>
        </div>

        {/* Scooter Items List */}
        <div className="space-y-4">
          {orderInput.scooterItems.map((item, idx) => (
            <div 
              key={item.id} 
              className="p-4 rounded-xl bg-gray-50/70 border border-gray-200 space-y-3 relative transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <span>Model Item</span>
                </span>

                {orderInput.scooterItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeScooterItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                    title="Remove Model"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Model Select */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Scooter Model
                </label>
                <select
                  value={item.modelId}
                  onChange={(e) => updateScooterItem(item.id, { modelId: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:border-red-600 shadow-2xs"
                >
                  {CATALOGUE_SCOOTER_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.defaultCategory})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Toggle (DL Model vs Other Model) */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Model Category (Discount Limit)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateScooterItem(item.id, { category: 'DL Model' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      item.category === 'DL Model'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>DL Model</span>
                    <span className="block text-[10px] font-normal opacity-80">₹500 / scooter</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateScooterItem(item.id, { category: 'Other Model' })}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                      item.category === 'Other Model'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-2xs'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span>Other Model</span>
                    <span className="block text-[10px] font-normal opacity-80">₹1,000 / scooter</span>
                  </button>
                </div>
              </div>

              {/* Quantity & Unit Price Grid */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Quantity with touch-friendly steppers */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => updateScooterItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center font-bold text-sm shadow-2xs active:bg-gray-200"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity || ''}
                      onChange={(e) => updateScooterItem(item.id, { quantity: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-center text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-red-600"
                    />
                    <button
                      type="button"
                      onClick={() => updateScooterItem(item.id, { quantity: item.quantity + 1 })}
                      className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center font-bold text-sm shadow-2xs active:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Unit Price (Optional) */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    Unit Price (₹) <span className="text-[10px] text-gray-400 font-normal">Optional</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 40000"
                    value={item.unitPrice !== undefined ? item.unitPrice : ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : Number(e.target.value);
                      updateScooterItem(item.id, { unitPrice: val });
                    }}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-red-600 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Another Model Button */}
        <button
          type="button"
          onClick={addScooterItem}
          className="w-full py-2.5 border-2 border-dashed border-red-300 hover:border-red-500 bg-red-50/50 hover:bg-red-50 text-red-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Another Model</span>
        </button>

        {/* Live Automatic Calculation Summary for Scooters */}
        <div className="p-3 bg-gray-100/80 rounded-xl text-xs space-y-1.5 border border-gray-200">
          <div className="flex items-center justify-between font-semibold text-gray-800">
            <span>Scooters Summary</span>
            <span className="font-mono">{calculationResult.totalScooters} Units Total</span>
          </div>
          <div className="flex items-center justify-between text-gray-600 text-[11px]">
            <span>DL Scooters: <strong>{calculationResult.totalDlScooters}</strong> (× ₹500 = {formatINR(calculationResult.totalDlScooters * appConfig.discountRates.dlModelMaxDiscount)})</span>
            <span>Other: <strong>{calculationResult.totalOtherScooters}</strong> (× ₹1,000 = {formatINR(calculationResult.totalOtherScooters * appConfig.discountRates.otherModelMaxDiscount)})</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-xs font-bold text-gray-900">
            <span>Total Scooter Discount Allowance:</span>
            <span className="font-mono text-emerald-700">{formatINR(calculationResult.scooterDiscountAllowance)}</span>
          </div>
        </div>
      </div>

      {/* SECTION: BATTERY ORDER SECTION */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-gray-900">Battery Order</h2>
          </div>

          {/* Battery Included Toggle */}
          <div className="inline-flex rounded-lg border border-gray-300 p-0.5 bg-gray-100">
            <button
              type="button"
              onClick={() => updateOrderInput({ batteryIncluded: false })}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                !orderInput.batteryIncluded
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              No
            </button>
            <button
              type="button"
              onClick={() => updateOrderInput({ batteryIncluded: true })}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                orderInput.batteryIncluded
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Yes
            </button>
          </div>
        </div>

        {orderInput.batteryIncluded ? (
          <div className="space-y-4">
            <div className="text-xs text-gray-500">
              Each eligible battery receives an additional <strong>₹500 discount allowance</strong>, kept strictly separate from scooter transport sharing.
            </div>

            {/* Battery Items */}
            {orderInput.batteryItems.map((bItem, bIdx) => (
              <div 
                key={bItem.id} 
                className="p-3.5 rounded-xl bg-emerald-50/40 border border-emerald-200/80 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">
                    Battery Variant #{bIdx + 1}
                  </span>
                  {orderInput.batteryItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBatteryItem(bItem.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Variant */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Variant
                    </label>
                    <select
                      value={bItem.variant}
                      onChange={(e) => updateBatteryItem(bItem.id, { variant: e.target.value as BatteryVariant })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-red-600"
                    >
                      {batteryVariants.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={bItem.quantity || ''}
                      onChange={(e) => {
                        const q = Math.max(1, parseInt(e.target.value) || 1);
                        updateBatteryItem(bItem.id, { quantity: q, eligibleDiscountQuantity: q });
                      }}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  {/* Optional Unit Price */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Unit Price (₹) <span className="text-[10px] text-gray-400 font-normal">Optional</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 25000"
                      value={bItem.unitPrice !== undefined ? bItem.unitPrice : ''}
                      onChange={(e) => {
                        const p = e.target.value === '' ? undefined : Number(e.target.value);
                        updateBatteryItem(bItem.id, { unitPrice: p });
                      }}
                      className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-mono text-gray-900 focus:outline-none focus:border-red-600 placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-emerald-800 font-medium">
                  Eligible Discount: {bItem.eligibleDiscountQuantity} × ₹500 = <strong>{formatINR(bItem.eligibleDiscountQuantity * 500)}</strong>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addBatteryItem}
              className="w-full py-2 border border-emerald-300 hover:border-emerald-500 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Battery Type</span>
            </button>

            {/* Total Battery Discount Pill */}
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg text-xs font-bold text-emerald-900 border border-emerald-200">
              <span>Total Battery Discount Allowance:</span>
              <span className="font-mono text-emerald-700">{formatINR(calculationResult.batteryDiscountAllowance)}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-500 italic">
            No batteries included in this order. Battery discount is ₹0.
          </div>
        )}
      </div>

      {/* SECTION: TRANSPORT LOGISTICS (Collapsible) */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsTransportOpen(!isTransportOpen)}
          className="w-full p-5 sm:p-6 text-left flex items-center justify-between hover:bg-gray-50/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Transport & Truck Allocation</h2>
              <div className="text-xs text-gray-500 mt-0.5">
                {orderInput.transportDistanceKm} km • {selectedPrimaryTruck.capacity}-scooter truck • Total Freight: <strong className="text-gray-900 font-mono">{formatINR(calculationResult.totalTransportCost)}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-blue-600 hidden sm:inline">
              {isTransportOpen ? 'Hide' : 'Configure'}
            </span>
            {isTransportOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </div>
        </button>

        {isTransportOpen && (
          <div className="p-5 sm:p-6 pt-0 border-t border-gray-100 space-y-4">
            
            {/* Distance input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Transport Distance (km)
                </label>
                <div className="flex items-center space-x-1">
                  {[100, 200, 350, 500, 1000].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => updateOrderInput({ transportDistanceKm: d })}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
                        orderInput.transportDistanceKm === d
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {d}km
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min="0"
                value={orderInput.transportDistanceKm || ''}
                onChange={(e) => updateOrderInput({ transportDistanceKm: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full bg-gray-50/60 border border-gray-300 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-gray-900 focus:bg-white focus:outline-none focus:border-red-600"
              />
            </div>

            {/* Truck Selector: 12, 32, 55 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Truck Capacity & Rate
                </label>
                <button
                  type="button"
                  onClick={autoOptimizeFleet}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Fit Fleet ({calculationResult.totalScooters} scooters)</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {appConfig.transportRates.map((t) => {
                  const isSelected = orderInput.truckAllocations.some((a) => a.truckId === t.id && a.count > 0);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSingleTruck(t.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-2xs'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-extrabold text-sm">{t.capacity} Units</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">₹{t.ratePerKm} / km</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5-Step Transport Breakdown */}
            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200/80 text-xs space-y-2">
              <div className="font-bold text-blue-950 flex items-center justify-between border-b border-blue-200/60 pb-1.5">
                <span>Transport Cost Breakdown</span>
                <span className="text-[10px] text-blue-700 font-semibold">{calculationResult.truckSummary}</span>
              </div>

              <div className="space-y-1.5 text-blue-900 font-medium">
                {/* 1. Base Transport Charge */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">1. Base Transport Charge:</span>
                  <span className="font-mono font-semibold text-gray-900">{formatINR(calculationResult.baseTransportCost)}</span>
                </div>

                {/* 2. Additional 10% Charge */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">2. Additional {calculationResult.transportExtraPercent}% Charge:</span>
                  <span className="font-mono font-semibold text-gray-900">+ {formatINR(calculationResult.transportExtraCharge)}</span>
                </div>

                {/* 3. Transport Subtotal */}
                <div className="flex items-center justify-between pt-1 border-t border-blue-200/40 font-semibold">
                  <span className="text-blue-950">3. Transport Subtotal:</span>
                  <span className="font-mono text-blue-950">{formatINR(calculationResult.transportSubtotal)}</span>
                </div>

                {/* 4. GST (5%) */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">4. GST ({calculationResult.transportGstPercent}%):</span>
                  <span className="font-mono font-semibold text-gray-900">+ {formatINR(calculationResult.transportGstAmount)}</span>
                </div>

                {/* 5. Final Transport Cost */}
                <div className="flex items-center justify-between pt-1.5 border-t border-blue-200 text-sm font-extrabold text-blue-950">
                  <span>5. Final Transport Cost:</span>
                  <span className="font-mono text-red-600">{formatINR(calculationResult.totalTransportCost)}</span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-blue-800">
                <span>50% Transport Sharing Value:</span>
                <strong className="font-mono">{formatINR(calculationResult.halfTransportCost)}</strong>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* SECTION: DISCOUNT ALLOCATION SELECTOR (Smart Sharing Engine) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Discount Allocation Mode</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Scooter discount allowance can optionally cover 50% of transport freight.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Automatic */}
          <button
            type="button"
            onClick={() => updateOrderInput({ allocationMode: 'Automatic' })}
            className={`p-3 rounded-xl border text-left transition-all relative ${
              orderInput.allocationMode === 'Automatic'
                ? 'bg-red-50 border-red-500 text-red-950 shadow-2xs'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-xs font-bold">Automatic</span>
              <span className="text-[9px] bg-red-600 text-white font-bold px-1.5 py-0.2 rounded">Recommended</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Absorbs 50% freight if scooter discount covers it; applies full discount to price if not.
            </p>
          </button>

          {/* Full Scooter Discount */}
          <button
            type="button"
            onClick={() => updateOrderInput({ allocationMode: 'Full Scooter Discount' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              orderInput.allocationMode === 'Full Scooter Discount'
                ? 'bg-blue-50 border-blue-500 text-blue-950 shadow-2xs'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="text-xs font-bold block mb-0.5">Discount on Price</span>
            <p className="text-[11px] text-gray-500">
              Apply 100% of discount to scooter invoice. Customer pays 100% freight.
            </p>
          </button>

          {/* Share Transport */}
          <button
            type="button"
            onClick={() => updateOrderInput({ allocationMode: 'Share Transport' })}
            className={`p-3 rounded-xl border text-left transition-all ${
              orderInput.allocationMode === 'Share Transport'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs'
                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="text-xs font-bold block mb-0.5">Share Transport (50/50)</span>
            <p className="text-[11px] text-gray-500">
              Company absorbs 50% transport from scooter discount allowance.
            </p>
          </button>
        </div>

        {/* Ineligible Warning Callout */}
        {calculationResult.warningMessage && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-2">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>{calculationResult.warningMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => updateOrderInput({ allocationMode: 'Full Scooter Discount' })}
              className="text-[11px] font-bold text-amber-900 underline hover:text-black"
            >
              Switch to "Discount on Price" mode
            </button>
          </div>
        )}
      </div>

      {/* Optional Commercial Notes */}
      <div className="text-xs text-gray-500">
        <button
          type="button"
          onClick={() => setIsNotesOpen(!isNotesOpen)}
          className="text-gray-600 hover:text-gray-900 font-semibold flex items-center space-x-1"
        >
          <span>{isNotesOpen ? '− Hide Delivery Notes' : '+ Add Optional Delivery Notes'}</span>
        </button>

        {isNotesOpen && (
          <textarea
            rows={2}
            value={orderInput.notes || ''}
            onChange={(e) => updateOrderInput({ notes: e.target.value })}
            placeholder="Special commercial terms, transport remarks..."
            className="w-full mt-2 bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs text-gray-900 focus:bg-white focus:outline-none focus:border-red-600"
          />
        )}
      </div>

      {/* STICKY BOTTOM ACTION BAR (Mobile-First) */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
              {calculationResult.totalScooters} Scooters • {calculationResult.totalBatteries} Batteries
            </span>
            <span className="text-xs font-bold text-gray-900">
              Total Discount: <strong className="text-emerald-700 font-mono">{formatINR(calculationResult.totalDiscountAllowance)}</strong>
            </span>
          </div>

          <button
            type="submit"
            disabled={isCalculating}
            className={`py-3 px-6 sm:px-8 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-xl shadow-md shadow-red-600/30 flex items-center space-x-2 transition-all ${
              isCalculating ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isCalculating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Calculating...</span>
              </>
            ) : (
              <>
                <span>Calculate Order</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

    </form>
  );
};
