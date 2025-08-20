'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import MasterDataInitializer from './MasterDataInitializer';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MasterDataInitializer />
      {children}
    </AuthProvider>
  );
}
