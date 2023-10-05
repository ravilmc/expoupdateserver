import { FieldError } from './fielderror.exception';

export const validateImage = (
  file: Express.Multer.File,
  propertyName: string,
  required = true,
) => {
  if (!file) {
    if (required) {
      throw new FieldError(propertyName, `${propertyName} is required`);
    }
    return;
  }
  if (!file.originalname.match(/\.(jpg|jpeg|png|svg)$/)) {
    throw new FieldError(propertyName, `${propertyName} must be an image`);
  }
};
