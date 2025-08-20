export interface CompanyDetails {
    name: string;
    logo?: string;
    address: string;
    gstin: string;
    pan?: string;
    email?: string;
    phone?: string;
}

export interface ClientDetails {
    name: string;
    address: string;
    gstin: string;
    pan?: string;
    email?: string;
    phone?: string;
}

export interface QuotationItem {
    id: number;
    name: string;
    description: string;
    hsn: string;
    quantity: number;
    rate: number;
    cgstRate: number;
    sgstRate: number;
}

export interface BankDetails {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    accountType: string;
}

export interface Totals {
    subTotal: number;
    discountAmount: number;
    advanceAmount?: number;
    taxableAmount: number;
    totalCgst: number;
    totalSgst: number;
    grandTotal: number;
}

// New type for rounding options
export type RoundingType = 'none' | 'up' | 'down';

export interface QuotationData {
    step: number;
    quotationName: string;
    quotationId: string;
    quotationDate: string;
    dueDate: string;
    companyDetails: CompanyDetails;
    clientDetails: ClientDetails;
    items: QuotationItem[];
    bankDetails?: BankDetails;
    terms: string;
    additionalNotes: string;
    discountPercentage: number;
    advancePaid: number;
    advanceFieldLabel: string; // New field for custom advance payment label
    roundingType: RoundingType; // New field for rounding type
    additionalCharges: number;
    signature?: string;
    totals: Totals;
}