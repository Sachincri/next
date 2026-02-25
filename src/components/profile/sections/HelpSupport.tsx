"use client"
import React, { useState } from "react";
import { CreditCard, Headphones, HelpCircle, Package, User, ChevronDown, ChevronUp, Mail, MessageSquare, Phone } from "lucide-react";
import dynamic from "next/dynamic";
const SupportRequestModal = dynamic(() => import("@/components/help/SupportRequestModal"), { ssr: false });

import { useGetPublicSettingsQuery } from "@/redux/api/homeApi";

import { Bot } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";

export const HelpSupportSection: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("General Queries");
    const { data: settings } = useGetPublicSettingsQuery();


    const faqs = [
        {
            q: "How can I track my order?",
            a: "You can track your order by going to the 'My Orders' section in your profile. Click on the 'Track Order' button next to your active orders to see the real-time status."
        },
        {
            q: "What is your return policy?",
            a: "We offer a 7-day return policy for most items. Items must be in their original packaging with tags intact. Some categories like innerwear and beauty products are non-returnable."
        },
        {
            q: "How long does a refund take?",
            a: "Once we receive and inspect your return, the refund is typically processed within 5-7 business days to your original payment method."
        },
        {
            q: "Can I cancel my order?",
            a: "Orders can be cancelled as long as they haven't been shipped. Go to 'My Orders', find the order you want to cancel, and click the 'Cancel' button if available."
        }
    ];

    const openRequestModal = (e: React.MouseEvent, category: string) => {
        e.stopPropagation();
        e.preventDefault();
        setSelectedCategory(category);
        setIsRequestModalOpen(true);
    };

    return (
        <div className="space-y-10 relative">
            <SupportRequestModal
                isOpen={isRequestModalOpen}
                onClose={() => setIsRequestModalOpen(false)}
                initialCategory={selectedCategory}
            />

            {/* Quick Support Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { icon: Package, title: 'Order Issues', desc: 'Help with orders, returns, refunds, and exchanges', color: 'blue' },
                    { icon: CreditCard, title: 'Payment Issues', desc: 'Issues with payments, refunds, and wallet', color: 'green' },
                    { icon: User, title: 'Account & Login', desc: 'Help with login, account security, and profile settings', color: 'purple' },
                    { icon: HelpCircle, title: 'General Queries', desc: 'Other questions and feedback', color: 'orange' }
                ].map((item, index) => (
                    <div
                        key={index}
                        onClick={(e) => openRequestModal(e, item.title)}
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group hover:border-blue-200 dark:hover:border-blue-900"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white' :
                                item.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:bg-green-600 group-hover:text-white' :
                                    item.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white' :
                                        'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 group-hover:bg-orange-600 group-hover:text-white'
                                } transition-all duration-300`}>
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div className="font-bold text-gray-800 dark:text-slate-100 text-lg">{item.title}</div>
                        </div>
                        <p className="text-gray-600 dark:text-slate-400 mb-4 leading-relaxed text-sm">{item.desc}</p>
                        <button
                            type="button"
                            onClick={(e) => openRequestModal(e, item.title)}
                            className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 text-sm bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors"
                        >
                            Submit Request
                        </button>
                    </div>
                ))}
            </div>


            {/* FAQ Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="border-b border-gray-50 dark:border-slate-800 last:border-0 pb-4">
                            <button
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                className="w-full flex justify-between items-center text-left py-2 group"
                            >
                                <span className={`font-semibold ${openFaq === i ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300 group-hover:text-blue-500 dark:group-hover:text-blue-400'} transition-colors`}>
                                    {faq.q}
                                </span>
                                {openFaq === i ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5 text-gray-400 dark:text-slate-500" />}
                            </button>
                            {openFaq === i && (
                                <div className="mt-2 text-gray-600 dark:text-slate-400 text-sm leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Direct Contact Options */}
            <div className="bg-gradient-to-br from-gray-900 to-indigo-900 text-white rounded-2xl p-8 overflow-hidden relative border border-slate-800">
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                        <Headphones className="w-8 h-8 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
                    <p className="text-gray-400 mb-8 max-w-md">Our support team is available 24/7 to assist you with any questions or concerns.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                            <Phone className="w-6 h-6 text-blue-400 mx-auto mb-3" />
                            <div className="text-lg font-bold">{settings?.helpLineNumber || "1800-208-9898"}</div>
                            <div className="text-xs text-gray-400">Toll Free Numbers</div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                            <Mail className="w-6 h-6 text-blue-400 mx-auto mb-3" />
                            <div className="text-lg font-bold">{settings?.supportEmail || "support@shop.com"}</div>
                            <div className="text-xs text-gray-400">Email Support</div>
                        </div>
                    </div>
                </div>

                {/* Decorative backgrounds */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
};
