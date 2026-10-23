export type ModelCategory = 'DL Model' | 'Other Model';

export type BatteryVariant = 
  | '60V 30Ah LFP'
  | '60V 45Ah LFP'
  | '60V 55Ah pouch cell';

export type TransportAllocationMode = 'Automatic' | 'Full Scooter Discount' | 'Share Transport';

export type GstTreatment = 'None' | 'Exclusive' | 'Inclusive';

export interface ScooterModel {
  id: string;
  name: string;
  defaultCategory: ModelCategory;
  defaultPriceWithoutBattery: number;
  pricesWithBattery: Record<BatteryVariant, number>;
  description?: string;
  tag?: string;
}

export interface TruckConfig {
  id: string;
  name: string;
  capacity: number; // e.g. 12, 32, 55
  ratePerKm: number; // e.g. 40, 55, 65
}

export interface ScooterOrderItem {
  id: string;
  modelId: string;
  modelName: string;
  category: ModelCategory;
  quantity: number;
  unitPrice?: number; // Optional until calculating final payable amount
}

export interface BatteryOrderItem {
  id: string;
  variant: BatteryVariant;
  quantity: number;
  unitPrice?: number; // Optional
  eligibleDiscountQuantity: number; // Default = quantity, editable
}

export interface TruckAllocationItem {
  truckId: string;
  truckName: string;
  capacity: number;
  ratePerKm: number;
  count: number;
}

export interface AppConfig {
  discountRates: {
    dlModelMaxDiscount: number; // default: 500
    otherModelMaxDiscount: number; // default: 1000
    batteryMaxDiscount: number; // default: 500
  };
  transportRates: TruckConfig[];
  modelCategoryOverrides: Record<string, ModelCategory>;
  customModelPrices: Record<string, number>;
  transportSharing: {
    enabled: boolean;
    companySharePercent: number; // default 50
    strictEligibilityCheck: boolean; // default true
  };
  transportSettings: {
    extraChargePercent: number; // default: 10
    transportGstPercent: number; // default: 5
  };
  taxSettings: {
    gstTreatment: GstTreatment;
    gstRatePercent: number; // default 5 for EV
  };
}

export interface OrderInput {
  customerName: string;
  orderRef: string;
  orderDate: string;
  scooterItems: ScooterOrderItem[];
  batteryIncluded: boolean;
  batteryItems: BatteryOrderItem[];
  transportDistanceKm: number;
  truckAllocations: TruckAllocationItem[];
  allocationMode: TransportAllocationMode;
  notes?: string;
}

export interface CalculationResult {
  // Quantities & Counts
  totalDlScooters: number;
  totalOtherScooters: number;
  totalScooters: number;
  totalBatteries: number;
  batteryBreakdown: { variant: BatteryVariant; quantity: number }[];

  // Discount Allowances
  scooterDiscountAllowance: number;
  batteryDiscountAllowance: number;
  totalDiscountAllowance: number;

  // Transport Details
  baseTransportCost: number;
  transportExtraPercent: number;
  transportExtraCharge: number;
  transportSubtotal: number;
  transportGstPercent: number;
  transportGstAmount: number;
  totalTransportCost: number; // Final Transport Cost = Subtotal + GST
  halfTransportCost: number;
  totalCapacity: number;
  truckSummary: string;

  // Transport Sharing Engine
  transportSharingEligible: boolean;
  transportSharingApplied: boolean;
  companyTransportSupport: number;
  customerTransportPayment: number;
  actualScooterDiscountApplied: number;
  actualBatteryDiscountApplied: number;
  remainingScooterDiscount: number;
  totalCustomerDiscountBenefit: number;

  // Pricing & Final Payable
  hasAllPrices: boolean;
  missingPriceReason?: string;
  grossScooterAmount: number | null;
  grossBatteryAmount: number | null;
  grossTotalAmount: number | null;
  subtotalBeforeTax: number | null;
  gstAmount: number | null;
  finalPayableAmount: number | null;
  gstTreatment: GstTreatment;
  gstRatePercent: number;

  // Status & Guidance
  effectiveAllocationMode: TransportAllocationMode;
  eligibilityMessage: string;
  warningMessage?: string;
  suggestedMode?: TransportAllocationMode;

  // Step by step breakdown for audit
  auditTrail: {
    step: string;
    description: string;
    formula: string;
    amount?: number | null;
  }[];
}

export interface SavedOrder {
  id: string;
  createdAt: string;
  updatedAt: string;
  orderInput: OrderInput;
  calculationResult: CalculationResult;
}
