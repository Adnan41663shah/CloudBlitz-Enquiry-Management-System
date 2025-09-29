import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Mail, 
  Calendar,
  Shield,
  User,
  Crown,
  Search,
  UserPlus,
} from 'lucide-react';
import { getInitials, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';

const UserList: React.FC = () => {
  const [filters, setFilters] = useState({
    page: 1,
  });
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => userAPI.getAll(filters),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => userAPI.updateRole(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination;

  const handleRoleChange = (userId: string, newRole: string) => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteMutation.mutate(userId);
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'staff':
        return 'default';
      case 'user':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Crown;
      case 'staff':
        return Shield;
      case 'user':
        return User;
      default:
        return User;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage user accounts and their roles in the system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full sm:w-[200px] rounded-lg border border-input bg-background hover:bg-accent/10 focus:bg-background transition-colors duration-300"
            />
          </div>
          <Button variant="gradient" size="lg" className="group transition-all duration-300 hover:shadow-lg" asChild>
            <Link to="/users/new">
              <UserPlus className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              Create New User
            </Link>
          </Button>
        </div>
      </div>

      {/* Users Grid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center text-xl">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Users ({users.length})
            </CardTitle>
            <CardDescription>
              Manage system users and their permissions
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">No users found</p>
              <Button variant="gradient" asChild>
                <Link to="/users/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first user
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user: any) => {
                const RoleIcon = getRoleIcon(user.role);
                return (
                  <Card key={user._id} className="group hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Avatar size="lg">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-600/20 text-primary font-bold">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {user.name}
                            </h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <Mail className="mr-1 h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {/* Role Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Role</span>
                          <Badge 
                            variant={getRoleVariant(user.role) as any}
                            className="flex items-center"
                          >
                            <RoleIcon className="mr-1 h-3 w-3" />
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </div>
                        
                        {/* Created Date */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Created</span>
                          <div className="flex items-center text-sm text-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {formatDate(user.createdAt)}
                          </div>
                        </div>
                        
                        {/* Role Selector */}
                        <div className="pt-2 border-t">
                          <Select
                            value={user.role}
                            onValueChange={(role) => handleRoleChange(user._id, role)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">
                                <div className="flex items-center">
                                  <User className="mr-2 h-4 w-4" />
                                  User
                                </div>
                              </SelectItem>
                              <SelectItem value="staff">
                                <div className="flex items-center">
                                  <Shield className="mr-2 h-4 w-4" />
                                  Staff
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center">
                                  <Crown className="mr-2 h-4 w-4" />
                                  Admin
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex space-x-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link to={`/users/${user._id}/edit`}>
                              <Edit className="mr-1 h-3 w-3" />
                              Edit
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(user._id)}
                            className="text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/5"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t mt-6">
              <p className="text-sm text-muted-foreground">
                Showing{' '}
                <span className="font-medium">
                  {(filters.page - 1) * 10 + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(filters.page * 10, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span>{' '}
                results
              </p>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={filters.page === 1}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                    const page = i + Math.max(1, filters.page - 2);
                    return (
                      <Button
                        key={page}
                        variant={page === filters.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilters(prev => ({ ...prev, page }))}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={filters.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserList;
