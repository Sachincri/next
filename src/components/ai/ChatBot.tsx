"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRagChatMutation } from '@/redux/api/ragApi';
import { useAppSelector } from '@/redux/hooks';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    X,
    Send,
    Bot,
    Trash2,
    Sparkles,
    Loader2,
    Headphones,
    MessageSquare,
    ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetPublicSettingsQuery } from '@/redux/api/homeApi';
import { useGetProductDetailsQuery } from '@/redux/api/productApi';
import ReactMarkdown from 'react-markdown';
import { usePathname, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const ChatProductCard = ({ id, name }: { id: string; name?: React.ReactNode }) => {
    const { data: product, isLoading } = useGetProductDetailsQuery(id);

    if (isLoading) {
        return (
            <div className="animate-pulse bg-slate-100 rounded-xl h-20 w-full max-w-[280px] my-2 border border-slate-200" />
        );
    }

    if (!product) {
        return (
            <Link
                href={`/product/${id}`}
                target="_blank"
                className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-100 transition-colors my-1.5 w-full max-w-xs no-underline text-xs group"
            >
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-indigo-600" />
                <span className="truncate">{name || "View Product"}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto text-indigo-500" />
            </Link>
        );
    }

    const imageUrl = typeof product.images?.[0] === 'string' ? product.images[0] : product.images?.[0]?.url;

    return (
        <Link
            href={`/product/${id}`}
            className="group flex items-center gap-3 bg-white border border-slate-200 hover:border-indigo-400 p-2.5 rounded-xl hover:shadow-md transition-all my-2 w-full max-w-[290px] cursor-pointer no-underline"
        >
            <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="56px"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Bot size={18} />
                    </div>
                )}
            </div>
            <div className="flex flex-col flex-1 min-w-0 pr-1">
                <span className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                    {product.name}
                </span>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-bold text-indigo-600">
                        ₹{product.sellingPrice?.toLocaleString?.('en-IN') || product.sellingPrice}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 group-hover:text-indigo-600 flex items-center gap-0.5">
                        Details <ArrowRight className="w-3 h-3" />
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

const CUSTOMER_PROMPT_CHIPS = [
    "Track my recent order",
    "Best cricket bats under ₹10,000",
    "Show current deals & discounts",
    "Return & shipping policy",
];

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
    const isProductDetailPage = Boolean(pathname?.startsWith('/product/') && pathname !== '/product');
    const isCartPage = pathname === '/cart';
    const hasStickyBottomBar = isProductDetailPage || isCartPage;
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

    const scrollRef = useRef<HTMLDivElement>(null);
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
                    behavior: 'smooth',
                });
            }
        }
    }, [chatHistory, isOpen, isLoading]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [isOpen]);

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
                pageContext: { productId },
            }).unwrap();

            if (res.success) {
                setChatHistory((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: res.data.response,
                        sources: res.data.sources,
                        suggestedActions: res.data.suggestedActions,
                        escalated: res.data.escalated,
                        ticket: res.data.ticket,
                        confidence: res.data.confidence,
                    },
                ]);
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

    const ChatWindowContent = (
        <div className="w-full h-full flex flex-col bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden text-slate-900">
            {/* Clean Light Header */}
            <div className="flex items-center justify-between px-4 py-3.5 bg-white border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shrink-0">
                        <Sparkles className="w-4 h-4" />
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-indigo-600 ring-2 ring-white" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold tracking-tight text-slate-900 truncate">
                                Aura Assistant
                            </h3>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                                AI
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                            Shopping &amp; Order Assistant
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {chatHistory.length > 0 && (
                        <button
                            type="button"
                            onClick={clearChat}
                            title="Clear conversation"
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close Chat"
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-hidden bg-white flex flex-col">
                <ScrollArea className="h-full px-4 py-4" ref={scrollRef}>
                    {chatHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-2 py-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3.5">
                                <Sparkles className="w-6 h-6" />
                            </div>

                            <h4 className="font-semibold text-base text-slate-900 tracking-tight mb-1">
                                Hi {welcomeName}, how can I help?
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-[290px]">
                                I can help you find products, check sizes/prices, or track your orders.
                            </p>

                            {/* Shopper Prompt Suggestions */}
                            <div className="mt-5 w-full space-y-2 text-left">
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
                                    Suggested Questions
                                </p>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {CUSTOMER_PROMPT_CHIPS.map((chip) => (
                                        <button
                                            key={chip}
                                            type="button"
                                            onClick={() => handleSend(chip)}
                                            className="group flex items-center justify-between gap-2 text-left text-xs bg-slate-50 hover:bg-indigo-50/70 text-slate-700 hover:text-indigo-700 border border-slate-200 hover:border-indigo-300 rounded-xl px-3.5 py-2.5 transition-all"
                                        >
                                            <span className="font-medium truncate">{chip}</span>
                                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
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
                                        className={`flex items-start gap-2 ${
                                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                                                <Bot className="w-4 h-4" />
                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[84%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                                                msg.role === 'user'
                                                    ? 'bg-indigo-600 text-white rounded-br-sm font-medium shadow-xs'
                                                    : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-sm'
                                            }`}
                                        >
                                            <div
                                                className={`prose prose-sm break-words max-w-full prose-p:leading-relaxed prose-p:my-0 prose-ul:my-1 prose-li:my-0 prose-a:no-underline text-xs sm:text-sm ${
                                                    msg.role === 'user'
                                                        ? 'text-white prose-strong:text-white'
                                                        : 'text-slate-800 prose-headings:text-slate-900 prose-strong:text-slate-900'
                                                }`}
                                            >
                                                <ReactMarkdown
                                                    components={{
                                                        a: ({ node, ...props }) => {
                                                            const href = props.href || '';
                                                            if (href.includes('/product/')) {
                                                                const idMatch = href.match(/\/product\/([a-zA-Z0-9_-]+)/);
                                                                const id = idMatch ? idMatch[1] : '';
                                                                if (id) {
                                                                    return <ChatProductCard id={id} name={props.children} />;
                                                                }
                                                            }
                                                            return (
                                                                <a
                                                                    {...props}
                                                                    className={`font-semibold underline ${
                                                                        msg.role === 'user'
                                                                            ? 'text-white'
                                                                            : 'text-indigo-600 hover:text-indigo-700'
                                                                    }`}
                                                                    target="_blank"
                                                                />
                                                            );
                                                        },
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>

                                            {msg.role === 'assistant' && msg.escalated && msg.ticket && (
                                                <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                                                    <div className="flex items-center gap-2">
                                                        <Headphones className="w-4 h-4 text-amber-700 shrink-0" />
                                                        <span className="font-semibold text-xs">Support Ticket Created</span>
                                                        <span className="ml-auto text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                                            {msg.ticket.priority} Priority
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-[11px] text-amber-800 leading-snug">
                                                        {msg.ticket.subject} (Ticket #{msg.ticket.ticketId.slice(-6).toUpperCase()}). Our support team has been notified.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                                        <div className="flex gap-1.5 pl-9 overflow-x-auto pb-0.5 hide-scrollbar">
                                            {msg.sources.map((s, i) => (
                                                <div
                                                    key={i}
                                                    className="whitespace-nowrap text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md shrink-0"
                                                >
                                                    Source: {s.title}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {msg.role === 'assistant' &&
                                        msg.suggestedActions &&
                                        msg.suggestedActions.length > 0 &&
                                        idx === chatHistory.length - 1 && (
                                            <div className="flex flex-wrap gap-1.5 pl-9 mt-0.5">
                                                {msg.suggestedActions.map((action, i) => (
                                                    <button
                                                        key={i}
                                                        type="button"
                                                        onClick={() => handleSend(action)}
                                                        className="text-[11px] font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full transition-colors"
                                                    >
                                                        {action}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Bot className="w-4 h-4" />
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex gap-1.5 items-center border border-slate-200">
                                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        <span className="text-xs font-medium text-slate-500 ml-1">
                                            Aura Assistant is typing...
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Unified Clean Input Bar */}
            <div className="p-3 border-t border-slate-200 bg-white shrink-0">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15 transition-all"
                >
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask Aura Assistant anything..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isLoading}
                        className="flex-1 h-9 bg-transparent border-none outline-none text-xs sm:text-sm px-3 text-slate-900 placeholder:text-slate-400 disabled:opacity-50"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!message.trim() || isLoading}
                        className="h-9 w-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0 disabled:opacity-40"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                        ) : (
                            <Send className="w-4 h-4 text-white" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Backdrop when open */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Chat Popup Window — constrained height & cleanly anchored above launcher */}
            {isOpen && (
                <div
                    className={`fixed z-50 ${
                        isMobile
                            ? hasStickyBottomBar
                                ? 'inset-x-3 bottom-40 h-[min(520px,calc(100vh-195px))] max-h-[calc(100vh-195px)]'
                                : 'inset-x-3 bottom-20 h-[min(560px,calc(100vh-120px))] max-h-[calc(100vh-120px)]'
                            : isProductDetailPage
                              ? 'bottom-40 right-5 w-[390px] h-[min(540px,calc(100vh-195px))] max-h-[calc(100vh-195px)]'
                              : isCartPage
                                ? 'bottom-40 lg:bottom-20 right-5 w-[390px] h-[min(540px,calc(100vh-195px))] lg:h-[560px] max-h-[calc(100vh-195px)] lg:max-h-[calc(100vh-120px)]'
                                : 'bottom-20 right-5 w-[390px] h-[560px] max-h-[calc(100vh-120px)]'
                    } animate-in fade-in slide-in-from-bottom-3 duration-200`}
                >
                    {ChatWindowContent}
                </div>
            )}

            {/* Floating Launcher Button (lifted cleanly above mobile sticky Buy Now / Place Order bars) */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label={isOpen ? 'Close Aura Assistant' : 'Open Aura Assistant'}
                title={isOpen ? 'Close Chat' : 'Chat with Aura Assistant'}
                className={`fixed z-50 h-12 w-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                    isProductDetailPage
                        ? 'bottom-24 right-4 sm:right-5'
                        : isCartPage
                          ? 'bottom-24 right-4 lg:bottom-5 lg:right-5'
                          : 'bottom-5 right-5'
                }`}
            >
                {isOpen ? (
                    <X className="h-5 w-5" />
                ) : (
                    <div className="relative flex items-center justify-center">
                        <MessageSquare className="h-5 w-5" />
                        <span className="absolute -top-1.5 -right-1.5 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-indigo-600" />
                    </div>
                )}
            </button>
        </>
    );
}
