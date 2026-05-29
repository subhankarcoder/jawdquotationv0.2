'use client'

import { useQuotation } from "@/context/QuotationContext";
import QuotationPreview from "./QuotationPreview";
import PDFPreview from "@/lib/pdf/PDFPreview";
import { Button } from "../ui/button";
import { ArrowLeft } from 'lucide-react';

export default function QuotationStep2() {
    const { state, dispatch } = useQuotation();

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Action Header Banner */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-5 bg-white rounded-xl border border-border/60 shadow-xs">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
                    className="border-border/80 hover:bg-muted text-xs rounded-lg h-9 font-normal"
                  >
                      <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                      Back To Editor
                  </Button>
                  <div className="h-4 w-px bg-border/60 hidden sm:block" />
                  <div>
                    <h2 className="text-sm font-normal text-foreground">Document Export Center</h2>
                    <p className="text-[11px] text-muted-foreground">Verify And Download Your Generated Quotation.</p>
                  </div>
                </div>
                
                {/* PDF Download Button */}
                <PDFPreview
                    filename={`Quotation-${state.quotationId}.pdf`}
                    buttonText="Download Official PDF"
                    buttonClassName="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-normal ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/95 h-9 px-4 shadow-sm"
                >
                    <QuotationPreview data={state} />
                </PDFPreview>
            </div>
            
            {/* The A4 Document Preview Frame */}
            <div className="bg-white rounded-xl border border-border/60 shadow-xs overflow-hidden max-w-4xl mx-auto">
                 <div className="bg-muted/30 border-b border-border/40 py-2.5 px-4 flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                   <div className="h-2 w-2 rounded-full bg-red-400" />
                   <div className="h-2 w-2 rounded-full bg-amber-400" />
                   <div className="h-2 w-2 rounded-full bg-emerald-400" />
                   <span className="ml-2 truncate select-none">Preview: Quotation-{state.quotationId}.pdf</span>
                 </div>
                 <div className="p-1 sm:p-6 bg-muted/20">
                   <div className="bg-white shadow-md border border-border/40 max-w-3xl mx-auto">
                     <QuotationPreview data={state} />
                   </div>
                 </div>
            </div>
        </div>
    )
};