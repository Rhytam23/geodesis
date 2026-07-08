import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'farmer' | 'cooperative' | 'government' | 'research' | 'public';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  user: {
    name: string;
    organization: string;
    email: string;
  } | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('farmer');
  const [user, setUser] = useState<any>(null);

  const login = (newRole: UserRole) => {
    setRole(newRole);
    setUser({
      name: newRole === 'farmer' ? 'Nguyen Van Minh' : 
            newRole === 'cooperative' ? 'Kien Giang Rice Coop' :
            newRole === 'government' ? 'MARD Official' : 'Dr. Tran Thi Lan',
      organization: newRole === 'farmer' ? 'Smallholder Farm, An Giang' :
                    newRole === 'cooperative' ? 'Kien Giang Cooperative' :
                    newRole === 'government' ? 'Ministry of Agriculture (MARD)' : 'Can Tho University',
      email: `${newRole}@smartland.vn`
    });
  };

  const logout = () => {
    setRole('public');
    setUser(null);
  };

  return (
    <RoleContext.Provider value={{
      role,
      setRole,
      isAuthenticated: !!user,
      user,
      login,
      logout
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within RoleProvider');
  return context;
};
