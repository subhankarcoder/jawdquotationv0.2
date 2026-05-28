'use client';

import { useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface LogoUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function LogoUpload({ value, onChange, label = 'Company Logo' }: LogoUploadProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>(value && !value.includes('supabase.co') ? 'url' : 'upload');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    // Validate image format
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, SVG, etc.)');
      return;
    }

    try {
      setIsUploading(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast.error('You must be logged in to upload files');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;

      // Upload file to the 'logos' bucket
      const { data, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        // If error is because the bucket doesn't exist, we explain it clearly
        if (uploadError.message.includes('bucket not found') || uploadError.message.includes('does not exist')) {
          throw new Error('Supabase Storage bucket "logos" has not been created yet. Please check the database migration guide or use the URL option in the meantime.');
        }
        throw uploadError;
      }

      // Retrieve public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success('Logo uploaded successfully');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Upload failed';
      toast.error(msg);
      console.error('Storage upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
        
        {/* Toggle between upload and URL mode */}
        <div className="flex rounded-md bg-gray-100 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-sm transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-gray-900 shadow-sm font-semibold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Upload className="h-3 w-3" />
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-sm transition-all ${
              activeTab === 'url'
                ? 'bg-white text-gray-900 shadow-sm font-semibold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <LinkIcon className="h-3 w-3" />
            Paste Link
          </button>
        </div>
      </div>

      {activeTab === 'upload' ? (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {value ? (
            /* Uploaded Preview State */
            <div className="flex items-center gap-4 p-3 border border-dashed rounded-lg bg-gray-50">
              <div className="relative h-16 w-24 bg-white border rounded p-1 flex items-center justify-center overflow-hidden">
                <img
                  src={value}
                  alt="Company Logo Preview"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Uploaded Logo</p>
                <p className="text-xs text-gray-500 truncate">{value.split('/').pop()}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            /* Upload Trigger State */
            <div
              onClick={triggerFileSelect}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50/20 cursor-pointer transition-all group"
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                  <span className="text-sm font-medium text-gray-600">Uploading to Supabase...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-gray-100 rounded-full group-hover:bg-blue-100 transition-colors">
                    <ImageIcon className="h-6 w-6 text-gray-500 group-hover:text-blue-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Click to upload company logo</span>
                  <span className="text-xs text-gray-500">Max size 2MB (PNG, JPG, SVG, WebP)</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Direct Link Paste Mode */
        <div className="space-y-3">
          <Input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full"
          />
          {value && (
            <div className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
              <div className="h-12 w-20 bg-white border rounded p-1 flex items-center justify-center overflow-hidden">
                <img
                  src={value}
                  alt="Company Logo Preview"
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/100x60?text=Invalid+URL';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 truncate">{value}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
