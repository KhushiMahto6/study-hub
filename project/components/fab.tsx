'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function FloatingActionButton() {
  const pathname = usePathname();
  if (pathname?.startsWith('/auth') || pathname === '/' || pathname?.startsWith('/admin')) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
      className="fixed bottom-6 right-6 z-40"
    >
      <Button asChild size="icon" className="h-12 w-12 rounded-full shadow-lg shadow-primary/30 hover:scale-110 transition-transform">
        <Link href="/upload" aria-label="Upload resource">
          <Upload className="h-5 w-5" />
        </Link>
      </Button>
    </motion.div>
  );
}
