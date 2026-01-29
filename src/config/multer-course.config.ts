import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerCourseConfig = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'video') {
        cb(null, './uploads/courses/videos');
      } else if (file.fieldname === 'resources') {
        cb(null, './uploads/courses/resources');
      } else if (file.fieldname === 'content') {
        cb(null, './uploads/courses/content');
      } else {
        cb(null, './uploads/courses');
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      // Allow video formats
      const allowedVideoTypes = /mp4|avi|mkv|mov|wmv|flv|webm/;
      const extname = allowedVideoTypes.test(file.originalname.toLowerCase());
      const mimetype = allowedVideoTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only video files are allowed (mp4, avi, mkv, mov, wmv, flv, webm)'));
      }
    } else if (file.fieldname === 'resources') {
      // Allow documents and archives
      const allowedResourceTypes = /pdf|doc|docx|ppt|pptx|zip|rar|txt|md/;
      const extname = allowedResourceTypes.test(file.originalname.toLowerCase());
      
      if (extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only document/archive files allowed (pdf, doc, docx, ppt, pptx, zip, rar, txt, md)'));
      }
    } else if (file.fieldname === 'content') {
      // Allow markdown files
      const allowedContentTypes = /md|markdown|txt/;
      const extname = allowedContentTypes.test(file.originalname.toLowerCase());
      
      if (extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only markdown files allowed for content (.md, .markdown, .txt)'));
      }
    } else {
      cb(null, true);
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB for videos
  },
};
