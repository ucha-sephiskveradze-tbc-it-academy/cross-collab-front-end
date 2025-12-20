import { SignupFormModel } from '../models/signup-form.model';
import { CreateAccountDto } from '../models/create-account.dto';

export function mapToDto(form: SignupFormModel): CreateAccountDto {
  return {
    email: form.email,
    fullName: `${form.firstName} ${form.lastName}`,
    password: form.password,
  };
}
