import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import EnquiryList from '../pages/dashboard/EnquiryList';
import EnquiryForm from '../pages/dashboard/EnquiryForm';
import EnquiryDetail from '../pages/dashboard/EnquiryDetail';
import StaffEnquiries from '../pages/dashboard/StaffEnquiries';
import UserList from '../pages/users/UserList';
import UserForm from '../pages/users/UserForm';

// Components
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/Layout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enquiries"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EnquiryList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enquiries/new"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EnquiryForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/enquiries/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <EnquiryDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-enquiries"
              element={
                <ProtectedRoute requiredRole="staff">
                  <Layout>
                    <StaffEnquiries />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <UserList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/new"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <UserForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/:id/edit"
              element={
                <ProtectedRoute requiredRole="admin">
                  <Layout>
                    <UserForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  );
};

export default AppRoutes;
