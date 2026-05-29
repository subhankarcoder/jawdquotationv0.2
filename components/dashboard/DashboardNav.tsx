"use client";

import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  CreditCard, 
  Layers, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

interface DashboardNavProps {
  user: User;
  children: React.ReactNode;
}

export default function DashboardNav({ user, children }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(true); // default collapsed for mobile/compact, will load from localStorage
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      // If there is no saved setting, default to true (collapsed)
      setIsCollapsed(saved !== 'false');
    }
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast.success('Signed Out Successfully');
      router.push('/login');
      router.refresh();
    } catch (error: unknown) {
      toast.error('Failed To Sign Out');
    }
  };

  const sidebarMenu = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, isActive: false },
    { href: '/dashboard', label: 'Quotations', icon: FileText, isActive: pathname === '/dashboard' },
    { href: '/dashboard/addresses', label: 'Clients', icon: Users, isActive: pathname === '/dashboard/addresses' },
    { href: '#', label: 'Products / Services', icon: Package, isActive: false },
    { href: '/dashboard/banks', label: 'Bank Accounts', icon: CreditCard, isActive: pathname === '/dashboard/banks' },
    { href: '#', label: 'Templates', icon: Layers, isActive: false },
    { href: '#', label: 'Settings', icon: Settings, isActive: false },
  ];

  // Get initials for profile avatar
  const getInitials = (emailStr?: string): string => {
    if (!emailStr) return 'AC';
    const parts = emailStr.split('@')[0].split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return emailStr.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(user.email);
  const displayName = user.email ? user.email.split('@')[0].replace(/[._-]/g, ' ') : 'Aman Chauhan';

  if (!mounted) {
    // Avoid layout flash before localstorage hydrates
    return (
      <div className="h-screen w-full flex flex-row overflow-hidden bg-neutral-50 text-neutral-900 font-sans antialiased">
        <div className="w-64 border-r border-neutral-200 bg-white" />
        <main className="flex-1 bg-neutral-50/40 p-10" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-row overflow-hidden bg-neutral-50 text-neutral-900 font-sans antialiased">
      {/* Left Sidebar */}
      <aside 
        className={`border-r border-neutral-200 bg-white flex flex-col justify-between shrink-0 h-full select-none transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16 p-3.5' : 'w-64 p-5'
        }`}
      >
        <div className="space-y-8">
          {/* Logo / Brand Header */}
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="flex h-6 w-6 items-center justify-center bg-black rounded-xs shrink-0">
              <svg className="h-4.5 w-4.5 fill-white text-white" viewBox="0 0 24 24">
                <path d="M12 2L2 22h20L12 2z" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-none">
                <span className="text-sm font-bold tracking-widest font-mono text-black">QUOTIFY</span>
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold mt-1">Quotation Generator</span>
              </div>
            )}
          </div>

          {/* Sidebar Menu Links */}
          <nav className="flex flex-col gap-1">
            {sidebarMenu.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  href={item.href}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center rounded-md text-xs transition-all font-mono border ${
                    isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'
                  } ${
                    item.isActive
                      ? 'text-neutral-900 bg-neutral-100 font-medium border-neutral-200/50'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 border-transparent font-normal'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${item.isActive ? 'text-neutral-900' : 'text-neutral-400'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile, Help, and Toggle */}
        <div className="space-y-4 pt-4 border-t border-neutral-150">
          {/* Help link */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('trigger-help-tour'));
              }
            }}
            title={isCollapsed ? 'Help Guide' : undefined}
            className={`flex items-center rounded-md text-xs text-neutral-500 hover:text-neutral-900 transition-all font-mono font-normal w-full text-left cursor-pointer hover:bg-neutral-50 border border-transparent ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
            }`}
          >
            <HelpCircle className="h-4 w-4 text-neutral-400 shrink-0" />
            {!isCollapsed && <span>Help Guide</span>}
          </button>

          {/* Sidebar collapse button */}
          <button
            onClick={toggleSidebar}
            className={`flex items-center rounded-md text-xs text-neutral-550 hover:text-neutral-900 transition-all font-mono font-normal w-full cursor-pointer hover:bg-neutral-50 border border-transparent ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-neutral-400 shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 text-neutral-400 shrink-0" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>

          {/* User Profile Card */}
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-3.5 pt-2">
              <div 
                className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center font-mono text-xs font-semibold shrink-0 cursor-pointer" 
                title={`${displayName} (${user.email})`}
              >
                {initials}
              </div>
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="text-neutral-400 hover:text-red-500 p-2 rounded-md hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-2 py-1.5 border border-neutral-100 bg-neutral-50/50 rounded-lg">
              {/* Avatar Circle */}
              <div className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center font-mono text-xs font-semibold shrink-0">
                {initials}
              </div>
              {/* Name & Email details */}
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-xs font-semibold text-neutral-800 truncate capitalize">{displayName}</span>
                <span className="text-[9px] font-mono text-neutral-400 truncate">{user.email || 'aman@company.com'}</span>
              </div>
              {/* Sign out button */}
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="ml-auto text-neutral-400 hover:text-red-500 p-1.5 rounded transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-y-auto bg-neutral-50/40 p-10 h-full">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
