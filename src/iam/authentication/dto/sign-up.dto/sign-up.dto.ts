import { IsEmail, MinLength } from 'class-validator';
import { MatchesField } from 'src/validation/matchesField.decorator';

export class SignUpDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @MatchesField('password', { message: 'Passwords do not match' })
  confirmPassword: string;

  @MinLength(2)
  firstName: string;

  @MinLength(2)
  lastName: string;
}
