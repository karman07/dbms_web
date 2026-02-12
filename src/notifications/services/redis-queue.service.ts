import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

export interface NotificationJob {
  id: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  tokens: string[];
  priority: string;
  createdAt: Date;
}

@Injectable()
export class RedisQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisQueueService.name);
  private redisClient: RedisClientType;
  private isConnected = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect() {
    try {
      this.redisClient = createClient({
        socket: {
          host: this.configService.get<string>('REDIS_HOST', 'localhost'),
          port: this.configService.get<number>('REDIS_PORT', 6379),
        },
        password: this.configService.get<string>('REDIS_PASSWORD'),
      });

      this.redisClient.on('error', (err) => {
        this.logger.error('Redis Client Error', err);
        this.isConnected = false;
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis client connected');
        this.isConnected = true;
      });

      this.redisClient.on('ready', () => {
        this.logger.log('Redis client ready');
      });

      await this.redisClient.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Redis', error);
      this.isConnected = false;
    }
  }

  private async disconnect() {
    if (this.redisClient && this.isConnected) {
      await this.redisClient.quit();
      this.logger.log('Redis client disconnected');
    }
  }

  async addToQueue(queueName: string, job: NotificationJob): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Redis is not connected');
    }

    try {
      const jobData = JSON.stringify(job);
      await this.redisClient.rPush(queueName, jobData);
      this.logger.log(`Job ${job.id} added to queue ${queueName}`);
    } catch (error) {
      this.logger.error('Failed to add job to queue', error);
      throw error;
    }
  }

  async addBulkToQueue(queueName: string, jobs: NotificationJob[]): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Redis is not connected');
    }

    try {
      const jobsData = jobs.map((job) => JSON.stringify(job));
      await this.redisClient.rPush(queueName, jobsData);
      this.logger.log(`${jobs.length} jobs added to queue ${queueName}`);
    } catch (error) {
      this.logger.error('Failed to add bulk jobs to queue', error);
      throw error;
    }
  }

  async getFromQueue(queueName: string): Promise<NotificationJob | null> {
    if (!this.isConnected) {
      throw new Error('Redis is not connected');
    }

    try {
      const jobData = await this.redisClient.lPop(queueName);
      if (!jobData) {
        return null;
      }
      return JSON.parse(jobData) as NotificationJob;
    } catch (error) {
      this.logger.error('Failed to get job from queue', error);
      throw error;
    }
  }

  async getQueueLength(queueName: string): Promise<number> {
    if (!this.isConnected) {
      return 0;
    }

    try {
      return await this.redisClient.lLen(queueName);
    } catch (error) {
      this.logger.error('Failed to get queue length', error);
      return 0;
    }
  }

  async clearQueue(queueName: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Redis is not connected');
    }

    try {
      await this.redisClient.del(queueName);
      this.logger.log(`Queue ${queueName} cleared`);
    } catch (error) {
      this.logger.error('Failed to clear queue', error);
      throw error;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Redis is not connected');
    }

    try {
      if (ttl) {
        await this.redisClient.setEx(key, ttl, value);
      } else {
        await this.redisClient.set(key, value);
      }
    } catch (error) {
      this.logger.error('Failed to set key', error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) {
      throw new Error('Redis is not connected');
    }

    try {
      return await this.redisClient.get(key);
    } catch (error) {
      this.logger.error('Failed to get key', error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Redis is not connected');
    }

    try {
      await this.redisClient.del(key);
    } catch (error) {
      this.logger.error('Failed to delete key', error);
      throw error;
    }
  }

  isHealthy(): boolean {
    return this.isConnected;
  }
}
