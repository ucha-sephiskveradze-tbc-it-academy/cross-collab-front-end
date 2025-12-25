import { SignupFormModel } from '../models/signup-form.model';
import { CreateAccountDto } from '../models/create-account.dto';

export function mapToDto(form: SignupFormModel): CreateAccountDto {
  return {
    userName: `${form.firstName.trim()}1${form.lastName.trim()}`,
    email: form.email,
    department: form.department,
    password: form.password,
    phoneNumber: form.phone,
    oneTimePassword: form.otp,
  };
}
