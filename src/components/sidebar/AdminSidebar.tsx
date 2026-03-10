import * as React from 'react';
import { ChevronsRight, ChevronsLeft, Eye, Inbox } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarRail, SidebarSeparator, useSidebar } from '@/components/ui/sidebar';
import { Separator } from '@radix-ui/react-separator';
import { useNavigate } from 'react-router';
import { clearAllStorage } from '@/lib/helperFunction';
import { environment } from '@/config';
import { NavItem } from '@/types/types';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar();
  const { Roles } = useAppSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const data: NavItem[] = [
    {
      title: 'Admin Dashboard',
      url: '/admin-dashboard',
      icon: LayoutDashboard,
      roles: ['superAdmin', 'EmployeeAssigningAuthority'],
    },
    {
      title: 'Manage Admin',
      url: '/manage-admin',
      icon: LayoutDashboard,
      roles: ['superAdmin'],
    },
    {
      title: 'Transfer Requests (HR)',
      url: '/hr-request-recieved',
      icon: LayoutDashboard,
      roles: ['HR'],
    },
    {
      title: 'Transfer Requests (RO)',
      url: '/reporting-request-recieved',
      icon: Inbox,
      roles: ['ReportingOfficer'],
    },
    {
      title: 'Transfer Requests (CGM)',
      url: '/cgm-request-recieved',
      icon: Inbox,
      roles: ['CGM',],
    },
  ];

  const navMainItems = data.filter((item) => item.roles.some((role) => Roles.includes(role)));
  const handleLogout = () => {
    clearAllStorage();
    window.location.href = environment.exitUrl;
  };
  return (
    <Sidebar collapsible="icon" {...props} className={state === 'collapsed' ? 'sidebar-collapsed' : ''}>
      <div className="flex justify-end md:pt-[90px] ">
        {state === 'collapsed' ? (
          <ChevronsRight onClick={toggleSidebar} className="w-8 h-8 cursor-pointer" />
        ) : (
          <ChevronsLeft onClick={toggleSidebar} className="w-8 h-8 cursor-pointer" />
        )}
      </div>
      <SidebarSeparator />
      <SidebarContent>
        <NavMain items={[...(navMainItems ?? [])]} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuButton
            onClick={() => navigate('/transfer-request')}
            asChild
            tooltip={' Manage Personal View'}
            className={`transition-all text-black cursor-pointer duration-300  active:bg-primary [&>svg]:size-7 ease-in-out hover:bg-primary hover:text-white h-full w-full active:text-white`}
          >
            <div className={`flex items-center gap-2`}>
              <Eye size={24} />
              <span> Manage Personal View</span>
            </div>
          </SidebarMenuButton>

          <Separator />
          <SidebarMenuButton
            onClick={handleLogout}
            asChild
            tooltip={'Exit'}
            className={`transition-all hidden sm:flex cursor-pointer duration-300  active:bg-primary [&>svg]:size-7 ease-in-out hover:bg-primary hover:text-white h-full w-full`}
          >
            <div className={`flex items-center gap-2`}>
              <LogOut size={24} />
              <span>Exit</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
