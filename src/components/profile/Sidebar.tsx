import React from "react";
import { User, ActiveSection, UserProfile } from "@/types";
import { Gift, HelpCircle, LogOut, Mail, MapPin, Package, Phone, Star, User as UserIcon } from "lucide-react";


interface SidebarProps {
  user: UserProfile | User | null;
  activeSection: ActiveSection;
  onChange: (section: ActiveSection) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, activeSection, onChange, className }) => {
  // Handle loading/missing user state gracefully
  const isLoading = !user;

  // Type guard or simple check to handle both User and UserProfile
  const isUserProfile = (u: any): u is UserProfile => u && 'firstName' in u;

  const firstName = isLoading ? "User" : (isUserProfile(user) ? user.firstName : user.name?.split(' ')[0] || '');
  const lastName = isLoading ? "" : (isUserProfile(user) ? user.lastName : user.name?.split(' ').slice(1).join(' ') || '');
  const email = isLoading ? "Loading..." : user.email;
  const mobile = isLoading ? "" : (isUserProfile(user) ? user.mobile : '');


  const menuItems = [
    { id: 'personal-info', icon: UserIcon, label: 'Personal Information', },
    { id: 'addresses', icon: MapPin, label: 'Manage Addresses', },
    { id: 'orders', icon: Package, label: 'My Orders', },
    { id: 'rewards', icon: Gift, label: 'My Rewards', },
    { id: 'reviews', icon: Star, label: 'My Reviews & Ratings', },
    { id: 'help', icon: HelpCircle, label: 'Help & Support', }
  ];

  return (
    <aside className={`bg-white h-fit w-full dark:bg-slate-900 md:rounded-lg md:shadow-lg overflow-hidden border border-slate-100 dark:border-slate-800 ${className || ''}`}>
      <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-slate-800 dark:to-slate-900 border-b border-blue-200/20 dark:border-slate-700">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {firstName?.[0] || 'U'}{lastName?.[0] || ''}
          </div>
          <div className="font-semibold text-lg text-gray-800 dark:text-slate-100">{firstName || 'User'} {lastName}</div>
          <div className="text-gray-600 dark:text-slate-400 text-sm mt-1 flex items-center justify-center gap-1">
            <Mail className="w-3 h-3" />
            {email || 'N/A'}
          </div>

          {mobile && (
            <div className="text-gray-600 dark:text-slate-400 text-sm mt-1 flex items-center justify-center gap-1">
              <Phone className="w-3 h-3" />
              {mobile}
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wide mb-2">Account</div>
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onChange(item.id as ActiveSection)}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 group ${activeSection === item.id
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:shadow-sm'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-white' : 'text-gray-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                    }`} />
                  <span className="font-medium">{item.label}</span>
                </div>
              </button>
            </li>
          ))}
        </ul>


        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
          <button
            onClick={() => onChange('logout')}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};