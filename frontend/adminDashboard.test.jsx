import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from './src/components/AdminDashboard';
import axiosInstance from './src/api/axiosInstance';

// Mock axiosInstance
vi.mock('./src/api/axiosInstance');

describe('AdminDashboard Component', () => {
  const mockStudents = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      course: 'MERN Bootcamp',
      enrollmentDate: '2023-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      course: 'React Bootcamp',
      enrollmentDate: '2023-02-01T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Mock localStorage
    Storage.prototype.getItem = vi.fn(() => 'mock-token');
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();
    
    // Mock axiosInstance.get for fetching students - this should be the default for all tests
    axiosInstance.get = vi.fn().mockResolvedValue({
      data: {
        students: mockStudents,
        currentPage: 1,
        totalPages: 1,
        totalStudents: 2
      }
    });
  });

  it('renders admin dashboard with student list', async () => {
    render(<AdminDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  it('shows add student form when Add Student button is clicked', async () => {
    render(<AdminDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Add Student' }));

    expect(screen.getByRole('heading', { name: 'Add Student' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Course')).toBeInTheDocument();
  });

  it('shows edit student form when Edit button is clicked', async () => {
    render(<AdminDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByText('Edit')[0]);

    expect(screen.getByRole('heading', { name: 'Edit Student' })).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
    expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
    expect(screen.getByLabelText('Course')).toHaveValue('MERN Bootcamp');
  });

  it('calls delete API when Delete button is clicked and confirmed', async () => {
    // Mock window.confirm
    window.confirm = vi.fn(() => true);
    
    // Mock delete student
    axiosInstance.delete = vi.fn().mockResolvedValue({});
    
    render(<AdminDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });

    // Click the first delete button
    fireEvent.click(screen.getAllByText('Delete')[0]);

    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalled();
    });
  });
});