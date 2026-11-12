import { redirect } from 'next/navigation';

export default function OrderPage() {
  redirect('/me?tab=orders');
}
