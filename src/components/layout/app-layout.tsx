import React from 'react';
import { Outlet } from 'react-router';
import { useAppName } from '@/hooks/useAppName';
import { SidebarProvider } from '../ui/sidebar';
import SiteHeader from '../site-header';
import { AppSidebar } from '../sidebar/app-sidebar';
import { AdminSidebar } from '../sidebar/AdminSidebar';

interface AppLayoutProps {
  isAdmin: boolean
}

const AppLayout: React.FC<AppLayoutProps> = ({ isAdmin }) => {
  const { fullName } = useAppName();
  return (
    <SidebarProvider className="flex flex-col w-full h-screen">
      <SiteHeader />
      <div className="w-full bg-gray-100 flex-1 overflow-hidden">
        <div className="flex flex-row h-full">
          {isAdmin ? <AdminSidebar /> : <AppSidebar />}
          <div className="w-full flex flex-col overflow-hidden">
            <div className="flex items-center mt-2 gap-0 justify-center text-primary text-center rounded-md font-bold text-3xl">{fullName}</div>
            <div className="bg-white flex-1 overflow-auto">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
