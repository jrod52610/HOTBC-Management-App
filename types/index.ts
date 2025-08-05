// Define types for the app

// Event categories
export type EventCategory = 'retreat' | 'camp' | 'appointment' | 'day-off' | 'special-event' | 'other';

// Event type for calendar
export interface Event {
  id: string;
  title: string;
  date: Date;
  endDate?: Date; // Optional for multi-day events
  startTime?: string; // Time in "HH:MM" format
  endTime?: string; // Time in "HH:MM" format
  description?: string;
  createdBy: string;
  category?: EventCategory;
  color?: string; // For color coordination
}

// Maintenance task type
export interface MaintenanceTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  createdAt: Date;
  dueDate?: Date;
}

// Cleaning task type
export interface CleaningTask {
  id: string;
  area: string;
  description?: string;
  status: 'clean' | 'unclean';
  assignedTo?: string;
  lastCleaned?: Date;
}

// Permission type
export type Permission = 'admin' | 'maintenance' | 'cleaning' | 'calendar' | 'read-only';

// Invitation status
export type InvitationStatus = 'pending' | 'sent' | 'accepted' | 'expired';

// User type
export interface User {
  id: string;
  name: string;
  permissions: Permission[];
  phoneNumber?: string;
  email?: string;
  invitationStatus?: InvitationStatus;
  invitationSentAt?: Date;
  lastLogin?: Date;
  profileCompleted?: boolean;
  tempPassword?: string;
  password?: string; // Actual password (in a real app, this would be hashed)
  passwordSetAt?: Date; // When the user set their own password
}