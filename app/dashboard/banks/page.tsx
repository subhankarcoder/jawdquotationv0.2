'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BankDetailsDB, BilledFromAddress } from '@/types';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import BankForm from '@/components/banks/BankForm';
import BankCard from '@/components/banks/BankCard';
import { useHelpTour } from '@/lib/hooks/useHelpTour';
import { DriveStep } from 'driver.js';

export default function BanksPage() {
  const [banks, setBanks] = useState<BankDetailsDB[]>([]);
  const [companies, setCompanies] = useState<BilledFromAddress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingBank, setEditingBank] = useState<BankDetailsDB | null>(null);
  const supabase = createClient();

  const getSteps = useCallback((): DriveStep[] => [
    {
      popover: {
        title: 'Receiving Bank Accounts',
        description: 'Connect and store your credentials to receive payments. When drafting quotations, these accounts can be dynamically embedded with one click.',
      }
    },
    {
      element: document.getElementById('add-bank-btn') ? '#add-bank-btn' : '#add-bank-fallback-btn',
      popover: {
        title: 'Add Bank Credentials',
        description: 'Click here to save receiving bank parameters. Specify details like bank name, holder name, account type (e.g. Current/Savings), account number, and IFSC.',
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '.bank-card-item',
      popover: {
        title: 'Bank Credentials Card',
        description: 'Displays saved credentials and any active company profiles linked to this bank. A linked bank profile will appear on that company\'s final quotations automatically!',
        side: 'top',
        align: 'center'
      }
    }
  ], []);

  useHelpTour(getSteps);

  const fetchData = useCallback(async (): Promise<void> => {
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
      toast.error('Failed To Fetch Bank Accounts');
      console.error('Fetch error:', error instanceof Error ? error.message : error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

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

      toast.success('Bank Account Deleted Successfully');
      await fetchData();
    } catch (error: unknown) {
      toast.error('Failed To Delete Bank Account');
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
      <div className="flex flex-col sm:flex-row justify-between sm:items-end pb-6 border-b border-zinc-200 dark:border-zinc-800 gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 leading-none">Bank Accounts</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            Store and manage bank credentials to connect them directly with your billing identities.
          </p>
        </div>
        <Button 
          id="add-bank-btn"
          onClick={() => setShowForm(true)} 
          className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-medium rounded-md h-9 px-4 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
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
        <Card className="border-border/60 shadow-xs">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <CreditCard className="h-5 w-5 text-muted-foreground/60" />
            </div>
            <h3 className="text-sm font-normal text-foreground mb-1">
              No Bank Accounts Yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mb-5 leading-normal">
              Add Your First Receiving Bank Credentials. Connecting Accounts To Your Company Profile Automatically Displays Them On The Finalized Invoice.
            </p>
            <Button 
              id="add-bank-fallback-btn"
              onClick={() => setShowForm(true)}
              className="bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-normal rounded-lg h-9 px-4"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
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
