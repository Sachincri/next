"use client"
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HelpSupportSection } from '@/components/profile/sections/HelpSupport';
import { Headphones, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-grow">
                {/* Hero Section */}
                <div className="bg-blue-600 py-16 text-white text-center">
                    <div className="max-w-4xl mx-auto px-4">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">How can we help you?</h1>
                        <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">
                            Search our help center or choose a topic below to get the support you need.
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-12 pb-20">
                    {/* Trust Badges */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                        {[
                            { icon: Truck, title: "Fast Delivery", text: "2-4 Business days" },
                            { icon: RotateCcw, title: "7 Days Returns", text: "Easy return policy" },
                            { icon: ShieldCheck, title: "Secure Payment", text: "100% secure checkout" },
                            { icon: Headphones, title: "24/7 Support", text: "Always here to help" }
                        ].map((badge, i) => (
                            <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                                <badge.icon className="w-6 h-6 text-blue-600 mb-2" />
                                <div className="font-bold text-gray-800 text-sm">{badge.title}</div>
                                <div className="text-xs text-gray-500">{badge.text}</div>
                            </div>
                        ))}
                    </div>

                    {/* Main Help Section Content */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-gray-200/50">
                        <HelpSupportSection />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
