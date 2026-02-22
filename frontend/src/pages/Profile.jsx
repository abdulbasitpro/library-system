import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Shield, Calendar, Settings } from 'lucide-react';
import Button from '../components/common/Button';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Your Profile</h2>
        <p className="text-slate-500">Manage your account information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
            <div className="h-24 w-24 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
              <User className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold">{user?.name}</h3>
            <p className="text-slate-500 text-sm capitalize">{user?.role}</p>
            
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <Button variant="secondary" className="w-full text-xs">Edit Avatar</Button>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-bold flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-600" />
                Account Settings
              </h4>
              <Button variant="ghost" className="text-xs text-indigo-600">Save Changes</Button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Full Name</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Email Address</label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium">{user?.email}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Security Role</label>
                <div className="flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                  <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 capitalize">{user?.role}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Member Since</label>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium">February 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
