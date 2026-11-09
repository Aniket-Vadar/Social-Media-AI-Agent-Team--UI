'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DocsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return (
    <div className="p-8 flex items-center justify-center min-h-[50vh] text-gray-500 text-sm">
      Redirecting to Settings...
    </div>
  );
}
