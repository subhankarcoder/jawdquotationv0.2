'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BankDetailsDB, BilledFromAddress } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Building } from 'lucide-react';
import toast from 'react-hot-toast';

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
      toast.error('Please fill in all required fields');
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
        toast.error('You must be logged in');
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
        toast.success('Bank account updated successfully');
      } else {
        // Create new bank
        const { data: newBank, error: insertError } = await supabase
          .from('bank_details')
          .insert([{ ...formData, user_id: user.id }])
          .select()
          .single();

        if (insertError) throw insertError;
        bankId = newBank.id;
        toast.success('Bank account added successfully');
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
        error instanceof Error ? error.message : 'Failed to save bank details';
      toast.error(message);
      console.error('Save error:', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{bank ? 'Edit Bank Account' : 'Add New Bank Account'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bank_name">
                Bank Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bank_name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="e.g. State Bank of India"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_holder">
                Account Holder Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="account_holder"
                name="account_holder"
                value={formData.account_holder}
                onChange={handleChange}
                placeholder="Name as in bank records"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">
                Account Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="account_number"
                name="account_number"
                value={formData.account_number}
                onChange={handleChange}
                placeholder="Account Number"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ifsc">
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_type">Account Type</Label>
              <select
                id="account_type"
                name="account_type"
                value={formData.account_type}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="Current">Current</option>
                <option value="Savings">Savings</option>
              </select>
            </div>
          </div>

          {/* Connect to Companies Checklist */}
          <div className="space-y-3 pt-2">
            <Label className="text-base font-semibold text-gray-800">Link with Companies</Label>
            <p className="text-xs text-gray-500">
              Select one or multiple companies. When you import these companies in the quotation generator, this bank details will automatically be attached.
            </p>
            {companies.length === 0 ? (
              <div className="p-4 border border-dashed rounded-lg bg-gray-50 text-center text-sm text-gray-500">
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
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50/50 ${
                        isChecked
                          ? 'border-blue-500 bg-blue-50/40'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-gray-400" />
                          {company.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{company.email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
