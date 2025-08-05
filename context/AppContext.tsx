import React, { createContext, useContext, useEffect, useState } from 'react';
import { Event, MaintenanceTask, CleaningTask, User, Permission } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  // Events
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (event: Event) => void;
  deleteEvent: (id: string) => void;
  
  // Maintenance Tasks
  maintenanceTasks: MaintenanceTask[];
  addMaintenanceTask: (task: Omit<MaintenanceTask, 'id' | 'createdAt'>) => void;
  updateMaintenanceTask: (task: MaintenanceTask) => void;
  deleteMaintenanceTask: (id: string) => void;
  
  // Cleaning Tasks
  cleaningTasks: CleaningTask[];
  addCleaningTask: (task: Omit<CleaningTask, 'id'>) => void;
  updateCleaningTask: (task: CleaningTask) => void;
  deleteCleaningTask: (id: string) => void;
  toggleCleanStatus: (id: string) => void;
  assignCleaningTask: (id: string, userId: string) => void;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUserPermissions: (userId: string, permissions: Permission[]) => void;
  inviteUserBySMS: (phoneNumber: string, name: string, permissions: Permission[], sid?: string) => Promise<boolean>;
  resendInvitation: (userId: string, sid?: string) => Promise<boolean>;
  updateUserProfile: (userId: string, userData: Partial<User>) => void;
  
  // Authentication
  loginWithPhoneAndPassword: (phoneNumber: string, password: string) => User | null;
  resetPassword: (userId: string, oldPassword: string, newPassword: string) => boolean;
  getCurrentUser: () => User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load data from localStorage or use default values
  const [events, setEvents] = useState<Event[]>(() => {
    const savedEvents = localStorage.getItem('campshare-events');
    return savedEvents ? JSON.parse(savedEvents).map((event: Record<string, unknown>) => ({
      ...event,
      date: new Date(event.date as string),
      endDate: event.endDate ? new Date(event.endDate as string) : undefined,
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '17:00'
    })) : [];
  });
  
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(() => {
    const savedTasks = localStorage.getItem('campshare-maintenance');
    return savedTasks ? JSON.parse(savedTasks).map((task: Record<string, unknown>) => ({
      ...task,
      createdAt: new Date(task.createdAt as string),
      dueDate: task.dueDate ? new Date(task.dueDate as string) : undefined
    })) : [];
  });
  
  const [cleaningTasks, setCleaningTasks] = useState<CleaningTask[]>(() => {
    const savedTasks = localStorage.getItem('campshare-cleaning');
    return savedTasks ? JSON.parse(savedTasks).map((task: Record<string, unknown>) => ({
      ...task,
      lastCleaned: task.lastCleaned ? new Date(task.lastCleaned as string) : undefined
    })) : [];
  });
  
  // Force reset all stored data for testing - REMOVE IN PRODUCTION
  useEffect(() => {
    // Clear all stored data
    localStorage.removeItem('campshare-users');
    localStorage.removeItem('campshare-current-user');
    localStorage.removeItem('campshare-events');
    localStorage.removeItem('campshare-maintenance');
    localStorage.removeItem('campshare-cleaning');
    localStorage.removeItem('has-reset-users');
    
    // Add this line to prevent infinite reloads during development
    localStorage.setItem('initial-setup-complete', 'true');
  }, []);

  // Define default users directly in the code (not dependent on localStorage)
  const defaultUsers: User[] = [
    { 
      id: "admin-user-id", 
      name: 'Admin User', 
      permissions: ['admin'], 
      phoneNumber: '1234567890', 
      password: 'admin123', 
      profileCompleted: true,
      invitationStatus: 'accepted'
    },
    { 
      id: "regular-user-id", 
      name: 'Regular User', 
      permissions: ['read-only'], 
      phoneNumber: '0987654321', 
      password: 'user123', 
      profileCompleted: true,
      invitationStatus: 'accepted'
    }
  ];

  // Initialize users state
  const [users, setUsers] = useState<User[]>(() => {
    console.log("Initializing users state");
    const savedUsers = localStorage.getItem('campshare-users');
    
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers);
        console.log("Found saved users:", parsedUsers);
        return parsedUsers;
      } catch (e) {
        console.error("Error parsing saved users:", e);
        return defaultUsers;
      }
    } else {
      console.log("Using default users:", defaultUsers);
      // Save default users to localStorage immediately
      localStorage.setItem('campshare-users', JSON.stringify(defaultUsers));
      return defaultUsers;
    }
  });
  
  // Current logged-in user
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('campshare-current-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('campshare-events', JSON.stringify(events));
  }, [events]);
  
  useEffect(() => {
    localStorage.setItem('campshare-maintenance', JSON.stringify(maintenanceTasks));
  }, [maintenanceTasks]);
  
  useEffect(() => {
    localStorage.setItem('campshare-cleaning', JSON.stringify(cleaningTasks));
  }, [cleaningTasks]);
  
  useEffect(() => {
    localStorage.setItem('campshare-users', JSON.stringify(users));
  }, [users]);
  
  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('campshare-current-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('campshare-current-user');
    }
  }, [currentUser]);
  
  // Events functions
  const addEvent = (event: Omit<Event, 'id'>) => {
    const newEvent = { ...event, id: uuidv4() };
    setEvents(prev => [...prev, newEvent]);
  };
  
  const updateEvent = (updatedEvent: Event) => {
    setEvents(prev => prev.map(event => event.id === updatedEvent.id ? updatedEvent : event));
  };
  
  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };
  
  // Maintenance tasks functions
  const addMaintenanceTask = (task: Omit<MaintenanceTask, 'id' | 'createdAt'>) => {
    const newTask: MaintenanceTask = { ...task, id: uuidv4(), createdAt: new Date() };
    setMaintenanceTasks(prev => [...prev, newTask]);
  };
  
  const updateMaintenanceTask = (updatedTask: MaintenanceTask) => {
    setMaintenanceTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
  };
  
  const deleteMaintenanceTask = (id: string) => {
    setMaintenanceTasks(prev => prev.filter(task => task.id !== id));
  };
  
  // Cleaning tasks functions
  const addCleaningTask = (task: Omit<CleaningTask, 'id'>) => {
    const newTask: CleaningTask = { ...task, id: uuidv4() };
    setCleaningTasks(prev => [...prev, newTask]);
  };
  
  const updateCleaningTask = (updatedTask: CleaningTask) => {
    setCleaningTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
  };
  
  const deleteCleaningTask = (id: string) => {
    setCleaningTasks(prev => prev.filter(task => task.id !== id));
  };
  
  const toggleCleanStatus = (id: string) => {
    setCleaningTasks(prev => prev.map(task => {
      if (task.id === id) {
        const newStatus = task.status === 'clean' ? 'unclean' : 'clean';
        return { 
          ...task, 
          status: newStatus,
          lastCleaned: newStatus === 'clean' ? new Date() : task.lastCleaned 
        };
      }
      return task;
    }));
  };
  
  const assignCleaningTask = (id: string, userId: string) => {
    setCleaningTasks(prev => prev.map(task => {
      if (task.id === id) {
        return { ...task, assignedTo: userId };
      }
      return task;
    }));
  };
  
  // Users functions
  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { 
      ...user, 
      id: uuidv4(), 
      permissions: user.permissions || ['read-only'],
      invitationStatus: user.invitationStatus || 'pending',
      profileCompleted: !!user.phoneNumber || false
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUserPermissions = (userId: string, permissions: Permission[]) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, permissions } : user
    ));
  };

  // Generate a random 6-digit temporary password
  const generateTempPassword = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // SMS invitation function that uses our smsService
  const inviteUserBySMS = async (phoneNumber: string, name: string, permissions: Permission[] = ['read-only'], sid?: string) => {
    // Format phone number (remove non-numeric characters)
    const formattedPhoneNumber = phoneNumber.replace(/\D/g, '');
    
    // Generate temporary password
    const tempPassword = generateTempPassword();
    
    // Check if user with this phone number already exists
    const existingUser = users.find(user => user.phoneNumber === formattedPhoneNumber);
    
    if (existingUser) {
      // Update existing user's invitation status instead of creating a new one
      setUsers(prev => prev.map(user => 
        user.phoneNumber === formattedPhoneNumber 
          ? { 
              ...user, 
              invitationStatus: 'sent', 
              invitationSentAt: new Date(),
              permissions: permissions,
              tempPassword: tempPassword,
              password: undefined // Clear any existing password
            } 
          : user
      ));
    } else {
      // Create a new user with pending invitation
      const newUser = {
        id: uuidv4(),
        name,
        phoneNumber: formattedPhoneNumber,
        permissions,
        invitationStatus: 'sent',
        invitationSentAt: new Date(),
        profileCompleted: false,
        tempPassword: tempPassword
      };
      setUsers(prev => [...prev, newUser]);
    }
    
    // Import and use the sendInvitationWithTempPassword function from smsService
    try {
      const { sendInvitationWithTempPassword } = await import('@/lib/smsService');
      const success = await sendInvitationWithTempPassword(formattedPhoneNumber, tempPassword, sid);
      
      console.log(`SMS invitation ${success ? 'successfully sent' : 'failed to send'} to ${formattedPhoneNumber} for user ${name} with temporary password: ${tempPassword}`);
      return success;
    } catch (error) {
      console.error('Error sending invitation SMS:', error);
      return false;
    }
  };
  
  const resendInvitation = async (userId: string, sid?: string) => {
    // Find the user
    const user = users.find(u => u.id === userId);
    if (!user || !user.phoneNumber) {
      console.error('Cannot resend invitation: User not found or has no phone number');
      return false;
    }

    // Generate a new temporary password
    const tempPassword = generateTempPassword();
    
    // Update the user with the new temp password
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { 
          ...u, 
          invitationStatus: 'sent',
          invitationSentAt: new Date(),
          tempPassword: tempPassword
        };
      }
      return u;
    }));
    
    // Send the SMS with the temporary password
    try {
      const { sendInvitationWithTempPassword } = await import('@/lib/smsService');
      const success = await sendInvitationWithTempPassword(
        user.phoneNumber, 
        tempPassword,
        sid
      );
      
      console.log(`SMS invitation ${success ? 'successfully resent' : 'failed to resend'} to ${user.phoneNumber} for user ${user.name} with new temporary password: ${tempPassword}`);
      return success;
    } catch (error) {
      console.error('Error resending invitation SMS:', error);
      return false;
    }
  };
  
  const updateUserProfile = (userId: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        // If user is accepting invitation, update status
        const updatedStatus = userData.invitationStatus === 'accepted' 
          ? 'accepted' 
          : user.invitationStatus;
          
        return { 
          ...user,
          ...userData,
          invitationStatus: updatedStatus,
          // Mark profile as completed if phone number is provided
          profileCompleted: userData.phoneNumber ? true : user.profileCompleted,
          // If accepting invitation, update last login time
          lastLogin: userData.invitationStatus === 'accepted' ? new Date() : user.lastLogin
        };
      }
      return user;
    }));
  };
  
  // Authentication methods
  const loginWithPhoneAndPassword = (phoneNumber: string, password: string): User | null => {
    console.log("Login attempt:", { phoneNumber, password });
    console.log("Available users:", users);

    // Format phone number (remove non-numeric characters)
    const formattedPhoneNumber = phoneNumber.replace(/\D/g, '');
    console.log("Formatted phone number:", formattedPhoneNumber);
    
    // For debugging, log all phone numbers in the system
    console.log("All phone numbers in system:", users.map(u => u.phoneNumber));
    
    const user = users.find(u => u.phoneNumber === formattedPhoneNumber);
    console.log("Found user?", user ? "Yes" : "No");
    
    if (!user) {
      console.log("No user found with phone number:", formattedPhoneNumber);
      return null;
    }
    
    console.log("User details:", { 
      id: user.id, 
      name: user.name, 
      hasPassword: !!user.password,
      hasTempPassword: !!user.tempPassword,
      userPassword: user.password,
      userTempPassword: user.tempPassword
    });
    
    // Check if temporary password matches
    if (user.tempPassword && user.tempPassword === password) {
      console.log("Temp password matched");
      // Login successful with temp password
      setCurrentUserState(user);
      return user;
    }
    
    // Check if regular password matches
    if (user.password && user.password === password) {
      console.log("Regular password matched");
      const updatedUser = {
        ...user,
        lastLogin: new Date()
      };
      
      // Login successful with regular password
      setCurrentUserState(updatedUser);
      
      // Update user's last login time
      setUsers(prev => prev.map(u => 
        u.id === user.id ? updatedUser : u
      ));
      
      return updatedUser;
    }
    
    console.log("Password doesn't match");
    return null;
  };
  
  const resetPassword = (userId: string, oldPassword: string, newPassword: string): boolean => {
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return false;
    }
    
    // Check if old password matches (either temp or regular)
    if ((user.tempPassword && user.tempPassword === oldPassword) || 
        (user.password && user.password === oldPassword)) {
      
      // Update user with new password
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            password: newPassword,
            tempPassword: undefined, // Remove temporary password
            invitationStatus: 'accepted',
            passwordSetAt: new Date(),
            profileCompleted: true
          };
        }
        return u;
      }));
      
      // Update current user if it's the same user
      if (currentUser && currentUser.id === userId) {
        setCurrentUserState({
          ...currentUser,
          password: newPassword,
          tempPassword: undefined,
          invitationStatus: 'accepted',
          passwordSetAt: new Date(),
          profileCompleted: true
        });
      }
      
      return true;
    }
    
    return false;
  };
  
  const getCurrentUser = (): User | null => {
    return currentUser;
  };
  
  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
  };
  
  const logout = () => {
    setCurrentUserState(null);
  };
  
  return (
    <AppContext.Provider value={{
      events,
      addEvent,
      updateEvent,
      deleteEvent,
      maintenanceTasks,
      addMaintenanceTask,
      updateMaintenanceTask,
      deleteMaintenanceTask,
      cleaningTasks,
      addCleaningTask,
      updateCleaningTask,
      deleteCleaningTask,
      toggleCleanStatus,
      assignCleaningTask,
      users,
      addUser,
      updateUserPermissions,
      inviteUserBySMS,
      resendInvitation,
      updateUserProfile,
      loginWithPhoneAndPassword,
      resetPassword,
      getCurrentUser,
      setCurrentUser,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};