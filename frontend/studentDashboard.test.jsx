import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StudentDashboard from './src/components/StudentDashboard';
import axiosInstance from './src/api/axiosInstance';

// Mock axiosInstance
vi.mock('./src/api/axiosInstance');

describe('StudentDashboard Component', () => {
  const mockStudent = {
    name: 'John Doe',
    email: 'john@example.com',
    course: 'MERN Bootcamp',
    enrollmentDate: '2023-01-01T00:00:00.000Z'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Mock localStorage
    Storage.prototype.getItem = vi.fn(() => 'mock-token');
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();
    
    // Mock axiosInstance.get for fetching student profile
    axiosInstance.get = vi.fn().mockResolvedValue({
      data: mockStudent
    });
  });

  it('renders student dashboard with profile information', async () => {
    render(<StudentDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('MERN Bootcamp')).toBeInTheDocument();
    });
  });

  it('shows edit profile form when Edit Profile button is clicked', async () => {
    render(<StudentDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit Profile' }));

    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
    expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
    expect(screen.getByLabelText('Course')).toHaveValue('MERN Bootcamp');
  });

  it('shows change password form when Change Password button is clicked', async () => {
    render(<StudentDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
  });

  it('updates profile when edit form is submitted', async () => {
    // Mock update student profile
    axiosInstance.put = vi.fn().mockResolvedValue({
      data: {
        ...mockStudent,
        name: 'John Smith'
      }
    });

    // Mock refetch student profile
    axiosInstance.get = vi.fn().mockResolvedValue({
      data: {
        ...mockStudent,
        name: 'John Smith'
      }
    });

    render(<StudentDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Edit Profile' }));

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John Smith' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Update Profile' }));

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/students/me', {
        name: 'John Smith',
        email: 'john@example.com',
        course: 'MERN Bootcamp'
      });
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });
  });

  it('changes password when change password form is submitted', async () => {
    // Mock change password
    axiosInstance.put = vi.fn().mockResolvedValue({});

    render(<StudentDashboard />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Student Dashboard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'current123' }
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'new123' }
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'new123' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Change Password' }));

    await waitFor(() => {
      expect(axiosInstance.put).toHaveBeenCalledWith('/auth/change-password', {
        currentPassword: 'current123',
        newPassword: 'new123'
      });
      expect(
        screen.getByText('Password changed successfully')
      ).toBeInTheDocument();
    });
  });
});