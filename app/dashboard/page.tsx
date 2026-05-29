'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  Eye, 
  Edit3, 
  Loader2, 
  Calendar,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import PDFPreview from '@/lib/pdf/PDFPreview';
import QuotationPreview from '@/components/quotation/QuotationPreview';

interface QuotationRow {
  id: string;
  quotation_id: string;
  quotation_name: string;
  client_name: string;
  grand_total: number;
  status: 'draft' | 'quotation';
  data: any;
  created_at: string;
  updated_at: string;
}

export default function QuotationsDashboard() {
  const [quotations, setQuotations] = useState<QuotationRow[]>([]);
  const [filteredQuotations, setFilteredQuotations] = useState<QuotationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<{ code?: string; message?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const sqlScript = `-- 1. Create the quotations table
CREATE TABLE public.quotations (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid(),
    quotation_id text NOT NULL,
    quotation_name text NOT NULL,
    client_name text NOT NULL,
    grand_total numeric NOT NULL DEFAULT 0.00,
    status text NOT NULL DEFAULT 'draft'::text,
    data jsonb NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT quotations_pkey PRIMARY KEY (id),
    CONSTRAINT quotations_status_check CHECK (status = ANY (ARRAY['draft'::text, 'quotation'::text]))
);

-- 2. Create index on user_id and updated_at for faster queries
CREATE INDEX idx_quotations_user_id_updated ON public.quotations (user_id, updated_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- 4. Set up security policies to isolate user records
CREATE POLICY "Users can insert their own quotations" ON public.quotations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select their own quotations" ON public.quotations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own quotations" ON public.quotations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quotations" ON public.quotations FOR DELETE USING (auth.uid() = user_id);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    toast.success('SQL query copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'drafts'>('all');

  const supabase = createClient();
  const router = useRouter();

  const fetchQuotations = useCallback(async () => {
    try {
      setIsLoading(true);
      setDbError(null);
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setQuotations((data as QuotationRow[]) || []);
    } catch (err: any) {
      console.error('Error fetching quotations:', err);
      if (err.code === '42P01' || (err.message && err.message.includes('relation "public.quotations" does not exist'))) {
        setDbError({ code: err.code, message: err.message || 'Table public.quotations does not exist' });
      } else {
        toast.error(err.message || 'Failed to fetch quotations');
      }
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  // Apply filters and search query
  useEffect(() => {
    let result = [...quotations];

    // Filter by tab
    if (activeTab === 'saved') {
      result = result.filter(q => q.status === 'quotation');
    } else if (activeTab === 'drafts') {
      result = result.filter(q => q.status === 'draft');
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        q => 
          q.quotation_id.toLowerCase().includes(query) ||
          q.quotation_name.toLowerCase().includes(query) ||
          q.client_name.toLowerCase().includes(query)
      );
    }

    setFilteredQuotations(result);
  }, [quotations, activeTab, searchQuery]);

  const handleDelete = async (id: string, refId: string) => {
    const confirmed = confirm(`Are you sure you want to delete quotation "${refId}"? This action is permanent.`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('quotations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Quotation deleted successfully');
      setQuotations(prev => prev.filter(q => q.id !== id));
    } catch (err: any) {
      console.error('Error deleting quotation:', err);
      toast.error('Failed to delete quotation');
    }
  };

  const formatPrice = (amount: number) => {
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    });
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-16 font-sans">
      
      {/* Premium Vercel Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-end pb-8 border-b border-zinc-200 dark:border-zinc-800 gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-none">
            Quotations
          </h1>
          <p className="text-base text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
            Create, view, manage, and download premium A4-ready project proposals and billing quotes.
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button 
            className="flex items-center gap-2 bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-150 text-sm font-semibold rounded-md h-10 px-5 shadow-sm transition-all duration-150"
          >
            <Plus className="h-4 w-4" />
            New Quotation
          </Button>
        </Link>
      </div>

      {/* Search and Tabs Controller */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs">
        
        {/* Search input with prefix Icon */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search by ID, name or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-md border-zinc-250 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black font-mono text-xs w-full bg-zinc-50/50"
          />
        </div>

        {/* Vercel Segmented Control Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 self-stretch sm:self-auto select-none">
          {(['all', 'saved', 'drafts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 sm:flex-initial text-center px-4 py-1.5 rounded-md text-xs font-medium font-mono uppercase tracking-wider transition-all cursor-pointer",
                activeTab === tab 
                  ? "bg-white dark:bg-zinc-900 text-black dark:text-white shadow-xs font-bold" 
                  : "text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              {tab === 'saved' ? 'Finalized' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main List Container */}
      {dbError ? (
        <Card className="border-red-200 dark:border-red-900 bg-red-50/10 dark:bg-red-950/10 rounded-lg shadow-none">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div className="flex gap-4 items-start border-b border-neutral-100 dark:border-neutral-800 pb-5">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 font-mono">
                  Database Setup Required
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl">
                  To save and manage drafts or finalized quotations, the <strong className="font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">quotations</strong> table must be initialized in your Supabase project.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-zinc-500 uppercase font-mono tracking-wider">
                  PostgreSQL Migration Query
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="h-8 text-xs font-mono border-zinc-250 hover:bg-zinc-50 flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600 animate-in fade-in zoom-in-50 duration-150" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-zinc-500" />
                      Copy SQL
                    </>
                  )}
                </Button>
              </div>

              <div className="relative rounded-md overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950 p-4">
                <pre className="text-[11px] font-mono text-zinc-300 overflow-x-auto whitespace-pre leading-relaxed select-all max-h-[300px]">
                  {sqlScript}
                </pre>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                1. Go to your Supabase Project
              </span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                2. Open SQL Editor
              </span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                3. Paste SQL and click 'Run'
              </span>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        // Premium Skeleton Loader
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 space-y-3 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
                <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full w-16" />
              </div>
              <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
              <div className="flex gap-4 pt-2">
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
                <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredQuotations.length === 0 ? (
        // Beautiful Empty State
        <Card className="border-dashed border-zinc-300 dark:border-zinc-800 shadow-none bg-white">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-14 w-14 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-1 leading-none font-mono">
              No Quotations Found
            </h3>
            <p className="text-sm text-zinc-450 dark:text-zinc-400 max-w-sm mb-6 leading-relaxed">
              {searchQuery 
                ? "No matching quotations match your query. Try clearing filters or altering search parameters."
                : activeTab === 'saved' 
                ? "You haven't finalized any quotations yet. Save an A4 quote upon downloading it!"
                : activeTab === 'drafts'
                ? "All your automatic step-by-step saves will appear here as drafts."
                : "Get started by generating your very first client quotation proposal."
              }
            </p>
            {!searchQuery && (
              <Link href="/dashboard/create">
                <Button className="bg-black hover:bg-zinc-800 text-white rounded-md text-xs font-semibold h-10 px-5 shadow-sm">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Create First Quotation
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        // Responsive Premium Quotations List
        <div className="flex flex-col gap-4">
          {filteredQuotations.map((row) => {
            const isDraft = row.status === 'draft';
            
            return (
              <div 
                key={row.id}
                className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-500 rounded-lg p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-150 shadow-xs"
              >
                {/* Left Side: Identifiers, Names & Info */}
                <div className="flex-1 space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-mono font-bold tracking-tight text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-100">
                      {row.quotation_id}
                    </span>
                    <span className={cn(
                      "inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full font-bold border",
                      isDraft 
                        ? "bg-zinc-50 text-zinc-500 border-zinc-200" 
                        : "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                    )}>
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", isDraft ? "bg-zinc-400" : "bg-emerald-500")} />
                      {row.status === 'quotation' ? 'Finalized' : 'Draft'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-tight truncate">
                      {row.quotation_name}
                    </h3>
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      Client: <span className="text-zinc-800 dark:text-zinc-200">{row.client_name || 'One-time Client'}</span>
                    </p>
                  </div>

                  {/* Metadata: Timestamps */}
                  <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      Updated: {format(new Date(row.updated_at), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>

                {/* Right Side: Price & Multi-row direct operations */}
                <div className="flex flex-row md:flex-col justify-between items-end gap-4 w-full md:w-auto shrink-0 border-t border-zinc-100 md:border-t-0 pt-4 md:pt-0">
                  
                  {/* Grand Total Value */}
                  <div className="text-left md:text-right flex flex-col md:items-end gap-0.5">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 font-bold">Grand Total</span>
                    <span className="text-xl font-bold font-mono text-black dark:text-white underline decoration-[1.5px] underline-offset-4">
                      {formatPrice(row.grand_total)}
                    </span>
                  </div>

                  {/* Action Controllers */}
                  <div className="flex items-center gap-2">
                    {/* Delete action */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(row.id, row.quotation_id)}
                      className="border-neutral-200 text-neutral-400 hover:text-red-650 hover:bg-red-50 hover:border-red-200 h-9 w-9 p-0 rounded-md transition-colors"
                      title="Delete Quotation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {isDraft ? (
                      // For Drafts: Direct Button to Edit
                      <Button
                        size="sm"
                        onClick={() => router.push(`/dashboard/create?id=${row.id}`)}
                        className="bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black hover:dark:bg-zinc-100 h-9 font-mono text-xs px-3.5 rounded-md flex items-center gap-1.5 font-bold shadow-xs"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        Edit Draft
                      </Button>
                    ) : (
                      // For Finalized: direct View & direct download PDF!
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/create?id=${row.id}`)}
                          className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-black h-9 font-mono text-xs px-3.5 rounded-md flex items-center gap-1.5"
                          title="Open & View Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>

                        {/* Inline PDF download button utilizing the cached state in the row */}
                        <PDFPreview
                          filename={`Quotation-${row.quotation_id}.pdf`}
                          buttonText="PDF"
                          buttonClassName="bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black hover:dark:bg-zinc-100 h-9 font-mono text-xs px-3.5 rounded-md flex items-center gap-1.5 font-bold shadow-xs focus:outline-none"
                        >
                          <QuotationPreview data={row.data} />
                        </PDFPreview>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
