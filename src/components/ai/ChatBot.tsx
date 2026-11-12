"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRagChatMutation } from '@/redux/api/ragApi';
import { useAppSelector } from '@/redux/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send, Bot, Trash2, Sparkles, Loader2, Headphones, ShieldAlert, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetPublicSettingsQuery } from '@/redux/api/homeApi';
import { useGetProductDetailsQuery } from '@/redux/api/productApi';
import ReactMarkdown from 'react-markdown';
import Draggable from 'react-draggable';
import { usePathname, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const ChatProductCard = ({ id, name }: { id: string, name?: React.ReactNode }) => {
    const { data: product, isLoading } = useGetProductDetailsQuery(id);

    if (isLoading) {
        return (
            <div className="animate-pulse bg-slate-100 dark:bg-zinc-900/80 rounded-2xl h-22 w-full max-w-[280px] my-2 border border-slate-200/60 dark:border-white/10" />
        );
    }

    if (!product) {
        return (
            <Link
                href={`/product/${id}`}
                target="_blank"
                className="inline-flex items-center gap-2 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold px-3 py-1.5 rounded-xl border border-indigo-200/60 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all my-1.5 w-full max-w-xs no-underline text-xs group"
            >
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-indigo-500 group-hover:rotate-12 transition-transform" />
                <span className="truncate">{name || "View Product"}</span>
                <span className="ml-auto text-indigo-400">→</span>
            </Link>
        );
    }

    const imageUrl = typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url;

    return (
        <Link
            href={`/product/${id}`}
            className="group flex items-center gap-3 bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 p-2.5 rounded-2xl hover:shadow-lg hover:shadow-indigo-500/5 transition-all my-2.5 w-full max-w-[290px] cursor-pointer no-underline block"
        >
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 flex-shrink-0 border border-slate-200/50 dark:border-white/5">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        sizes="64px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Bot size={18} />
                    </div>
                )}
            </div>
            <div className="flex flex-col flex-1 min-w-0 pr-1">
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {product.name}
                </span>
                <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        ₹{product.sellingPrice?.toLocaleString?.() || product.sellingPrice}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        Details →
                    </span>
                </div>
            </div>
        </Link>
    );
};

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: { title: string; chunkId: string; score: number }[];
    toolCalls?: { name: string; result: any }[];
    suggestedActions?: string[];
    escalated?: boolean;
    ticket?: { ticketId: string; subject: string; priority: string } | null;
    confidence?: number;
}

const getOrCreateSessionId = () => {
    if (typeof window === 'undefined') return 'temp-session';
    let sid = localStorage.getItem('rag_session_id');
    if (!sid) {
        sid = 'sess_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('rag_session_id', sid);
    }
    return sid;
};

