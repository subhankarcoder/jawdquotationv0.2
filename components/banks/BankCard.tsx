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
    <Card className="relative overflow-hidden group hover:shadow-md transition-all border border-gray-200">
      {/* Decorative colored strip on top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-950">{bank.bank_name}</h3>
                <span className="inline-block mt-1 bg-blue-100/60 text-blue-700 font-medium px-2 py-0.5 rounded text-xs">
                  {bank.account_type} Account
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-700 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
            <div className="flex justify-between">
              <span className="text-gray-500">Account Holder:</span>
              <span className="font-medium text-gray-900">{bank.account_holder}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Account Number:</span>
              <span className="font-mono font-medium text-gray-900">{bank.account_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">IFSC Code:</span>
              <span className="font-mono font-medium text-gray-900">{bank.ifsc}</span>
            </div>
          </div>

          {/* Linked Companies Section */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
              Connected Companies ({linkedCompanies.length})
            </span>
            {linkedCompanies.length === 0 ? (
              <span className="text-xs text-gray-400 italic block">Not connected to any companies</span>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {linkedCompanies.map((name, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded border border-gray-200"
                  >
                    <Building className="h-3 w-3 text-gray-500" />
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(bank)}
              className="flex-1 hover:bg-gray-50"
            >
              <Edit2 className="h-4 w-4 mr-1.5" />
              Edit Account
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(bank.id!)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 px-3"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
