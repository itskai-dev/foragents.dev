import { Suspense } from 'react';
import { SubscribeSuccessClient } from './SubscribeSuccessClient';

export default function SubscribeSuccessPage() {
  return (
    <Suspense>
      <SubscribeSuccessClient />
    </Suspense>
  );
}
