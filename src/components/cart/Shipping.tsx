'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addShippingInfo } from '@/redux/reducer/cartReducer';
import { CheckoutSteps } from './CheckoutSteps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const shippingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City name must be at least 2 characters'),
  state: z.string().min(1, 'Please select a state'),
  country: z.string().min(1, 'Please select a country'),
  pinCode: z.string().regex(/^\d{4,10}$/, 'PIN code must be 4-10 digits'),
  phoneNo: z.string().regex(/^\d{10,15}$/, 'Phone number must be 10-15 digits'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

export function Shipping() {
  const { shippingInfo } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const form = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      pinCode: '',
      phoneNo: '',
    },
  });

  const onSubmit = async (data: ShippingFormData) => {
    const shippingData = {
      ...data,
      pinCode: parseInt(data.pinCode),
      phoneNo: parseInt(data.phoneNo),
    };
    dispatch(addShippingInfo(shippingData as any));
    router.push('/order-summary');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-all duration-300">
      <CheckoutSteps activeStep={0} />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Shipping Details</CardTitle>
                <CardDescription>Provide delivery address for this order</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Full Name *</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email Address *</FormLabel><FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="address" render={({ field }) => (
                      <FormItem><FormLabel>Street Address *</FormLabel><FormControl><Input placeholder="123 Street, Area" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem><FormLabel>City *</FormLabel><FormControl><Input placeholder="City" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem><FormLabel>State *</FormLabel><FormControl><Input placeholder="State" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="pinCode" render={({ field }) => (
                        <FormItem><FormLabel>Pincode *</FormLabel><FormControl><Input placeholder="400001" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="country" render={({ field }) => (
                        <FormItem><FormLabel>Country *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="phoneNo" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number *</FormLabel><FormControl><Input placeholder="10-digit mobile" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-[#0d0e26] dark:bg-slate-100 dark:text-gray-900 cursor-pointer h-11 font-bold transition-all hover:opacity-90">Continue to Summary</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Alert className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <Shield className="h-4 w-4 dark:text-blue-400" />
              <AlertDescription className="text-xs text-slate-600 dark:text-slate-400">Your address details are secure.</AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}
