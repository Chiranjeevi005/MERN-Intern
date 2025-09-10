import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './src/components/Login';
import axiosInstance from './src/api/axiosInstance';

// Mock axiosInstance
vi.mock('./src/api/axiosInstance');

describe('Login Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    
    // Mock localStorage
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();
  });

  it('renders login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows error message on failed login', async () => {
    // Mock failed login
    axiosInstance.post.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } }
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrongpassword' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('redirects to admin dashboard on successful admin login', async () => {
    // Mock successful login
    axiosInstance.post.mockResolvedValue({
      data: {
        token: 'test-token',
        user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' }
      }
    });

    // Mock localStorage
    Storage.prototype.setItem = vi.fn();

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'admin123' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({ id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' })
      );
    });
  });

  it('redirects to student dashboard on successful student login', async () => {
    // Mock successful login
    axiosInstance.post.mockResolvedValue({
      data: {
        token: 'test-token',
        user: { id: '2', name: 'Student', email: 'student@example.com', role: 'student' }
      }
    });

    // Mock localStorage
    Storage.prototype.setItem = vi.fn();

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'student@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'student123' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'test-token');
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'user',
        JSON.stringify({ id: '2', name: 'Student', email: 'student@example.com', role: 'student' })
      );
    });
  });
});