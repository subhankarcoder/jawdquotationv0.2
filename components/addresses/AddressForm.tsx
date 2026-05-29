'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BilledFromAddress, BankDetailsDB } from '@/types';
import LogoUpload from '@/components/shared/LogoUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Building, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddressFormProps {
  address?: BilledFromAddress | null;
  onClose: () => void;
  onSuccess: () => void;
}

type FormAddressData = Omit<BilledFromAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export default function AddressForm({ address, onClose, onSuccess }: AddressFormProps) {
  const [formData, setFormData] = useState<FormAddressData>({
    name: '',
    address: '',
    gstin: '',
    pan: '',
    email: '',
    phone: '',
    logo: '',
    is_default: false,
    bank_details_id: null,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bankAccounts, setBankAccounts] = useState<BankDetailsDB[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const { data, error } = await supabase
          .from('bank_details')
          .select('*')
          .order('bank_name', { ascending: true });
        if (!error && data) {
          setBankAccounts(data as BankDetailsDB[]);
        }
      } catch (err) {
        console.error('Failed to fetch bank accounts:', err);
      }
    };
    void fetchBanks();
  }, [supabase]);

  useEffect(() => {
    if (address) {
      setFormData({
        name: address.name,
        address: address.address,
        gstin: address.gstin,
        pan: address.pan,
        email: address.email,
        phone: address.phone,
        logo: address.logo || '',
        is_default: address.is_default || false,
        bank_details_id: address.bank_details_id || null,
      });
    }
  }, [address]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.address || !formData.email || !formData.phone) {
      toast.error('Please Fill In All Required Fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please Enter A Valid Email Address');
      return;
    }

    // Phone validation
    if (formData.phone.length < 10) {
      toast.error('Please Enter A Valid Phone Number');
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

      const payload = {
        ...formData,
        bank_details_id: formData.bank_details_id || null,
      };

      if (address?.id) {
        // Update existing address
        const { error: updateError } = await supabase
          .from('billed_from_addresses')
          .update(payload)
          .eq('id', address.id);

        if (updateError) throw updateError;

        toast.success('Address Updated Successfully');
      } else {
        // Create new address
        const { error: insertError } = await supabase
          .from('billed_from_addresses')
          .insert([{ ...payload, user_id: user.id }]);

        if (insertError) throw insertError;

        toast.success('Address Added Successfully');
      }

      onSuccess();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed To Save Address';
      toast.error(message);
      console.error('save error:', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
      <CardHeader className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-900 flex flex-row items-center justify-between">
        <CardTitle className="font-semibold text-zinc-900 dark:text-zinc-50 text-base">{address ? 'Edit Address' : 'Add New Address'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 cursor-pointer">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-6 pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-normal text-slate-500">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Company Name"
                required
                className="font-normal text-slate-800 bg-white border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-normal text-slate-500">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="company@example.com"
                required
                className="font-normal text-slate-800 bg-white border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="font-normal text-slate-500">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 1234567890"
                required
                className="font-normal text-slate-800 bg-white border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstin" className="font-normal text-slate-500">GSTIN</Label>
              <Input
                id="gstin"
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
                className="font-normal text-slate-800 bg-white border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pan" className="font-normal text-slate-500">PAN</Label>
              <Input
                id="pan"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                placeholder="AAAAA0000A"
                maxLength={10}
                className="font-normal text-slate-800 bg-white border-slate-200"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <LogoUpload
                value={formData.logo || ''}
                onChange={(url) => setFormData((prev) => ({ ...prev, logo: url }))}
                label="Company Logo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_details_id" className="font-normal text-slate-500">Linked Bank Account</Label>
              <Select
                value={formData.bank_details_id || 'none'}
                onValueChange={(val) => setFormData(prev => ({ ...prev, bank_details_id: val === 'none' ? null : val }))}
              >
                <SelectTrigger id="bank_details_id" className="font-normal text-slate-800 bg-white border-slate-200">
                  <SelectValue placeholder="None (Do Not Link Any Bank Details)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Do Not Link Any Bank Details)</SelectItem>
                  {bankAccounts.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.bank_name} - {bank.account_number} ({bank.account_holder})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="font-normal text-slate-500">
              Address <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Business Rd, Business City, State - 123456"
              rows={3}
              required
              className="font-normal text-slate-800 bg-white border-slate-200"
            />
          </div>

          <div className="flex items-center gap-3 select-none cursor-pointer pt-2" onClick={() => setFormData(prev => ({ ...prev, is_default: !prev.is_default }))}>
            {/* Custom Monochromatic Checkbox Circle */}
            <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
              formData.is_default
                ? 'bg-zinc-900 border-zinc-900 dark:bg-zinc-100 dark:border-zinc-100'
                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950'
            }`}>
              {formData.is_default && <Check className="h-2.5 w-2.5 text-white dark:text-zinc-900 stroke-[3px]" />}
            </div>
            <Label htmlFor="is_default" className="font-normal cursor-pointer text-zinc-550 dark:text-zinc-400 text-xs select-none">
              Set As Default Address
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t border-zinc-100 dark:border-zinc-900 mt-6">
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
                <span>{address ? 'Update Address' : 'Add Address'}</span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
