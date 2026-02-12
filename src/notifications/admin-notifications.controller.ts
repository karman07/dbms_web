import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  Param,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto, SendBulkNotificationDto } from './dto/send-notification.dto';
import { UserRole } from '../users/schemas/user.schema';

/**
 * Admin-only notification controller
 */
@Controller('admin/notifications')
@UseGuards(JwtAuthGuard)
export class AdminNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Check if user is admin
   */
  private checkAdminRole(user: any) {
    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Only admins can perform this action');
    }
  }

  /**
   * Send notification to specific users
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  async sendNotification(@Request() req, @Body() dto: SendNotificationDto) {
    this.checkAdminRole(req.user);

    if (!dto.userIds && !dto.fcmTokens) {
      throw new BadRequestException('Either userIds or fcmTokens must be provided');
    }

    try {
      const notification = await this.notificationsService.sendNotification(
        dto,
        req.user.userId,
      );

      return {
        success: true,
        message: 'Notification queued successfully',
        data: {
          notificationId: notification._id,
          totalRecipients: notification.totalRecipients,
          status: notification.status,
        },
      };
    } catch (error) {
      if (error.message === 'No valid user IDs provided') {
        throw new BadRequestException(
          'No valid user IDs provided. User IDs must be valid MongoDB ObjectIds (24 character hex strings)'
        );
      }
      throw error;
    }
  }

  /**
   * Send bulk notification to all or many users
   */
  @Post('send-bulk')
  @HttpCode(HttpStatus.OK)
  async sendBulkNotification(@Request() req, @Body() dto: SendBulkNotificationDto) {
    this.checkAdminRole(req.user);

    try {
      const notification = await this.notificationsService.sendBulkNotification(
        dto,
        req.user.userId,
      );

      return {
        success: true,
        message: 'Bulk notification queued successfully',
        data: {
          notificationId: notification._id,
          totalRecipients: notification.totalRecipients,
          isBulk: notification.isBulk,
          status: notification.status,
          scheduledAt: notification.scheduledAt,
        },
      };
    } catch (error) {
      if (error.message === 'No valid user IDs provided') {
        throw new BadRequestException(
          'No valid user IDs provided. User IDs must be valid MongoDB ObjectIds (24 character hex strings). Example: "65abc123def456789012abcd"'
        );
      }
      throw error;
    }
  }

  /**
   * Get all notification history (admin view)
   */
  @Get('history')
  async getAllNotifications(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ) {
    this.checkAdminRole(req.user);

    const filters: any = {};
    if (status) filters.status = status;
    if (type) filters.type = type;

    const result = await this.notificationsService.getNotificationHistory(
      Number(page),
      Number(limit),
      filters,
    );

    return {
      success: true,
      data: result.notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        totalPages: Math.ceil(result.total / Number(limit)),
      },
    };
  }

  /**
   * Get notification by ID
   */
  @Get(':id')
  async getNotificationById(@Request() req, @Param('id') id: string) {
    this.checkAdminRole(req.user);

    const result = await this.notificationsService.getNotificationHistory(1, 1, {
      _id: id,
    });

    if (result.notifications.length === 0) {
      throw new BadRequestException('Notification not found');
    }

    return {
      success: true,
      data: result.notifications[0],
    };
  }

  /**
   * Get notification statistics
   */
  @Get('stats/overview')
  async getStats(@Request() req, @Query('sentBy') sentBy?: string) {
    this.checkAdminRole(req.user);

    const stats = await this.notificationsService.getNotificationStats(sentBy);

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get my sent notifications (admin who sent them)
   */
  @Get('my/sent')
  async getMySentNotifications(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    this.checkAdminRole(req.user);

    const result = await this.notificationsService.getNotificationHistory(
      Number(page),
      Number(limit),
      { sentBy: req.user.userId },
    );

    return {
      success: true,
      data: result.notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.total,
        totalPages: Math.ceil(result.total / Number(limit)),
      },
    };
  }
}
