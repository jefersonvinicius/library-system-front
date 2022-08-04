import { User } from 'app/user';
import axios from 'axios';
import { HttpStatusCode } from 'infra/http';
import { api } from './axios';

export type LogInData = {
  email: string;
  password: string;
};

export interface AuthService {
  logIn(data: LogInData): Promise<User>;
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid Credentials');
  }
}

export class APIAuth implements AuthService {
  async logIn(data: LogInData) {
    try {
      const response = await api.post('/api/v1/login', data);
      return User.fromLogin(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === HttpStatusCode.Unauthorized)
        throw new InvalidCredentialsError();
      throw error;
    }
  }
}
