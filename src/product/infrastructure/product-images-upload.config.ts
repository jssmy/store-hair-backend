import { BadRequestException, NestInterceptor, Type } from '@nestjs/common';
import { AnyFilesInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

export const PRODUCT_IMAGES_FIELD = 'images';
export const PRODUCT_IMAGES_MAX_COUNT = 4;

const PRODUCT_IMAGES_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

export function ProductImagesInterceptor(
  maxCount = PRODUCT_IMAGES_MAX_COUNT,
): Type<NestInterceptor> {
  return FilesInterceptor(PRODUCT_IMAGES_FIELD, maxCount, {
    storage: diskStorage({
      destination: './images/products',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = file.originalname.split('.').pop();

        cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!PRODUCT_IMAGES_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new BadRequestException('Solo se permiten imagenes'), false);
      }

      cb(null, true);
    },
  });
}

/**
 * Interceptor para lotes: captura archivos de CUALQUIER campo.
 * El cliente debe nombrar los campos como images[0], images[1]...
 * donde el índice corresponde al producto en el array `products`.
 * Máximo 4 imágenes por producto.
 */
export function AnyProductImagesInterceptor(): Type<NestInterceptor> {
  return AnyFilesInterceptor({
    storage: diskStorage({
      destination: './images/products',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        console.log('Archivo recibido:', file.originalname, 'con campo:', file.fieldname);
        const extension = file.originalname.split('.').pop();
        cb(null, `product-${uniqueSuffix}.${extension}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!PRODUCT_IMAGES_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new BadRequestException('Solo se permiten imagenes'), false);
      }
      cb(null, true);
    },
  });
}
