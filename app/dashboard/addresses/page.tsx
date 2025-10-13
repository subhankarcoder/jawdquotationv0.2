'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BilledFromAddress } from '@/types';
import { Button } from '@/components/ui/button';
import { FaMapMarkerAlt } from "react-icons/fa";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import AddressForm from '@/components/addresses/AddressForm';
import AddressCard from '@/components/addresses/AddressCard';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<BilledFromAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<BilledFromAddress | null>(null);
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
    } catch (error: any) {
      toast.error('Failed to fetch addresses');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('billed_from_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (error: any) {
      toast.error('Failed to delete address');
      console.error('Delete error:', error);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const { error } = await supabase
        .from('billed_from_addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast.success('Default address updated');
      fetchAddresses();
    } catch (error: any) {
      toast.error('Failed to set default address');
      console.error('Set default error:', error);
    }
  };

  const handleEdit = (address: BilledFromAddress) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleFormClose = () => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Addresses</h1>
          <p className="text-gray-600 mt-1">
            Store and manage your billing addresses for quick quotation creation
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Address
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
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FaMapMarkerAlt className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No addresses yet
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Add your first billing address to get started
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
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
