import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckSquare,
  FileText,
  Bell,
  Activity,
  Target,
  Calendar,
  Clock,
} from 'lucide-react';

// Mock data for demo
const mockMetrics = [
  { name: 'Tasks Completed', value: 24, change: '+12%', trend: 'up' },
  { name: 'Total Revenue', value: '$12,340', change: '+5.2%', trend: 'up' },
  { name: 'Active Projects', value: 8, change: '-2', trend: 'down' },
  { name: 'Team Productivity', value: '92%', change: '+3%', trend: 'up' },
];

const weeklyData = [
  { name: 'Mon', tasks: 4, revenue: 240 },
  { name: 'Tue', tasks: 6, revenue: 380 },
  { name: 'Wed', tasks: 8, revenue: 520 },
  { name: 'Thu', tasks: 5, revenue: 340 },
  { name: 'Fri', tasks: 9, revenue: 610 },
  { name: 'Sat', tasks: 3, revenue: 180 },
  { name: 'Sun', tasks: 2, revenue: 120 },
];

const categoryData = [
  { name: 'Development', value: 40, color: '#3b82f6' },
  { name: 'Design', value: 25, color: '#10b981' },
  { name: 'Marketing', value: 20, color: '#f59e0b' },
  { name: 'Planning', value: 15, color: '#ef4444' },
];

const Overview = () => {
  const [recentTasks] = useState([
    { id: 1, title: 'Complete project proposal', status: 'completed', priority: 'high' },
    { id: 2, title: 'Review design mockups', status: 'in-progress', priority: 'medium' },
    { id: 3, title: 'Update financial report', status: 'pending', priority: 'high' },
    { id: 4, title: 'Team meeting preparation', status: 'completed', priority: 'low' },
  ]);

  const [recentNotes] = useState([
    { id: 1, title: 'Product roadmap ideas', createdAt: '2024-01-15' },
    { id: 2, title: 'Client feedback summary', createdAt: '2024-01-14' },
    { id: 3, title: 'Market research notes', createdAt: '2024-01-13' },
  ]);

  const [upcomingReminders] = useState([
    { id: 1, title: 'Board meeting', time: '2024-01-16 10:00', priority: 'high' },
    { id: 2, title: 'Project deadline', time: '2024-01-17 17:00', priority: 'medium' },
    { id: 3, title: 'Client call', time: '2024-01-16 14:30', priority: 'high' },
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your productivity today.
          </p>
        </div>
        <Button className="btn-primary">
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Meeting
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockMetrics.map((metric, index) => (
          <Card key={index} className="metric-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {metric.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${
                metric.trend === 'up' ? 'text-success' : 'text-destructive'
              }`}>
                {metric.change} from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly Performance */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>
              Tasks completed and revenue generated this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Bar dataKey="tasks" fill="hsl(var(--primary))" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
            <CardDescription>
              Breakdown of tasks by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm">{category.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Tasks */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant={task.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {task.status}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          task.priority === 'high' ? 'border-destructive text-destructive' :
                          task.priority === 'medium' ? 'border-warning text-warning' :
                          'border-muted-foreground text-muted-foreground'
                        }`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notes */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentNotes.map((note) => (
                <div key={note.id}>
                  <p className="text-sm font-medium">{note.title}</p>
                  <p className="text-xs text-muted-foreground">{note.createdAt}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Upcoming Reminders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{reminder.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{reminder.time}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={reminder.priority === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {reminder.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productivity Goals */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Today's Progress
          </CardTitle>
          <CardDescription>
            Track your daily productivity goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Tasks Completed</span>
                <span className="text-sm text-muted-foreground">6/10</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Daily Revenue Target</span>
                <span className="text-sm text-muted-foreground">$450/$600</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Focus Time</span>
                <span className="text-sm text-muted-foreground">4.5/8 hours</span>
              </div>
              <Progress value={56} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Overview;