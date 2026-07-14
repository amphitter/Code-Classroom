export interface LoginResponse {
  success: boolean;

  token: string;

  student?: {
    id: string;
    name: string;
    rollNo: string;
    email: string;
  };

  admin?: {
    id: string;
    name: string;
  };
}