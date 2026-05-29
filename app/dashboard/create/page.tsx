'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { QuotationProvider, useQuotation } from '@/context/QuotationContext';
import QuotationForm from '@/components/quotation/QuotationForm';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

function QuotationLoader() {
  const { state, dispatch } = useQuotation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [loading, setLoading] = useState(!!id);
  const supabase = createClient();

  useEffect(() => {
    if (!id) {
      // Clear any loaded state just in case, though new provider mount should naturally be fresh
      dispatch({ type: 'RESET_QUOTATION' });
      return;
    }

    const fetchQuotation = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('quotations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data && data.data) {
          // Merge db UUID and status into the data object
          const quotationData = {
            ...data.data,
            id: data.id,
            status: data.status,
          };
          dispatch({ type: 'LOAD_QUOTATION', payload: quotationData });
          toast.success('Loaded draft successfully');
        } else {
          toast.error('Quotation not found');
          router.push('/dashboard');
        }
      } catch (err: any) {
        console.error('Error loading quotation:', err);
        toast.error(err.message || 'Failed to load quotation');
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [id, supabase, dispatch, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <p className="text-sm font-mono text-zinc-500">Loading quotation details...</p>
      </div>
    );
  }

  return <QuotationForm />;
}

export default function CreateQuotationPage() {
  return (
    <QuotationProvider>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
          <p className="text-sm font-mono text-zinc-500">Initializing editor...</p>
        </div>
      }>
        <QuotationLoader />
      </Suspense>
    </QuotationProvider>
  );
}
