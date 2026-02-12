import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationStatus } from './schemas/notification.schema';
import { User } from '../users/schemas/user.schema';
import { FcmService } from './services/fcm.service';
import { RedisQueueService, NotificationJob } from './services/redis-queue.service';
import { SendNotificationDto, SendBulkNotificationDto } from './dto/send-notification.dto';

const NOTIFICATION_QUEUE = 'notifications:queue';
const BATCH_SIZE = 500; // FCM multicast limit
const PROCESSING_INTERVAL = 5000; // Process queue every 5 seconds

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private processingInterval: NodeJS.Timeout;

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private fcmService: FcmService,
    private redisQueueService: RedisQueueService,
  ) {}

  async onModuleInit() {
    // Start processing queue
    this.startQueueProcessor();
  }

  /**
   * Validate and filter valid ObjectIds
   */
  private validateObjectIds(ids: string[]): string[] {
    const validIds: string[] = [];
    const invalidIds: string[] = [];

    ids.forEach((id) => {
      if (Types.ObjectId.isValid(id)) {
        validIds.push(id);
      } else {
        invalidIds.push(id);
      }
    });

    if (invalidIds.length > 0) {
      this.logger.warn(`Invalid ObjectIds found and will be skipped: ${invalidIds.join(', ')}`);
    }

    return validIds;
  }

  /**
   * Register FCM token for a user
   */
  async registerToken(userId: string, fcmToken: string): Promise<void> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Add token if it doesn't exist
      if (!user.fcmTokens) {
        user.fcmTokens = [];
      }

      if (!user.fcmTokens.includes(fcmToken)) {
        user.fcmTokens.push(fcmToken);
        await user.save();
        this.logger.log(`Token registered for user ${userId}`);
      }
    } catch (error) {
      this.logger.error('Error registering token:', error);
      throw error;
    }
  }

  /**
   * Remove FCM token for a user
   */
  async removeToken(userId: string, fcmToken: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        $pull: { fcmTokens: fcmToken },
      });
      this.logger.log(`Token removed for user ${userId}`);
    } catch (error) {
      this.logger.error('Error removing token:', error);
      throw error;
    }
  }

  /**
   * Toggle notifications for a user
   */
  async toggleNotifications(userId: string, enabled: boolean): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(userId, {
        notificationsEnabled: enabled,
      });
      this.logger.log(`Notifications ${enabled ? 'enabled' : 'disabled'} for user ${userId}`);
    } catch (error) {
      this.logger.error('Error toggling notifications:', error);
      throw error;
    }
  }

  /**
   * Send notification to specific users
   */
  async sendNotification(
    dto: SendNotificationDto,
    sentBy?: string,
  ): Promise<Notification> {
    try {
      let tokens: string[] = [];

      // Get tokens from user IDs
      if (dto.userIds && dto.userIds.length > 0) {
        // Validate and filter valid ObjectIds
        const validUserIds = this.validateObjectIds(dto.userIds);

        if (validUserIds.length === 0) {
          throw new Error('No valid user IDs provided');
        }

        const users = await this.userModel
          .find({
            _id: { $in: validUserIds },
            notificationsEnabled: true,
          })
          .select('fcmTokens');

        users.forEach((user) => {
          if (user.fcmTokens && user.fcmTokens.length > 0) {
            tokens.push(...user.fcmTokens);
          }
        });
      }

      // Add directly provided tokens
      if (dto.fcmTokens && dto.fcmTokens.length > 0) {
        tokens.push(...dto.fcmTokens);
      }

      // Remove duplicates
      tokens = [...new Set(tokens)];

      // Create notification record
      const notification = await this.notificationModel.create({
        title: dto.title,
        body: dto.body,
        type: dto.type,
        priority: dto.priority,
        data: dto.data,
        imageUrl: dto.imageUrl,
        recipients: dto.userIds
          ? this.validateObjectIds(dto.userIds).map((id) => new Types.ObjectId(id))
          : undefined,
        sentBy: sentBy ? new Types.ObjectId(sentBy) : undefined,
        totalRecipients: tokens.length,
        isBulk: false,
        status: NotificationStatus.PENDING,
      });

      if (tokens.length === 0) {
        notification.status = NotificationStatus.FAILED;
        notification.error = 'No valid tokens found';
        await notification.save();
        return notification;
      }

      // Add to queue
      const job: NotificationJob = {
        id: notification._id.toString(),
        title: dto.title,
        body: dto.body,
        data: this.convertDataToStrings(dto.data),
        imageUrl: dto.imageUrl,
        tokens,
        priority: dto.priority || 'normal',
        createdAt: new Date(),
      };

      await this.redisQueueService.addToQueue(NOTIFICATION_QUEUE, job);

      return notification;
    } catch (error) {
      this.logger.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send bulk notification to all or many users
   */
  async sendBulkNotification(
    dto: SendBulkNotificationDto,
    sentBy: string,
  ): Promise<Notification> {
    try {
      let query: any = { notificationsEnabled: true };

      // If not sending to all, filter by user IDs
      if (!dto.sendToAll && dto.userIds && dto.userIds.length > 0) {
        // Validate and filter valid ObjectIds
        const validUserIds = this.validateObjectIds(dto.userIds);

        if (validUserIds.length === 0) {
          throw new Error('No valid user IDs provided');
        }

        query._id = { $in: validUserIds };
      }

      // Get all valid tokens
      const users = await this.userModel.find(query).select('fcmTokens');
      
      let tokens: string[] = [];
      users.forEach((user) => {
        if (user.fcmTokens && user.fcmTokens.length > 0) {
          tokens.push(...user.fcmTokens);
        }
      });

      // Remove duplicates
      tokens = [...new Set(tokens)];

      // Create notification record
      const notification = await this.notificationModel.create({
        title: dto.title,
        body: dto.body,
        type: dto.type,
        priority: dto.priority,
        data: dto.data,
        imageUrl: dto.imageUrl,
        sentBy: new Types.ObjectId(sentBy),
        totalRecipients: tokens.length,
        isBulk: true,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        status: NotificationStatus.PENDING,
      });

      if (tokens.length === 0) {
        notification.status = NotificationStatus.FAILED;
        notification.error = 'No valid tokens found';
        await notification.save();
        return notification;
      }

      // Split tokens into batches and add to queue
      const batches: string[][] = [];
      for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
        batches.push(tokens.slice(i, i + BATCH_SIZE));
      }

      const jobs: NotificationJob[] = batches.map((batchTokens, index) => ({
        id: `${notification._id.toString()}_batch_${index}`,
        title: dto.title,
        body: dto.body,
        data: this.convertDataToStrings(dto.data),
        imageUrl: dto.imageUrl,
        tokens: batchTokens,
        priority: dto.priority || 'normal',
        createdAt: new Date(),
      }));

      await this.redisQueueService.addBulkToQueue(NOTIFICATION_QUEUE, jobs);

      this.logger.log(
        `Bulk notification queued: ${tokens.length} tokens in ${batches.length} batches`,
      );

      return notification;
    } catch (error) {
      this.logger.error('Error sending bulk notification:', error);
      throw error;
    }
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(
    page = 1,
    limit = 20,
    filters?: any,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const skip = (page - 1) * limit;
    const query = filters || {};

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sentBy', 'firstName lastName email')
        .exec(),
      this.notificationModel.countDocuments(query),
    ]);

    return { notifications, total };
  }

  /**
   * Get notifications sent to a specific user
   */
  async getNotificationsForUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{ notifications: Notification[]; total: number; unreadCount: number }> {
    const skip = (page - 1) * limit;
    
    // Find notifications where:
    // 1. User is in recipients array (targeted notifications)
    // 2. OR notification is bulk and user was active at the time
    const query: any = {
      $or: [
        { recipients: new Types.ObjectId(userId) },
        { isBulk: true },
      ],
    };

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-failedTokens') // Don't expose failed tokens to users
        .populate('sentBy', 'firstName lastName')
        .exec(),
      this.notificationModel.countDocuments(query),
    ]);

    // Count notifications from last 7 days as "unread"
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const unreadCount = await this.notificationModel.countDocuments({
      ...query,
      createdAt: { $gte: sevenDaysAgo },
    });

    return { notifications, total, unreadCount };
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(sentBy?: string): Promise<any> {
    const query = sentBy ? { sentBy: new Types.ObjectId(sentBy) } : {};

    const [total, sent, failed, pending] = await Promise.all([
      this.notificationModel.countDocuments(query),
      this.notificationModel.countDocuments({ ...query, status: NotificationStatus.SENT }),
      this.notificationModel.countDocuments({ ...query, status: NotificationStatus.FAILED }),
      this.notificationModel.countDocuments({ ...query, status: NotificationStatus.PENDING }),
    ]);

    const successRate = total > 0 ? ((sent / total) * 100).toFixed(2) : 0;

    return {
      total,
      sent,
      failed,
      pending,
      successRate: `${successRate}%`,
    };
  }

  /**
   * Process notification queue
   */
  private startQueueProcessor() {
    this.logger.log('Starting notification queue processor');

    this.processingInterval = setInterval(async () => {
      await this.processQueue();
    }, PROCESSING_INTERVAL);
  }

  private async processQueue() {
    try {
      const queueLength = await this.redisQueueService.getQueueLength(NOTIFICATION_QUEUE);
      
      if (queueLength === 0) {
        return;
      }

      this.logger.log(`Processing queue: ${queueLength} jobs pending`);

      // Process one job at a time to avoid overwhelming FCM
      const job = await this.redisQueueService.getFromQueue(NOTIFICATION_QUEUE);
      
      if (!job) {
        return;
      }

      await this.processNotificationJob(job);
    } catch (error) {
      this.logger.error('Error processing queue:', error);
    }
  }

  private async processNotificationJob(job: NotificationJob) {
    try {
      this.logger.log(`Processing job ${job.id} with ${job.tokens.length} tokens`);

      // Extract base notification ID (remove batch suffix if exists)
      const notificationId = job.id.split('_batch_')[0];

      // Update status to processing
      await this.notificationModel.findByIdAndUpdate(notificationId, {
        status: NotificationStatus.PROCESSING,
      });

      // Send notification via FCM
      const result = await this.fcmService.sendToMultipleDevices({
        title: job.title,
        body: job.body,
        data: job.data,
        imageUrl: job.imageUrl,
        tokens: job.tokens,
      });

      // Update notification record
      const notification = await this.notificationModel.findById(notificationId);
      
      if (notification) {
        notification.successCount += result.successCount;
        notification.failureCount += result.failureCount;
        
        if (result.failedTokens.length > 0) {
          notification.failedTokens = [
            ...(notification.failedTokens || []),
            ...result.failedTokens,
          ];

          // Remove invalid tokens from users
          await this.removeInvalidTokens(result.failedTokens);
        }

        // Determine final status
        if (notification.successCount > 0 && notification.failureCount > 0) {
          notification.status = NotificationStatus.PARTIALLY_SENT;
        } else if (notification.failureCount === 0) {
          notification.status = NotificationStatus.SENT;
        } else {
          notification.status = NotificationStatus.FAILED;
        }

        notification.sentAt = new Date();
        notification.completedAt = new Date();

        await notification.save();

        this.logger.log(
          `Job ${job.id} completed: ${result.successCount} success, ${result.failureCount} failed`,
        );
      }
    } catch (error) {
      this.logger.error(`Error processing job ${job.id}:`, error);

      // Mark as failed
      const notificationId = job.id.split('_batch_')[0];
      await this.notificationModel.findByIdAndUpdate(notificationId, {
        status: NotificationStatus.FAILED,
        error: error.message,
        completedAt: new Date(),
      });
    }
  }

  private async removeInvalidTokens(tokens: string[]) {
    try {
      await this.userModel.updateMany(
        { fcmTokens: { $in: tokens } },
        { $pull: { fcmTokens: { $in: tokens } } },
      );
      this.logger.log(`Removed ${tokens.length} invalid tokens from users`);
    } catch (error) {
      this.logger.error('Error removing invalid tokens:', error);
    }
  }

  private convertDataToStrings(data?: Record<string, any>): Record<string, string> | undefined {
    if (!data) return undefined;

    const result: Record<string, string> = {};
    Object.keys(data).forEach((key) => {
      result[key] = String(data[key]);
    });
    return result;
  }

  /**
   * Clean up on module destroy
   */
  onModuleDestroy() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
  }
}
