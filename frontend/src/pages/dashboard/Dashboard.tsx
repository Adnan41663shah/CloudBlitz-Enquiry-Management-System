import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { enquiryAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { StatsCard } from '../../components/ui/stats-card';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { 
  FileText, 
  CheckCircle, 
  Users, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Activity,
  Eye,
  Calendar,
  Search,
  BarChart3,
  Sparkles,

} from 'lucide-react';
import { getInitials, formatDateTime, capitalize } from '../../lib/utils';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  // Get stats for each status separately for accurate counts
  const { data: allEnquiriesData } = useQuery({
    queryKey: ['enquiries', 'dashboard-all-stats'],
    queryFn: () => enquiryAPI.getAll({ limit: 1 }), // Just get total count
  });
  
  const { data: newEnquiriesData } = useQuery({
    queryKey: ['enquiries', 'dashboard-new-stats'],
    queryFn: () => enquiryAPI.getAll({ status: 'new', limit: 1 }), // Just get count
  });
  
  const { data: inProgressEnquiriesData } = useQuery({
    queryKey: ['enquiries', 'dashboard-progress-stats'],
    queryFn: () => enquiryAPI.getAll({ status: 'in_progress', limit: 1 }), // Just get count
  });
  
  const { data: closedEnquiriesData } = useQuery({
    queryKey: ['enquiries', 'dashboard-closed-stats'],
    queryFn: () => enquiryAPI.getAll({ status: 'closed', limit: 1 }), // Just get count
  });
  
  // Get filtered enquiries for display
  const { data: filteredEnquiriesData, isLoading } = useQuery({
    queryKey: ['enquiries', 'dashboard-filtered', activeTab],
    queryFn: () => {
      const filters: any = { limit: 10 };
      if (activeTab !== 'all') {
        filters.status = activeTab;
      }
      return enquiryAPI.getAll(filters);
    },
  });

  // Use filtered data for display
  const enquiries = filteredEnquiriesData?.data?.enquiries || [];
  
  // Get actual counts from pagination totals
  const totalEnquiries = allEnquiriesData?.data?.pagination?.total || 0;
  const statusCounts = {
    new: newEnquiriesData?.data?.pagination?.total || 0,
    in_progress: inProgressEnquiriesData?.data?.pagination?.total || 0,
    closed: closedEnquiriesData?.data?.pagination?.total || 0,
  };

  const stats = [
    { 
      title: 'Total Enquiries', 
      value: totalEnquiries, 
      icon: BarChart3,
      color: 'blue' as const,
      trend: { value: 12, isPositive: true }
    },
    { 
      title: 'New Enquiries', 
      value: statusCounts.new || 0, 
      icon: Sparkles,
      color: 'green' as const,
      trend: { value: 8, isPositive: true }
    },
    { 
      title: 'In Progress', 
      value: statusCounts.in_progress || 0, 
      icon: Activity,
      color: 'yellow' as const,
      trend: { value: 3, isPositive: false }
    },
    { 
      title: 'Completed', 
      value: statusCounts.closed || 0, 
      icon: CheckCircle,
      color: 'purple' as const,
      trend: { value: 15, isPositive: true }
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-br from-primary to-purple-600 bg-clip-text text-fuchsia-900 flex items-center">
            <Sparkles className="mr-2 h-6 w-6 text-primary animate-pulse" />
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Here's what's happening with your enquiry management system today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
            <input 
              type="text" 
              placeholder="Search enquiries..." 
              className="w-full sm:w-auto h-10 pl-10 pr-4 rounded-xl bg-slate-100/80 border-0 focus:ring-2 focus:ring-primary/30 transition-all duration-300 placeholder:text-muted-foreground/70"
            />
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 transition-all duration-300 hover:border-primary/50">
            <Calendar className="h-4 w-4" />
            Today
          </Button>
          <Button variant="gradient" size="sm" asChild className="hidden sm:flex items-center gap-2 transition-all duration-300 hover:scale-105 bg-purple-800">
            <Link to="/enquiries/new">
              <Plus className="h-4 w-4" />
              New Enquiry
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div 
            key={stat.title}
            className="transition-all duration-500 ease-in-out" 
            style={{ 
              animationDelay: `${index * 100}ms`,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
            <StatsCard
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              trend={stat.trend}
            />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Enquiries */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl font-semibold">Recent Enquiries</CardTitle>
                <CardDescription>
                  Latest customer enquiries and their status
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/enquiries" className="flex items-center">
                  View all <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            
            {/* Status Filter Tabs */}
            <div className="px-6 pb-4">
              <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
                {[
                  { id: 'all', name: 'All', count: totalEnquiries },
                  { id: 'new', name: 'New', count: statusCounts.new || 0 },
                  { id: 'in_progress', name: 'In Progress', count: statusCounts.in_progress || 0 },
                  { id: 'closed', name: 'Closed', count: statusCounts.closed || 0 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    {tab.name}
                    <Badge 
                      variant="secondary" 
                      className="ml-2 text-xs"
                    >
                      {tab.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
            
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
              ) : enquiries.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground mb-4">No enquiries found</p>
                  <Button variant="gradient" asChild className="transition-all duration-300 hover:scale-105">
                    <Link to="/enquiries/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Create your first enquiry
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {enquiries.map((enquiry: any) => (
                    <div
                      key={enquiry._id}
                      className="flex items-center space-x-4 p-4 rounded-lg border border-slate-200/60 hover:bg-accent/50 transition-all duration-300 cursor-pointer group"
                      onClick={() => window.location.href = `/enquiries/${enquiry._id}`}
                    >
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-600/20 text-primary font-semibold">
                          {getInitials(enquiry.customerName)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {enquiry.customerName}
                          </p>
                          <Badge 
                            variant={enquiry.status === 'new' ? 'success' : enquiry.status === 'in_progress' ? 'warning' : 'secondary'}
                            className="transition-all duration-300 group-hover:scale-105"
                          >
                            {capitalize(enquiry.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {enquiry.email}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground mt-2 space-x-4">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDateTime(enquiry.createdAt)}
                          </div>
                          {enquiry.assignedTo && (
                            <div className="flex items-center">
                              <Users className="mr-1 h-3 w-3" />
                              {enquiry.assignedTo.name}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-primary"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Frequently used actions for efficient workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <Button className="w-full justify-start group transition-all duration-300 hover:scale-[1.02] bg-amber-500" variant="gradient" asChild>
                <Link to="/enquiries/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Enquiry
                  <ArrowRight className="ml-auto h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button className="w-full justify-start group transition-all duration-300" variant="outline" asChild>
                <Link to="/enquiries">
                  <FileText className="mr-2 h-4 w-4" />
                  View All Enquiries
                  <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              {user?.role === 'admin' && (
                <Button className="w-full justify-start group transition-all duration-300" variant="outline" asChild>
                  <Link to="/users">
                    <Users className="mr-2 h-4 w-4" />
                    Manage Users
                    <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Staff Section */}
          {user?.role === 'staff' && (
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardHeader className="bg-slate-50/50">
                <CardTitle className="flex items-center text-lg">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Staff Dashboard
                </CardTitle>
                <CardDescription>
                  Your assigned enquiries and tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                <Button className="w-full justify-start group transition-all duration-300 hover:scale-[1.02]" variant="default" asChild>
                  <Link to="/staff-enquiries">
                    <Activity className="mr-2 h-4 w-4" />
                    My Assigned Enquiries
                    <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex justify-between">
                      <span>Assigned to me:</span>
                      <span className="font-semibold">
                        {enquiries.filter((e: any) => e.assignedTo?._id === user?.id).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-semibold text-amber-600">
                        {enquiries.filter((e: any) => e.assignedTo?._id === user?.id && e.status !== 'closed').length}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Status */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="flex items-center text-lg">
                <Activity className="mr-2 h-5 w-5 text-emerald-500" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors duration-300">
                  <span className="text-sm text-muted-foreground">API Status</span>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors duration-300">
                  <span className="text-sm text-muted-foreground">Database</span>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                    <span className="text-sm font-medium text-emerald-600">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors duration-300">
                  <span className="text-sm text-muted-foreground">Last Updated</span>
                  <span className="text-sm font-medium">Just now</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
