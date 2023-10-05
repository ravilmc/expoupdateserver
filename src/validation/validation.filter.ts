import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  ValidationError,
} from '@nestjs/common';
import { ValidationException } from './validation.exception';

@Catch(ValidationException)
export class ValidationFilter implements ExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    const errors = exception.getResponse();

    if (typeof errors != 'string' && 'message' in errors) {
      const fieldErrors = errors.message as ValidationError[];

      return response.status(status).json({
        statusCode: status,
        path: request.url,
        errors: fieldErrors.reduce((acc, error) => {
          const { property, constraints } = error;
          const message = Object.values(constraints)[0];
          acc[property] = message;
          return acc;
        }, {}),
      });
    }

    response.status(status).json({
      statusCode: status,
      path: request.url,
      errors,
    });
  }
}
