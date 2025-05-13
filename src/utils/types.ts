export interface RegisterRequestBody {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface ChangePasswordRequestBody {
  userId: string;
  newPassword: string;
  oldPassword: string;
}

export interface RefreshTokenRequestBody {
  refreshToken: string;
}

export interface OTPRequestBody {
  email: string;
}

export interface ResetPasswordRequestBody {
  new_password: string;
  otp: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  password: string;
  email: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  userId: string;
  oldPassword: string;
  newPassword: string;
}

export interface ResetPasswordData {
  password: string;
  otp: string;
}
