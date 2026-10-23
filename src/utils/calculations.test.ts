import { describe, expect, it } from 'vitest';
import { calculateOrderFinancials } from './calculations';
import { DEFAULT_APP_CONFIG } from '../data/defaultConfig';
import type { AppConfig, OrderInput } from '../types';

describe('Xidaa Discount Calculator - Updated Transport Formula & Sharing Tests', () => {
  it('Prompt Example: 12-scooter truck travelling 1,000 km (Exact Match)', () => {
    const input: OrderInput = {
      customerName: 'Aodn Motors Dealership',
      orderRef: 'XD-EX-1000KM',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 12, unitPrice: 50000 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 1000,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    // Step 1: Base transport = 1,000 km × ₹40/km = ₹40,000
    expect(res.baseTransportCost).toBe(40000);
    // Step 2: Additional 10% charge = ₹4,000
    expect(res.transportExtraPercent).toBe(10);
    expect(res.transportExtraCharge).toBe(4000);
    // Step 3: Transport subtotal = ₹44,000
    expect(res.transportSubtotal).toBe(44000);
    // Step 4: GST at 5% on ₹44,000 = ₹2,200
    expect(res.transportGstPercent).toBe(5);
    expect(res.transportGstAmount).toBe(2200);
    // Step 5: Final transport payable = ₹46,200
    expect(res.totalTransportCost).toBe(46200);
    // 50% threshold H = ₹23,100
    expect(res.halfTransportCost).toBe(23100);
  });

  it('All 3 Truck Rates: 32-scooter truck rate (₹55/km) for 1,000 km', () => {
    const input: OrderInput = {
      customerName: 'Test 32-Truck',
      orderRef: 'XD-TRUCK-32',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 32 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 1000,
      truckAllocations: [
        { truckId: 'truck-32', truckName: '32-Scooter Truck', capacity: 32, ratePerKm: 55, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    // Step 1: Base = 1,000 × 55 = ₹55,000
    expect(res.baseTransportCost).toBe(55000);
    // Step 2: 10% Extra = ₹5,500
    expect(res.transportExtraCharge).toBe(5500);
    // Step 3: Subtotal = ₹60,500
    expect(res.transportSubtotal).toBe(60500);
    // Step 4: 5% GST = ₹3,025
    expect(res.transportGstAmount).toBe(3025);
    // Step 5: Final = ₹63,525
    expect(res.totalTransportCost).toBe(63525);
  });

  it('All 3 Truck Rates: 55-scooter truck rate (₹65/km) for 1,000 km', () => {
    const input: OrderInput = {
      customerName: 'Test 55-Truck',
      orderRef: 'XD-TRUCK-55',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-tank', modelName: 'X-Tank', category: 'Other Model', quantity: 55 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 1000,
      truckAllocations: [
        { truckId: 'truck-55', truckName: '55-Scooter Truck', capacity: 55, ratePerKm: 65, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    // Step 1: Base = 1,000 × 65 = ₹65,000
    expect(res.baseTransportCost).toBe(65000);
    // Step 2: 10% Extra = ₹6,500
    expect(res.transportExtraCharge).toBe(6500);
    // Step 3: Subtotal = ₹71,500
    expect(res.transportSubtotal).toBe(71500);
    // Step 4: 5% GST = ₹3,575
    expect(res.transportGstAmount).toBe(3575);
    // Step 5: Final = ₹75,075
    expect(res.totalTransportCost).toBe(75075);
  });

  it('Zero distance handling: all 5 values must be 0 and sharing ineligible', () => {
    const input: OrderInput = {
      customerName: 'Local Customer',
      orderRef: 'XD-ZERO-KM',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 10 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 0,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    expect(res.baseTransportCost).toBe(0);
    expect(res.transportExtraCharge).toBe(0);
    expect(res.transportSubtotal).toBe(0);
    expect(res.transportGstAmount).toBe(0);
    expect(res.totalTransportCost).toBe(0);
    expect(res.halfTransportCost).toBe(0);
    expect(res.transportSharingEligible).toBe(false);
    expect(res.companyTransportSupport).toBe(0);
    expect(res.customerTransportPayment).toBe(0);
    expect(res.actualScooterDiscountApplied).toBe(10000);
  });

  it('Multiple trucks calculation without double-counting', () => {
    // 1x 12-truck (₹40/km) + 1x 32-truck (₹55/km) for 500 km
    const input: OrderInput = {
      customerName: 'Multi Truck Fleet Dealership',
      orderRef: 'XD-MULTI-TRUCK',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 44 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 500,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
        { truckId: 'truck-32', truckName: '32-Scooter Truck', capacity: 32, ratePerKm: 55, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    // Base = (500 × 40) + (500 × 55) = 20,000 + 27,500 = ₹47,500
    expect(res.baseTransportCost).toBe(47500);
    // 10% Extra = ₹4,750
    expect(res.transportExtraCharge).toBe(4750);
    // Subtotal = ₹52,250
    expect(res.transportSubtotal).toBe(52250);
    // 5% GST = 52,250 × 0.05 = ₹2,612.50
    expect(res.transportGstAmount).toBe(2612.5);
    // Final Transport Cost = 52,250 + 2,612.50 = ₹54,862.50
    expect(res.totalTransportCost).toBe(54862.5);
  });

  it('Transport-sharing eligibility check: S >= H (Eligible)', () => {
    // 24 Other Model scooters (S = 24,000), 12-truck, 1,000 km (Final = ₹46,200, H = ₹23,100)
    // S (24,000) >= H (23,100) -> Eligible!
    const input: OrderInput = {
      customerName: 'Eligible Partner',
      orderRef: 'XD-SHARING-ELIGIBLE',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 24, unitPrice: 50000 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 1000,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    expect(res.scooterDiscountAllowance).toBe(24000);
    expect(res.totalTransportCost).toBe(46200);
    expect(res.halfTransportCost).toBe(23100);
    expect(res.transportSharingEligible).toBe(true);
    expect(res.transportSharingApplied).toBe(true);
    expect(res.companyTransportSupport).toBe(23100);
    expect(res.customerTransportPayment).toBe(23100);
    expect(res.remainingScooterDiscount).toBe(900); // 24,000 - 23,100
    expect(res.actualScooterDiscountApplied).toBe(900);
    // Final payable: 24 * 50,000 = 12,00,000 - 900 + 23,100 = 12,22,200
    expect(res.finalPayableAmount).toBe(1222200);
  });

  it('Transport-sharing eligibility check: S < H (Ineligible)', () => {
    // 10 DL Model scooters (S = 5,000), 12-truck, 1,000 km (Final = ₹46,200, H = ₹23,100)
    // S (5,000) < H (23,100) -> Ineligible!
    const input: OrderInput = {
      customerName: 'Ineligible Dealership',
      orderRef: 'XD-SHARING-INELIGIBLE',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-double-light', modelName: 'X-Double Light', category: 'DL Model', quantity: 10 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 1000,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    expect(res.scooterDiscountAllowance).toBe(5000);
    expect(res.totalTransportCost).toBe(46200);
    expect(res.halfTransportCost).toBe(23100);
    expect(res.transportSharingEligible).toBe(false);
    expect(res.transportSharingApplied).toBe(false);
    expect(res.companyTransportSupport).toBe(0);
    expect(res.customerTransportPayment).toBe(46200);
    expect(res.actualScooterDiscountApplied).toBe(5000);
  });

  it('Battery discount remains strictly separate from transport sharing', () => {
    // 0 scooters, 20 batteries @ ₹500 discount = ₹10,000 battery allowance. 100 km, 12-truck.
    const input: OrderInput = {
      customerName: 'Battery Distributor',
      orderRef: 'XD-BATT-ONLY',
      orderDate: '2026-10-23',
      scooterItems: [],
      batteryIncluded: true,
      batteryItems: [
        { id: 'b1', variant: '60V 45Ah LFP', quantity: 20, unitPrice: 35000, eligibleDiscountQuantity: 20 },
      ],
      transportDistanceKm: 100,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    // 100 km @ ₹40 = ₹4,000 base + 10% (₹400) = ₹4,400 + 5% (₹220) = ₹4,620 final
    expect(res.totalTransportCost).toBe(4620);
    expect(res.halfTransportCost).toBe(2310);
    expect(res.scooterDiscountAllowance).toBe(0);
    expect(res.batteryDiscountAllowance).toBe(10000);
    // Battery allowance CANNOT fund transport sharing!
    expect(res.transportSharingEligible).toBe(false);
    expect(res.companyTransportSupport).toBe(0);
    expect(res.customerTransportPayment).toBe(4620);
    expect(res.actualBatteryDiscountApplied).toBe(10000);
  });

  it('Configurable transport settings: custom 15% extra and 18% GST', () => {
    const customConfig: AppConfig = {
      ...DEFAULT_APP_CONFIG,
      transportSettings: {
        extraChargePercent: 15,
        transportGstPercent: 18,
      },
    };

    const input: OrderInput = {
      customerName: 'Custom Surcharge Dealership',
      orderRef: 'XD-CUSTOM-SURCHARGE',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 10 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 100,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, customConfig);

    // Base = 100 × 40 = ₹4,000
    expect(res.baseTransportCost).toBe(4000);
    // 15% Extra = ₹600
    expect(res.transportExtraPercent).toBe(15);
    expect(res.transportExtraCharge).toBe(600);
    // Subtotal = ₹4,600
    expect(res.transportSubtotal).toBe(4600);
    // 18% GST on ₹4,600 = ₹828
    expect(res.transportGstPercent).toBe(18);
    expect(res.transportGstAmount).toBe(828);
    // Final = ₹5,428
    expect(res.totalTransportCost).toBe(5428);
  });

  it('No double-counting of GST on transport in downstream order payable', () => {
    const configWithExclusiveGst: AppConfig = {
      ...DEFAULT_APP_CONFIG,
      taxSettings: {
        gstTreatment: 'Exclusive',
        gstRatePercent: 5,
      },
    };

    const input: OrderInput = {
      customerName: 'GST Dealership',
      orderRef: 'XD-GST-TEST',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 10, unitPrice: 50000 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 100,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Full Scooter Discount', // Full discount on vehicle, full transport paid by customer
    };

    const res = calculateOrderFinancials(input, configWithExclusiveGst);

    // Gross scooters = 10 × 50,000 = ₹5,00,000
    // Scooter discount = 10 × 1,000 = ₹10,000
    // Net scooters = ₹4,90,000
    // Product GST (5% of net scooters) = ₹24,500
    // Transport: 100 km @ ₹40 = ₹4,000 Base + ₹400 (10%) = ₹4,400 + ₹220 (5% transport GST) = ₹4,620 Final Transport Cost
    // Notice that product GST is ₹24,500, NOT applied on transport.
    // Final payable = ₹4,90,000 (net scooters) + ₹24,500 (scooter GST) + ₹4,620 (transport with its own GST) = ₹5,19,120
    expect(res.baseTransportCost).toBe(4000);
    expect(res.transportGstAmount).toBe(220);
    expect(res.totalTransportCost).toBe(4620);
    expect(res.customerTransportPayment).toBe(4620);
    expect(res.gstAmount).toBe(24500); // 5% on 4,90,000
    expect(res.finalPayableAmount).toBe(519120);
  });
});
