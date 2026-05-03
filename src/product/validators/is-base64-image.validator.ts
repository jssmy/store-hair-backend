import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const BASE64_DATA_URI_REGEX = /^data:(image\/(?:jpeg|png|webp));base64,[A-Za-z0-9+/]+=*$/;
const IMAGE_URL_REGEX = /^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?.*)?$/i;

@ValidatorConstraint({ name: 'isBase64Image', async: false })
export class IsBase64ImageConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'string') return false;

    const match = BASE64_DATA_URI_REGEX.exec(value);
    if (match) {
      return ALLOWED_MIME_TYPES.includes(match[1]);
    }

    return IMAGE_URL_REGEX.test(value);
  }

  defaultMessage(): string {
    return 'Cada imagen debe ser un data URI base64 o una URL de imagen válida (jpg, jpeg, png, webp)';
  }
}

export function IsBase64Image(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBase64ImageConstraint,
    });
  };
}
