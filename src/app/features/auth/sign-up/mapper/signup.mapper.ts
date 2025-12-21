import { SignupFormModel } from '../models/signup-form.model';
import { CreateAccountDto } from '../models/create-account.dto';

export function mapToDto(form: SignupFormModel): CreateAccountDto {
  const capitalize = (text: string) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : '';

  return {
    email: form.email,
    fullName: `${form.firstName} ${form.lastName}`,
    department: capitalize(form.department),
    password: form.password,
  };
}
