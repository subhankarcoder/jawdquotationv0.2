/* eslint-disable @next/next/no-img-element */
'use client';

import { BilledFromAddress } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Star } from 'lucide-react';

interface AddressCardProps {
  address: BilledFromAddress;
  onEdit: (address: BilledFromAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  return (
    <Card 
      className={`address-card-item relative overflow-hidden transition-all duration-200 bg-white dark:bg-zinc-950 border rounded-md hover:shadow-xs group ${
        address.is_default 
          ? 'border-zinc-900 dark:border-zinc-100 ring-0.5 ring-zinc-900 dark:ring-zinc-100' 
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      {address.is_default && (
        <div className="absolute top-3.5 right-3.5">
          <span className="font-mono text-[9px] font-semibold uppercase tracking-wider bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 px-2 py-0.5 rounded">
            Default
          </span>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="space-y-3.5">
          {address.logo && (
            <div className="h-9 w-auto flex items-center justify-start filter dark:brightness-95">
              <img
                src={address.logo}
                alt={address.name}
                className="max-h-full max-w-[110px] object-contain"
              />
            </div>
          )}
          
          <div className="space-y-1">
            <h3 className="font-medium text-[13px] text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
              {address.name}
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal whitespace-pre-line font-mono tracking-tight">
              {address.address}
            </p>
          </div>

          <div className="space-y-1.5 text-xs border-t border-zinc-100 dark:border-zinc-900 pt-3">
            {address.email && (
              <div className="flex items-center justify-between py-0.5">
                <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">email</span>
                <span className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200 select-all font-medium">{address.email}</span>
              </div>
            )}
            {address.phone && (
              <div className="flex items-center justify-between py-0.5">
                <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">phone</span>
                <span className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200 select-all font-medium">{address.phone}</span>
              </div>
            )}
            {address.gstin && (
              <div className="flex items-center justify-between py-0.5">
                <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">gstin</span>
                <span className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200 select-all font-medium">{address.gstin}</span>
              </div>
            )}
            {address.pan && (
              <div className="flex items-center justify-between py-0.5">
                <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">pan</span>
                <span className="font-mono text-[11px] text-zinc-800 dark:text-zinc-200 select-all font-medium">{address.pan}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            {!address.is_default && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetDefault(address.id!)}
                className="flex-1 text-[11px] rounded-md h-7.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-mono font-medium cursor-pointer"
              >
                <Star className="h-3 w-3 mr-1.5 fill-none stroke-[2]" />
                Set Default
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(address)}
              className={`text-[11px] rounded-md h-7.5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-mono font-medium cursor-pointer ${
                address.is_default ? 'flex-1' : ''
              }`}
            >
              <Edit2 className="h-3 w-3 mr-1" />
              {address.is_default && <span className="ml-0.5">Edit Details</span>}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(address.id!)}
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
