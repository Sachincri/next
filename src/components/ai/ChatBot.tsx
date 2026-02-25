"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useChatMutation } from '@/redux/api/aiApi';
import { useAppSelector } from '@/redux/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, X, Send, Bot, Trash2, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGetPublicSettingsQuery } from '@/redux/api/homeApi';
import ReactMarkdown from 'react-markdown';
import { useParams } from 'next/navigation';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function ChatBot() {
    const { user } = useAppSelector((state) => state.user);
    const { data: settings } = useGetPublicSettingsQuery();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [chatMutation, { isLoading }] = useChatMutation();
    const params = useParams();
    const productId = params?.id as string;

    const isAdmin = user?.role === 'admin';
    const scrollRef = useRef<HTMLDivElement>(null);

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

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: message };
        setChatHistory((prev) => [...prev, userMessage]);
        setMessage('');

        try {
            const history = chatHistory.map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }]
            }));

            const res = await chatMutation({
                message,
                history,
                productId // Pass the current product ID for context
            }).unwrap();

            if (res.success) {
                setChatHistory((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
            }
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to get AI response');
        }
    };

    const clearChat = () => {
        setChatHistory([]);
        toast.success('Chat history cleared');
    };

    if (settings?.aiChatEnabled === false) return null;

    const welcomeName = user?.name ? user.name.split(' ')[0] : 'there';
    const welcomeMessage = isAdmin
        ? "I can analyze your store's performance, revenue, and inventory. Ask me anything about your business."
        : "I'm here to help you find the best products, resolve issues, and answer any questions. How can I assist you today?";

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            {isOpen && (
                <Card className={`mb-4 w-[350px] sm:w-[420px] h-[550px] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 animate-in slide-in-from-bottom-4 pointer-events-auto overflow-hidden rounded-2xl`}>
                    <CardHeader className={`flex flex-row items-center justify-between py-4 px-5 ${isAdmin ? 'bg-zinc-900 text-white' : 'bg-indigo-600 text-white'}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${isAdmin ? 'bg-zinc-800' : 'bg-indigo-500/50'} backdrop-blur-sm`}>
                                {isAdmin ? <Sparkles className="w-5 h-5 text-yellow-500" /> : <Bot className="w-5 h-5 text-white" />}
                            </div>
                            <div>
                                <CardTitle className="text-sm font-bold tracking-tight">
                                    {isAdmin ? 'Admin Intelligence' : 'Store Assistant'}
                                </CardTitle>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    <span className="text-[10px] opacity-80 font-medium">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                onClick={clearChat}
                                title="Clear Chat"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden bg-white dark:bg-zinc-950">
                        <ScrollArea className="h-full px-5 py-6" ref={scrollRef}>
                            {chatHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[380px] text-center px-6">
                                    <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 border border-slate-100 dark:border-zinc-800">
                                        <Bot className={`w-8 h-8 ${isAdmin ? 'text-zinc-400' : 'text-indigo-500'}`} />
                                    </div>
                                    <h4 className="font-bold text-lg mb-2">Welcome, {welcomeName}!</h4>
                                    <p className="text-sm text-slate-500 dark:text-zinc-500 leading-relaxed">
                                        {welcomeMessage}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {chatHistory.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all ${msg.role === 'user'
                                                ? `${isAdmin ? 'bg-zinc-900 text-white' : 'bg-indigo-600 text-white'} rounded-tr-none hover:shadow-md`
                                                : 'bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 rounded-tl-none border border-slate-200/50 dark:border-zinc-800/50'
                                                }`}>
                                                <div className="prose prose-sm dark:prose-invert break-words max-w-full 
                                                            prose-p:leading-relaxed prose-p:my-0
                                                            prose-ul:my-1 prose-li:my-0
                                                        ">
                                                    <ReactMarkdown>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start animate-in fade-in duration-300">
                                            <div className="bg-slate-100 dark:bg-zinc-900 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1.5 items-center">
                                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-4 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <form onSubmit={handleSend} className="flex w-full items-center gap-3">
                            <Input
                                placeholder="Ask something..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={isLoading}
                                className="flex-1 h-11 bg-slate-50 dark:bg-zinc-900 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/20 rounded-xl"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!message.trim() || isLoading}
                                className={`h-11 w-11 rounded-xl shadow-lg transition-all active:scale-95 group relative overflow-hidden ${isAdmin ? 'bg-zinc-900 hover:bg-zinc-800 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                    }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <div className="relative">
                                        <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        <Sparkles className="absolute -top-2 -right-2 w-3 h-3 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}

            {/* Toggle Button */}
            <Button
                size="icon"
                className={`h-16 w-16 rounded-2xl shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 pointer-events-auto group relative ${isOpen
                    ? 'bg-zinc-800 hover:bg-zinc-900 text-white'
                    : isAdmin
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-white ring-4 ring-zinc-900/10'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white ring-4 ring-indigo-600/10'
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                {isOpen ? (
                    <X className="h-7 w-7 transition-all duration-300 rotate-0 group-hover:rotate-90" />
                ) : (
                    <div className="relative">
                        <MessageSquare className="h-7 w-7 transition-all duration-300 group-hover:scale-110" />
                        <span className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900" />
                    </div>
                )}
            </Button>
        </div>
    );
}
