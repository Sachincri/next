import { UserProfile } from "@/types";

import { Calendar, Mail, MapPin, Phone, Shield, Edit2, X, Check } from "lucide-react";
import { useState } from "react";

export const PersonalInformation = ({ profile, onSave }: { profile: UserProfile, onSave?: (u: UserProfile) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile>({
    ...profile,
    lastName: profile.lastName || 'Customer'
  });

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    onSave?.(updatedProfile);
    setIsEditing(false);
    alert('Profile updated successfully! ✅');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    handleProfileUpdate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          <span className="text-blue-800 dark:text-blue-300 font-medium">Your personal information is secure with us</span>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg outline-none transition-colors ${isEditing ? 'bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-slate-100' : 'bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-500 cursor-not-allowed'}`}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            disabled={!isEditing}
            className={`w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg outline-none transition-colors ${isEditing ? 'bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-slate-100' : 'bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-500 cursor-not-allowed'}`}
          />
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Gender</label>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700"
              />
              <span className="text-gray-700 dark:text-slate-300">Male</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700"
              />
              <span className="text-gray-700 dark:text-slate-300">Female</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Email Address</label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-500 cursor-not-allowed"
            />
            <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-500">Email cannot be changed for security reasons</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Mobile Number</label>
          <div className="relative">
            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              disabled
              className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-500 cursor-not-allowed"
            />
            <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-500">Mobile number is verified and secured</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Date of Birth</label>
          <div className="relative">
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg outline-none transition-colors ${isEditing ? 'bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-slate-100' : 'bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-500 cursor-not-allowed'}`}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Location</label>
          <div className="relative">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg outline-none transition-colors ${isEditing ? 'bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-slate-100' : 'bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-slate-500 cursor-not-allowed'}`}
            />
            <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-slate-500" />
          </div>
        </div>


      </div>

      {isEditing && (
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Check className="w-5 h-5" />
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({ ...profile, lastName: profile.lastName || 'Customer' });
              setIsEditing(false);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border-2 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};