import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, Settings, LogOut, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { tasksAPI } from '@/api/tasks';
import { notesAPI } from '@/api/notes';
import { remindersAPI, Reminder } from '@/api/reminders';
import { format } from 'date-fns';

const Header = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [remindersOpen, setRemindersOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  // Fetch reminders when dropdown opens
  const fetchReminders = async () => {
    try {
      const data = await remindersAPI.getAll();
      // Map backend fields to frontend Reminder type
      const mapped = data.map((reminder: any) => ({
        id: reminder.id,
        title: reminder.title || reminder.message || reminder.description || 'Untitled Reminder',
        description: reminder.message ?? reminder.description ?? '',
        reminderTime: reminder.remindAt ?? reminder.reminderTime ?? new Date().toISOString(),
        isCompleted: reminder.isCompleted ?? false,
        taskId: reminder.taskId,
        createdAt: reminder.createdAt ?? '',
      }));
      setReminders(mapped);
    } catch {
      setReminders([]);
    }
  };

  // Get next 5 upcoming reminders
  const upcomingReminders = reminders
    .filter(r => !r.isCompleted && new Date(r.reminderTime) > new Date())
    .sort((a, b) => new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime())
    .slice(0, 5);

  // Search handler
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    try {
      const [tasks, notes, reminders] = await Promise.all([
        tasksAPI.getAll(),
        notesAPI.getAll(),
        remindersAPI.getAll(),
      ]);
      const q = query.toLowerCase();
      const filteredTasks = tasks.filter((t: any) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
      const filteredNotes = notes.filter((n: any) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
      const filteredReminders = reminders.filter((r: any) => (r.title || '').toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q));
      setSearchResults([
        ...filteredTasks.map((t: any) => ({ type: 'Task', ...t })),
        ...filteredNotes.map((n: any) => ({ type: 'Note', ...n })),
        ...filteredReminders.map((r: any) => ({ type: 'Reminder', ...r })),
      ]);
      setSearchOpen(true);
    } catch {
      setSearchResults([]);
      setSearchOpen(false);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl">
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="h-9 w-9" />
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search across your workspace..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-96 bg-background/50 border-border/50"
              onFocus={() => { if (searchQuery) setSearchOpen(true); }}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            />
            {searchOpen && searchResults.length > 0 && (
              <div
                className="absolute left-0 top-full mt-1 min-w-[24rem] w-full bg-card border border-border rounded-xl shadow-2xl z-[100] max-h-80 overflow-y-auto p-2"
                style={{ boxShadow: '0 8px 32px 0 rgba(0,0,0,0.18)' }}
              >
                {searchResults.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="px-4 py-2 mb-1 last:mb-0 hover:bg-muted cursor-pointer flex flex-col rounded-lg transition-colors"
                    style={{ minHeight: '48px' }}
                  >
                    <span className="text-xs text-muted-foreground mb-1">{item.type}</span>
                    <span className="font-medium truncate">{item.title || item.name}</span>
                    {item.type === 'Task' && <span className="text-xs">{item.status}</span>}
                    {item.type === 'Note' && <span className="text-xs">{item.content?.slice(0, 40)}</span>}
                    {item.type === 'Reminder' && <span className="text-xs">{item.reminderTime ? new Date(item.reminderTime).toLocaleString() : ''}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <DropdownMenu open={remindersOpen} onOpenChange={(open) => {
            setRemindersOpen(open);
            if (open) fetchReminders();
          }}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {upcomingReminders.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                    {upcomingReminders.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Upcoming Reminders</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {upcomingReminders.length === 0 && (
                <DropdownMenuItem disabled>No upcoming reminders</DropdownMenuItem>
              )}
              {upcomingReminders.map((reminder) => (
                <DropdownMenuItem key={reminder.id} disabled>
                  <div className="flex flex-col">
                    <span className="font-medium">{reminder.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(reminder.reminderTime), 'PPP p')}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 px-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {user ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;