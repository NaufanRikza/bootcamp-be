import { HttpStatusCode } from 'axios';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { extname } from 'path';
import fs from 'fs';

const uploadFolderPath = './uploads/';

// Create the uploads folder if it doesn't exist
if (!fs.existsSync(uploadFolderPath)) {
  console.log('create folder uploads');
  fs.mkdirSync(uploadFolderPath);
}

const upload = multer({
  dest: uploadFolderPath,
  limits: {
    fileSize: 1024 * 1024 * 1,
  },
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadFolderPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const fileExtension = extname(file.originalname);
      cb(null, uniqueSuffix + fileExtension); // Save with a random name and original extension
    },
  }),
  fileFilter: function (req, file, cb) {
    if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
});

export function multerMiddleware(req: Request, res: Response, next: NextFunction) {
  upload.single('file')(req, res, function (error: any) {
    if (error) {
      return res.status(400).json({
        httpCode: HttpStatusCode.BadRequest,
        message: error.message,
      });
    }
    next();
  });
}
