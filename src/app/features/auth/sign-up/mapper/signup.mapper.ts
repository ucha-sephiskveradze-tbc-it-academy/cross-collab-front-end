import { SignupFormModel } from '../models/signup-form.model';
import { CreateAccountDto } from '../models/create-account.dto';
import { Departments } from '../models/departments';

export function mapToDto(form: SignupFormModel): CreateAccountDto {
  // Map department name to department ID (index + 1, assuming 1-based IDs)
  const departmentIndex = Departments.findIndex(
    (dept) => dept.toLowerCase() === form.department.toLowerCase()
  );
  const departmentId = departmentIndex >= 0 ? departmentIndex + 1 : 1; // Default to 1 if not found

  return {
    userName: `${form.firstName}${form.lastName}`,
    email: form.email,
    department: departmentId,
    password: form.password,
    phoneNumber: form.phone,
    oneTimePassword: form.otp,
  };
}
