'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BilledFromAddress } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddressFormProps {
  address?: BilledFromAddress | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddressForm({ address, onClose, onSuccess }: AddressFormProps) {
  const [formData, setFormData] = useState<Omit<BilledFromAddress, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    name: '',
    address: '',
    gstin: '',
    pan: '',
    email: '',
    phone: '',
    logo: '',
    is_default: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (address) {
      setFormData({
        name: address.name,
        address: address.address,
        gstin: address.gstin,
        pan: address.pan,
        email: address.email,
        phone: address.phone,
        logo: address.logo || '',
        is_default: address.is_default || false,
      });
    }
  }, [address]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.address || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Phone validation (basic)
    if (formData.phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      setIsSubmitting(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      if (address?.id) {
        // Update existing address
        const { error } = await supabase
          .from('billed_from_addresses')
          .update(formData)
          .eq('id', address.id);

        if (error) throw error;
        toast.success('Address updated successfully');
      } else {
        // Create new address
        const { error } = await supabase
          .from('billed_from_addresses')
          .insert([{ ...formData, user_id: user.id }]);

        if (error) throw error;
        toast.success('Address added successfully');
      }

      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save address');
      console.error('Save error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{address ? 'Edit Address' : 'Add New Address'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Company Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Company Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="company@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 1234567890"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input
                id="gstin"
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                placeholder="22AAAAA0000A1Z5"
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pan">PAN</Label>
              <Input
                id="pan"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                placeholder="AAAAA0000A"
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL</Label>
              <Input
                id="logo"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Address <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Business Rd, Business City, State - 123456"
              rows={3}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_default"
              name="is_default"
              checked={formData.is_default}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="is_default" className="font-normal cursor-pointer">
              Set as default address
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </div>
              ) : (
                <span>{address ? 'Update Address' : 'Add Address'}</span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
