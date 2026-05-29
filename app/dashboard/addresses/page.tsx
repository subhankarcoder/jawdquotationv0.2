'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BilledFromAddress } from '@/types';
import { Button } from '@/components/ui/button';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import AddressForm from '@/components/addresses/AddressForm';
import AddressCard from '@/components/addresses/AddressCard';
import { useHelpTour } from '@/lib/hooks/useHelpTour';
import { DriveStep } from 'driver.js';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<BilledFromAddress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<BilledFromAddress | null>(null);
  const supabase = createClient();

  const getSteps = useCallback((): DriveStep[] => [
    {
      popover: {
        title: 'Billing Addresses Registry',
        description: 'Welcome to your Billing Identity database. Save and manage your own company profiles or client billing addresses to instantly fill drafts later.',
      }
    },
    {
      element: document.getElementById('add-address-btn') ? '#add-address-btn' : '#add-address-fallback-btn',
      popover: {
        title: 'Create Billing Address',
        description: 'Click here to construct a new verified billing card. You can configure custom logos, official email addresses, contact phones, and GSTIN/PAN info.',
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '.address-card-item',
      popover: {
        title: 'Profile Information Card',
        description: 'This holds the verified details of a saved company or client. You can edit credentials, delete obsolete records, or set one as the preselected Default.',
        side: 'top',
        align: 'center'
      }
    }
  ], []);

  useHelpTour(getSteps);

  const fetchAddresses = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('billed_from_addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAddresses(data as BilledFromAddress[] || []);
    } catch (error: unknown) {
      toast.error('Failed To Fetch Addresses');
      console.error('Fetch error:', error instanceof Error ? error.message : error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void fetchAddresses();
  }, [fetchAddresses]);

  const handleDelete = async (id: string): Promise<void> => {
    const confirmed = confirm('Are you sure you want to delete this address?');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('billed_from_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Address Deleted Successfully');
      await fetchAddresses();
    } catch (error: unknown) {
      toast.error('Failed To Delete Address');
      console.error('Delete error:', error instanceof Error ? error.message : error);
    }
  };

  const handleSetDefault = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('billed_from_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast.success('Default Address Updated');
      await fetchAddresses();
    } catch (error: unknown) {
      toast.error('Failed To Set Default Address');
      console.error('Set default error:', error instanceof Error ? error.message : error);
    }
  };

  const handleEdit = (address: BilledFromAddress): void => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleFormClose = (): void => {
    setShowForm(false);
    setEditingAddress(null);
    fetchAddresses();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 leading-none">Billing Addresses</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Store and manage your verified billing addresses for one-click quotation creation.
          </p>
        </div>
        <Button 
          id="add-address-btn"
          onClick={() => setShowForm(true)} 
          className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-medium rounded-md h-9 px-4 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Billing Address
        </Button>
      </div>

      {showForm && (
        <AddressForm
          address={editingAddress}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}

      {addresses.length === 0 ? (
        <Card className="border-border/60 shadow-xs">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <FaMapMarkerAlt className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <h3 className="text-sm font-normal text-foreground mb-1">
              No Saved Addresses
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-5 leading-normal">
              Add Your First Billing Address. You Can Easily Select It When Drafting Your Quotation To Bypass Typing.
            </p>
            <Button 
              id="add-address-fallback-btn"
              onClick={() => setShowForm(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-normal rounded-lg h-9 px-4"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Create Address Card
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}
    </div>
  );
}
