import { useRole } from '../context/RoleContext';
import { User, Settings, Bell, LogOut, Camera, Shield, Edit2, Mail, Building } from 'lucide-react';
import { useState } from 'react';

export default function Profile() {
  const { role, user, logout } = useRole();
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'system'>('system');

  if (!user) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
          <p className="text-slate-500">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tighter">Profile</h1>
          <p className="text-slate-500 mt-1">Manage your account, preferences, and activity</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-2xl text-sm hover:bg-slate-50 transition"
        >
          <Edit2 className="w-4 h-4" /> {isEditing ? 'Done' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
          <div className="relative inline-block mb-5">
            <div className="w-28 h-28 rounded-full bg-emerald-100 flex items-center justify-center text-5xl font-semibold text-emerald-800 ring-4 ring-white">
              {user.name.charAt(0)}
            </div>
            <button className="absolute bottom-1 right-1 bg-white p-2.5 rounded-full border shadow-sm hover:bg-slate-50 transition">
              <Camera className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          
          <div className="font-semibold text-2xl tracking-tight">{user.name}</div>
          <div className="inline-flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full mt-1.5 capitalize font-medium">
            <Shield className="w-3.5 h-3.5" /> {role}
          </div>
          
          <div className="mt-4 pt-4 border-t text-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <Building className="w-4 h-4" />
              <span>{user.organization}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 mt-1.5">
              <Mail className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Details + Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
            <h3 className="font-semibold mb-5 flex items-center gap-2 text-lg">
              <User className="w-5 h-5 text-emerald-700" /> Personal Information
            </h3>
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Full Name</div>
                <div className="font-medium text-base">{user.name}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Role</div>
                <div className="font-medium text-base capitalize">{role}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Organization</div>
                <div className="font-medium text-base">{user.organization}</div>
              </div>
              <div>
                <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Email</div>
                <div className="font-medium text-base">{user.email}</div>
              </div>
              {isEditing && (
                <div className="md:col-span-2 mt-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-2xl">
                  Editing enabled in production (contact support@smartland.vn)
                </div>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
            <h3 className="font-semibold mb-5 flex items-center gap-2 text-lg">
              <Settings className="w-5 h-5 text-emerald-700" /> Preferences &amp; Settings
            </h3>
            <div className="space-y-5 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-xs text-slate-500">Email and SMS alerts</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={notificationsEnabled} 
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Theme</div>
                  <div className="text-xs text-slate-500">Interface appearance</div>
                </div>
                <select 
                  value={theme} 
                  onChange={(e) => setTheme(e.target.value as 'light' | 'system')}
                  className="bg-white border border-slate-200 text-sm px-3 py-1.5 rounded-2xl"
                >
                  <option value="light">Light</option>
                  <option value="system">System (Auto)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Language</div>
                  <div className="text-xs text-slate-500">Display language</div>
                </div>
                <div className="text-emerald-700 font-medium text-sm">English • Tiếng Việt</div>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
            <h3 className="font-semibold mb-5 flex items-center gap-2 text-lg">
              <Bell className="w-5 h-5 text-emerald-700" /> Recent Activity
            </h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between border-b border-slate-100 pb-2.5"><span>Last login</span><span className="font-medium">Today at 09:14</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-2.5"><span>Recommendations viewed</span><span className="font-medium">14 this week</span></div>
              <div className="flex justify-between"><span>Location analyses</span><span className="font-medium">3 this month</span></div>
            </div>
          </div>

          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 py-3.5 border border-red-200 hover:bg-red-50 text-red-600 rounded-3xl font-medium text-sm transition-all active:scale-[0.985]"
          >
            <LogOut className="w-4 h-4" /> Sign Out of Account
          </button>
        </div>
      </div>
    </div>
  );
}
