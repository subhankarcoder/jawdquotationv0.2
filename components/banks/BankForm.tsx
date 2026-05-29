'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BankDetailsDB, BilledFromAddress } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Building, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BankFormProps {
  bank?: BankDetailsDB | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FormBankData = Omit<BankDetailsDB, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export default function BankForm({ bank, onClose, onSuccess }: BankFormProps) {
  const [formData, setFormData] = useState<FormBankData>({
    bank_name: '',
    account_holder: '',
    account_number: '',
    ifsc: '',
    account_type: 'Current',
  });

  const [companies, setCompanies] = useState<BilledFromAddress[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const supabase = createClient();

  const fetchCompanies = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('billed_from_addresses')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCompanies((data as BilledFromAddress[]) || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }, [supabase]);

  const fetchLinkedCompanies = useCallback(async (bankId: string) => {
    try {
      const { data, error } = await supabase
        .from('billed_from_addresses')
        .select('id')
        .eq('bank_details_id', bankId);

      if (error) throw error;
      if (data) {
        setSelectedCompanyIds(data.map((item) => item.id!));
      }
    } catch (error) {
      console.error('Error fetching linked companies:', error);
    }
  }, [supabase]);

  useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    if (bank) {
      setFormData({
        bank_name: bank.bank_name,
        account_holder: bank.account_holder,
        account_number: bank.account_number,
        ifsc: bank.ifsc,
        account_type: bank.account_type || 'Current',
      });
      void fetchLinkedCompanies(bank.id);
    } else {
      setSelectedCompanyIds([]);
    }
  }, [bank, fetchLinkedCompanies]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCompanyToggle = (companyId: string) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!formData.bank_name || !formData.account_holder || !formData.account_number || !formData.ifsc) {
      toast.error('Please Fill In All Required Fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        toast.error('You Must Be Logged In');
        return;
      }

      let bankId = bank?.id;

      if (bankId) {
        // Update existing bank
        const { error: updateError } = await supabase
          .from('bank_details')
          .update(formData)
          .eq('id', bankId);

        if (updateError) throw updateError;
        toast.success('Bank Account Updated Successfully');
      } else {
        // Create new bank
        const { data: newBank, error: insertError } = await supabase
          .from('bank_details')
          .insert([{ ...formData, user_id: user.id }])
          .select()
          .single();

        if (insertError) throw insertError;
        bankId = newBank.id;
        toast.success('Bank Account Added Successfully');
      }

      // Handle updating the linked companies (billed_from_addresses)
      // 1. Get all current linked companies for this bank
      const { data: currentlyLinked } = await supabase
        .from('billed_from_addresses')
        .select('id')
        .eq('bank_details_id', bankId);

      const currentlyLinkedIds = currentlyLinked?.map((c) => c.id!) || [];

      // 2. Unlink those that are no longer selected
      const toUnlink = currentlyLinkedIds.filter((id) => !selectedCompanyIds.includes(id));
      if (toUnlink.length > 0) {
        const { error: unlinkError } = await supabase
          .from('billed_from_addresses')
          .update({ bank_details_id: null })
          .in('id', toUnlink);
        if (unlinkError) throw unlinkError;
      }

      // 3. Link new selections
      if (selectedCompanyIds.length > 0) {
        const { error: linkError } = await supabase
          .from('billed_from_addresses')
          .update({ bank_details_id: bankId })
          .in('id', selectedCompanyIds);
        if (linkError) throw linkError;
      }

      onSuccess();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed To Save Bank Details';
      toast.error(message);
      console.error('save error:', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
      <CardHeader className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-900 flex flex-row items-center justify-between">
        <CardTitle className="font-semibold text-zinc-900 dark:text-zinc-50 text-base">{bank ? 'Edit Bank Account' : 'Add New Bank Account'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 cursor-pointer">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank_name" className="font-normal text-slate-500">
                Bank Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bank_name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="e.g. State Bank Of India"
                required
                className="font-normal text-slate-800 bg-white border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_holder" className="font-normal text-slate-500">
                Account Holder Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="account_holder"
                name="account_holder"
                value={formData.account_holder}
                onChange={handleChange}
                placeholder="Name As In Bank Records"
                required
                className="font-normal text-slate-800 bg-white border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number" className="font-normal text-slate-500">
                Account Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="account_number"
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                placeholder="Account Number"
                required
                className="font-normal text-slate-800 bg-white border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ifsc" className="font-normal text-slate-500">
                IFSC Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="ifsc"
                name="ifsc"
                value={formData.ifsc}
                onChange={handleChange}
                placeholder="SBIN0001234"
                maxLength={11}
                required
                className="font-normal text-slate-800 bg-white border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_type" className="font-normal text-slate-500">Account Type</Label>
              <Select
                value={formData.account_type}
                onValueChange={(val) => setFormData(prev => ({ ...prev, account_type: val }))}
              >
                <SelectTrigger id="account_type" className="font-normal text-slate-800 bg-white border-slate-200">
                  <SelectValue placeholder="Select Account Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Current">Current Account</SelectItem>
                  <SelectItem value="Savings">Savings Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Connect to Companies Checklist */}
          <div className="space-y-3 pt-4">
            <div>
              <h3 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Link With Companies</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">
                Select one or multiple companies. When you import these companies in the Quotation Generator, these bank details will automatically be attached.
              </p>
            </div>
            {companies.length === 0 ? (
              <div className="p-4 border border-dashed rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-center text-xs text-zinc-500 dark:text-zinc-400">
                No companies saved yet. Create a company in the &quot;Manage Addresses&quot; tab first.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-1">
                {companies.map((company) => {
                  const isChecked = selectedCompanyIds.includes(company.id!);
                  return (
                    <div
                      key={company.id}
                      onClick={() => handleCompanyToggle(company.id!)}
                      className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-all select-none ${
                        isChecked
                          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50/50 dark:bg-zinc-900/40 shadow-xs'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50/30 bg-white dark:bg-zinc-950'
                      }`}
                    >
                      {/* Custom Monochromatic Checkbox Circle */}
                      <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                        isChecked
                          ? 'bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100'
                          : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950'
                      }`}>
                        {isChecked && <Check className="h-2.5 w-2.5 text-white dark:text-zinc-900 stroke-[3px]" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 truncate">
                          <Building className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
                          {company.name}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{company.email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-900 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-md h-9 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-medium rounded-md h-9 px-4 shadow-sm transition-colors cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white dark:border-zinc-950 border-t-transparent" />
                  <span>Saving...</span>
                </div>
              ) : (
                <span>{bank ? 'Update Account' : 'Add Account'}</span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
