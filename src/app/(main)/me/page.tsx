"use client"
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ActiveSection, UserProfile } from '@/types';
const PersonalInformation = dynamic(() => import('@/components/profile/sections/PersonalInfo').then(mod => mod.PersonalInformation), { ssr: false });
const HelpSupportSection = dynamic(() => import('@/components/profile/sections/HelpSupport').then(mod => mod.HelpSupportSection), { ssr: false });
const ReviewsSection = dynamic(() => import('@/components/profile/sections/Reviews').then(mod => mod.ReviewsSection), { ssr: false });
const RewardsSection = dynamic(() => import('@/components/profile/sections/Rewards').then(mod => mod.RewardsSection), { ssr: false });
const OrdersSection = dynamic(() => import('@/components/profile/sections/Orders').then(mod => mod.OrdersSection), { ssr: false });
const AddressesSection = dynamic(() => import('@/components/profile/sections/Addresses'), { ssr: false });
import { ArrowLeft, User as UserIcon } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Sidebar } from '@/components/profile/Sidebar';
import { useGetMyOrdersQuery } from '@/redux/api/orderApi';
import { useUpdateProfileMutation } from '@/redux/api/userApi';
import toast from 'react-hot-toast';

const ProfileContent: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated, user } = useAppSelector((state) => state.user);
  const { data: ordersData, isLoading: loading, error } = useGetMyOrdersQuery();
  const [updateProfile] = useUpdateProfileMutation();

  const handleProfileSave = async (updatedProfile: any) => {
    try {
      const name = `${updatedProfile.firstName} ${updatedProfile.lastName}`.trim();
      await updateProfile({ name }).unwrap();
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update profile');
    }
  };

  const orders = ordersData || [];
  const [isMobile, setIsMobile] = useState(false);
  const rewards = user?.rewardPoints || 0;
  const [activeSection, setActiveSection] = useState<ActiveSection>('main');


  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [dispatch]);

  const getPageTitle = (section: ActiveSection): string => {
    const titles: any = {
      'main': 'My Profile',
      'personal-info': 'Personal Information',
      'addresses': 'Manage Addresses',
      'orders': 'My Orders',
      'rewards': 'My Rewards',
      'reviews': 'My Reviews & Ratings',
      'help': 'Help & Support',
    };
    return titles[section] || 'My Profile';
  };

  const renderMainContent = () => {
    const renderContent = () => {
      if (!isAuthenticated) {
        return (
          <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-gray-400 dark:text-slate-500">
              <UserIcon className="w-8 h-8" />
            </div>
            <p className="text-gray-600 dark:text-slate-400 font-medium">Please log in to view your profile.</p>
          </div>
        );
      }

      const [firstName = '', ...lastNameParts] = (user?.name || '').split(' ');
      const lastName = lastNameParts.join(' ');

      const mappedProfile: UserProfile = {
        ...user,
        firstName,
        lastName,
        email: user?.email || '',
        mobile: user?.phone || '',
        gender: 'male',
        dateOfBirth: '',
        location: '',
        id: user?._id || '',
      } as any;

      switch (activeSection) {
        case 'personal-info':
          return <PersonalInformation
            profile={mappedProfile}
            onSave={handleProfileSave}
          />;
        case 'addresses': return <AddressesSection />;
        case 'orders': return <OrdersSection orders={orders.flatMap((order: any) => (order.orderItems || []).map((item: any) => ({ ...order, id: order._id, title: item.name, image: item.image, price: item.sellingPrice })))} />;
        case 'rewards': return <RewardsSection rewards={rewards} />;
        case 'reviews': return <ReviewsSection />;
        case 'help': return <HelpSupportSection />;
        default: return <PersonalInformation profile={mappedProfile} onSave={handleProfileSave} />;
      }
    };

    return (
      <main className="bg-white dark:bg-slate-900 md:rounded-lg md:shadow-lg p-4 md:p-6 min-h-screen border-l border-slate-100 dark:border-slate-800">
        {isMobile && activeSection !== 'main' && (
          <div className="flex items-center gap-4 mb-6 -ml-2">
            <button
              onClick={() => setActiveSection('main')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors text-blue-600 dark:text-blue-400"
              aria-label="Back to menu"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800 dark:text-slate-100">{getPageTitle(activeSection)}</h1>
          </div>
        )}
        {!isMobile && (
          <div className="mb-6 pb-4 border-b border-gray-200 dark:border-slate-800">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">{getPageTitle(activeSection)}</h1>
          </div>
        )}
        {renderContent()}
      </main>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-0 md:p-6 transition-colors duration-300">
      <div className={`${isMobile ? 'p-0' : 'max-w-7xl mx-auto flex flex-col md:flex-row'} gap-0 md:gap-6`}>
        <div className={`${isMobile && activeSection !== 'main' ? 'hidden' : 'block'} ${isMobile ? 'w-full' : 'w-full md:w-[320px] flex-shrink-0'}`}>
          <Sidebar
            user={user}
            activeSection={activeSection}
            onChange={setActiveSection}
            className={isMobile ? 'min-h-screen' : ''}
          />
        </div>
        <div className={`flex-1 ${isMobile && activeSection === 'main' ? 'hidden' : 'block'}`}>
          {renderMainContent()}
        </div>
      </div>
    </div>
  );

};

import { Suspense } from 'react';
export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-20 text-center">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
