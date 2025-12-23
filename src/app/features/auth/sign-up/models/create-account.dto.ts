export interface CreateAccountDto {
  userName: string;
 email: string; // Email address
   password: string; // Account password 
    phoneNumber: string; // Phone number with country code 
   oneTimePassword: string; // OTP for verification 
   department: number; // Department ID (numeric)
}
