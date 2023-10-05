import { ValidationError } from 'class-validator';
import { ValidationException } from './validation.exception';

export class FieldError extends ValidationException {
  constructor(
    public field: string,
    public message: string,
    public constraint: string = 'constraint',
  ) {
    const error: ValidationError = {
      property: field,
      constraints: {
        [constraint]: message,
      },
    };
    super([error]);
  }
}
