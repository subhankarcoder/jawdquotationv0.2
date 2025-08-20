'use client'

import { useQuotation } from "@/context/QuotationContext";
import QuotationPreview from "./QuotationPreview";
import PDFPreview from "@/lib/pdf/PDFPreview";
import { Button } from "../ui/button";
import { ArrowLeft } from 'lucide-react';

export default function QuotationStep2() {
    const { state, dispatch } = useQuotation();

    return (
        <div className="space-y-8">
            {/* Action Buttons */}
            <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
                <Button variant="outline" onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Edit
                </Button>
                <h2 className="text-xl font-semibold">Quotation Preview</h2>
                
                {/* PDF Download Button - only renders button, no visible preview */}
                <PDFPreview
                    filename={`Quotation-${state.quotationId}.pdf`}
                    buttonText="Download PDF"
                    buttonClassName="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    <QuotationPreview data={state} />
                </PDFPreview>
            </div>
            
            {/* The ONLY visible preview for the user */}
            <div className="bg-white rounded-lg shadow p-4">
                 <QuotationPreview data={state} />
            </div>
        </div>
    )
};