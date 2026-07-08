import { useState } from 'react';
import FarmerDashboard from '../components/dashboards/FarmerDashboard';
import CooperativeDashboard from '../components/dashboards/CooperativeDashboard';
import GovernmentDashboard from '../components/dashboards/GovernmentDashboard';
import ResearchDashboard from '../components/dashboards/ResearchDashboard';
import { useRole } from '../context/RoleContext';

const ROLES = [
  { id: 'farmer', label: 'Farmer' },
  { id: 'cooperative', label: 'Cooperative' },
  { id: 'government', label: 'Government' },
  { id: 'researcher', label: 'Research' },
] as const;

type Role = typeof ROLES[number]['id'];

export default function RoleDashboards() {
  const { role } = useRole();
  const [activeRole, setActiveRole] = useState<Role>(role === 'farmer' ? 'farmer' : 'cooperative');

  const CurrentComponent = 
    activeRole === 'farmer' ? FarmerDashboard :
    activeRole === 'cooperative' ? CooperativeDashboard :
    activeRole === 'government' ? GovernmentDashboard :
    ResearchDashboard;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Persistent Role Switcher — instant client-side, no reload */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-8 py-3 flex items-center gap-2">
          <div className="font-semibold text-lg tracking-tight mr-4">Role Dashboards</div>
          
          <div className="flex bg-slate-100 rounded-2xl p-1 text-sm">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveRole(r.id)}
                className={`px-8 py-1.5 rounded-[14px] font-medium transition-all ${
                  activeRole === r.id 
                    ? 'bg-white shadow-sm text-emerald-800' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          
          <div className="ml-auto text-xs text-slate-500 hidden md:block">
            All dashboards reuse shared components + live data services
          </div>
        </div>
      </div>

      {/* Selected role renders here — zero page reload */}
      <div>
        <CurrentComponent />
      </div>
    </div>
  );
}
