import { Request, Response } from 'express';
import Enquiry, { IEnquiry } from '../models/Enquiry';
import User from '../models/User';
import { createEnquirySchema, updateEnquirySchema, enquiryQuerySchema, CreateEnquiryInput, UpdateEnquiryInput, EnquiryQueryInput } from '../utils/validation';
import { AuthRequest } from '../middlewares/auth';

export const createEnquiry = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData: CreateEnquiryInput = createEnquirySchema.parse(req.body);
    
    const enquiry = new Enquiry(validatedData);
    await enquiry.save();

    res.status(201).json({
      message: 'Enquiry created successfully',
      enquiry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating enquiry' });
  }
};

export const getEnquiries = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedQuery: EnquiryQueryInput = enquiryQuerySchema.parse(req.query);
    
    const {
      status,
      search,
      page = 1,
      limit = 10
    } = validatedQuery;

    // Build filter object
    const filter: any = { isDeleted: false };
    
    if (status && status.trim() !== '') {
      filter.status = status;
    }
    
    if (search && search.trim() !== '') {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    const enquiries = await Enquiry.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Enquiry.countDocuments(filter);

    res.json({
      enquiries,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching enquiries:', error);
    res.status(500).json({ message: 'Server error fetching enquiries' });
  }
};

export const getEnquiryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const enquiry = await Enquiry.findOne({ _id: id, isDeleted: false })
      .populate('assignedTo', 'name email');
    
    if (!enquiry) {
      res.status(404).json({ message: 'Enquiry not found' });
      return;
    }

    res.json({ enquiry });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching enquiry' });
  }
};

export const updateEnquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validatedData: UpdateEnquiryInput = updateEnquirySchema.parse(req.body);
    const userRole = req.user?.role;
    
    const enquiry = await Enquiry.findOne({ _id: id, isDeleted: false });
    
    if (!enquiry) {
      res.status(404).json({ message: 'Enquiry not found' });
      return;
    }

    // Role-based update restrictions
    if (userRole === 'staff') {
      // Staff can only update status and only for enquiries assigned to them
      if (enquiry.assignedTo?.toString() !== req.user?._id?.toString()) {
        res.status(403).json({ message: 'You can only update enquiries assigned to you' });
        return;
      }
      
      // Staff can only update status, not assignedTo or other fields
      if (validatedData.assignedTo !== undefined) {
        res.status(403).json({ message: 'Staff cannot assign/unassign enquiries' });
        return;
      }
      
      // Only allow status update for staff
      if (validatedData.status) {
        enquiry.status = validatedData.status;
      }
    } else if (userRole === 'admin') {
      // Admin can update all fields
      if (validatedData.assignedTo) {
        const user = await User.findById(validatedData.assignedTo);
        if (!user) {
          res.status(400).json({ message: 'Assigned user not found' });
          return;
        }
      }
      
      Object.assign(enquiry, validatedData);
    } else {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    await enquiry.save();

    // Populate assignedTo for response
    await enquiry.populate('assignedTo', 'name email');

    res.json({
      message: 'Enquiry updated successfully',
      enquiry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating enquiry' });
  }
};

export const deleteEnquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    
    // Only admin can delete enquiries
    if (userRole !== 'admin') {
      res.status(403).json({ message: 'Only admin can delete enquiries' });
      return;
    }
    
    const enquiry = await Enquiry.findOne({ _id: id, isDeleted: false });
    
    if (!enquiry) {
      res.status(404).json({ message: 'Enquiry not found' });
      return;
    }

    // Soft delete
    enquiry.isDeleted = true;
    await enquiry.save();

    res.json({ message: 'Enquiry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting enquiry' });
  }
};

// Assign enquiry to staff (Admin only)
export const assignEnquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const userRole = req.user?.role;
    
    // Only admin can assign enquiries
    if (userRole !== 'admin') {
      res.status(403).json({ message: 'Only admin can assign enquiries' });
      return;
    }
    
    const enquiry = await Enquiry.findOne({ _id: id, isDeleted: false });
    
    if (!enquiry) {
      res.status(404).json({ message: 'Enquiry not found' });
      return;
    }

    // Verify the assigned user exists and is staff or admin
    const user = await User.findById(assignedTo);
    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }
    
    if (user.role === 'user') {
      res.status(400).json({ message: 'Cannot assign enquiry to regular user. Only staff or admin can be assigned.' });
      return;
    }

    enquiry.assignedTo = assignedTo;
    await enquiry.save();
    await enquiry.populate('assignedTo', 'name email');

    res.json({
      message: 'Enquiry assigned successfully',
      enquiry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error assigning enquiry' });
  }
};

// Unassign enquiry (Admin only)
export const unassignEnquiry = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userRole = req.user?.role;
    
    // Only admin can unassign enquiries
    if (userRole !== 'admin') {
      res.status(403).json({ message: 'Only admin can unassign enquiries' });
      return;
    }
    
    const enquiry = await Enquiry.findOne({ _id: id, isDeleted: false });
    
    if (!enquiry) {
      res.status(404).json({ message: 'Enquiry not found' });
      return;
    }

    enquiry.assignedTo = undefined;
    await enquiry.save();

    res.json({
      message: 'Enquiry unassigned successfully',
      enquiry
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error unassigning enquiry' });
  }
};

// Get staff users for assignment (Admin only)
export const getStaffUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userRole = req.user?.role;
    
    // Only admin can get staff users
    if (userRole !== 'admin') {
      res.status(403).json({ message: 'Only admin can access staff list' });
      return;
    }

    const staffUsers = await User.find({ role: { $in: ['admin', 'staff'] } })
      .select('name email role')
      .sort({ name: 1 });

    res.json({ staff: staffUsers });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching staff users' });
  }
};
