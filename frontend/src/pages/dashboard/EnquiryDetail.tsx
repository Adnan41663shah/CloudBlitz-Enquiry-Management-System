import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enquiryAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeftIcon, CalendarIcon, UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const EnquiryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('');

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['enquiry', id],
    queryFn: () => enquiryAPI.getById(id!),
    enabled: !!id,
  });

  // Fetch staff users for assignment (admin only)
  const { data: staffData } = useQuery({
    queryKey: ['staff'],
    queryFn: () => enquiryAPI.getStaffList(),
    enabled: user?.role === 'admin',
  });

  const enquiry = data?.data?.enquiry;
  const staffUsers = staffData?.data?.staff || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => enquiryAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiry', id] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      toast.success('Enquiry updated successfully!');
      setIsAssigning(false);
      setSelectedStaff('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update enquiry');
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) => 
      enquiryAPI.assign(id, { assignedTo }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiry', id] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      toast.success('Enquiry assigned successfully!');
      setIsAssigning(false);
      setSelectedStaff('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to assign enquiry');
    },
  });

  const unassignMutation = useMutation({
    mutationFn: enquiryAPI.unassign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enquiry', id] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      toast.success('Enquiry unassigned successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to unassign enquiry');
    },
  });

  const handleAssign = () => {
    if (selectedStaff) {
      assignMutation.mutate({ id: id!, assignedTo: selectedStaff });
    }
  };

  const handleUnassign = () => {
    if (window.confirm('Are you sure you want to unassign this enquiry?')) {
      unassignMutation.mutate(id!);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    updateMutation.mutate({
      id: id!,
      data: { status: newStatus }
    });
  };

  // Check if user can edit this enquiry
  const canEdit = () => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'staff' && enquiry?.assignedTo?._id === user?.id) return true;
    return false;
  };

  // Check if user can assign/unassign
  const canAssign = () => {
    return user?.role === 'admin';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !enquiry) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Enquiry Not Found</h2>
        <p className="text-gray-600 mb-6">The enquiry you're looking for doesn't exist or has been deleted.</p>
        <button
          onClick={() => navigate('/enquiries')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Enquiries
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/enquiries')}
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Enquiries
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Enquiry Details</h1>
      </div>

      {/* Enquiry Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{enquiry.customerName}</h2>
              <p className="text-sm text-gray-500">Enquiry #{enquiry._id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enquiry.status)}`}>
                {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1).replace('-', ' ')}
              </span>
              
              {/* Status Management - only for assigned staff or admin */}
              {canEdit() && (
                <div className="flex space-x-2">
                  <select
                    value={enquiry.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    disabled={updateMutation.isPending}
                  >
                    <option value="new">New</option>
                    <option value="in_progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{enquiry.customerName}</p>
                    <p className="text-sm text-gray-500">Customer Name</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{enquiry.email}</p>
                    <p className="text-sm text-gray-500">Email Address</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{enquiry.phone}</p>
                    <p className="text-sm text-gray-500">Phone Number</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enquiry Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Enquiry Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(enquiry.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="text-sm text-gray-500">Created Date</p>
                  </div>
                </div>
                {enquiry.assignedTo && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{enquiry.assignedTo.name}</p>
                        <p className="text-sm text-gray-500">Assigned To</p>
                      </div>
                    </div>
                    {canAssign() && (
                      <button
                        onClick={handleUnassign}
                        disabled={unassignMutation.isPending}
                        className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        {unassignMutation.isPending ? 'Unassigning...' : 'Unassign'}
                      </button>
                    )}
                  </div>
                )}
                
                {/* Assignment Controls - Admin only */}
                {!enquiry.assignedTo && canAssign() && (
                  <div className="space-y-2">
                    {!isAssigning ? (
                      <button
                        onClick={() => setIsAssigning(true)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        + Assign to Staff
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <select
                          value={selectedStaff}
                          onChange={(e) => setSelectedStaff(e.target.value)}
                          className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select staff member</option>
                          {staffUsers.map((staff: any) => (
                            <option key={staff._id} value={staff._id}>
                              {staff.name} ({staff.role})
                            </option>
                          ))}
                        </select>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleAssign}
                            disabled={!selectedStaff || assignMutation.isPending}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {assignMutation.isPending ? 'Assigning...' : 'Assign'}
                          </button>
                          <button
                            onClick={() => {
                              setIsAssigning(false);
                              setSelectedStaff('');
                            }}
                            className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {enquiry.updatedAt && enquiry.updatedAt !== enquiry.createdAt && (
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(enquiry.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm text-gray-500">Last Updated</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Message</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{enquiry.message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnquiryDetail;
