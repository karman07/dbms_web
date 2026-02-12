import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

export interface FCMMessage {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  token?: string;
  tokens?: string[];
}

export interface FCMResponse {
  success: boolean;
  successCount: number;
  failureCount: number;
  failedTokens: string[];
  error?: string;
}

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Send notification to a single device
   */
  async sendToDevice(message: FCMMessage): Promise<FCMResponse> {
    if (!message.token) {
      return {
        success: false,
        successCount: 0,
        failureCount: 1,
        failedTokens: [],
        error: 'No token provided',
      };
    }

    try {
      const payload: admin.messaging.Message = {
        notification: {
          title: message.title,
          body: message.body,
          imageUrl: message.imageUrl,
        },
        data: message.data || {},
        token: message.token,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(payload);
      this.logger.log(`Successfully sent message: ${response}`);

      return {
        success: true,
        successCount: 1,
        failureCount: 0,
        failedTokens: [],
      };
    } catch (error) {
      this.logger.error('Error sending message to device:', error);
      
      // Check if token is invalid/unregistered
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        return {
          success: false,
          successCount: 0,
          failureCount: 1,
          failedTokens: [message.token],
          error: error.message,
        };
      }

      return {
        success: false,
        successCount: 0,
        failureCount: 1,
        failedTokens: [message.token],
        error: error.message,
      };
    }
  }

  /**
   * Send notification to multiple devices (batch)
   * FCM supports up to 500 tokens per request
   */
  async sendToMultipleDevices(message: FCMMessage): Promise<FCMResponse> {
    if (!message.tokens || message.tokens.length === 0) {
      return {
        success: false,
        successCount: 0,
        failureCount: 0,
        failedTokens: [],
        error: 'No tokens provided',
      };
    }

    try {
      const payload: admin.messaging.MulticastMessage = {
        notification: {
          title: message.title,
          body: message.body,
          imageUrl: message.imageUrl,
        },
        data: message.data || {},
        tokens: message.tokens,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(payload);
      
      this.logger.log(
        `Successfully sent ${response.successCount} messages, ${response.failureCount} failed`,
      );

      // Collect failed tokens
      const failedTokens: string[] = [];
      if (response.failureCount > 0 && message.tokens) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success && message.tokens) {
            failedTokens.push(message.tokens[idx]);
            this.logger.warn(
              `Failed to send to token ${message.tokens[idx]}: ${resp.error?.message}`,
            );
          }
        });
      }

      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens,
      };
    } catch (error) {
      this.logger.error('Error sending multicast message:', error);
      return {
        success: false,
        successCount: 0,
        failureCount: message.tokens.length,
        failedTokens: message.tokens,
        error: error.message,
      };
    }
  }

  /**
   * Send notification to topic
   */
  async sendToTopic(topic: string, message: Omit<FCMMessage, 'token' | 'tokens'>): Promise<FCMResponse> {
    try {
      const payload: admin.messaging.Message = {
        notification: {
          title: message.title,
          body: message.body,
          imageUrl: message.imageUrl,
        },
        data: message.data || {},
        topic: topic,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(payload);
      this.logger.log(`Successfully sent message to topic ${topic}: ${response}`);

      return {
        success: true,
        successCount: 1,
        failureCount: 0,
        failedTokens: [],
      };
    } catch (error) {
      this.logger.error(`Error sending message to topic ${topic}:`, error);
      return {
        success: false,
        successCount: 0,
        failureCount: 1,
        failedTokens: [],
        error: error.message,
      };
    }
  }

  /**
   * Subscribe tokens to a topic
   */
  async subscribeToTopic(tokens: string[], topic: string): Promise<void> {
    try {
      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      this.logger.log(
        `Successfully subscribed ${response.successCount} tokens to topic ${topic}`,
      );
    } catch (error) {
      this.logger.error(`Error subscribing to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe tokens from a topic
   */
  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<void> {
    try {
      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      this.logger.log(
        `Successfully unsubscribed ${response.successCount} tokens from topic ${topic}`,
      );
    } catch (error) {
      this.logger.error(`Error unsubscribing from topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Send notifications in batches to handle large number of tokens
   * FCM has a limit of 500 tokens per request
   */
  async sendInBatches(
    tokens: string[],
    message: Omit<FCMMessage, 'token' | 'tokens'>,
    batchSize = 500,
  ): Promise<FCMResponse> {
    const batches: string[][] = [];
    
    // Split tokens into batches
    for (let i = 0; i < tokens.length; i += batchSize) {
      batches.push(tokens.slice(i, i + batchSize));
    }

    this.logger.log(`Sending notifications in ${batches.length} batches`);

    let totalSuccess = 0;
    let totalFailure = 0;
    const allFailedTokens: string[] = [];

    // Process each batch
    for (let i = 0; i < batches.length; i++) {
      this.logger.log(`Processing batch ${i + 1}/${batches.length}`);
      
      const batchResult = await this.sendToMultipleDevices({
        ...message,
        tokens: batches[i],
      });

      totalSuccess += batchResult.successCount;
      totalFailure += batchResult.failureCount;
      allFailedTokens.push(...batchResult.failedTokens);

      // Add a small delay between batches to avoid rate limiting
      if (i < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    this.logger.log(
      `Batch sending complete: ${totalSuccess} success, ${totalFailure} failed`,
    );

    return {
      success: totalSuccess > 0,
      successCount: totalSuccess,
      failureCount: totalFailure,
      failedTokens: allFailedTokens,
    };
  }
}
