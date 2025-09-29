import request from 'supertest';
import express from 'express';
import cors from 'cors';
import enquiryRoutes from '../routes/enquiries';
import authRoutes from '../routes/auth';
import User from '../models/User';
import { generateToken } from '../utils/jwt';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/enquiries', enquiryRoutes);

describe('Enquiry Routes', () => {
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create a test user and get auth token
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: 'hashedpassword',
      role: 'admin'
    });
    await user.save();
    
    authToken = generateToken(user);
    userId = user._id.toString();
  });

  describe('POST /api/enquiries', () => {
    it('should create a new enquiry', async () => {
      const enquiryData = {
        customerName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        message: 'Test enquiry message'
      };

      const response = await request(app)
        .post('/api/enquiries')
        .send(enquiryData)
        .expect(201);

      expect(response.body.message).toBe('Enquiry created successfully');
      expect(response.body.enquiry.customerName).toBe(enquiryData.customerName);
    });
  });

  describe('GET /api/enquiries', () => {
    beforeEach(async () => {
      // Create test enquiries
      const enquiryData = {
        customerName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        message: 'Test enquiry message'
      };

      await request(app)
        .post('/api/enquiries')
        .send(enquiryData);
    });

    it('should get enquiries with authentication', async () => {
      const response = await request(app)
        .get('/api/enquiries')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.enquiries).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it('should not get enquiries without authentication', async () => {
      await request(app)
        .get('/api/enquiries')
        .expect(401);
    });
  });

  describe('GET /api/enquiries/:id', () => {
    let enquiryId: string;

    beforeEach(async () => {
      const enquiryData = {
        customerName: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        message: 'Test enquiry message'
      };

      const response = await request(app)
        .post('/api/enquiries')
        .send(enquiryData);

      enquiryId = response.body.enquiry._id;
    });

    it('should get enquiry by id with authentication', async () => {
      const response = await request(app)
        .get(`/api/enquiries/${enquiryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.enquiry).toBeDefined();
      expect(response.body.enquiry.customerName).toBe('John Doe');
    });

    it('should not get enquiry without authentication', async () => {
      await request(app)
        .get(`/api/enquiries/${enquiryId}`)
        .expect(401);
    });
  });
});
