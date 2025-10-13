'use client';

import { QuotationProvider, useQuotation } from '@/context/QuotationContext';
import QuotationForm from '@/components/quotation/QuotationForm';
import QuotationStep2 from '@/components/quotation/QuotationFormStep2';

function QuotationWizard() {
  const { state } = useQuotation();

  return (
    <div className="min-h-screen">
      {state.step === 1 ? <QuotationForm /> : <QuotationStep2 />}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <QuotationProvider>
      <QuotationWizard />
    </QuotationProvider>
  );
}
