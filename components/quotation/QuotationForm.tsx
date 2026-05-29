"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQuotation } from '@/context/QuotationContext';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Building,
  HelpCircle,
  Calendar as CalendarIcon,
  Hash,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Loader2,
  MoreHorizontal,
  Download,
  Printer,
  Save,
  Check
} from 'lucide-react';
import AddressSelector from './AddressSelector';
import { BankDetails, CompanyDetails, QuotationItem, RoundingType, BankDetailsDB } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import QuotationPreview from './QuotationPreview';
import PDFPreview from '@/lib/pdf/PDFPreview';
import { useHelpTour } from '@/lib/hooks/useHelpTour';
import { DriveStep } from 'driver.js';

// Stepped Wizard list
const steps = [
  { id: 1, label: 'General Details' },
  { id: 2, label: 'Billed By & To' },
  { id: 3, label: 'Line Items & Pricing' },
  { id: 4, label: 'Payment & Calculations' },
  { id: 5, label: 'Export / Preview' }
];

export default function QuotationForm() {
  const { state, dispatch } = useQuotation();
  const router = useRouter();
  const supabase = createClient();
  const [isSaving, setIsSaving] = useState(false);

  const saveQuotation = async (status: 'draft' | 'quotation', showToast = true) => {
    try {
      setIsSaving(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('Session expired. Please log in again.');
        return null;
      }

      const payload = {
        user_id: user.id,
        quotation_id: state.quotationId,
        quotation_name: state.quotationName,
        client_name: state.clientDetails.name,
        grand_total: state.totals.grandTotal,
        status: status,
        data: {
          ...state,
          status: status,
        },
        updated_at: new Date().toISOString(),
      };

      let result;
      if (state.id) {
        result = await supabase
          .from('quotations')
          .update(payload)
          .eq('id', state.id)
          .select();
      } else {
        result = await supabase
          .from('quotations')
          .insert(payload)
          .select();
      }

      const { data, error } = result;
      if (error) throw error;

      if (data && data[0]) {
        dispatch({ type: 'SET_FIELD', field: 'id', value: data[0].id });
        dispatch({ type: 'SET_FIELD', field: 'status', value: data[0].status });
        if (showToast) {
          toast.success(status === 'draft' ? 'Draft saved successfully!' : 'Quotation saved successfully!');
        }
        return data[0].id;
      }
    } catch (err: any) {
      console.error('Error saving quotation:', err);
      if (showToast) {
        toast.error(err.message || 'Failed to save quotation');
      }
    } finally {
      setIsSaving(false);
    }
    return null;
  };

  const getSteps = useCallback((): DriveStep[] => {
    switch (state.step) {
      case 1:
        return [
          {
            popover: {
              title: 'General Details Guide',
              description: 'Step 1: Let\'s configure the document title, reference identifier, and issuing dates.',
            }
          },
          {
            element: '#quotationName',
            popover: {
              title: 'Document Name',
              description: 'Enter a recognizable title for this proposal, e.g., "Web Development Services Agreement" or "Graphic Design Bundle".',
              side: 'bottom',
            }
          },
          {
            element: '#quotationId',
            popover: {
              title: 'Reference ID',
              description: 'A unique serial code to keep track of this document. It will auto-save and display on your finalized PDF invoice.',
              side: 'bottom',
            }
          },
          {
            element: '#quotationDate',
            popover: {
              title: 'Creation Date',
              description: 'Specify the official date of issuing this proposal to the client.',
              side: 'bottom',
            }
          },
          {
            element: '#dueDate',
            popover: {
              title: 'Validity Date',
              description: 'Set a deadline for the quotation. Prevents pricing confusion by designating when these terms officially expire.',
              side: 'bottom',
            }
          }
        ];
      case 2:
        return [
          {
            popover: {
              title: 'Sender & Client Details Guide',
              description: 'Step 2: Define who is drafting this quotation and which client is being billed.',
            }
          },
          {
            element: '#billed-by-card',
            popover: {
              title: 'Billed By Profile',
              description: 'Your own billing profile. Click "Import Profile" to quickly populate verified business details, logos, and bank linkages without re-typing.',
              side: 'right',
            }
          },
          {
            element: '#billed-to-card',
            popover: {
              title: 'Client Billing Profile',
              description: 'The target client profile. You can import from your address registry or click Edit to configure one-time details manually.',
              side: 'left',
            }
          }
        ];
      case 3:
        return [
          {
            popover: {
              title: 'Line Items & Taxes Guide',
              description: 'Step 3: Add services or products with rates, quantities, and GST tax percentages.',
            }
          },
          {
            element: '#add-item-btn',
            popover: {
              title: 'Add Items & Services',
              description: 'Click here to insert a new blank row for items or service descriptions.',
              side: 'bottom',
            }
          },
          {
            element: '#line-items-table',
            popover: {
              title: 'Dynamic Line Item Table',
              description: 'Enter the item details: title, detailed description, HSN/SAC code, quantity, rate type, base rate, and local CGST/SGST tax values.',
              side: 'top',
            }
          },
          {
            element: '#totals-summary-panel',
            popover: {
              title: 'Totals Calculation Summary',
              description: 'Calculates subtotals, individual tax breakdowns, and final Grand Totals automatically in real-time as you type!',
              side: 'left',
            }
          }
        ];
      case 4:
        return [
          {
            popover: {
              title: 'Payments & Rules Guide',
              description: 'Step 4: Connect receiving bank accounts, set up advance deductions, rounding formulas, terms, and digital signatures.',
            }
          },
          {
            element: '#bank-selector-trigger',
            popover: {
              title: 'Payment Bank Linkage',
              description: 'Choose a bank account from your saved bank registry. Details like A/C number, holder, and IFSC will automatically render on the bottom of the invoice.',
              side: 'bottom',
            }
          },
          {
            element: '#advancePaid',
            popover: {
              title: 'Deductions & Advance Deposits',
              description: 'If you have already received advance payment, record it here to subtract it from the final due balance.',
              side: 'bottom',
            }
          },
          {
            element: '#rounding-selector-trigger',
            popover: {
              title: 'Bookkeeping Rounding Rule',
              description: 'Select Round Up or Down to eliminate fractional decimal values from calculations and maintain clean bookkeeping.',
              side: 'bottom',
            }
          },
          {
            element: '#terms',
            popover: {
              title: 'Terms & Conditions',
              description: 'Write project schedules, late fee policies, warranty clauses, or delivery parameters for client viewing.',
              side: 'top',
            }
          },
          {
            element: '#signature-container',
            popover: {
              title: 'Authorized Signature Upload',
              description: 'Upload a scanned signature file (PNG/JPG max 2MB) or input a public signature URL to automatically sign the quotation document.',
              side: 'top',
            }
          }
        ];
      case 5:
        return [
          {
            popover: {
              title: 'Preview & Export Guide',
              description: 'Step 5: Review your print-ready document draft and select your export method.',
            }
          },
          {
            element: '#quotation-print-area',
            popover: {
              title: 'A4 Size Live Preview Canvas',
              description: 'Examine a pixel-perfect representation of the generated quotation sheet in A4 print layout.',
              side: 'right',
            }
          },
          {
            element: '#export-options-card',
            popover: {
              title: 'Export Options Panel',
              description: 'Download a pristine PDF bundle or print directly using browser layout printers.',
              side: 'left',
            }
          }
        ];
      default:
        return [];
    }
  }, [state.step]);

  useHelpTour(getSteps);

  const [showAddressSelector, setShowAddressSelector] = useState(false);
  const [addressSelectorTarget, setAddressSelectorTarget] = useState<'company' | 'client'>('company');

  // Bank details from Supabase
  const [banks, setBanks] = useState<BankDetailsDB[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');

  // Custom editing states for Billed profiles
  const [isEditingBilledBy, setIsEditingBilledBy] = useState(false);
  const [isEditingBilledTo, setIsEditingBilledTo] = useState(false);

  // Signature upload tab and state
  const [sigUploadTab, setSigUploadTab] = useState<'upload' | 'url'>('upload');
  const [isSigUploading, setIsSigUploading] = useState(false);
  const sigFileInputRef = useRef<HTMLInputElement>(null);

  // Logo upload tab and state
  const [logoUploadTab, setLogoUploadTab] = useState<'upload' | 'url'>('upload');
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const [zoom, setZoom] = useState(70);

  const handlePrint = () => {
    const printContent = document.getElementById('quotation-print-area')?.innerHTML;
    if (!printContent) {
      toast.error('Print area not found');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.write(`
        <html>
          <head>
            <title>Quotation - ${state.quotationId}</title>
            <style>
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                background: white;
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.focus();
                window.print();
                setTimeout(function() {
                  window.frameElement.remove();
                }, 1000);
              };
            </script>
          </body>
        </html>
      `);
      doc.close();
    }
  };

  // Fetch receiving banks
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const { data } = await supabase.from('bank_details').select('*');
        if (data) {
          const bankList = data as BankDetailsDB[];
          setBanks(bankList);

          // Match selected bank if already filled in state
          if (state.bankDetails?.accountNumber) {
            const matched = bankList.find(b => b.account_number === state.bankDetails?.accountNumber);
            if (matched) setSelectedBankId(matched.id);
          }
        }
      } catch (err) {
        console.error('Error fetching banks:', err);
      }
    };
    fetchBanks();
  }, [supabase, state.bankDetails]);

  // Handle bank selection
  const handleBankSelect = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId);
    if (bank) {
      dispatch({ type: 'SET_BANK_DETAILS', field: 'bankName', value: bank.bank_name });
      dispatch({ type: 'SET_BANK_DETAILS', field: 'accountHolder', value: bank.account_holder });
      dispatch({ type: 'SET_BANK_DETAILS', field: 'accountNumber', value: bank.account_number });
      dispatch({ type: 'SET_BANK_DETAILS', field: 'ifsc', value: bank.ifsc });
      dispatch({ type: 'SET_BANK_DETAILS', field: 'accountType', value: bank.account_type || 'Current' });
      setSelectedBankId(bankId);
      toast.success(`Connected to ${bank.bank_name}`);
    }
  };

  const handleDetailChange = (type: 'SET_COMPANY_DETAILS' | 'SET_CLIENT_DETAILS' | 'SET_BANK_DETAILS', name: string, value: string) => {
    dispatch({ type, field: name as any, value });
  };

  const handleItemChange = (index: number, name: string, value: any) => {
    const isNumeric = ['quantity', 'rate', 'cgstRate', 'sgstRate'].includes(name);
    dispatch({
      type: 'UPDATE_ITEM',
      index,
      field: name as keyof QuotationItem,
      value: isNumeric ? parseFloat(value) || 0 : value
    });
  };

  const handleRoundingChange = (roundingType: RoundingType) => {
    dispatch({ type: 'SET_FIELD', field: 'roundingType', value: roundingType });
  };

  const openAddressSelector = (target: 'company' | 'client') => {
    setAddressSelectorTarget(target);
    setShowAddressSelector(true);
  };

  const handleAddressImport = (companyDetails: CompanyDetails, bankDetails?: BankDetails | null) => {
    if (addressSelectorTarget === 'company') {
      Object.entries(companyDetails).forEach(([key, value]) => {
        dispatch({ type: 'SET_COMPANY_DETAILS', field: key, value: value || '' });
      });
      if (bankDetails) {
        Object.entries(bankDetails).forEach(([key, value]) => {
          dispatch({ type: 'SET_BANK_DETAILS', field: key as keyof BankDetails, value: value || '' });
        });
      }
      setIsEditingBilledBy(false);
    } else {
      Object.entries(companyDetails).forEach(([key, value]) => {
        dispatch({ type: 'SET_CLIENT_DETAILS', field: key, value: value || '' });
      });
      setIsEditingBilledTo(false);
    }
  };

  // Upload signature helper
  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File must be smaller than 2MB');
      return;
    }

    try {
      setIsSigUploading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/signature-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      dispatch({ type: 'SET_FIELD', field: 'signature', value: publicUrl });
      toast.success('Signature uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Signature upload failed');
      console.error(err);
    } finally {
      setIsSigUploading(false);
    }
  };

  // Upload logo helper
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('File must be smaller than 2MB');
      return;
    }

    try {
      setIsLogoUploading(true);
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      dispatch({ type: 'SET_COMPANY_DETAILS', field: 'logo', value: publicUrl });
      toast.success('Logo uploaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Logo upload failed');
      console.error(err);
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleNext = async () => {
    if (state.step < 5) {
      void saveQuotation('draft', false);
      dispatch({ type: 'SET_STEP', payload: state.step + 1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (state.step > 1) {
      dispatch({ type: 'SET_STEP', payload: state.step - 1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Convert numbers to text for Amount in Words
  const amountToWords = (num: number): string => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const g = ['', 'Thousand', 'Lakh', 'Crore'];

    if (num === 0) return 'Zero';

    let n = Math.floor(num).toString();
    if (parseInt(n) > 999999999) return 'Amount Too Large';

    let words = '';

    const formatTens = (subNum: number): string => {
      if (subNum < 20) return a[subNum];
      return b[Math.floor(subNum / 10)] + (subNum % 10 !== 0 ? ' ' + a[subNum % 10] : '');
    };

    const parseBlock = (val: number): string => {
      let str = '';
      if (val >= 100) {
        str += a[Math.floor(val / 100)] + 'Hundred ';
        val %= 100;
      }
      if (val > 0) {
        str += formatTens(val) + ' ';
      }
      return str;
    };

    // Format in Indian numbering system
    let raw = parseInt(n);
    let blocks: number[] = [];

    // Hundred block
    blocks.push(raw % 1000);
    raw = Math.floor(raw / 1000);

    // Thousand, Lakh, Crore blocks
    while (raw > 0) {
      blocks.push(raw % 100);
      raw = Math.floor(raw / 100);
    }

    for (let i = blocks.length - 1; i >= 0; i--) {
      let val = blocks[i];
      if (val > 0) {
        words += parseBlock(val) + (g[i] ? g[i] + ' ' : '');
      }
    }

    return `INR ${words.trim()} Only`;
  };

  const getRoundingExample = () => {
    const base = state.totals.subTotal + state.totals.totalCgst + state.totals.totalSgst - state.advancePaid;
    if (state.roundingType === 'up') {
      return `Example: ${base.toFixed(2)} -> ${Math.ceil(base).toFixed(2)}`;
    }
    if (state.roundingType === 'down') {
      return `Example: ${base.toFixed(2)} -> ${Math.floor(base).toFixed(2)}`;
    }
    return `Example: ${base.toFixed(2)} -> ${base.toFixed(2)} (No Rounding)`;
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-16 font-sans">

      {/* Top Section: Branding, Autosave & Progress Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4">
          <div className="flex flex-col">
            <h1 className="text-[26px] font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 leading-none">Create Quotation</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">Fill in the details below to generate a premium quotation.</p>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-md text-[11px] font-medium text-zinc-600 dark:text-zinc-400 font-mono shadow-sm self-start sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ALL CHANGES SAVED
          </div>
        </div>

        {/* Minimal Swiss Wizard Progress Tracker */}
        <div className="w-full bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/80 rounded-lg p-5 select-none">
          <div className="flex flex-row items-center justify-between gap-2 overflow-x-auto py-1">
            {steps.map((s, idx) => {
              const isCurrent = state.step === s.id;
              const isCompleted = state.step > s.id;

              return (
                <div key={s.id} className="flex items-center gap-3 shrink-0 flex-1 justify-center last:flex-initial">
                  <button
                    onClick={() => dispatch({ type: 'SET_STEP', payload: s.id })}
                    className="flex items-center gap-2 text-left focus:outline-none transition-all group"
                  >
                    {/* Circle Badge */}
                    <div
                      className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all border",
                        isCurrent
                          ? "bg-black text-white border-black"
                          : isCompleted
                            ? "bg-neutral-100 text-neutral-800 border-neutral-300 group-hover:bg-neutral-200"
                            : "bg-white text-neutral-400 border-neutral-200 group-hover:border-neutral-300"
                      )}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3px]" /> : s.id}
                    </div>
                    {/* Label */}
                    <span
                      className={cn(
                        "text-xs font-mono transition-colors tracking-tight",
                        isCurrent
                          ? "text-black font-medium"
                          : "text-neutral-400 font-normal group-hover:text-neutral-600"
                      )}
                    >
                      {s.label}
                    </span>
                  </button>

                  {idx < steps.length - 1 && (
                     <div className="h-px bg-neutral-200 flex-1 min-w-[20px] max-w-[80px]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Address Selector Popup Modal */}
      {showAddressSelector && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-neutral-200 rounded-sm shadow-xl p-2 relative animate-scale-up">
            <button
              onClick={() => setShowAddressSelector(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 transition-colors p-1"
            >
              <X className="h-4 w-4" />
            </button>
            <AddressSelector
              onSelect={handleAddressImport}
              onClose={() => setShowAddressSelector(false)}
            />
          </div>
        </div>
      )}

      {/* Main Dynamic Workspace Panel */}
      <div className="min-h-[460px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.step}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >

            {/* STEP 1: General Details */}
            {state.step === 1 && (
              <Card className="border-neutral-200 rounded-sm shadow-none overflow-hidden bg-white">
                <div className="px-6 py-5 border-b border-neutral-200">
                  <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold">Step 1 of 5</span>
                  <h2 className="text-lg font-bold text-black tracking-tight font-mono mt-1">General Details</h2>
                  <p className="text-sm text-neutral-450 mt-1 font-mono">Configure basic information for your quotation.</p>
                </div>

                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    id="quotationName"
                    label="Document Name"
                    value={state.quotationName}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'quotationName', value: e.target.value })}
                    placeholder="Web Development Services Quotation"
                    required
                  />
                  <InputField
                    id="quotationId"
                    label="Reference ID"
                    value={state.quotationId}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'quotationId', value: e.target.value })}
                    placeholder="QT-2025-0001"
                    required
                    isMonospace
                  />

                  <DatePickerField
                    id="quotationDate"
                    label="Creation Date"
                    value={state.quotationDate}
                    onChange={(val) => dispatch({ type: 'SET_FIELD', field: 'quotationDate', value: val })}
                    required
                  />

                  <DatePickerField
                    id="dueDate"
                    label="Validity / Expiration Date"
                    value={state.dueDate}
                    onChange={(val) => dispatch({ type: 'SET_FIELD', field: 'dueDate', value: val })}
                    required
                  />
                </CardContent>
              </Card>
            )}

            {/* STEP 2: Billed By & To */}
            {state.step === 2 && (
              <div className="flex flex-col gap-6">
                <div className="px-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold">Step 2 of 5</span>
                  <h2 className="text-lg font-bold text-black tracking-tight font-mono mt-1">Billed By & To</h2>
                  <p className="text-sm text-neutral-450 mt-1 font-mono">Add sender and receiver information. Import profiles to auto-fill details and bank credentials.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Billed By */}
                  <Card id="billed-by-card" className="border-neutral-200 rounded-sm shadow-none overflow-hidden bg-white">
                    <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/50">
                      <span className="text-base font-medium tracking-tight font-mono text-black">Billed By (From)</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openAddressSelector('company')}
                        className="text-xs font-mono border-neutral-250 hover:bg-neutral-100 h-7 rounded-xs px-2.5"
                      >
                        Import Profile
                      </Button>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      {isEditingBilledBy ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField id="companyName" label="Company Name" value={state.companyDetails.name} onChange={(e) => handleDetailChange('SET_COMPANY_DETAILS', 'name', e.target.value)} placeholder="Acme Digital Pvt. Ltd." />
                            <InputField id="companyGstin" label="GSTIN Number" value={state.companyDetails.gstin} onChange={(e) => handleDetailChange('SET_COMPANY_DETAILS', 'gstin', e.target.value)} placeholder="27AACCA1234A1Z5" isMonospace />
                            <InputField id="companyPan" label="PAN Number" value={state.companyDetails.pan || ''} onChange={(e) => handleDetailChange('SET_COMPANY_DETAILS', 'pan', e.target.value)} placeholder="ABCDE1234F" isMonospace />
                            <InputField id="companyEmail" label="Email Address" type="email" value={state.companyDetails.email || ''} onChange={(e) => handleDetailChange('SET_COMPANY_DETAILS', 'email', e.target.value)} placeholder="finance@acme.com" />
                            <InputField id="companyPhone" label="Phone Number" value={state.companyDetails.phone || ''} onChange={(e) => handleDetailChange('SET_COMPANY_DETAILS', 'phone', e.target.value)} placeholder="+91 98765 43210" />
                            <div className="md:col-span-2">
                              <InputField id="companyAddress" label="Address" value={state.companyDetails.address} onChange={(e) => handleDetailChange('SET_COMPANY_DETAILS', 'address', e.target.value)} placeholder="123, Business Park" />
                            </div>
                          </div>

                          {/* Logo Uploader */}
                          <div className="space-y-2 border-t border-neutral-100 pt-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-mono font-semiBold text-neutral-800">Company Logo</Label>
                              <div className="flex rounded bg-neutral-150 p-0.5 text-xs font-mono">
                                <button
                                  type="button"
                                  onClick={() => setLogoUploadTab('upload')}
                                  className={cn(
                                    "px-2 py-0.5 rounded-xs transition-all",
                                    logoUploadTab === 'upload' ? 'bg-white text-neutral-900 font-bold shadow-xs' : 'text-neutral-400'
                                  )}
                                >
                                  Upload Logo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setLogoUploadTab('url')}
                                  className={cn(
                                    "px-2 py-0.5 rounded-xs transition-all",
                                    logoUploadTab === 'url' ? 'bg-white text-neutral-900 font-bold shadow-xs' : 'text-neutral-400'
                                  )}
                                >
                                  Paste Link
                                </button>
                              </div>
                            </div>

                            {logoUploadTab === 'upload' ? (
                              <div className="space-y-2">
                                <input
                                  type="file"
                                  ref={logoFileInputRef}
                                  onChange={handleLogoUpload}
                                  accept="image/*"
                                  className="hidden"
                                />

                                {state.companyDetails.logo ? (
                                  <div className="flex items-center gap-3 p-2 border border-neutral-200 rounded-sm bg-neutral-50">
                                    <div className="h-10 w-10 bg-white border border-neutral-150 rounded-sm p-0.5 flex items-center justify-center overflow-hidden">
                                      <img
                                        src={state.companyDetails.logo}
                                        alt="Company Logo Preview"
                                        className="max-h-full max-w-full object-contain"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0 font-mono text-[10px] text-neutral-500">
                                      <p className="font-bold text-neutral-800 truncate">Company Logo</p>
                                      <p className="truncate">{state.companyDetails.logo.split('/').pop()}</p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => dispatch({ type: 'SET_COMPANY_DETAILS', field: 'logo', value: '' })}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-neutral-200 h-7 font-mono text-[10px] rounded-xs px-2"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => logoFileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-neutral-200 rounded-sm hover:border-black hover:bg-neutral-50/50 cursor-pointer transition-all group"
                                  >
                                    {isLogoUploading ? (
                                      <div className="flex flex-col items-center gap-1.5">
                                        <Loader2 className="h-5 w-5 text-black animate-spin" />
                                        <span className="text-[10px] font-mono text-neutral-500">Uploading logo...</span>
                                      </div>
                                    ) : (
                                      <div className="flex flex-col items-center gap-1 text-center">
                                        <Upload className="h-4 w-4 text-neutral-400 group-hover:text-black transition-colors" />
                                        <span className="text-[10px] font-bold text-neutral-700 font-mono">Upload Company Logo</span>
                                        <span className="text-[8px] text-neutral-400 font-mono">PNG/JPG (Max 2MB)</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Input
                                type="url"
                                value={state.companyDetails.logo || ''}
                                onChange={(e) => dispatch({ type: 'SET_COMPANY_DETAILS', field: 'logo', value: e.target.value })}
                                placeholder="https://example.com/company-logo.png"
                                className="font-mono text-xs rounded-sm border-neutral-200 h-9"
                              />
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingBilledBy(false)}
                            className="font-mono text-xs mt-2 rounded-xs h-8"
                          >
                            Save Details
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border border-neutral-100 p-4 rounded-xs bg-neutral-50/30">
                            <div className="flex items-start gap-3 min-w-0 flex-1">
                              {state.companyDetails.logo && (
                                <div className="h-10 w-10 border border-neutral-150 rounded-sm bg-white p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                                  <img src={state.companyDetails.logo} alt="Company Logo" className="max-h-full max-w-full object-contain" />
                                </div>
                              )}
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm text-black truncate">{state.companyDetails.name || 'Acme Digital Pvt. Ltd.'}</h4>
                                  <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-[9px] px-1.5 py-0.5 rounded-sm font-semibold">
                                    <span className="h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
                                    Verified
                                  </span>
                                </div>
                                {/* <p className="text-[11px] text-neutral-400 font-mono leading-relaxed line-clamp-2">{state.companyDetails.address || '123, Business Park, Andheri East, Mumbai'}</p> */}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingBilledBy(true)}
                              className="font-mono text-sm underline text-neutral-500 hover:text-black"
                            >
                              Edit
                            </Button>
                          </div>

                          <div className="space-y-2 text-xs font-mono border-t border-neutral-100 pt-3">
                            <div className="flex justify-between py-1 border-b border-neutral-50"><span className="text-neutral-400">GSTIN</span><span className="text-neutral-800 font-semibold">{state.companyDetails.gstin || '27AACCA1234A1Z5'}</span></div>
                            {state.companyDetails.pan && (
                              <div className="flex justify-between py-1 border-b border-neutral-50"><span className="text-neutral-400">PAN</span><span className="text-neutral-800 font-semibold">{state.companyDetails.pan}</span></div>
                            )}
                            {state.companyDetails.email && (
                              <div className="flex justify-between py-1 border-b border-neutral-50"><span className="text-neutral-400">Email</span><span className="text-neutral-800">{state.companyDetails.email}</span></div>
                            )}
                            {state.companyDetails.phone && (
                              <div className="flex justify-between py-1 border-b border-neutral-50"><span className="text-neutral-400">Phone</span><span className="text-neutral-800">{state.companyDetails.phone}</span></div>
                            )}
                            <div className="flex justify-between py-1 border-b border-neutral-50"><span className="text-neutral-400">Bank Name</span><span className="text-neutral-800">{state.bankDetails?.bankName || 'HDFC Bank Ltd.'}</span></div>
                            <div className="flex justify-between py-1 border-b border-neutral-50"><span className="text-neutral-400">A/C No.</span><span className="text-neutral-800">{state.bankDetails?.accountNumber || '50200012345678'}</span></div>
                            <div className="flex justify-between py-1"><span className="text-neutral-400">IFSC Code</span><span className="text-neutral-800">{state.bankDetails?.ifsc || 'HDFC0001234'}</span></div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Billed To */}
                  <Card id="billed-to-card" className="border-neutral-200 rounded-sm shadow-none overflow-hidden bg-white">
                    <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/50">
                      <span className="text-base font-medium font-mono text-black">Billed To (Client)</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openAddressSelector('client')}
                        className="text-xs font-mono border-neutral-250 hover:bg-neutral-100 h-7 rounded-xs px-2.5"
                      >
                        Import Profile
                      </Button>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      {isEditingBilledTo ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField id="clientName" label="Client / Company Name" value={state.clientDetails.name} onChange={(e) => handleDetailChange('SET_CLIENT_DETAILS', 'name', e.target.value)} placeholder="Globex Corporation Pvt. Ltd." />
                            <InputField id="clientGstin" label="GSTIN Number" value={state.clientDetails.gstin} onChange={(e) => handleDetailChange('SET_CLIENT_DETAILS', 'gstin', e.target.value)} placeholder="29AABCG9876B1Z2" isMonospace />
                            <InputField id="clientPan" label="PAN Number" value={state.clientDetails.pan || ''} onChange={(e) => handleDetailChange('SET_CLIENT_DETAILS', 'pan', e.target.value)} placeholder="VWXYZ9876A" isMonospace />
                            <InputField id="clientEmail" label="Email Address" type="email" value={state.clientDetails.email || ''} onChange={(e) => handleDetailChange('SET_CLIENT_DETAILS', 'email', e.target.value)} placeholder="billing@globex.com" />
                            <InputField id="clientPhone" label="Phone Number" value={state.clientDetails.phone || ''} onChange={(e) => handleDetailChange('SET_CLIENT_DETAILS', 'phone', e.target.value)} placeholder="+91 80 1234 5678" />
                            <div className="md:col-span-2">
                              <InputField id="clientAddress" label="Address" value={state.clientDetails.address} onChange={(e) => handleDetailChange('SET_CLIENT_DETAILS', 'address', e.target.value)} placeholder="45, Residency Road, Bengaluru" />
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingBilledTo(false)}
                            className="font-mono text-[10px] mt-2 rounded-xs h-8"
                          >
                            Save Details
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border border-neutral-100 p-4 rounded-xs bg-neutral-50/30">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-black truncate">{state.clientDetails.name || 'Globex Corporation Pvt. Ltd.'}</h4>
                                <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/50 text-[9px] px-1.5 py-0.5 rounded-sm font-semibold">
                                  <span className="h-1 w-1 rounded-full bg-emerald-500 shrink-0" />
                                  Verified
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-400 font-mono leading-relaxed line-clamp-2">{state.clientDetails.address || '45, Residency Road, Bengaluru'}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingBilledTo(true)}
                              className="font-mono underline text-sm text-neutral-500 hover:text-black"
                            >
                              Edit
                            </Button>
                          </div>

                          <div className="space-y-2 text-xs font-mono border-t border-neutral-100 pt-3">
                            <div className="flex justify-between py-1 border-b border-neutral-50"><span className="text-neutral-400">GSTIN</span><span className="text-neutral-800 font-semibold">{state.clientDetails.gstin || '29AABCG9876B1Z2'}</span></div>
                            {state.clientDetails.pan && (
                              <div className="flex justify-between py-1 border-b border-neutral-50"><span className="text-neutral-400">PAN</span><span className="text-neutral-800 font-semibold">{state.clientDetails.pan}</span></div>
                            )}
                            {state.clientDetails.email && (
                              <div className="flex justify-between py-1 border-b border-neutral-50"><span className="text-neutral-400">Email</span><span className="text-neutral-800">{state.clientDetails.email}</span></div>
                            )}
                            {state.clientDetails.phone && (
                              <div className="flex justify-between py-1 border-b border-neutral-50"><span className="text-neutral-400">Phone</span><span className="text-neutral-800">{state.clientDetails.phone}</span></div>
                            )}
                            <div className="flex justify-between py-1 border-b border-neutral-50"><span className="text-neutral-400">Bank Name</span><span className="text-neutral-800">ICICI Bank Ltd.</span></div>
                            <div className="flex justify-between py-1 border-b border-neutral-50"><span className="text-neutral-400">A/C No.</span><span className="text-neutral-800">123405678001</span></div>
                            <div className="flex justify-between py-1"><span className="text-neutral-400">IFSC Code</span><span className="text-neutral-800">ICIC0001234</span></div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* STEP 3: Line Items & Pricing */}
            {state.step === 3 && (
              <Card className="border-neutral-200 rounded-sm shadow-none overflow-hidden bg-white">
                <div className="px-6 py-5 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold">Step 3 of 5</span>
                    <h2 className="text-lg font-bold text-black tracking-tight font-mono mt-1">Line Items & Pricing</h2>
                    <p className="text-sm text-neutral-450 mt-1 font-mono">Add items or services with pricing and tax details. Totals are calculated automatically.</p>
                  </div>
                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <Button
                      id="add-item-btn"
                      onClick={() => dispatch({ type: 'ADD_ITEM' })}
                      variant="outline"
                      className="font-mono text-xs rounded-xs border-neutral-200 text-neutral-700 hover:bg-neutral-50 h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Item
                    </Button>
                    <Button
                      onClick={() => dispatch({ type: 'ADD_ITEM' })}
                      variant="outline"
                      className="font-mono text-xs rounded-xs border-neutral-200 text-neutral-700 hover:bg-neutral-50 h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Service
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6 space-y-6">
                  {state.items.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-neutral-200 rounded-sm bg-neutral-50/20">
                      <h4 className="text-xs font-bold text-neutral-800 font-mono">No Items Added Yet</h4>
                      <p className="text-[11px] text-neutral-400 font-mono mb-4">Add at least one line item to generate pricing totals.</p>
                      <Button
                        onClick={() => dispatch({ type: 'ADD_ITEM' })}
                        className="bg-black hover:bg-neutral-800 text-white rounded-xs text-xs font-mono h-9"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add First Item
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">

                      {/* Premium Tabular Table Grid */}
                      <div id="line-items-table" className="overflow-x-auto border border-neutral-200 rounded-sm">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-mono text-neutral-500 font-bold">
                              <th className="py-2.5 px-3 w-10 text-center border-r border-neutral-200">#</th>
                              <th className="py-2.5 px-3 min-w-[200px] border-r border-neutral-200">Item / Service</th>
                              <th className="py-2.5 px-3 w-28 text-center border-r border-neutral-200">HSN/SAC</th>
                              <th className="py-2.5 px-3 w-16 text-center border-r border-neutral-200">Qty</th>
                              <th className="py-2.5 px-3 w-28 text-center border-r border-neutral-200">Rate Type</th>
                              <th className="py-2.5 px-3 w-32 text-right border-r border-neutral-200">Rate (₹)</th>
                              <th className="py-2.5 px-3 w-36 text-center border-r border-neutral-200" colSpan={2}>Tax (%)</th>
                              <th className="py-2.5 px-3 w-36 text-right border-r border-neutral-200">Amount (₹)</th>
                              <th className="py-2.5 px-2 w-10 text-center"></th>
                            </tr>
                            <tr className="bg-neutral-100/50 border-b border-neutral-200 text-[9px] uppercase font-mono text-neutral-400 font-bold text-center">
                              <th colSpan={6} className="border-r border-neutral-200"></th>
                              <th className="py-1 px-1 border-r border-neutral-200 font-bold">CGST</th>
                              <th className="py-1 px-1 border-r border-neutral-200 font-bold">SGST</th>
                              <th colSpan={2}></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-250">
                            {state.items.map((item, index) => {
                              const lineTotal = item.quantity * item.rate;
                              const taxTotal = (lineTotal * (item.cgstRate + item.sgstRate)) / 100;
                              const total = lineTotal + taxTotal;

                              return (
                                <tr key={item.id} className="text-xs group hover:bg-neutral-50/30 transition-colors">
                                  {/* # */}
                                  <td className="py-3 px-3 text-center font-mono text-neutral-400 border-r border-neutral-200 bg-neutral-50/10">
                                    {index + 1}
                                  </td>

                                  {/* Item Name / Desc */}
                                  <td className="py-3 px-3 border-r border-neutral-200 space-y-1.5">
                                    <input
                                      value={item.name}
                                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                      placeholder="Website Design"
                                      className="w-full font-bold text-neutral-900 bg-transparent border-0 border-b border-transparent hover:border-neutral-200 focus:border-black focus:ring-0 p-0 text-xs transition-colors rounded-none placeholder:text-neutral-350"
                                    />
                                    <textarea
                                      value={item.description}
                                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                      placeholder="Provide detailed description..."
                                      rows={1}
                                      className="w-full text-[11px] text-neutral-400 bg-transparent border-0 border-b border-transparent hover:border-neutral-100 focus:border-black focus:ring-0 p-0 transition-colors resize-y rounded-none placeholder:text-neutral-300"
                                    />
                                  </td>

                                  {/* HSN/SAC */}
                                  <td className="py-3 px-3 border-r border-neutral-200 text-center">
                                    <input
                                      value={item.hsn || ''}
                                      onChange={(e) => handleItemChange(index, 'hsn', e.target.value)}
                                      placeholder="998313"
                                      className="w-full font-mono text-center bg-transparent border-none focus:ring-0 p-0 text-xs text-neutral-800"
                                    />
                                  </td>

                                  {/* Quantity */}
                                  <td className="py-3 px-3 border-r border-neutral-200 text-center">
                                    <input
                                      type="number"
                                      value={item.quantity}
                                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                      className="w-full font-mono text-center bg-transparent border-none focus:ring-0 p-0 text-xs text-neutral-800 font-bold"
                                    />
                                  </td>

                                  {/* Rate Type */}
                                  <td className="py-3 px-3 border-r border-neutral-200 text-center">
                                    <Select defaultValue="Fixed">
                                      <SelectTrigger className="h-7 border-none bg-transparent hover:bg-neutral-50 px-1 py-0 shadow-none text-xs text-neutral-800 font-mono focus:ring-0 focus:ring-offset-0 text-center justify-center gap-1">
                                        <SelectValue placeholder="Select" />
                                      </SelectTrigger>
                                      <SelectContent className="min-w-[100px]">
                                        <SelectItem value="Fixed">Fixed</SelectItem>
                                        <SelectItem value="Hourly">Hourly</SelectItem>
                                        <SelectItem value="Daily">Daily</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>

                                  {/* Rate */}
                                  <td className="py-3 px-3 border-r border-neutral-200 text-right font-mono">
                                    <input
                                      type="number"
                                      value={item.rate}
                                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                                      className="w-full font-mono text-right bg-transparent border-none focus:ring-0 p-0 text-xs text-neutral-800 font-bold"
                                    />
                                  </td>

                                  {/* CGST */}
                                  <td className="py-3 px-2 border-r border-neutral-200 text-center font-mono">
                                    <input
                                      type="number"
                                      value={item.cgstRate}
                                      onChange={(e) => handleItemChange(index, 'cgstRate', e.target.value)}
                                      className="w-full font-mono text-center bg-transparent border-none focus:ring-0 p-0 text-xs text-neutral-600"
                                    />
                                  </td>

                                  {/* SGST */}
                                  <td className="py-3 px-2 border-r border-neutral-200 text-center font-mono">
                                    <input
                                      type="number"
                                      value={item.sgstRate}
                                      onChange={(e) => handleItemChange(index, 'sgstRate', e.target.value)}
                                      className="w-full font-mono text-center bg-transparent border-none focus:ring-0 p-0 text-xs text-neutral-600"
                                    />
                                  </td>

                                  {/* Amount */}
                                  <td className="py-3 px-3 border-r border-neutral-200 text-right font-mono font-bold text-neutral-900">
                                    {total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>

                                  {/* Delete */}
                                  <td className="py-3 px-2 text-center">
                                    <button
                                      onClick={() => dispatch({ type: 'REMOVE_ITEM', index })}
                                      className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Add Row & Pricing Breakdown summary align grid */}
                      <div className="flex flex-col md:flex-row md:justify-between items-start gap-8 pt-4">
                        <Button
                          onClick={() => dispatch({ type: 'ADD_ITEM' })}
                          variant="outline"
                          className="font-mono text-xs rounded-xs border-neutral-200 text-neutral-700 hover:bg-neutral-50 h-8"
                        >
                          + Add New Row
                        </Button>

                        {/* Totals Summary Panel at bottom right */}
                        <div id="totals-summary-panel" className="w-full md:w-80 bg-neutral-50/50 border border-neutral-200 rounded-sm p-4 space-y-2.5 font-mono text-xs">
                          <div className="flex justify-between text-neutral-500">
                            <span>Sub Total</span>
                            <span className="text-neutral-900 font-bold">{state.totals.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-neutral-500">
                            <span>Total Tax (CGST)</span>
                            <span className="text-neutral-900">{state.totals.totalCgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between text-neutral-500 border-b border-neutral-200 pb-2.5">
                            <span>Total Tax (SGST)</span>
                            <span className="text-neutral-900">{state.totals.totalSgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-between items-center text-black pt-1">
                            <span className="font-bold text-neutral-800">Grand Total (₹)</span>
                            <span className="font-bold text-base text-black underline decoration-[1.5px] underline-offset-4">
                              {state.totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* STEP 4: Payment & Calculations */}
            {state.step === 4 && (
              <div className="flex flex-col gap-6">
                <div className="px-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold">Step 4 of 5</span>
                  <h2 className="text-lg font-bold text-black tracking-tight font-mono mt-1">Payment & Calculations</h2>
                  <p className="text-sm text-neutral-450 mt-1 font-mono">Configure payment preferences, terms, and rounding rules.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Bank Account & Rounding */}
                  <Card className="border-neutral-200 rounded-sm shadow-none bg-white">
                    <CardContent className="p-6 space-y-6">
                      {/* Bank SelectorDropdown */}
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-500">Receiving Bank Account</Label>
                        <Select
                          value={selectedBankId}
                          onValueChange={(val) => handleBankSelect(val)}
                        >
                          <SelectTrigger id="bank-selector-trigger" className="flex h-10 w-full rounded-sm border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-850 font-mono">
                            <SelectValue placeholder="Select Receiving Bank" />
                          </SelectTrigger>
                          <SelectContent>
                            {banks.map((b) => (
                              <SelectItem key={b.id} value={b.id}>
                                {b.bank_name} - {b.account_number}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Selected Bank Details Display Card */}
                      <div className="border border-neutral-200 p-4 rounded-sm bg-neutral-50/20 font-mono text-[11px] space-y-2 text-neutral-600">
                        <div className="flex justify-between"><span className="text-neutral-400">A/C No.</span><span className="text-neutral-800 font-semibold">{state.bankDetails?.accountNumber || '50200012345678'}</span></div>
                        <div className="flex justify-between"><span className="text-neutral-400">IFSC Code</span><span className="text-neutral-800 font-semibold">{state.bankDetails?.ifsc || 'HDFC0001234'}</span></div>
                        {/* <div className="flex justify-between"><span className="text-neutral-400">Branch</span><span className="text-neutral-800">Andheri East, Mumbai</span></div> */}
                      </div>

                      {/* Add Another Bank Account link */}
                      <a
                        href="/dashboard/banks"
                        target="_blank"
                        className="text-[10px] font-mono text-neutral-400 hover:text-black transition-colors inline-block mt-1 underline underline-offset-2"
                      >
                        + Add Another Bank Account
                      </a>

                      {/* Advance label and amount */}
                      <div className="grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4">
                        <InputField
                          id="advanceFieldLabel"
                          label="Advance Deduction Label"
                          value={state.advanceFieldLabel}
                          onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'advanceFieldLabel', value: e.target.value })}
                          placeholder="Advance Received"
                        />
                        <InputField
                          id="advancePaid"
                          label="Deduction Amount"
                          type="number"
                          value={state.advancePaid}
                          onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'advancePaid', value: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                        />
                      </div>

                      {/* Rounding Dropdown */}
                      <div className="space-y-2 border-t border-neutral-100 pt-4">
                        <Label className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-500">Rounding Rule</Label>
                        <Select
                          value={state.roundingType}
                          onValueChange={(val) => handleRoundingChange(val as RoundingType)}
                        >
                          <SelectTrigger id="rounding-selector-trigger" className="flex h-10 w-full rounded-sm border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-850 font-mono">
                            <SelectValue placeholder="Select Rounding Rule" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="up">Up (Round away from zero)</SelectItem>
                            <SelectItem value="down">Down (Round down)</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-[10px] text-neutral-400 font-mono block mt-1">Applies to Grand Total and Tax calculations.</span>
                      </div>

                      {/* Rounding dynamic Box */}
                      <div className="bg-neutral-50 border border-neutral-200/80 p-3.5 rounded-sm font-mono text-[10px] text-neutral-500">
                        {getRoundingExample()}
                      </div>

                    </CardContent>
                  </Card>

                  {/* Right Column: Terms and Signature */}
                  <Card className="border-neutral-200 rounded-sm shadow-none bg-white">
                    <CardContent className="p-6 space-y-6">

                      {/* Terms and conditions */}
                      <TextareaField
                        id="terms"
                        label="Terms & Conditions"
                        value={state.terms}
                        onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'terms', value: e.target.value })}
                        placeholder="Provide billing parameters, advance details..."
                        rows={4}
                        required
                      />

                      {/* Signature Upload Dropzone */}
                      <div id="signature-container" className="space-y-3 border-t border-neutral-100 pt-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] uppercase font-mono tracking-wider font-bold text-neutral-500">Authorized Signature</Label>

                          <div className="flex rounded bg-neutral-150 p-0.5 text-[9px] font-mono">
                            <button
                              type="button"
                              onClick={() => setSigUploadTab('upload')}
                              className={cn(
                                "px-2 py-0.5 rounded-xs transition-all",
                                sigUploadTab === 'upload' ? 'bg-white text-neutral-900 font-bold shadow-xs' : 'text-neutral-400'
                              )}
                            >
                              Upload File
                            </button>
                            <button
                              type="button"
                              onClick={() => setSigUploadTab('url')}
                              className={cn(
                                "px-2 py-0.5 rounded-xs transition-all",
                                sigUploadTab === 'url' ? 'bg-white text-neutral-900 font-bold shadow-xs' : 'text-neutral-400'
                              )}
                            >
                              Paste Link
                            </button>
                          </div>
                        </div>

                        {sigUploadTab === 'upload' ? (
                          <div className="space-y-3">
                            <input
                              type="file"
                              ref={sigFileInputRef}
                              onChange={handleSignatureUpload}
                              accept="image/*"
                              className="hidden"
                            />

                            {state.signature ? (
                              <div className="flex items-center gap-4 p-3 border border-neutral-200 rounded-sm bg-neutral-50">
                                <div className="h-14 w-24 bg-white border border-neutral-150 rounded-sm p-1 flex items-center justify-center overflow-hidden">
                                  <img
                                    src={state.signature}
                                    alt="Signature Scanned Preview"
                                    className="max-h-full max-w-full object-contain"
                                  />
                                </div>
                                <div className="flex-1 min-w-0 font-mono text-[10px] text-neutral-500">
                                  <p className="font-bold text-neutral-800 truncate">Scanned Signature</p>
                                  <p className="truncate">{state.signature.split('/').pop()}</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => dispatch({ type: 'SET_FIELD', field: 'signature', value: '' })}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-neutral-200 h-8 font-mono text-[10px] rounded-xs"
                                >
                                  Change
                                </Button>
                              </div>
                            ) : (
                              <div
                                onClick={() => sigFileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-200 rounded-sm hover:border-black hover:bg-neutral-50/50 cursor-pointer transition-all group"
                              >
                                {isSigUploading ? (
                                  <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-6 w-6 text-black animate-spin" />
                                    <span className="text-[10px] font-mono text-neutral-500">Uploading signature...</span>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-1.5 text-center">
                                    <Upload className="h-5 w-5 text-neutral-400 group-hover:text-black transition-colors" />
                                    <span className="text-xs font-bold text-neutral-700 font-mono">Upload Signature</span>
                                    <span className="text-[9px] text-neutral-400 font-mono">Recommended size: 308 x 80px (PNG)</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Input
                              type="url"
                              value={state.signature || ''}
                              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'signature', value: e.target.value })}
                              placeholder="https://example.com/scanned-sig.png"
                              className="font-mono text-xs rounded-sm border-neutral-200"
                            />
                            {state.signature && (
                              <div className="h-16 w-32 border border-neutral-150 p-1 bg-white rounded-sm flex items-center justify-center">
                                <img src={state.signature} alt="Signature URL Preview" className="max-h-full max-w-full object-contain" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* STEP 5: Export / Preview */}
            {state.step === 5 && (
              <div className="flex flex-col gap-6">
                <div className="px-1">
                  <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 font-semibold">Step 5 of 5</span>
                  <h2 className="text-lg font-bold text-black tracking-tight font-mono mt-1">Export / Preview</h2>
                  <p className="text-sm text-neutral-450 mt-1 font-mono">Review your quotation before exporting or printing.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                  {/* Left Column: Summary Card & Export Options */}
                  <div className="lg:col-span-5 flex flex-col gap-6">

                    {/* Summary Card */}
                    <Card className="border-neutral-200 rounded-sm shadow-none bg-white">
                      <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50/50">
                        <h3 className="text-xs font-bold font-mono text-black">Summary</h3>
                      </div>
                      <CardContent className="p-5 font-mono text-[11px] space-y-3">
                        <div className="flex flex-col gap-0.5 border-b border-neutral-50 pb-2">
                          <span className="text-neutral-400 uppercase text-[9px] font-bold">Document Name</span>
                          <span className="text-neutral-800 font-semibold">{state.quotationName}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-50 pb-2">
                          <span className="text-neutral-400">Reference ID</span>
                          <span className="text-neutral-800 font-bold">{state.quotationId}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-50 pb-2">
                          <span className="text-neutral-400">Created On</span>
                          <span className="text-neutral-800">{state.quotationDate}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-50 pb-2">
                          <span className="text-neutral-400">Valid Until</span>
                          <span className="text-neutral-800">{state.dueDate}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-50 pb-2">
                          <span className="text-neutral-400">Billed By</span>
                          <span className="text-neutral-800 truncate max-w-[160px]">{state.companyDetails.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-neutral-50 pb-2">
                          <span className="text-neutral-400">Billed To</span>
                          <span className="text-neutral-800 truncate max-w-[160px]">{state.clientDetails.name}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1 text-black font-bold">
                          <span className="uppercase text-[9px]">Grand Total</span>
                          <span className="text-sm underline decoration-1 underline-offset-2">
                            ₹{state.totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* PDF Template Theme Selector */}
                    <Card id="theme-selector-card" className="border-neutral-200 rounded-sm shadow-none bg-white">
                      <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50/50">
                        <h3 className="text-xs font-bold font-mono text-black uppercase tracking-wider">Document Theme</h3>
                      </div>
                      <CardContent className="p-5">
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'modern', name: 'Modern', desc: 'Minimalist tech', color: '#000000' },
                            { id: 'emerald', name: 'Creative', desc: 'Forest emerald', color: '#064e3b' },
                            { id: 'royal', name: 'Corporate', desc: 'Enterprise navy', color: '#1e3a8a' },
                            { id: 'warm', name: 'Warm Sunset', desc: 'Terracotta boutique', color: '#854d0e' },
                            { id: 'steel', name: 'Technical', desc: 'Slate logistics', color: '#334155' },
                            { id: 'classic', name: 'Elegant', desc: 'Centered legal', color: '#111827' },
                          ].map((t) => {
                            const isSelected = (state.theme || 'modern') === t.id;
                            return (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => dispatch({ type: 'SET_FIELD', field: 'theme', value: t.id })}
                                className={cn(
                                  "flex flex-col items-start text-left p-3 rounded border text-xs transition-all cursor-pointer w-full select-none",
                                  isSelected 
                                    ? "border-black bg-zinc-50/80 ring-1 ring-black" 
                                    : "border-zinc-200 hover:border-zinc-350 hover:bg-zinc-50/50"
                                )}
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="h-2.5 w-2.5 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: t.color }} />
                                  <span className="font-bold text-zinc-950">{t.name}</span>
                                </div>
                                <span className="text-[10px] text-zinc-400 font-mono leading-none truncate max-w-[125px]">
                                  {t.desc}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Export Options */}
                    <Card id="export-options-card" className="border-neutral-200 rounded-sm shadow-none bg-white">
                      <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50/50">
                        <h3 className="text-xs font-bold font-mono text-black">Export Options</h3>
                      </div>
                      <CardContent className="p-5 flex flex-col gap-2.5">
                        <PDFPreview
                          filename={`Quotation-${state.quotationId}.pdf`}
                          buttonText="Download PDF"
                          buttonClassName="w-full bg-black text-white hover:bg-neutral-800 border border-black font-mono font-bold text-xs py-2.5 rounded-sm transition-all duration-150 shadow-xs flex items-center justify-center gap-2"
                          onDownload={() => saveQuotation('quotation')}
                        >
                          <QuotationPreview data={state} />
                        </PDFPreview>

                        <Button
                          variant="outline"
                          onClick={handlePrint}
                          className="w-full text-neutral-800 border-neutral-200 hover:bg-neutral-50 font-mono text-xs py-2.5 rounded-sm flex items-center justify-center gap-2 h-10"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Print (PDF)
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => saveQuotation('draft')}
                          disabled={isSaving}
                          className="w-full text-neutral-800 border-neutral-200 hover:bg-neutral-50 font-mono text-xs py-2.5 rounded-sm flex items-center justify-center gap-2 h-10"
                        >
                          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                          Save as Draft
                        </Button>
                        <Button
                          onClick={() => saveQuotation('quotation')}
                          disabled={isSaving}
                          className="w-full bg-zinc-900 text-white hover:bg-zinc-800 font-mono font-bold text-xs py-2.5 rounded-sm flex items-center justify-center gap-2 h-10 border border-zinc-900"
                        >
                          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          Save Quotation
                        </Button>
                      </CardContent>
                    </Card>

                  </div>

                  {/* Right Column: A4 PDF Live Preview Panel */}
                  <div className="lg:col-span-7 flex flex-col border border-neutral-200 rounded-sm overflow-hidden bg-white shadow-xs">

                    {/* Control Bar */}
                    <div className="bg-neutral-50 border-b border-neutral-200 px-4 py-2.5 flex items-center justify-between text-neutral-500 font-mono text-[10px]">
                      <div className="flex items-center gap-2 select-none">
                        <svg className="h-3.5 w-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>A4 SIZE</span>
                      </div>

                      <div className="flex items-center gap-2 select-none font-mono">
                        <button
                          type="button"
                          onClick={() => setZoom(z => Math.max(30, z - 10))}
                          className="h-5 w-5 hover:bg-neutral-200 text-neutral-600 hover:text-black transition-colors rounded flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="text-[9px] font-bold text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded-sm min-w-[36px] text-center">{zoom}%</span>
                        <button
                          type="button"
                          onClick={() => setZoom(z => Math.min(150, z + 10))}
                          className="h-5 w-5 hover:bg-neutral-200 text-neutral-600 hover:text-black transition-colors rounded flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="hover:text-black" title="Open in New Tab" onClick={() => toast.success('Opening preview in full screen...')}><ExternalLinkIcon /></button>
                      </div>
                    </div>

                    {/* Preview Sheet Container */}
                    <div className="p-6 bg-neutral-100/50 flex items-start justify-center overflow-auto h-[600px] w-full">
                      <div
                        className="origin-top transition-transform duration-100 ease-out shrink-0"
                        style={{
                          transform: `scale(${zoom * 0.01})`,
                          width: '800px',
                          height: `${1130 * zoom * 0.01}px`,
                          transformOrigin: 'top center'
                        }}
                      >
                        <div id="quotation-print-area" className="bg-white border border-neutral-200 shadow-md w-[800px] min-w-[800px]">
                          <QuotationPreview data={state} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Stepped Actions Drawer Navigation bar */}
      <div className="flex justify-between items-center pt-6 border-t border-neutral-200 bg-transparent">
        <div>
          {state.step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2 border-neutral-200 hover:bg-neutral-50 text-sm font-mono rounded-sm h-9 px-4 text-neutral-600"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-mono text-sm h-9 px-4 rounded-sm"
          >
            Cancel
          </Button>

          {state.step < 5 ? (
            <Button
              onClick={handleNext}
              className="flex items-center gap-1.5 bg-black text-white hover:bg-neutral-800 text-sm font-mono rounded-sm h-9 px-5 shadow-sm"
            >
              Save & Continue
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <PDFPreview
              filename={`Quotation-${state.quotationId}.pdf`}
              buttonText="Download PDF"
              buttonClassName="inline-flex items-center gap-1.5 bg-black text-white hover:bg-neutral-800 text-xs font-mono rounded-sm h-9 px-5 shadow-sm focus:outline-none"
              onDownload={() => saveQuotation('quotation')}
            >
              <QuotationPreview data={state} />
            </PDFPreview>
          )}
        </div>
      </div>

    </div>
  );
}

// Inline input details
const InputField = ({
  label,
  id,
  isMonospace = false,
  ...props
}: {
  label: string;
  id: string;
  isMonospace?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="grid w-full items-center gap-2 select-none">
    <Label htmlFor={id} className="text-sm font-mono font-semiBold text-neutral-800 flex items-center gap-1">
      {label} {props.required && <span className="text-red-500">*</span>}
    </Label>
    <Input
      id={id}
      {...props}
      className={cn(
        "rounded-sm text-sm h-10 border-neutral-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black placeholder:text-neutral-300 transition-all text-neutral-800 bg-white w-full",
        isMonospace && "font-mono"
      )}
    />
  </div>
);

const TextareaField = ({
  label,
  id,
  ...props
}: {
  label: string;
  id: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div className="grid w-full items-center gap-2 select-none">
    <Label htmlFor={id} className="text-sm font-mono font-semiBold text-neutral-700">
      {label} {props.required && <span className="text-red-500">*</span>}
    </Label>
    <Textarea
      id={id}
      {...props}
      className="rounded-sm text-xs border-neutral-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black placeholder:text-neutral-300 transition-all text-neutral-800 bg-white"
    />
  </div>
);

const DatePickerField = ({
  label,
  id,
  value,
  onChange,
  required = false
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) => {
  const date = value ? parseISO(value) : undefined;

  return (
    <div className="grid w-full items-center gap-2 select-none">
      <Label htmlFor={id} className="text-sm font-mono font-semiBold text-neutral-800">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className={cn(
              "w-full justify-between text-left rounded-sm text-sm h-10 border-neutral-200 focus:ring-1 focus:ring-black text-neutral-800 bg-white hover:bg-neutral-50 font-mono pl-3.5 pr-10 relative",
              !value && "text-neutral-400"
            )}
          >
            <span>
              {value ? format(date!, "dd MMM yyyy") : "Select Date"}
            </span>
            <CalendarIcon className="h-4 w-4 text-neutral-400 shrink-0 absolute right-3.5 top-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border border-neutral-200 shadow-md rounded-sm" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => {
              onChange(newDate ? format(newDate, "yyyy-MM-dd") : "");
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Extra tiny Icons
const ExternalLinkIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);