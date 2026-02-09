import axiosInstance from '@/lib/axios';
import { User, CreateUserDto, UpdateProfileDto, AdminUpdateUserDto } from '@/types/user';

class UserService {
  /**
   * Create a new user
   * POST /users
   * Requires: JWT Token (any authenticated user)
   */
  async createUser(data: CreateUserDto): Promise<User> {
    const response = await axiosInstance.post<User>('/users', data);
    return response.data;
  }

  /**
   * Create an admin user
   * POST /users/admin
   * Access: Public (for initial setup)
   */
  async createAdmin(data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<User> {
    const response = await axiosInstance.post<User>('/users/admin', data);
    return response.data;
  }

  /**
   * Get all users
   * GET /users
   * Requires: JWT Token (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    const response = await axiosInstance.get<User[]>('/users');
    return response.data;
  }

  /**
   * Get user profile
   * GET /users/profile
   * Requires: JWT Token (own profile only)
   */
  async getProfile(): Promise<User> {
    const response = await axiosInstance.get<User>('/users/profile');
    return response.data;
  }

  /**
   * Get user by ID
   * GET /users/:id
   * Requires: JWT Token (admin only)
   */
  async getUserById(id: string): Promise<User> {
    const response = await axiosInstance.get<User>(`/users/${id}`);
    return response.data;
  }

  /**
   * Upload profile picture
   * POST /users/profile/picture
   * Requires: JWT Token (own profile only)
   */
  async uploadProfilePicture(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await axiosInstance.post<User>('/users/profile/picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Update user profile
   * PATCH /users/profile
   * Requires: JWT Token (own profile only)
   */
  async updateProfile(data: UpdateProfileDto): Promise<User> {
    const response = await axiosInstance.patch<User>('/users/profile', data);

    return response.data;
  }

  /**
   * Admin update user
   * PATCH /users/:id
   * Requires: JWT Token (admin only)
   */
  async adminUpdateUser(id: string, data: AdminUpdateUserDto): Promise<User> {
    const response = await axiosInstance.patch<User>(`/users/${id}`, data);
    return response.data;
  }

  /**
   * Delete user
   * DELETE /users/:id
   * Requires: JWT Token (admin only)
   */
  async deleteUser(id: string): Promise<void> {
    await axiosInstance.delete(`/users/${id}`);
  }

  /**
   * Verify user email
   * PATCH /users/:id/verify-email
   * Requires: JWT Token (admin only)
   */
  async verifyEmail(id: string): Promise<User> {
    const response = await axiosInstance.patch<User>(`/users/${id}/verify-email`);
    return response.data;
  }

  /**
   * Check if profile is complete
   * GET /users/profile/is-complete
   * Requires: JWT Token (own profile only)
   */
  async isProfileComplete(): Promise<{ isComplete: boolean; missingFields: string[] }> {
    const response = await axiosInstance.get<{ isComplete: boolean; missingFields: string[] }>('/users/profile/is-complete');
    return response.data;
  }
}

export default new UserService();
