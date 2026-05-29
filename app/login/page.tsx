'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FaGoogle } from 'react-icons/fa';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const supabase = createClient();

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      // Optional: redirect manually if needed
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      toast.error('Failed To Sign In With Google');
      console.error('Login error:', error instanceof Error ? error.message : error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md border-slate-100/80 shadow-xs overflow-hidden">
        <CardHeader className="space-y-1.5 text-center bg-white p-6">
          <CardTitle className="text-2xl font-normal tracking-normal text-slate-800">Quotation Generator</CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-1">
            Sign In To Create And Manage Your Quotations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 bg-white p-6 pt-0">
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full h-11 text-xs font-normal border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                <span>Signing In...</span>
              </div>
            ) : (
              <>
                <FaGoogle className="mr-2 h-4 w-4" />
                Continue With Google
              </>
            )}
          </Button>

          <p className="text-center text-[10px] text-slate-400 leading-normal">
            By Continuing, You Agree To Our Terms Of Service And Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
