import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Calendar as CalendarIcon, Clock, Bell, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { format, addDays, addHours, isAfter, isBefore, addMinutes } from 'date-fns';
import { Reminder, remindersAPI } from '../../api/reminders';
import { toast } from '@/hooks/use-toast';

const RemindersPage = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminderTime: new Date(),
    taskId: '',
  });

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const data = await remindersAPI.getAll();
      // Map backend fields to frontend Reminder type
      const mapped = data.map((reminder: any) => ({
        id: reminder.id,
        title: reminder.title,
        description: reminder.message ?? reminder.description ?? '',
        // Use the reminder.remindAt as local time string
        reminderTime: reminder.remindAt
          ? reminder.remindAt.replace('Z', '') // Remove Z if present
          : reminder.reminderTime
            ? reminder.reminderTime.replace('Z', '')
            : new Date().toISOString(),
        isCompleted: reminder.isCompleted ?? false,
        taskId: reminder.taskId,
        createdAt: reminder.createdAt ?? '',
      }));
      setReminders(mapped);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch reminders.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Instead of toISOString (which converts to UTC), send a local ISO string
      const localISO = formData.reminderTime.getFullYear() + '-' +
        String(formData.reminderTime.getMonth() + 1).padStart(2, '0') + '-' +
        String(formData.reminderTime.getDate()).padStart(2, '0') + 'T' +
        String(formData.reminderTime.getHours()).padStart(2, '0') + ':' +
        String(formData.reminderTime.getMinutes()).padStart(2, '0') + ':00';
      const reminderData = {
        message: formData.description, // Backend expects 'message'
        remindAt: localISO, // Send local time string
        title: formData.title,
        taskId: formData.taskId || undefined,
        isCompleted: false,
      };

      if (editingReminder) {
        await remindersAPI.update(editingReminder.id, reminderData);
        toast({
          title: "Reminder updated",
          description: "Your reminder has been successfully updated.",
        });
      } else {
        await remindersAPI.create(reminderData);
        toast({
          title: "Reminder created",
          description: "Your new reminder has been successfully created.",
        });
      }

      setIsDialogOpen(false);
      setEditingReminder(null);
      setFormData({
        title: '',
        description: '',
        reminderTime: new Date(),
        taskId: '',
      });
      fetchReminders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async (id: string) => {
    try {
      // Optionally, call remindersAPI.markCompleted if supported
      setReminders(reminders.map(reminder => 
        reminder.id === id ? { ...reminder, isCompleted: !reminder.isCompleted } : reminder
      ));
      toast({
        title: "Reminder updated",
        description: "Reminder status has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reminder status.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setFormData({
      title: reminder.title,
      description: reminder.description,
      reminderTime: new Date(reminder.reminderTime),
      taskId: reminder.taskId || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await remindersAPI.delete(id);
      setReminders(reminders.filter(reminder => reminder.id !== id));
      toast({
        title: "Reminder deleted",
        description: "The reminder has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete reminder.",
        variant: "destructive",
      });
    }
  };

  const filteredReminders = reminders.filter(reminder => {
    if (filterStatus === 'completed') return reminder.isCompleted;
    if (filterStatus === 'pending') return !reminder.isCompleted;
    return true;
  });

  const getTimeBadge = (reminderTime: string) => {
    const now = new Date();
    const time = new Date(reminderTime);
    
    if (isBefore(time, now)) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (isBefore(time, addHours(now, 1))) {
      return <Badge variant="default">Due Soon</Badge>;
    } else if (isBefore(time, addDays(now, 1))) {
      return <Badge variant="secondary">Today</Badge>;
    } else {
      return <Badge variant="outline">Upcoming</Badge>;
    }
  };

  const getTimeDisplay = (reminderTime: string) => {
    const time = new Date(reminderTime);
    const now = new Date();
    if (isBefore(time, now)) {
      return `${format(time, 'MMM d, h:mm a')}`;
    } else {
      return format(time, 'MMM d, h:mm a');
    }
  };

  const sortedReminders = [...filteredReminders].sort((a, b) => {
    // Sort by completion status first (incomplete first), then by time
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return new Date(a.reminderTime).getTime() - new Date(b.reminderTime).getTime();
  });

  const upcomingCount = reminders.filter(r => !r.isCompleted && isAfter(new Date(r.reminderTime), new Date())).length;
  const overdueCount = reminders.filter(r => !r.isCompleted && isBefore(new Date(r.reminderTime), new Date())).length;
  const completedCount = reminders.filter(r => r.isCompleted).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground">
            Never miss important deadlines and meetings
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
              </DialogTitle>
              <DialogDescription>
                {editingReminder ? 'Update your reminder details' : 'Set up a new reminder'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter reminder title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter reminder description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reminder Date & Time</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.reminderTime, 'PPP p')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.reminderTime}
                        onSelect={(date) => {
                          if (date) {
                            const newDate = new Date(date);
                            newDate.setHours(formData.reminderTime.getHours());
                            newDate.setMinutes(formData.reminderTime.getMinutes());
                            setFormData({ ...formData, reminderTime: newDate });
                          }
                        }}
                        initialFocus
                      />
                      <div className="p-3 border-t">
                        <Label>Time</Label>
                        <Input
                          type="time"
                          value={format(formData.reminderTime, 'HH:mm')}
                          onChange={(e) => {
                            const [hours, minutes] = e.target.value.split(':').map(Number);
                            const newDate = new Date(formData.reminderTime);
                            newDate.setHours(hours);
                            newDate.setMinutes(minutes);
                            setFormData({ ...formData, reminderTime: newDate });
                          }}
                          className="mt-2"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="btn-primary">
                  {editingReminder ? 'Update Reminder' : 'Create Reminder'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled reminders
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueCount}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{completedCount}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reminders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminders List */}
      <div className="space-y-4">
        {sortedReminders.map((reminder) => (
          <Card key={reminder.id} className="glass-card group">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Checkbox
                    checked={reminder.isCompleted}
                    onCheckedChange={() => handleComplete(reminder.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${
                      reminder.isCompleted ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {reminder.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {reminder.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      {!reminder.isCompleted && getTimeBadge(reminder.reminderTime)}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Bell className="h-3 w-3" />
                        {getTimeDisplay(reminder.reminderTime)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(reminder)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(reminder.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedReminders.length === 0 && (
          <Card className="glass-card">
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Bell className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No reminders found</p>
                <p className="text-sm text-muted-foreground">
                  Create your first reminder to stay organized
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RemindersPage;