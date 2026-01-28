import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerDocsConfig = {
  storage: diskStorage({
    destination: './uploads/docs',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = extname(file.originalname);
      const baseName = file.originalname.replace(ext, '').replace(/\s+/g, '_');
      callback(null, `${baseName}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(markdown|md)$/) && !file.originalname.endsWith('.md')) {
      return callback(new Error('Only markdown files (.md) are allowed!'), false);
    }
    callback(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
};
