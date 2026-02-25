import { Metadata } from 'next';
import Login from '@/components/auth/Login';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Login | E-Commerce Store',
  description: 'Sign in to your account',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
}