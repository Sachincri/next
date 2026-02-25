import DashboardLayout from "@/components/admin/dashboard-layout"
import AppLoadContent from "@/components/admin/home/HomeCMSUpload"

export default function ContentPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Home Page Content</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage the content and layout of your home page.</p>
                </div>

                <AppLoadContent />
            </div>
        </DashboardLayout>
    )
}
