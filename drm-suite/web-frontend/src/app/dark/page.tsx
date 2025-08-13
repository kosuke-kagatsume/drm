'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DarkHomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dark dashboard
    router.push('/dark/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-500 mx-auto"></div>
        <p className="mt-4 text-zinc-500 text-xs tracking-wider">LOADING...</p>
      </div>
    </div>
  );
}
