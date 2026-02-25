"use client";

import dynamic from "next/dynamic";
import DashboardLayout from "@/components/admin/dashboard-layout";
import { useGetAllSupportRequestsQuery } from "@/redux/api/supportApi";

const IssuesTable = dynamic(() => import("@/components/admin/issues/IssuesTable").then(mod => mod.IssuesTable), { ssr: false });
const IssuesChart = dynamic(() => import("@/components/admin/issues/IssuesChart").then(mod => mod.IssuesChart), { ssr: false });
import { Loader2, AlertCircle } from "lucide-react";

export default function IssuesPage() {
    const { data, isLoading } = useGetAllSupportRequestsQuery();
    const issues = data?.data?.requests || [];

    return (
        <DashboardLayout>
            <div className="p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Support Issues</h1>
                        <p className="text-gray-500 mt-2">Manage and track customer support requests.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100">
                        <AlertCircle size={20} />
                        <span className="font-semibold">{issues.length} Total Issues</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="h-96 flex items-center justify-center">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <>
                        {/* Charts Section */}
                        <IssuesChart data={issues} />

                        {/* Table Section */}
                        <IssuesTable data={issues} isLoading={isLoading} />
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}
