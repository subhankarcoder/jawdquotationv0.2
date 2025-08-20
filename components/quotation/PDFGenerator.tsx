// Integrates preview with download logic

'use client';

import { useQuotation } from "@/context/QuotationContext";
import PDFPreview from "@/lib/pdf/PDFPreview";
import QuotationPreview from "./QuotationPreview";

export default function PDFGenerator() {
    const { state } = useQuotation();
    return (
        <div className="bg-gray-100 p-8 rounded-lg shadow-inner">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Live Preview</h3>
            
            {/* Download Button Component */}
            <PDFPreview
                filename={`Quotation-${state.quotationId}.pdf`}
                buttonText="Download PDF"
                buttonClassName="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 mb-4 w-full"
            >
                <QuotationPreview data={state} />
            </PDFPreview>

            {/* The Actual Preview shown on screen */}
            <div className="border border-gray-300 rounded-md overflow-hidden">
                {/* We scale it down slightly to fit nicely in the preview area */}
                <div style={{ transform: 'scale(1)', transformOrigin: 'top left' }}>
                     <QuotationPreview data={state} />
                </div>
            </div>
        </div>
    )
}