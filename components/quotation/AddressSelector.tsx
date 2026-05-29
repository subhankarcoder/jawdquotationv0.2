'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BilledFromAddress, CompanyDetails, BankDetails } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddressSelectorProps {
  onSelect: (address: CompanyDetails, bankDetails?: BankDetails | null) => void;
  onClose: () => void;
}

export default function AddressSelector({ onSelect, onClose }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<BilledFromAddress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const supabase = createClient();

  const fetchAddresses = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('billed_from_addresses')
        .select('*, bank_details:bank_details_id(*)')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      const addressData = (data ?? []) as BilledFromAddress[];
      setAddresses(addressData);

      // Auto-select default address if available
      const defaultAddress = addressData.find((addr) => addr.is_default);
      if (defaultAddress) {
        setSelectedId(defaultAddress.id!);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch addresses';
      toast.error('Failed to fetch addresses');
      console.error('Fetch error:', message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void fetchAddresses();
  }, [fetchAddresses]);

  const handleImport = (): void => {
    const selected = addresses.find((addr) => addr.id === selectedId);
    if (!selected) {
      toast.error('Please select an address');
      return;
    }

    const companyDetails: CompanyDetails = {
      name: selected.name,
      address: selected.address,
      gstin: selected.gstin,
      pan: selected.pan,
      email: selected.email,
      phone: selected.phone,
      logo: selected.logo || '',
    };

    const bankDetails: BankDetails | null = selected.bank_details ? {
      bankName: selected.bank_details.bank_name,
      accountHolder: selected.bank_details.account_holder,
      accountNumber: selected.bank_details.account_number,
      ifsc: selected.bank_details.ifsc,
      accountType: selected.bank_details.account_type,
    } : null;

    onSelect(companyDetails, bankDetails);
    toast.success('Address and bank details imported successfully');
    onClose();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No saved addresses
          </h3>
          <p className="text-gray-600 mb-4">
            Add addresses in the Manage Addresses page to import them here
          </p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 shadow-xs max-w-xl mx-auto">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-foreground">Select Saved Address</h3>
          <span className="text-xs text-muted-foreground">{addresses.length} addresses found</span>
        </div>
        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 mb-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              onClick={() => setSelectedId(address.id!)}
              className={`p-3.5 border rounded-lg cursor-pointer transition-all ${
                selectedId === address.id
                  ? 'border-primary bg-primary/[0.03] shadow-xs'
                  : 'border-border/80 hover:border-border hover:bg-muted/30'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-sm text-foreground truncate">{address.name}</h4>
                    {address.is_default && (
                      <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{address.address}</p>
                  {address.email && <p className="text-[11px] text-muted-foreground/80 mt-1 font-mono truncate">{address.email}</p>}
                </div>
                <div className="flex items-center justify-center h-5 w-5 rounded-full border border-border flex-shrink-0">
                  {selectedId === address.id && (
                    <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2.5 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-lg text-xs h-9 border-border/80 hover:bg-muted">
            Cancel
          </Button>
          <Button onClick={handleImport} className="flex-1 rounded-lg text-xs h-9 bg-primary text-primary-foreground hover:bg-primary/95">
            Import Selected Address
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
