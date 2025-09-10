// State management (Store, Actions, Dispatcher)
'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { QuotationData, QuotationItem, CompanyDetails, ClientDetails, BankDetails, Totals, RoundingType } from '@/types/index';

// Define action types
type Action =
    | { type: 'SET_STEP'; payload: number }
    | { type: 'SET_FIELD'; field: keyof QuotationData; value: string | number | CompanyDetails | ClientDetails | QuotationItem[] | BankDetails | Totals | RoundingType }
    | { type: 'SET_COMPANY_DETAILS'; field: string; value: string }
    | { type: 'SET_CLIENT_DETAILS'; field: string; value: string }
    | { type: 'SET_BANK_DETAILS'; field: keyof BankDetails; value: string }
    | { type: 'ADD_ITEM' }
    | { type: 'UPDATE_ITEM'; index: number; field: keyof QuotationItem; value: string | number | CompanyDetails | ClientDetails | QuotationItem[] | BankDetails | Totals | RoundingType }
    | { type: 'REMOVE_ITEM'; index: number }
    | { type: 'RECALCULATE_TOTALS' };

// Helper function to apply rounding
const applyRounding = (amount: number, roundingType: RoundingType): number => {
    switch (roundingType) {
        case 'up':
            return Math.ceil(amount);
        case 'down':
            return Math.floor(amount);
        default:
            return amount;
    }
};

// Initial state of the quotation data
const initialState: QuotationData = {
    step: 1,
    quotationName: 'Quotation',
    quotationId: 'REF/2025-26/001',
    quotationDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tag: '',
    companyDetails: { name: 'Your Company', address: '123 Business Rd, Business City', gstin: '', pan: '', email: 'example@example.com', phone: '+123456789', logo: '' },
    clientDetails: { name: 'Client Company', address: '456 Client Ave, Client Town', gstin: '', pan: '', email: 'example@example.com', phone: '+123456789' },
    items: [
        { id: 1, name: 'Premium Web Development', description: 'Full-stack development of a responsive website with a modern tech stack.', hsn: '9983', quantity: 10, rate: 5000, cgstRate: 9, sgstRate: 9 }
    ],
    bankDetails: { bankName: 'Global Bank', accountHolder: 'Your Company Inc.', accountNumber: '1234567890', ifsc: 'GBIN0001234', accountType: 'Current' },
    terms: 'Please pay within 15 days. Overdue payments are subject to a 1.5% monthly interest rate.',
    additionalNotes: 'We appreciate your business and look forward to working with you again.',
    discountPercentage: 0,
    advancePaid: 0,
    advanceFieldLabel: 'Advance Paid', // New field with default label
    roundingType: 'none', // New field with default value
    additionalCharges: 0,
    signature: '',
    totals: { subTotal: 0, discountAmount: 0, taxableAmount: 0, totalCgst: 0, totalSgst: 0, grandTotal: 0 }
}

// Quotation reducer function to handle state changes
const QuotationReducer = (state: QuotationData, action: Action): QuotationData => {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, step: action.payload };
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value };
        case 'SET_COMPANY_DETAILS':
            return { ...state, companyDetails: { ...state.companyDetails, [action.field]: action.value } };
        case 'SET_CLIENT_DETAILS':
            return { ...state, clientDetails: { ...state.clientDetails, [action.field]: action.value } };
        case 'SET_BANK_DETAILS':
            return { ...state, bankDetails: { ...(state.bankDetails as BankDetails), [action.field]: action.value }};
        case 'ADD_ITEM':
            const newItem: QuotationItem = { id: Date.now(), name: '', description: '', hsn: '', quantity: 1, rate: 0, cgstRate: 9, sgstRate: 9 };
            return { ...state, items: [...state.items, newItem] };
        case 'UPDATE_ITEM':
            const updatedItems = [...state.items];
            updatedItems[action.index] = { ...updatedItems[action.index], [action.field]: action.value };
            return { ...state, items: updatedItems };
        case 'REMOVE_ITEM':
            return { ...state, items: state.items.filter((_, i) => i !== action.index) };
        case 'RECALCULATE_TOTALS':
            let subTotal = 0;
            let totalCgst = 0;
            let totalSgst = 0;
            state.items.forEach(item => {
                const amount = item.quantity * item.rate;
                const cgst = amount * (item.cgstRate / 100);
                const sgst = amount * (item.sgstRate / 100);
                subTotal += amount;
                totalCgst += cgst;
                totalSgst += sgst;
            });
            const discountAmount = subTotal * (state.discountPercentage / 100);
            const taxableAmount = subTotal - discountAmount;
            const totalBeforeRounding = taxableAmount + totalCgst + totalSgst + state.additionalCharges - state.advancePaid;
            const grandTotal = applyRounding(totalBeforeRounding, state.roundingType);
            
            return { 
                ...state, 
                totals: { 
                    subTotal, 
                    discountAmount, 
                    taxableAmount, 
                    totalCgst, 
                    totalSgst, 
                    grandTotal 
                } 
            };
        default:
            return state;
    }
}

// Create the context for the quotation data
const QuotationContext = createContext<{ state: QuotationData; dispatch: React.Dispatch<Action> } | undefined>(undefined);

// Context provider component
export const QuotationProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(QuotationReducer, initialState);
    useEffect(() => {
        dispatch({ type: 'RECALCULATE_TOTALS' });
    }, [state.items, state.discountPercentage, state.additionalCharges, state.advancePaid, state.roundingType]);
    return (
        <QuotationContext.Provider value={{ state, dispatch }}>
            {children}
        </QuotationContext.Provider>
    );
};

// Custom hook to use the quotation context
export const useQuotation = () => {
    const context = useContext(QuotationContext);
    if (!context) {
        throw new Error('useQuotation must be used within a QuotationProvider');
    }
    return context;
};