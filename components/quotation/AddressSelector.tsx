'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BilledFromAddress, CompanyDetails } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddressSelectorProps {
  onSelect: (address: CompanyDetails) => void;
  onClose: () => void;
}

export default function AddressSelector({ onSelect, onClose }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<BilledFromAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('billed_from_addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAddresses(data || []);
      
      // Auto-select default address
      const defaultAddress = data?.find((addr) => addr.is_default);
      if (defaultAddress) {
        setSelectedId(defaultAddress.id!);
      }
    } catch (error: any) {
      toast.error('Failed to fetch addresses');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
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

    onSelect(companyDetails);
    toast.success('Address imported successfully');
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
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Select Address to Import</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              onClick={() => setSelectedId(address.id!)}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedId === address.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{address.name}</h4>
                    {address.is_default && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{address.address}</p>
                  <p className="text-sm text-gray-500 mt-1">{address.email}</p>
                </div>
                {selectedId === address.id && (
                  <Check className="h-5 w-5 text-blue-500 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleImport} className="flex-1">
            Import Selected
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
