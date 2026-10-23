import type { 
  AppConfig, 
  CalculationResult, 
  OrderInput, 
  TransportAllocationMode, 
  TruckConfig 
} from '../types';
import { formatINR, toPaise, toRupees } from './currency';

/**
 * Pure calculation engine for Xidaa Discount Calculator.
 * Operates with strict integer-paise arithmetic to eliminate floating-point currency discrepancies.
 */
export function calculateOrderFinancials(
  input: OrderInput,
  config: AppConfig
): CalculationResult {
  const auditTrail: CalculationResult['auditTrail'] = [];

  // 1. Scooter Item Calculations
  let totalDlScooters = 0;
  let totalOtherScooters = 0;
  let totalScooters = 0;
  let hasMissingScooterPrice = false;
  let grossScooterPaise = 0;

  (input.scooterItems || []).forEach((item) => {
    const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
    if (qty > 0) {
      totalScooters += qty;
      if (item.category === 'DL Model') {
        totalDlScooters += qty;
      } else {
        totalOtherScooters += qty;
      }

      if (item.unitPrice !== undefined && item.unitPrice !== null && item.unitPrice > 0) {
        grossScooterPaise += toPaise(qty * item.unitPrice);
      } else {
        hasMissingScooterPrice = true;
      }
    }
  });

  const dlLimit = config.discountRates.dlModelMaxDiscount;
  const otherLimit = config.discountRates.otherModelMaxDiscount;

  const dlAllowancePaise = toPaise(totalDlScooters * dlLimit);
  const otherAllowancePaise = toPaise(totalOtherScooters * otherLimit);
  const scooterDiscountAllowancePaise = dlAllowancePaise + otherAllowancePaise;
  const scooterDiscountAllowance = toRupees(scooterDiscountAllowancePaise);

  auditTrail.push({
    step: '1. Scooter Discount Allowance (S)',
    description: `DL: ${totalDlScooters} × ${formatINR(dlLimit)} (${formatINR(toRupees(dlAllowancePaise))}) + Other: ${totalOtherScooters} × ${formatINR(otherLimit)} (${formatINR(toRupees(otherAllowancePaise))})`,
    formula: `(${totalDlScooters} × ${formatINR(dlLimit)}) + (${totalOtherScooters} × ${formatINR(otherLimit)})`,
    amount: scooterDiscountAllowance,
  });

  // 2. Battery Item Calculations
  let totalBatteries = 0;
  let totalEligibleBatteries = 0;
  let grossBatteryPaise = 0;
  let hasMissingBatteryPrice = false;
  const batteryBreakdown: CalculationResult['batteryBreakdown'] = [];

  if (input.batteryIncluded && input.batteryItems && input.batteryItems.length > 0) {
    input.batteryItems.forEach((b) => {
      const bQty = Math.max(0, Math.floor(Number(b.quantity) || 0));
      if (bQty > 0) {
        totalBatteries += bQty;
        const eligible = Math.min(bQty, Math.max(0, Math.floor(Number(b.eligibleDiscountQuantity) || 0)));
        totalEligibleBatteries += eligible;
        batteryBreakdown.push({ variant: b.variant, quantity: bQty });

        if (b.unitPrice !== undefined && b.unitPrice !== null && b.unitPrice > 0) {
          grossBatteryPaise += toPaise(bQty * b.unitPrice);
        } else {
          hasMissingBatteryPrice = true;
        }
      }
    });
  }

  const batteryAllowancePaise = toPaise(totalEligibleBatteries * config.discountRates.batteryMaxDiscount);
  const batteryDiscountAllowance = toRupees(batteryAllowancePaise);

  auditTrail.push({
    step: '2. Battery Discount Allowance (B)',
    description: input.batteryIncluded && totalEligibleBatteries > 0
      ? `${totalEligibleBatteries} eligible batteries @ ${formatINR(config.discountRates.batteryMaxDiscount)} each`
      : 'No eligible battery discount (batteries not included or 0 eligible)',
    formula: `${totalEligibleBatteries} × ${formatINR(config.discountRates.batteryMaxDiscount)}`,
    amount: batteryDiscountAllowance,
  });

  const totalDiscountAllowance = scooterDiscountAllowance + batteryDiscountAllowance;

  // 3. Transport Logistics Calculations
  // Step 1: Base Transport = Distance in KM × Truck Rate (sum of truck allocations)
  // Step 2: Extra Charge % (default 10%) = Base Transport × Extra%
  // Step 3: Transport Subtotal = Base Transport + Extra Charge
  // Step 4: Transport GST % (default 5%) = Transport Subtotal × GST%
  // Step 5: Final Transport Cost = Transport Subtotal + Transport GST
  const distanceKm = Math.max(0, Number(input.transportDistanceKm) || 0);
  let baseTransportPaise = 0;
  let totalCapacity = 0;
  const truckDescriptions: string[] = [];

  if (input.truckAllocations && input.truckAllocations.length > 0) {
    input.truckAllocations.forEach((alloc) => {
      const count = Math.max(0, Math.floor(Number(alloc.count) || 0));
      if (count > 0) {
        totalCapacity += count * alloc.capacity;
        const lineBasePaise = toPaise(count * distanceKm * alloc.ratePerKm);
        baseTransportPaise += lineBasePaise;
        truckDescriptions.push(
          `${count}x ${alloc.capacity}-scooter truck (${distanceKm} km @ ${formatINR(alloc.ratePerKm)}/km = ${formatINR(toRupees(lineBasePaise))})`
        );
      }
    });
  }

  const baseTransportCost = toRupees(baseTransportPaise);

  // Additional % extra charge (configurable, default 10%)
  const transportExtraPercent = config.transportSettings?.extraChargePercent ?? 10;
  const transportExtraPaise = Math.round(baseTransportPaise * (transportExtraPercent / 100));
  const transportExtraCharge = toRupees(transportExtraPaise);

  // Transport subtotal after extra charge
  const transportSubtotalPaise = baseTransportPaise + transportExtraPaise;
  const transportSubtotal = toRupees(transportSubtotalPaise);

  // Transport GST % (configurable, default 5%) calculated on Transport Subtotal
  const transportGstPercent = config.transportSettings?.transportGstPercent ?? 5;
  const transportGstPaise = Math.round(transportSubtotalPaise * (transportGstPercent / 100));
  const transportGstAmount = toRupees(transportGstPaise);

  // Final Transport Cost = Subtotal + Transport GST
  const finalTransportPaise = transportSubtotalPaise + transportGstPaise;
  const totalTransportCost = toRupees(finalTransportPaise);

  // Half-transport sharing quota (50% of final transport cost)
  const halfTransportPaise = Math.round(finalTransportPaise * (config.transportSharing.companySharePercent / 100));
  const halfTransportCost = toRupees(halfTransportPaise);
  const truckSummary = truckDescriptions.join(' + ') || 'No trucks allocated';

  auditTrail.push({
    step: '3. Transport Logistics Charges (5-Step Formula)',
    description: `Base: ${formatINR(baseTransportCost)} + ${transportExtraPercent}% Extra: ${formatINR(transportExtraCharge)} = Subtotal: ${formatINR(transportSubtotal)} + ${transportGstPercent}% GST: ${formatINR(transportGstAmount)} = Final Transport: ${formatINR(totalTransportCost)} (${truckSummary})`,
    formula: `[Base (${formatINR(baseTransportCost)}) × (1 + ${transportExtraPercent}%)] × (1 + ${transportGstPercent}%)`,
    amount: totalTransportCost,
  });

  // 4. Smart Transport-Sharing Engine
  // Rule: Scooter discount allowance (S) covers 50% of final transport cost (H). Battery allowance (B) is NEVER used for freight sharing.
  const isSharingEligible = totalTransportCost > 0 && scooterDiscountAllowancePaise >= halfTransportPaise;

  let transportSharingApplied = false;
  let companyTransportSupportPaise = 0;
  let customerTransportPaymentPaise = finalTransportPaise;
  let remainingScooterDiscountPaise = scooterDiscountAllowancePaise;
  let effectiveAllocationMode: TransportAllocationMode = input.allocationMode;
  let eligibilityMessage = '';
  let warningMessage: string | undefined;
  let suggestedMode: TransportAllocationMode | undefined;

  switch (input.allocationMode) {
    case 'Automatic': {
      if (isSharingEligible) {
        transportSharingApplied = true;
        companyTransportSupportPaise = halfTransportPaise;
        customerTransportPaymentPaise = finalTransportPaise - halfTransportPaise;
        remainingScooterDiscountPaise = scooterDiscountAllowancePaise - halfTransportPaise;
        effectiveAllocationMode = 'Share Transport';
        eligibilityMessage = `Scooter discount allowance (${formatINR(scooterDiscountAllowance)}) covers 50% freight (${formatINR(halfTransportCost)}). Company absorbs 50% freight support. Remaining scooter discount (${formatINR(toRupees(remainingScooterDiscountPaise))}) applied to invoice.`;
      } else {
        transportSharingApplied = false;
        companyTransportSupportPaise = 0;
        customerTransportPaymentPaise = finalTransportPaise;
        remainingScooterDiscountPaise = scooterDiscountAllowancePaise;
        effectiveAllocationMode = 'Full Scooter Discount';
        if (totalTransportCost > 0) {
          eligibilityMessage = `Scooter discount allowance (${formatINR(scooterDiscountAllowance)}) is insufficient for 50% transport support (${formatINR(halfTransportCost)}). Full discount applied to scooter invoice; customer pays 100% transport.`;
        } else {
          eligibilityMessage = `Zero transport distance. Full scooter discount applied to vehicle invoice.`;
        }
      }
      break;
    }

    case 'Full Scooter Discount': {
      transportSharingApplied = false;
      companyTransportSupportPaise = 0;
      customerTransportPaymentPaise = finalTransportPaise;
      remainingScooterDiscountPaise = scooterDiscountAllowancePaise;
      effectiveAllocationMode = 'Full Scooter Discount';
      eligibilityMessage = `Full scooter discount applied to vehicle invoice. Customer pays 100% transport charge.`;
      break;
    }

    case 'Share Transport': {
      if (isSharingEligible) {
        transportSharingApplied = true;
        companyTransportSupportPaise = halfTransportPaise;
        customerTransportPaymentPaise = finalTransportPaise - halfTransportPaise;
        remainingScooterDiscountPaise = scooterDiscountAllowancePaise - halfTransportPaise;
        effectiveAllocationMode = 'Share Transport';
        eligibilityMessage = `50% transport sharing active. Company absorbs ${formatINR(halfTransportCost)}. Remaining scooter discount (${formatINR(toRupees(remainingScooterDiscountPaise))}) applied to invoice.`;
      } else {
        // INELIGIBLE CASE: S < H
        transportSharingApplied = false;
        companyTransportSupportPaise = 0;
        customerTransportPaymentPaise = finalTransportPaise;
        remainingScooterDiscountPaise = scooterDiscountAllowancePaise;
        effectiveAllocationMode = 'Full Scooter Discount';
        suggestedMode = 'Full Scooter Discount';
        const deficit = toRupees(halfTransportPaise - scooterDiscountAllowancePaise);
        warningMessage = `Transport Sharing Ineligible: Scooter discount allowance (${formatINR(scooterDiscountAllowance)}) cannot cover 50% freight (${formatINR(halfTransportCost)}). Deficit: ${formatINR(deficit)}. Recommend applying discount to scooter prices instead.`;
        eligibilityMessage = `Transport sharing requirement not met. Applied full discount to scooter invoice.`;
      }
      break;
    }
  }

  const companyTransportSupport = toRupees(companyTransportSupportPaise);
  const customerTransportPayment = toRupees(customerTransportPaymentPaise);
  const actualScooterDiscountApplied = toRupees(remainingScooterDiscountPaise);
  const actualBatteryDiscountApplied = batteryDiscountAllowance;
  const remainingScooterDiscount = actualScooterDiscountApplied;

  // Total customer benefit = actual scooter discount + battery discount + company transport support
  // When transport sharing is active: (S - H) + B + H = S + B. Never exceeds budget.
  const totalCustomerDiscountBenefit = toRupees(
    remainingScooterDiscountPaise + batteryAllowancePaise + companyTransportSupportPaise
  );

  // 5. Check Price Completeness & Financials
  const hasItemsToPrice = totalScooters > 0 || totalBatteries > 0;
  const hasAllPrices = hasItemsToPrice && !hasMissingScooterPrice && (!input.batteryIncluded || !hasMissingBatteryPrice);

  let grossScooterAmount: number | null = null;
  let grossBatteryAmount: number | null = null;
  let grossTotalAmount: number | null = null;
  let subtotalBeforeTax: number | null = null;
  let gstAmount: number | null = null;
  let finalPayableAmount: number | null = null;
  let missingPriceReason: string | undefined;

  if (!hasItemsToPrice) {
    missingPriceReason = 'Add at least one scooter or battery item to calculate order.';
  } else if (!hasAllPrices) {
    missingPriceReason = 'Enter prices to calculate final payable amount.';
  } else {
    // All prices provided!
    grossScooterAmount = toRupees(grossScooterPaise);
    grossBatteryAmount = toRupees(grossBatteryPaise);
    const grossTotalPaise = grossScooterPaise + grossBatteryPaise;
    grossTotalAmount = toRupees(grossTotalPaise);

    // Net products after applying remaining scooter discount and battery discount
    const netProductsPaise = Math.max(0, grossTotalPaise - remainingScooterDiscountPaise - batteryAllowancePaise);

    // Note: Customer transport payment already includes transport GST (Step 3/4).
    // Do NOT add GST again elsewhere to the same transport amount.
    const { gstTreatment, gstRatePercent } = config.taxSettings;
    let productGstPaise = 0;

    if (gstTreatment === 'Exclusive' && gstRatePercent > 0) {
      productGstPaise = Math.round(netProductsPaise * (gstRatePercent / 100));
      subtotalBeforeTax = toRupees(netProductsPaise + customerTransportPaymentPaise);
      gstAmount = toRupees(productGstPaise);
      finalPayableAmount = toRupees(netProductsPaise + productGstPaise + customerTransportPaymentPaise);
    } else if (gstTreatment === 'Inclusive' && gstRatePercent > 0) {
      productGstPaise = Math.round(netProductsPaise - (netProductsPaise / (1 + gstRatePercent / 100)));
      subtotalBeforeTax = toRupees(netProductsPaise + customerTransportPaymentPaise);
      gstAmount = toRupees(productGstPaise);
      finalPayableAmount = toRupees(netProductsPaise + customerTransportPaymentPaise);
    } else {
      // 'None'
      subtotalBeforeTax = toRupees(netProductsPaise + customerTransportPaymentPaise);
      gstAmount = null;
      finalPayableAmount = toRupees(netProductsPaise + customerTransportPaymentPaise);
    }
  }

  return {
    totalDlScooters,
    totalOtherScooters,
    totalScooters,
    totalBatteries,
    batteryBreakdown,
    scooterDiscountAllowance,
    batteryDiscountAllowance,
    totalDiscountAllowance,
    baseTransportCost,
    transportExtraPercent,
    transportExtraCharge,
    transportSubtotal,
    transportGstPercent,
    transportGstAmount,
    totalTransportCost,
    halfTransportCost,
    totalCapacity,
    truckSummary,
    transportSharingEligible: isSharingEligible,
    transportSharingApplied,
    companyTransportSupport,
    customerTransportPayment,
    actualScooterDiscountApplied,
    actualBatteryDiscountApplied,
    remainingScooterDiscount,
    totalCustomerDiscountBenefit,
    hasAllPrices,
    missingPriceReason,
    grossScooterAmount,
    grossBatteryAmount,
    grossTotalAmount,
    subtotalBeforeTax,
    gstAmount,
    finalPayableAmount,
    gstTreatment: config.taxSettings.gstTreatment,
    gstRatePercent: config.taxSettings.gstRatePercent,
    effectiveAllocationMode,
    eligibilityMessage,
    warningMessage,
    suggestedMode,
    auditTrail,
  };
}

