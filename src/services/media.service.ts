import axiosInstance from '@/lib/axios';

export interface MediaItem {
  _id: string;
  title: string;
  description?: string;
  filePath?: string;
  url?: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  mimeType?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

class MediaService {
  async getAllMedia(): Promise<MediaItem[]> {
    const response = await axiosInstance.get('/media');
    return response.data;
  }
}

export default new MediaService();