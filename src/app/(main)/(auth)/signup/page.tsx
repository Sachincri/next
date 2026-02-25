import { Metadata } from 'next';
import SignUp from '@/components/auth/SignUp';

export const metadata: Metadata = {
  title: 'Sign Up | E-Commerce Store',
  description: 'Create a new account',
};

import { Suspense } from 'react';

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUp />
    </Suspense>
  );
}