/**
 * Helper to auto-allocate trucks based on order total scooters
 */
export function recommendTruckAllocation(
  totalScooters: number,
  truckConfigs: TruckConfig[]
): {
  trucks: { truck: TruckConfig; count: number }[];
  totalCapacity: number;
} {
  if (totalScooters <= 0) {
    return {
      trucks: [{ truck: truckConfigs[0], count: 1 }],
      totalCapacity: truckConfigs[0]?.capacity || 12,
    };
  }

  // Sort descending: 55, 32, 12
  const sorted = [...truckConfigs].sort((a, b) => b.capacity - a.capacity);
  let remaining = totalScooters;
  const result: { truck: TruckConfig; count: number }[] = [];
  let totalCapacity = 0;

  for (const truck of sorted) {
    if (remaining >= truck.capacity) {
      const count = Math.floor(remaining / truck.capacity);
      result.push({ truck, count });
      remaining -= count * truck.capacity;
      totalCapacity += count * truck.capacity;
    }
  }

  if (remaining > 0) {
    const ascending = [...truckConfigs].sort((a, b) => a.capacity - b.capacity);
    const chosen = ascending.find((t) => t.capacity >= remaining) || sorted[0];
    const existing = result.find((r) => r.truck.id === chosen.id);
    if (existing) {
      existing.count += 1;
    } else {
      result.push({ truck: chosen, count: 1 });
    }
    totalCapacity += chosen.capacity;
  }

  return {
    trucks: result,
    totalCapacity,
  };
}
