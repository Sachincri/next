export interface RegisterData {
    name: string;
    email: string;
    password: string;
    avatar?: File;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface ProtectedRouteProps {
    children: React.ReactNode;
    isAuthenticated: boolean;
    adminRoute?: boolean;
    isAdmin?: boolean;
    redirect?: string;
}

export interface UseAuth {
    user: any;
    isAuthenticated: boolean;
    loading: boolean;
    login: (email: string, password: string) => void;
    logout: () => void;
    register: (userData: RegisterData) => void;
}
