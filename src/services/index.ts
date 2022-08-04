import axios from 'axios';
import { APIAuth } from './auth';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

export const authService = new APIAuth();
