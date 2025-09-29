import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Crown, 
  Loader2, 
  Save,
  UserPlus
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'staff' | 'user';
}

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const queryClient = useQueryClient();

  // Fetch user data for editing
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userAPI.getAll({ page: 1, limit: 1000 }), // Get all users to find the specific one
    enabled: isEdit && !!id,
  });

  // Find the specific user from the list
  const user = userData?.data?.users?.find((u: any) => u._id === id);

  useEffect(() => {
    if (isEdit && user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Don't pre-fill password
        role: user.role
      });
    }
  }, [isEdit, user]);

  const createMutation = useMutation({
    mutationFn: userAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully!');
      navigate('/users');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserFormData> }) => 
      userAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully!');
      navigate('/users');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit) {
      // For updates, only send fields that have changed
      const updateData: Partial<UserFormData> = {};
      if (formData.name !== user.name) updateData.name = formData.name;
      if (formData.email !== user.email) updateData.email = formData.email;
      if (formData.role !== user.role) updateData.role = formData.role;
      if (formData.password) updateData.password = formData.password;
      
      updateMutation.mutate({ id: id!, data: updateData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isEdit && isLoadingUser) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto space-y-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="group mb-2 hover:bg-slate-100/80 transition-all duration-300" 
            onClick={() => navigate('/users')}
          >
            <ArrowLeft className="mr-1 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Back to Users
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {isEdit ? 'Edit User' : 'Create New User'}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isEdit ? 'Update user information and permissions' : 'Add a new user to the system'}
          </p>
        </div>
        {isEdit && (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
          </div>
        )}
      </div>

      <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-slate-50/50 rounded-t-lg">
          <CardTitle className="text-xl flex items-center">
            {isEdit ? (
              <User className="mr-2 h-5 w-5 text-primary" />
            ) : (
              <UserPlus className="mr-2 h-5 w-5 text-primary" />
            )}
            {isEdit ? 'User Details' : 'New User Information'}
          </CardTitle>
          <CardDescription>
            {isEdit ? 'Update the user information below' : 'Fill in the details to create a new user'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-input bg-background hover:bg-accent/10 focus:bg-background transition-colors duration-300"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 pr-4 py-2 w-full rounded-lg border border-input bg-background hover:bg-accent/10 focus:bg-background transition-colors duration-300"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password {isEdit ? '(leave blank to keep current)' : '*'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  name="password"
                  id="password"
                  required={!isEdit}
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-input bg-background hover:bg-accent/10 focus:bg-background transition-colors duration-300"
                  placeholder={isEdit ? 'Enter new password (optional)' : 'Enter password'}
                />
              </div>
              {isEdit && (
                <p className="text-sm text-muted-foreground">
                  Leave password blank to keep the current password
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-foreground">
                Role *
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select
                  name="role"
                  id="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-input bg-background hover:bg-accent/10 focus:bg-background transition-colors duration-300 appearance-none"
                >
                  <option value="user">User</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100 transition-all duration-300 hover:shadow-sm">
                  <div className="flex items-center mb-1">
                    <User className="h-4 w-4 mr-1 text-slate-500" />
                    <span className="font-medium text-sm">User</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Can create enquiries, view own data</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100 transition-all duration-300 hover:shadow-sm">
                  <div className="flex items-center mb-1">
                    <Shield className="h-4 w-4 mr-1 text-primary" />
                    <span className="font-medium text-sm">Staff</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Enquiry management, limited access</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50/80 border border-slate-100 transition-all duration-300 hover:shadow-sm">
                  <div className="flex items-center mb-1">
                    <Crown className="h-4 w-4 mr-1 text-amber-500" />
                    <span className="font-medium text-sm">Admin</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Full system access, user management</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/users')}
                className="transition-all duration-300 hover:border-slate-300"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="gradient" 
                className="group transition-all duration-300 hover:shadow-md"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    {isEdit ? 'Update User' : 'Create User'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserForm;
