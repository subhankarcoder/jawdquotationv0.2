"use client"; // ADD THIS LINE at the top

import { QuotationProvider, useQuotation } from '@/context/QuotationContext';
import QuotationForm from '@/components/quotation/QuotationForm';
import QuotationStep2 from '@/components/quotation/QuotationFormStep2';

// A new component to handle the step logic
function QuotationWizard() {
    const { state } = useQuotation();
    
    return (
        <div className="container mx-auto p-4 md:p-8">
            {state.step === 1 && <QuotationForm />}
            {state.step === 2 && <QuotationStep2 />}
        </div>
    );
}


export default function Home() {
    return (
        <QuotationProvider>
            <main className="min-h-screen bg-gray-50 font-sans">
                <header className="bg-white shadow-sm">
                    <div className="container mx-auto px-6 py-4">
                        <h1 className="text-3xl font-bold text-gray-800">Quotation Generator</h1>
                        <p className="text-gray-600">Create and download professional quotations with ease.</p>
                    </div>
                </header>
                <QuotationWizard />
            </main>
        </QuotationProvider>
    );
}