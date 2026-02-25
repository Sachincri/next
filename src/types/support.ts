export interface SupportIssue {
    _id: string; // Used in Table
    status: "Pending" | "In Progress" | "Resolved" | "Closed" | string; // Chart uses string, Table uses enum union. Broadening for compatibility.
    priority: "Low" | "Medium" | "High" | "Urgent" | string;
    category: string;
    subject?: string; // Optional for Chart
    description?: string; // Optional for Chart
    user?: {
        name: string;
        email: string;
    };
    createdAt?: string; // Optional for Chart
}
