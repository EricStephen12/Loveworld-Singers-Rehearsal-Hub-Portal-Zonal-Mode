// Admin Authentication Management System
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  password: string; // In real app, this would be hashed
  role: 'super_admin' | 'admin' | 'moderator';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

// Default admin users
export const defaultAdminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@loveworldpraise.com',
    password: 'admin123', // In production, this should be hashed
    role: 'super_admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'admin-2',
    username: 'moderator',
    email: 'moderator@loveworldpraise.com',
    password: 'mod123', // In production, this should be hashed
    role: 'moderator',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Admin authentication management functions
export class AdminAuthManager {
  private static STORAGE_KEY = 'admin_users';
  private static CURRENT_USER_KEY = 'current_admin_user';

  // Get all admin users
  static getAdminUsers(): AdminUser[] {
    if (typeof window === 'undefined') return defaultAdminUsers;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        return parsed.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined
        }));
      }
    } catch (error) {
      console.error('Error loading admin users:', error);
    }
    
    return defaultAdminUsers;
  }

  // Save admin users to localStorage
  static saveAdminUsers(users: AdminUser[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving admin users:', error);
    }
  }

  // Add a new admin user
  static addAdminUser(userData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): AdminUser {
    const users = this.getAdminUsers();
    const newUser: AdminUser = {
      ...userData,
      id: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.push(newUser);
    this.saveAdminUsers(users);
    return newUser;
  }

  // Update an existing admin user
  static updateAdminUser(id: string, updates: Partial<Omit<AdminUser, 'id' | 'createdAt'>>): AdminUser | null {
    const users = this.getAdminUsers();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date()
    };
    
    this.saveAdminUsers(users);
    return users[index];
  }

  // Delete an admin user
  static deleteAdminUser(id: string): boolean {
    const users = this.getAdminUsers();
    const filtered = users.filter(user => user.id !== id);
    
    if (filtered.length === users.length) return false; // User not found
    
    this.saveAdminUsers(filtered);
    return true;
  }

  // Toggle admin user active status
  static toggleAdminUser(id: string): AdminUser | null {
    const users = this.getAdminUsers();
    const user = users.find(user => user.id === id);
    
    if (!user) return null;
    
    return this.updateAdminUser(id, { isActive: !user.isActive });
  }

  // Get active admin users only
  static getActiveAdminUsers(): AdminUser[] {
    return this.getAdminUsers().filter(user => user.isActive);
  }

  // Get admin user by ID
  static getAdminUserById(id: string): AdminUser | null {
    return this.getAdminUsers().find(user => user.id === id) || null;
  }

  // Get admin user by username
  static getAdminUserByUsername(username: string): AdminUser | null {
    return this.getAdminUsers().find(user => user.username === username) || null;
  }

  // Get admin user by email
  static getAdminUserByEmail(email: string): AdminUser | null {
    return this.getAdminUsers().find(user => user.email === email) || null;
  }

  // Authenticate admin user
  static authenticateAdmin(username: string, password: string): AdminUser | null {
    const user = this.getAdminUserByUsername(username);
    
    if (user && user.password === password && user.isActive) {
      // Update last login
      this.updateAdminUser(user.id, { lastLogin: new Date() });
      return user;
    }
    
    return null;
  }

  // Set current admin user
  static setCurrentAdminUser(user: AdminUser | null): void {
    if (typeof window === 'undefined') return;
    
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
  }

  // Get current admin user
  static getCurrentAdminUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(this.CURRENT_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt),
          lastLogin: parsed.lastLogin ? new Date(parsed.lastLogin) : undefined
        };
      }
    } catch (error) {
      console.error('Error getting current admin user:', error);
    }
    
    return null;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.getCurrentAdminUser() !== null;
  }

  // Logout current admin user
  static logout(): void {
    this.setCurrentAdminUser(null);
  }

  // Reset to default admin users
  static resetToDefaults(): void {
    this.saveAdminUsers(defaultAdminUsers);
  }

  // Change password
  static changePassword(id: string, newPassword: string): boolean {
    const result = this.updateAdminUser(id, { password: newPassword });
    return result !== null;
  }
}

// Export for easy access
export const adminAuthManager = AdminAuthManager;

// Example usage functions for admin panel (ready to use)
export const adminAuthFunctions = {
  // Add a new admin user
  addAdminUser: (username: string, email: string, password: string, role: 'super_admin' | 'admin' | 'moderator') => {
    return adminAuthManager.addAdminUser({
      username,
      email,
      password,
      role,
      isActive: true
    });
  },

  // Delete an admin user
  deleteAdminUser: (id: string) => {
    return adminAuthManager.deleteAdminUser(id);
  },

  // Update admin user details
  updateAdminUser: (id: string, updates: Partial<Omit<AdminUser, 'id' | 'createdAt'>>) => {
    return adminAuthManager.updateAdminUser(id, updates);
  },

  // Toggle admin user active status
  toggleAdminUser: (id: string) => {
    return adminAuthManager.toggleAdminUser(id);
  },

  // Get all admin users for admin display
  getAllAdminUsers: () => {
    return adminAuthManager.getAdminUsers();
  },

  // Get active admin users for user display
  getActiveAdminUsers: () => {
    return adminAuthManager.getActiveAdminUsers();
  },

  // Authenticate admin user
  authenticateAdmin: (username: string, password: string) => {
    return adminAuthManager.authenticateAdmin(username, password);
  },

  // Get current admin user
  getCurrentAdminUser: () => {
    return adminAuthManager.getCurrentAdminUser();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return adminAuthManager.isAuthenticated();
  },

  // Logout current admin user
  logout: () => {
    adminAuthManager.logout();
  },

  // Change password
  changePassword: (id: string, newPassword: string) => {
    return adminAuthManager.changePassword(id, newPassword);
  },

  // Reset to default admin users
  resetAdminUsers: () => {
    adminAuthManager.resetToDefaults();
  }
};

