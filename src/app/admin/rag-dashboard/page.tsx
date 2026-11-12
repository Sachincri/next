"use client";

import React, { useState } from "react";
import { 
  useGetRagStatsQuery, 
  useIngestKnowledgeMutation 
} from "@/redux/api/ragApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Bot, BrainCircuit, LineChart, FileText, CheckCircle2, MessageSquareText } from "lucide-react";
import toast from "react-hot-toast";

export default function RagDashboardPage() {
  const { data: statsData, isLoading: isLoadingStats, refetch } = useGetRagStatsQuery({});
  const [ingestMutation, { isLoading: isIngesting }] = useIngestKnowledgeMutation();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceType, setSourceType] = useState("faq");

  const stats = statsData?.data;

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return toast.error("Please fill all required fields");
    
    try {
      const res = await ingestMutation({ title, content, sourceType }).unwrap();
      toast.success(res.message || "Knowledge ingested successfully");
      setTitle("");
      setContent("");
      refetch();
    } catch (err: any) {
      toast.error(err.data?.message || "Failed to ingest knowledge");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Chat & RAG Analytics</h2>
        <p className="text-muted-foreground">Monitor your chatbot's performance and manage its knowledge base.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chat Queries</CardTitle>
            <MessageSquareText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : stats?.totalQueries || 0}</div>
            <p className="text-xs text-muted-foreground">Across all user sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Base Chunks</CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : stats?.totalDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">Stored in Pinecone Vector DB</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : `${stats?.averageRating?.toFixed(1) || 0} / 5.0`}</div>
            <p className="text-xs text-muted-foreground">Based on user feedback</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Hits</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : "94%"}</div>
            <p className="text-xs text-muted-foreground">Queries successfully answered</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Knowledge Ingestion Form */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Train the AI</CardTitle>
            <CardDescription>Add new policies, FAQs, or rules to the AI's knowledge base.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIngest} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Knowledge Title</label>
                <Input 
                  placeholder="e.g. 2026 Return Policy Updates" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  disabled={isIngesting}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Type</label>
                <Select value={sourceType} onValueChange={setSourceType} disabled={isIngesting}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="faq">FAQ</SelectItem>
                    <SelectItem value="policy">Policy / Rules</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="product">Product Details</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Textarea 
                  placeholder="Paste the detailed content here..." 
                  className="min-h-[150px]" 
                  value={content} 
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isIngesting}
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isIngesting}>
                {isIngesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                Ingest & Vectorize
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Top Intents / Analytics Info */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Chat Intents</CardTitle>
            <CardDescription>What your customers are asking about most</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex h-[250px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {(stats?.intents || []).length > 0 ? (
                  stats.intents.map((intent: any, idx: number) => (
                    <div key={idx} className="flex items-center">
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none capitalize">{intent._id || 'General Support'}</p>
                        <div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-full rounded-full" 
                            style={{ width: `${Math.min(100, (intent.count / Math.max(1, stats.totalQueries)) * 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 font-medium">{intent.count}</div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mb-2 opacity-20" />
                    <p>No chat data available yet.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
