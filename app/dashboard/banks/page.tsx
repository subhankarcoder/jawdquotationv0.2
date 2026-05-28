'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BankDetailsDB, BilledFromAddress } from '@/types';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import BankForm from '@/components/banks/BankForm';
import BankCard from '@/components/banks/BankCard';

export default function BanksPage() {
  const [banks, setBanks] = useState<BankDetailsDB[]>([]);
  const [companies, setCompanies] = useState<BilledFromAddress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingBank, setEditingBank] = useState<BankDetailsDB | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Fetch bank accounts
      const { data: bankData, error: bankError } = await supabase
        .from('bank_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (bankError) throw bankError;

      // Fetch all companies to map linked relationships
      const { data: companyData, error: companyError } = await supabase
        .from('billed_from_addresses')
        .select('*');

      if (companyError) throw companyError;

      setBanks((bankData as BankDetailsDB[]) || []);
      setCompanies((companyData as BilledFromAddress[]) || []);
    } catch (error: unknown) {
      toast.error('Failed to fetch bank accounts');
      console.error('Fetch error:', error instanceof Error ? error.message : error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    const confirmed = confirm('Are you sure you want to delete this bank account? All linked companies will lose their bank link.');
    if (!confirmed) return;

    try {
      // 1. Unlink in billed_from_addresses
      const { error: unlinkError } = await supabase
        .from('billed_from_addresses')
        .update({ bank_details_id: null })
        .eq('bank_details_id', id);

      if (unlinkError) throw unlinkError;

      // 2. Delete from bank_details
      const { error: deleteError } = await supabase
        .from('bank_details')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      toast.success('Bank account deleted successfully');
      await fetchData();
    } catch (error: unknown) {
      toast.error('Failed to delete bank account');
      console.error('Delete error:', error instanceof Error ? error.message : error);
    }
  };

  const handleEdit = (bank: BankDetailsDB): void => {
    setEditingBank(bank);
    setShowForm(true);
  };

  const handleFormClose = (): void => {
    setShowForm(false);
    setEditingBank(null);
    fetchData();
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Bank Details</h1>
          <p className="text-gray-600 mt-1">
            Store and manage bank accounts to connect them with your company profiles
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Bank Account
        </Button>
      </div>

      {showForm && (
        <BankForm
          bank={editingBank}
          onClose={handleFormClose}
          onSuccess={handleFormClose}
        />
      )}

      {banks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No bank accounts yet
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Add your first bank details to link with your company profiles
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banks.map((bank) => {
            // Find names of companies linked to this bank
            const linkedCompanyNames = companies
              .filter((c) => c.bank_details_id === bank.id)
              .map((c) => c.name);

            return (
              <BankCard
                key={bank.id}
                bank={bank}
                linkedCompanies={linkedCompanyNames}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
