'use client';

import { motion, type MotionProps } from 'framer-motion';
import { type ReactNode } from 'react';

type Props = MotionProps & {
  children: ReactNode;
  className?: string;
};

export function MotionDiv({ children, ...props }: Props) {
  return <motion.div {...props}>{children}</motion.div>;
}
