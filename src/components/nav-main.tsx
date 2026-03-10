import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from './ui/sidebar';
import { NavItem } from '@/types/types';
import { NavLink } from 'react-router';

export function NavMain({ items }: { items: NavItem[] }) {
  const { setOpenMobile } = useSidebar();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleOpen = (title: string) => {
    setOpenItems((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]));
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const hasChildren = !!item.children?.length;
          const isOpen = openItems.includes(item.title);

          return (
            <SidebarMenuItem key={item.title}>
              {hasChildren ? (
                <SidebarMenuButton
                  onClick={() => toggleOpen(item.title)}
                  tooltip={item.title}
                  className="flex items-center justify-between gap-2 hover:bg-primary hover:text-white"
                >
                  <div className="flex items-center gap-2">
                    {item.icon && <item.icon size={24} />}
                    <span>{item.title}</span>
                  </div>
                  {isOpen ? <ChevronDown size={24} /> : <ChevronRight size={24} />}
                </SidebarMenuButton>
              ) : (
                <NavLink to={item.url!} onClick={() => setOpenMobile(false)}>
                  {({ isActive }) => (
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={`transition-all duration-300 hover:bg-primary active:bg-primary [&>svg]:size-7 ease-in-out ${
                        isActive ? 'bg-primary text-primary hover:text-white h-full w-full' : ' hover:text-white  h-full'
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          isActive ? 'bg-primary text-white hover:text-white h-full w-full' : 'hover:bg-primary hover:text-white active:text-white  h-full'
                        }`}
                      >
                        {item.icon && <item.icon size={24} />}
                        <span className={isActive ? 'font-bold' : 'font-normal'}>{item.title}</span>
                      </div>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              )}

              {hasChildren && isOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <SidebarMenuItem key={child.title}>
                      <NavLink to={child.url!} onClick={() => setOpenMobile(false)}>
                        {({ isActive }) => (
                          <SidebarMenuButton
                            asChild
                            tooltip={child.title}
                            className={`transition-all duration-300 hover:bg-primary active:bg-primary [&>svg]:size-7 h-12 ease-in-out ${
                              isActive ? 'bg-primary text-white hover:text-white h-full w-full' : ' hover:text-white  h-full'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={isActive ? 'font-bold' : 'font-normal'}>{child.title}</span>
                            </div>
                          </SidebarMenuButton>
                        )}
                      </NavLink>
                    </SidebarMenuItem>
                  ))}
                </div>
              )}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
