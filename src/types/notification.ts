export enum NotificationType {
  COURSE_UPDATE = 'course_update',
  NEW_CONTENT = 'new_content',
  ASSIGNMENT_DUE = 'assignment_due',
  QUIZ_AVAILABLE = 'quiz_available',
  ANNOUNCEMENT = 'announcement',
  PROMOTION = 'promotion',
  SYSTEM = 'system'
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high'
}

export enum NotificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  FAILED = 'failed',
  PARTIALLY_SENT = 'partially_sent'
}

export interface Notification {
  _id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  recipients?: string[];
  isBulk: boolean;
  sentBy: any; // Can be string ID or populated User object
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  failedTokens: string[];
  scheduledAt?: string;
  sentAt?: string;
  completedAt?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  successRate: string;
}

export interface SendNotificationRequest {
  title: string;
  body: string;
  type: NotificationType;
  priority?: NotificationPriority;
  data?: Record<string, any>;
  imageUrl?: string;
  userIds?: string[];
  fcmTokens?: string[];
}

export interface SendBulkNotificationRequest {
  title: string;
  body: string;
  type: NotificationType;
  priority?: NotificationPriority;
  data?: Record<string, any>;
  imageUrl?: string;
  sendToAll: boolean;
  userIds?: string[];
  scheduledAt?: string;
}
