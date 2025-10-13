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
    <Card className={`relative ${address.is_default ? 'ring-2 ring-blue-500' : ''}`}>
      {address.is_default && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            <Star className="h-3 w-3 fill-current" />
            Default
          </div>
        </div>
      )}
      
      <CardContent className="pt-6">
        <div className="space-y-3">
          {address.logo && (
            <img
              src={address.logo}
              alt={address.name}
              className="h-12 w-auto object-contain mb-2"
            />
          )}
          
          <div>
            <h3 className="font-semibold text-lg text-gray-900">{address.name}</h3>
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
              {address.address}
            </p>
          </div>

          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> {address.email}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Phone:</span> {address.phone}
            </p>
            {address.gstin && (
              <p className="text-gray-600">
                <span className="font-medium">GSTIN:</span> {address.gstin}
              </p>
            )}
            {address.pan && (
              <p className="text-gray-600">
                <span className="font-medium">PAN:</span> {address.pan}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-3 border-t">
            {!address.is_default && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSetDefault(address.id!)}
                className="flex-1"
              >
                <Star className="h-4 w-4 mr-1" />
                Set Default
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(address)}
              className={address.is_default ? 'flex-1' : ''}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(address.id!)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
