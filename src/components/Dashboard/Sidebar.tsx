import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Home,
  BarChart3,
  CheckSquare,
  FileText,
  DollarSign,
  Bell,
  TrendingUp,
} from 'lucide-react';

const navigationItems = [
  { title: 'Overview', url: '/', icon: Home },
  { title: 'Metrics', url: '/metrics', icon: BarChart3 },
  { title: 'Tasks', url: '/tasks', icon: CheckSquare },
  { title: 'Notes', url: '/notes', icon: FileText },
  { title: 'Finance', url: '/finance', icon: DollarSign },
  { title: 'Reminders', url: '/reminders', icon: Bell },
];

const Sidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <SidebarUI
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } border-r border-sidebar-border bg-sidebar transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="p-4">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-primary-foreground">M</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">My Dashboard</h1>
              <p className="text-xs text-sidebar-foreground/60">Personal Management</p>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className={({ isActive: active }) =>
                        `sidebar-nav-item ${
                          active || isActive(item.url) ? 'active' : ''
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarUI>
  );
};

export default Sidebar;