export function ChatBot() {
    const pathname = usePathname();
    const isCheckoutPage = ['/shipping', '/order-summary', '/payment'].includes(pathname);
    const isAdminPage = pathname?.startsWith('/admin');
    const { user } = useAppSelector((state) => state.user);
    const { data: settings } = useGetPublicSettingsQuery();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [ragChatMutation, { isLoading }] = useRagChatMutation();
    const sessionId = useRef(getOrCreateSessionId()).current;
    const [isMobile, setIsMobile] = useState(false);
    const params = useParams();
    const productId = params?.id as string;

    const isAdmin = user?.role === 'admin';
    const scrollRef = useRef<HTMLDivElement>(null);
    const outerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Prevent background scrolling when mobile drawer is open
    useEffect(() => {
        if (isOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, isMobile]);

    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTo({
                    top: scrollContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [chatHistory, isOpen, isLoading]);

    const handleSend = async (textToSend?: string) => {
        const query = (textToSend || message).trim();
        if (!query || isLoading) return;

        const userMessage: Message = { role: 'user', content: query };
        setChatHistory((prev) => [...prev, userMessage]);
        setMessage('');

        try {
            const res = await ragChatMutation({
                message: query,
                sessionId,
                pageContext: { productId }
            }).unwrap();

            if (res.success) {
                setChatHistory((prev) => [...prev, {
                    role: 'assistant',
                    content: res.data.response,
                    sources: res.data.sources,
                    suggestedActions: res.data.suggestedActions,
                    escalated: res.data.escalated,
                    ticket: res.data.ticket,
                    confidence: res.data.confidence,
                }]);
            }
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to get AI response');
        }
    };

    const clearChat = () => {
        setChatHistory([]);
        toast.success('Chat cleared');
    };

    if (settings?.aiChatEnabled === false || isCheckoutPage || isAdminPage) return null;

    const welcomeName = user?.name ? user.name.split(' ')[0] : 'there';
    const welcomeMessage = isAdmin
        ? "I can analyze your store's live performance, inventory trends, and orders. What would you like to inspect?"
        : "I'm Aura Genie ✨ — your smart personal shopping assistant. Looking for product recommendations, special discounts, or order delivery tracking?";

    const promptChips = isAdmin
        ? [
            { icon: "📊", text: "Today's revenue summary" },
            { icon: "⚠️", text: "Low stock products list" },
            { icon: "🔥", text: "Top selling products this week" },
            { icon: "📦", text: "Recent pending orders" }
        ]
        : [
            { icon: "✨", text: "Top trending products right now" },
            { icon: "⚡", text: "Best deals & discounts under ₹999" },
            { icon: "🎁", text: "Gift recommendations for someone" },
            { icon: "📦", text: "Track my order delivery status" }
        ];

    const ChatWindowContent = (
        <div className="w-full h-full sm:w-[410px] sm:h-[600px] flex flex-col shadow-[0_25px_80px_-15px_rgba(0,0,0,0.7)] border-0 sm:border border-white/10 bg-[#0d101d]/98 backdrop-blur-3xl overflow-hidden rounded-t-[32px] sm:rounded-3xl relative text-white">
            {/* Top ambient glowing neon border */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 z-30" />

            {/* Mobile Drawer Pull Indicator */}
            <div
                className="sm:hidden w-full pt-3 pb-1 flex justify-center bg-[#0d101d] cursor-pointer select-none"
                onClick={() => setIsOpen(false)}
            >
                <div className="w-12 h-1.5 bg-white/25 rounded-full hover:bg-white/50 transition-colors" />
            </div>

            {/* Premium Header */}
            <div className={`chat-drag-handle ${!isMobile ? 'cursor-grab active:cursor-grabbing' : ''} flex items-center justify-between py-4 px-5 select-none bg-[#090b14]/90 border-b border-white/[0.08] backdrop-blur-md`}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-fuchsia-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/30">
                            <div className="w-full h-full bg-[#0d101d] rounded-[14px] flex items-center justify-center">
                                {isAdmin ? <Sparkles className="w-4 h-4 text-amber-400" /> : <Sparkles className="w-5 h-5 text-fuchsia-400 animate-pulse" />}
                            </div>
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#090b14]" />
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                                <span>{isAdmin ? 'Aura Intelligence' : 'Aura Genie'}</span>
                                <span className="text-[10px] text-fuchsia-400 font-normal">✨</span>
                            </h3>
                            <span className="text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/40 text-fuchsia-300">
                                Smart AI
                            </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-medium">
                            Your 24/7 Shopping & Order Assistant
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    {chatHistory.length > 0 && (
                        <button
                            onClick={clearChat}
                            title="Clear conversation"
                            className="h-8 w-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setIsOpen(false)}
                        aria-label="Close Chat"
                        className="h-8 w-8 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-hidden bg-[#070913] flex flex-col relative">
                {/* Ambient background glow orbs */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-indigo-600/10 rounded-full blur-[90px] pointer-events-none" />
                <div className="absolute bottom-10 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-[80px] pointer-events-none" />

                <ScrollArea className="h-full px-4 py-4 sm:px-5 sm:py-5" ref={scrollRef}>
                    {chatHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[340px] text-center px-2 py-6">
                            {/* Holographic Glowing Orb */}
                            <div className="relative mb-4 group">
                                <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 rounded-3xl blur-lg opacity-50 group-hover:opacity-80 transition duration-700 animate-pulse" />
                                <div className="relative w-16 h-16 bg-[#0d101d] rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                                    <Sparkles className="w-8 h-8 text-indigo-300 animate-pulse" />
                                </div>
                            </div>

                            <h4 className="font-bold text-lg mb-1.5 text-white tracking-tight">
                                How can I help you, {welcomeName}? ✨
                            </h4>
                            <p className="text-xs text-zinc-400 leading-relaxed max-w-[300px]">
                                {welcomeMessage}
                            </p>

                            {/* Prompt Suggestion Cards */}
                            <div className="mt-6 w-full space-y-2">
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-left px-1">
                                    Suggested Inquiries
                                </p>
                                <div className="grid grid-cols-1 gap-2">
                                    {promptChips.map((chip, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(chip.text)}
                                            className="group flex items-center gap-3 text-left text-xs bg-[#0f1325]/90 hover:bg-[#161b33] text-zinc-200 hover:text-white border border-white/[0.08] hover:border-indigo-500/40 rounded-2xl p-3 transition-all shadow-sm hover:shadow-indigo-500/10 hover:shadow-lg active:scale-[0.98]"
                                        >
                                            <span className="text-base flex-shrink-0 group-hover:scale-110 transition-transform">
                                                {chip.icon}
                                            </span>
                                            <span className="font-medium flex-1 truncate">{chip.text}</span>
                                            <span className="text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all text-xs font-bold">
                                                →
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-2">
                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className="flex flex-col gap-1.5">
                                    <div
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 p-[1px] flex-shrink-0 mr-2 mt-0.5 shadow-sm">
                                                <div className="w-full h-full bg-[#0d101d] rounded-[11px] flex items-center justify-center">
                                                    <Bot className="w-3.5 h-3.5 text-indigo-300" />
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm transition-all ${msg.role === 'user'
                                                ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/20 rounded-tr-xs font-medium'
                                                : 'bg-[#12162a]/95 text-zinc-100 rounded-tl-xs border border-white/10 backdrop-blur-md shadow-md'
                                                }`}
                                        >
                                            <div className="prose prose-sm prose-invert break-words max-w-full prose-p:leading-relaxed prose-p:my-0 prose-ul:my-1 prose-li:my-0 prose-a:no-underline text-xs sm:text-sm">
                                                <ReactMarkdown
                                                    components={{
                                                        a: ({ node, ...props }) => {
                                                            const href = props.href || '';
                                                            const isProductLink = href.includes('/product/');
                                                            if (isProductLink) {
                                                                const idMatch = href.match(/\/product\/([a-zA-Z0-9_-]+)/);
                                                                const id = idMatch ? idMatch[1] : '';
                                                                if (id) {
                                                                    return <ChatProductCard id={id} name={props.children} />;
                                                                }
                                                            }
                                                            return (
                                                                <a
                                                                    {...props}
                                                                    className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold"
                                                                    target="_blank"
                                                                />
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                            {msg.role === 'assistant' && msg.escalated && msg.ticket && (
                                                <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                                                    <div className="flex items-center gap-2">
                                                        <Headphones className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
                                                        <span className="font-semibold text-xs text-amber-300">Support Ticket Created</span>
                                                        <span className="ml-auto text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                                            {msg.ticket.priority} Priority
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-[11px] text-zinc-300 leading-snug">
                                                        {msg.ticket.subject} (Ticket #{msg.ticket.ticketId.slice(-6).toUpperCase()}). Our human support team has been notified.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                                        <div className="flex gap-2 pl-10 overflow-x-auto pb-1 hide-scrollbar">
                                            {msg.sources.map((s, i) => (
                                                <div key={i} className="whitespace-nowrap text-[10px] bg-white/5 border border-white/10 text-zinc-400 px-2 py-1 rounded-md flex-shrink-0">
                                                    Source: {s.title}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {msg.role === 'assistant' && msg.suggestedActions && msg.suggestedActions.length > 0 && idx === chatHistory.length - 1 && (
                                        <div className="flex flex-wrap gap-2 pl-10 mt-1">
                                            {msg.suggestedActions.map((action, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSend(action)}
                                                    className="text-[11px] font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full transition-colors"
                                                >
                                                    {action}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start items-center gap-2 animate-in fade-in duration-300">
                                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 p-[1px] flex-shrink-0 shadow-sm">
                                        <div className="w-full h-full bg-[#0d101d] rounded-[11px] flex items-center justify-center">
                                            <Bot className="w-3.5 h-3.5 text-indigo-300" />
                                        </div>
                                    </div>
                                    <div className="bg-[#12162a]/95 rounded-2xl rounded-tl-xs px-4 py-3 flex gap-1.5 items-center border border-white/10 shadow-sm">
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        <span className="text-[11px] font-semibold text-zinc-400 ml-1.5">Aura Genie is thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 border-t border-white/[0.08] bg-[#090b14]/95 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex items-center gap-2 bg-[#12162a]/90 rounded-2xl p-1.5 border border-white/10 focus-within:border-indigo-400/60 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-inner"
                >
                    <Input
                        ref={inputRef}
                        placeholder="Ask Aura Genie anything..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 h-10 bg-transparent border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xs sm:text-sm px-3.5 text-white placeholder:text-zinc-500"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!message.trim() || isLoading}
                        className={`h-10 w-10 rounded-xl shadow-lg transition-all active:scale-90 flex-shrink-0 ${isAdmin
                            ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                            : 'bg-gradient-to-tr from-fuchsia-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-white shadow-fuchsia-600/30'
                            }`}
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                            <Send className="w-4 h-4 text-white hover:translate-x-0.5 hover:-translate-y-0.5 transition-transform" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Bottom Drawer & Backdrop */}
            {isMobile && isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/75 backdrop-blur-md z-[99] animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />
                    {/* Bottom Sheet Drawer */}
                    <div className="fixed inset-x-0 bottom-0 z-[100] h-[85vh] max-h-[85dvh] w-full animate-in slide-in-from-bottom duration-300 ease-out flex flex-col">
                        {ChatWindowContent}
                    </div>
                </>
            )}

            {/* Desktop Floating Window & Draggable Handler */}
            {!isMobile && (
                <Draggable handle=".chat-drag-handle, .chat-toggle-btn" bounds="body" nodeRef={outerRef}>
                    <div ref={outerRef} className="fixed bottom-6 right-6 lg:bottom-8 lg:right-8 z-[100] flex flex-col items-end pointer-events-none">
                        {/* Chat Window */}
                        {isOpen && (
                            <div className="pointer-events-auto mb-4 animate-in slide-in-from-bottom-4 duration-300">
                                {ChatWindowContent}
                            </div>
                        )}

                        {/* Desktop Toggle Button */}
                        <button
                            className={`chat-toggle-btn cursor-grab active:cursor-grabbing h-14 w-14 rounded-2xl shadow-[0_10px_35px_rgba(192,38,211,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 pointer-events-auto group relative flex items-center justify-center ${isOpen
                                ? 'bg-zinc-900 text-white border border-white/20'
                                : isAdmin
                                    ? 'bg-zinc-950 text-white border border-zinc-800 ring-4 ring-zinc-950/20'
                                    : 'bg-gradient-to-tr from-fuchsia-600 via-indigo-600 to-cyan-400 text-white p-[2px]'
                                }`}
                            onClick={() => setIsOpen(!isOpen)}
                            title={isOpen ? 'Close Chat' : 'Chat with Aura Genie ✨'}
                        >
                            <div className={`w-full h-full rounded-[14px] flex items-center justify-center ${isOpen ? 'bg-transparent' : 'bg-[#0d101d]/90 backdrop-blur-md group-hover:bg-transparent transition-colors'}`}>
                                {isOpen ? (
                                    <X className="h-6 w-6 transition-all duration-300 text-white" />
                                ) : (
                                    <div className="relative flex items-center justify-center">
                                        <Sparkles className="h-6 w-6 text-fuchsia-300 group-hover:text-white transition-all group-hover:scale-110" />
                                        <span className="absolute -top-1.5 -right-1.5 bg-emerald-400 w-3 h-3 rounded-full border-2 border-[#0d101d] animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                    </div>
                                )}
                            </div>
                        </button>
                    </div>
                </Draggable>
            )}

            {/* Mobile Floating Toggle Button (visible when drawer is closed) */}
            {isMobile && !isOpen && (
                <div className="fixed bottom-6 right-4 z-[90]">
                    <button
                        className={`h-14 w-14 rounded-2xl shadow-[0_10px_30px_rgba(192,38,211,0.45)] transition-all duration-300 active:scale-90 flex items-center justify-center ${isAdmin
                            ? 'bg-zinc-950 text-white border border-zinc-800'
                            : 'bg-gradient-to-tr from-fuchsia-600 via-indigo-600 to-cyan-400 p-[2px]'
                            }`}
                        onClick={() => setIsOpen(true)}
                        aria-label="Open Aura Genie"
                    >
                        <div className="w-full h-full bg-[#0d101d]/90 backdrop-blur-md rounded-[14px] flex items-center justify-center relative">
                            <Sparkles className="h-6 w-6 text-fuchsia-300" />
                            <span className="absolute top-2.5 right-2.5 bg-emerald-400 w-2.5 h-2.5 rounded-full border-2 border-[#0d101d] animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                        </div>
                    </button>
                </div>
            )}
        </>
    );
}
