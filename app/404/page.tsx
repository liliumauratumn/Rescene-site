import type { Metadata } from 'next';
import NotFoundContent from '@/components/NotFoundContent';

export const metadata: Metadata = {
  title: 'ページが見つかりません',
  robots: { index: false, follow: true },
};

export default function NotFoundRoutePage() {
  return <NotFoundContent />;
}
