'use client';

import { BankDetailsDB } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, CreditCard, Building } from 'lucide-react';

interface BankCardProps {
  bank: BankDetailsDB;
  linkedCompanies: string[];
  onEdit: (bank: BankDetailsDB) => void;
  onDelete: (id: string) => void;
}

export default function BankCard({
  bank,
  linkedCompanies,
  onEdit,
  onDelete,
}: BankCardProps) {
  return (
    <Card 
      className="bank-card-item relative overflow-hidden transition-all duration-200 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs group"
    >
      <CardContent className="p-4">
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-350 rounded">
                <CreditCard className="h-3.5 w-3.5" />
              </div>
              <div>
                <h3 className="font-medium text-[13px] text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
                  {bank.bank_name}
                </h3>
              </div>
            </div>
            <span className="font-mono text-[9px] font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-1.5 py-0.5 rounded">
              {bank.account_type}
            </span>
          </div>
          
          <div className="space-y-1.5 text-xs border-t border-zinc-100 dark:border-zinc-900 pt-3">
            <div className="flex items-center justify-between py-0.5">
              <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">holder</span>
              <span className="font-mono text-[11px] text-zinc-850 dark:text-zinc-200 select-all font-medium">{bank.account_holder}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">account #</span>
              <span className="font-mono text-[11px] text-zinc-850 dark:text-zinc-200 select-all font-medium">{bank.account_number}</span>
            </div>
            <div className="flex items-center justify-between py-0.5">
              <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">ifsc</span>
              <span className="font-mono text-[11px] text-zinc-850 dark:text-zinc-200 select-all font-medium">{bank.ifsc}</span>
            </div>
          </div>

          {/* Linked Companies Section */}
          <div className="space-y-1.5 pt-3 border-t border-zinc-100 dark:border-zinc-900">
            <span className="text-[10px] font-mono font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
              linked profiles ({linkedCompanies.length})
            </span>
            {linkedCompanies.length === 0 ? (
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 italic block font-mono">no active links</span>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                {linkedCompanies.map((name, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-[10px] px-1.5 py-0.5 rounded border border-zinc-200/60 dark:border-zinc-800/80 truncate max-w-full font-mono font-normal"
                  >
                    <Building className="h-2.5 w-2.5 text-zinc-400 dark:text-zinc-500" />
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-900">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(bank)}
              className="flex-1 text-[11px] rounded-md h-7.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-mono font-medium cursor-pointer"
            >
              <Edit2 className="h-3 w-3 mr-1.5" />
              Edit Bank
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(bank.id!)}
              className="text-[11px] rounded-md h-7.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-400 dark:text-zinc-550 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/20 hover:border-red-200 dark:hover:border-red-900/50 transition-colors font-mono font-medium cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
