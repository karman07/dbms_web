import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto, ToggleNotificationsDto } from './dto/send-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Register FCM token for current user
   */
  @Post('register-token')
  @HttpCode(HttpStatus.OK)
  async registerToken(@Request() req, @Body() dto: RegisterTokenDto) {
    await this.notificationsService.registerToken(req.user.userId, dto.fcmToken);
    return {
      success: true,
      message: 'FCM token registered successfully',
    };
  }

  /**
   * Remove FCM token for current user
   */
  @Delete('remove-token')
  @HttpCode(HttpStatus.OK)
  async removeToken(@Request() req, @Body() dto: RegisterTokenDto) {
    await this.notificationsService.removeToken(req.user.userId, dto.fcmToken);
    return {
      success: true,
      message: 'FCM token removed successfully',
    };
  }

  /**
   * Toggle notifications for current user
   */
  @Post('toggle')
  @HttpCode(HttpStatus.OK)
  async toggleNotifications(@Request() req, @Body() dto: ToggleNotificationsDto) {
    await this.notificationsService.toggleNotifications(req.user.userId, dto.enabled);
    return {
      success: true,
      message: `Notifications ${dto.enabled ? 'enabled' : 'disabled'} successfully`,
    };
  }

  /**
   * Get notification history for current user
   */
  @Get('history')
  async getMyNotifications(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.notificationsService.getNotificationsForUser(
      req.user.userId,
      Number(page),
      Number(limit),
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
