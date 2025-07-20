import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Plus, TrendingUp, TrendingDown, Activity, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { metricsAPI, Metric } from '../../api/metrics';
import { toast } from '@/hooks/use-toast';

const MetricsPage = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    unit: '',
    category: '',
  });

  // Mock data for demo
  const mockMetrics: Metric[] = [
    { id: '1', name: 'Website Traffic', value: 12450, unit: 'visitors', category: 'Marketing', timestamp: '2024-01-15T10:00:00Z', trend: 'up' },
    { id: '2', name: 'Conversion Rate', value: 3.2, unit: '%', category: 'Sales', timestamp: '2024-01-15T10:00:00Z', trend: 'up' },
    { id: '3', name: 'Server Response Time', value: 245, unit: 'ms', category: 'Performance', timestamp: '2024-01-15T10:00:00Z', trend: 'down' },
    { id: '4', name: 'Customer Satisfaction', value: 4.8, unit: '/5', category: 'Support', timestamp: '2024-01-15T10:00:00Z', trend: 'stable' },
    { id: '5', name: 'Monthly Revenue', value: 45670, unit: '$', category: 'Finance', timestamp: '2024-01-15T10:00:00Z', trend: 'up' },
    { id: '6', name: 'Active Users', value: 2847, unit: 'users', category: 'Engagement', timestamp: '2024-01-15T10:00:00Z', trend: 'up' },
  ];

  const chartData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 5000 },
    { name: 'Apr', value: 4500 },
    { name: 'May', value: 6000 },
    { name: 'Jun', value: 5500 },
  ];

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const data = await metricsAPI.getAll();
      setMetrics(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch metrics.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const metricData = {
        ...formData,
        value: parseFloat(formData.value),
      };

      if (editingMetric) {
        await metricsAPI.update(editingMetric.id, metricData);
        toast({
          title: "Metric updated",
          description: "Your metric has been successfully updated.",
        });
      } else {
        await metricsAPI.create(metricData);
        toast({
          title: "Metric created",
          description: "Your new metric has been successfully created.",
        });
      }

      setIsDialogOpen(false);
      setEditingMetric(null);
      setFormData({ name: '', value: '', unit: '', category: '' });
      fetchMetrics();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (metric: Metric) => {
    setEditingMetric(metric);
    setFormData({
      name: metric.name,
      value: metric.value.toString(),
      unit: metric.unit,
      category: metric.category,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await metricsAPI.delete(id);
      setMetrics(metrics.filter(metric => metric.id !== id));
      toast({
        title: "Metric deleted",
        description: "The metric has been successfully deleted.",
      });
      fetchMetrics();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete metric.",
        variant: "destructive",
      });
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metrics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and track your key performance indicators
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Metric
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMetric ? 'Edit Metric' : 'Create New Metric'}
              </DialogTitle>
              <DialogDescription>
                {editingMetric ? 'Update your metric details' : 'Add a new metric to track'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Metric Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Website Traffic"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="e.g., visitors, %, $"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Performance">Performance</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Engagement">Engagement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="btn-primary">
                  {editingMetric ? 'Update Metric' : 'Create Metric'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Overview Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Metrics Trend</CardTitle>
          <CardDescription>Performance over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" />
              <YAxis />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.id} className="metric-card group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {metric.category}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(metric.trend)}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleEdit(metric)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(metric.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                  {metric.name}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {metric.value.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {metric.unit}
                  </span>
                </div>
                <p className={`text-xs mt-2 ${getTrendColor(metric.trend)}`}>
                  Updated {new Date(metric.timestamp).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Breakdown */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Metrics by Category</CardTitle>
          <CardDescription>Distribution of metrics across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(
                metrics.reduce((acc, metric) => {
                  acc[metric.category] = (acc[metric.category] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([category, count]) => ({ category, count }))}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="category" />
              <YAxis />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsPage;