export interface IRequest {
  id?: string;
  user?: {
    id: string;
    email: string;
  };
  [key: string]: any;
}

export interface IResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface IError {
  status: number;
  message: string;
}
