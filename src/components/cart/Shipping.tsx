'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addShippingInfo } from '@/redux/reducer/cartReducer';
import { useAddAddressMutation, useGetAddressesQuery } from '@/redux/api/addressApi';
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
import { Shield, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { useRecordConsentMutation } from '@/redux/api/privacyApi';
import { useCookieConsent } from '@/components/privacy/CookieConsentContext';

const shippingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City name must be at least 2 characters'),
  state: z.string().min(1, 'Please select a state'),
  country: z.string().min(1, 'Please select a country'),
  pinCode: z.string().regex(/^\d{4,10}$/, 'PIN code must be 4-10 digits'),
  phoneNo: z.string().regex(/^\d{10,15}$/, 'Phone number must be 10-15 digits'),
  privacyNoticeAccepted: z.boolean().refine((val) => val === true, {
    message: 'Please acknowledge the Privacy Notice to process your order',
  }),
  marketingConsent: z.boolean().optional(),
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
      name: user?.name || (shippingInfo as any)?.name || '',
      email: user?.email || shippingInfo?.email || '',
      address: shippingInfo?.address || '',
      city: shippingInfo?.city || '',
      state: shippingInfo?.state || '',
      country: shippingInfo?.country || 'India',
      pinCode: shippingInfo?.pinCode ? String(shippingInfo.pinCode) : '',
      phoneNo: shippingInfo?.phoneNo ? String(shippingInfo.phoneNo) : '',
      privacyNoticeAccepted: false,
      marketingConsent: false,
    },
  });

  const { data: addresses } = useGetAddressesQuery(undefined, { skip: !user });
  const [addAddress] = useAddAddressMutation();
  const [recordConsent] = useRecordConsentMutation();
  const { anonymousId } = useCookieConsent();

  // Prefill form from existing shippingInfo or default address
  useEffect(() => {
    if (shippingInfo && shippingInfo.address && shippingInfo.address.trim().length > 0) {
      form.reset({
        name: (shippingInfo as any)?.name || [shippingInfo.firstName, shippingInfo.lastName].filter(Boolean).join(' ') || user?.name || '',
        email: shippingInfo.email || user?.email || '',
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        country: shippingInfo.country || 'India',
        pinCode: shippingInfo.pinCode ? String(shippingInfo.pinCode) : '',
        phoneNo: shippingInfo.phoneNo ? String(shippingInfo.phoneNo) : '',
        privacyNoticeAccepted: false,
        marketingConsent: false,
      });
    } else if (addresses && addresses.length > 0) {
      const def = addresses.find((a: any) => a.isDefault) || addresses[0];
      form.reset({
        name: def.name || user?.name || '',
        email: user?.email || '',
        address: def.address || '',
        city: def.city || '',
        state: def.state || '',
        country: def.country || 'India',
        pinCode: def.pinCode ? String(def.pinCode) : '',
        phoneNo: def.phoneNo ? String(def.phoneNo) : '',
        privacyNoticeAccepted: false,
        marketingConsent: false,
      });
    }
  }, [addresses, shippingInfo, user, form]);

  const onSubmit = async (data: ShippingFormData) => {
    const { privacyNoticeAccepted, marketingConsent, ...shippingFields } = data;
    const fullName = shippingFields.name.trim();
    const shippingData = {
      ...shippingFields,
      name: fullName,
      firstName: fullName.split(' ')[0] || 'Customer',
      lastName: fullName.split(' ').slice(1).join(' ') || '',
      pinCode: parseInt(shippingFields.pinCode),
      phoneNo: parseInt(shippingFields.phoneNo),
    };

    // Save to user's address book if it's new
    if (user) {
      const addressExists = addresses?.some((addr: any) => 
        addr.address?.toLowerCase().trim() === shippingFields.address.toLowerCase().trim() && 
        Number(addr.pinCode) === Number(shippingFields.pinCode)
      );

      if (!addressExists) {
        try {
          await addAddress({ 
            ...shippingFields, 
            pinCode: Number(shippingFields.pinCode),
            phoneNo: String(shippingFields.phoneNo),
            isDefault: !addresses || addresses.length === 0 
          }).unwrap();
        } catch (error) {
          console.error("Failed to save address to profile:", error);
        }
      }
    }

    // Record explicit DPDP checkout privacy & optional marketing consent
    recordConsent({
      anonymousId,
      email: shippingFields.email,
      source: 'checkout',
      privacyNoticeAccepted: Boolean(privacyNoticeAccepted),
      ...(marketingConsent ? { emailMarketing: true, whatsappMarketing: true } : {}),
    }).catch(() => {});

    dispatch(addShippingInfo(shippingData as any));
    router.push('/order-summary');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 transition-all duration-300">
      <CheckoutSteps activeStep={0} />
      <div className="w-full max-w-[1550px] mx-auto px-4 py-8">
        <div className="max-w-7xl 2xl:max-w-[1500px] mx-auto grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Shipping Details</CardTitle>
                <CardDescription>Provide delivery address for this order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {addresses && addresses.length > 0 && (
                  <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                      Select From Saved Addresses
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr: any, idx: number) => {
                        const isCurrent = form.watch('address') === addr.address && form.watch('pinCode') === String(addr.pinCode);
                        return (
                          <div
                            key={addr._id || idx}
                            onClick={() => {
                              form.reset({
                                name: addr.name || user?.name || '',
                                email: user?.email || '',
                                address: addr.address || '',
                                city: addr.city || '',
                                state: addr.state || '',
                                country: addr.country || 'India',
                                pinCode: String(addr.pinCode || ''),
                                phoneNo: String(addr.phoneNo || ''),
                              });
                              toast.success(`Selected "${addr.name || 'Saved Address'}"`);
                            }}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              isCurrent
                                ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{addr.name || 'Address'}</span>
                              {addr.isDefault && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{addr.address}, {addr.city}</p>
                            <p className="text-[11px] font-medium text-blue-600 dark:text-blue-400 mt-2">
                              {isCurrent ? '✓ Selected' : 'Click to select'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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

                    <div className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4">
                      <FormField control={form.control} name="privacyNoticeAccepted" render={({ field }) => (
                        <FormItem>
                          <div className="flex items-start gap-2.5">
                            <FormControl>
                              <Checkbox
                                id="checkout-privacy-notice"
                                checked={Boolean(field.value)}
                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                className="mt-0.5"
                              />
                            </FormControl>
                            <label htmlFor="checkout-privacy-notice" className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 cursor-pointer">
                              I have read and agree to the{' '}
                              <Link href="/privacy-policy" target="_blank" className="text-indigo-600 dark:text-indigo-400 underline font-medium">
                                Privacy Notice
                              </Link>{' '}
                              for processing my order/account data. <span className="text-red-500">*</span>
                            </label>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="marketingConsent" render={({ field }) => (
                        <FormItem>
                          <div className="flex items-start gap-2.5">
                            <FormControl>
                              <Checkbox
                                id="checkout-marketing-consent"
                                checked={Boolean(field.value)}
                                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                                className="mt-0.5"
                              />
                            </FormControl>
                            <label htmlFor="checkout-marketing-consent" className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 cursor-pointer">
                              I agree to receive promotional offers and updates via WhatsApp &amp; Email (you can opt out anytime).
                            </label>
                          </div>
                        </FormItem>
                      )} />
                    </div>

                    <Button type="submit" className="w-full bg-[#0d0e26] dark:bg-slate-100 dark:text-gray-900 cursor-pointer h-11 font-bold transition-all hover:opacity-90">Continue to Summary</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-4 space-y-6">
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
