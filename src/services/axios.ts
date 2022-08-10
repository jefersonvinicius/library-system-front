import axios, { AxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

function tokenInterceptor(token: string) {
  return (config: AxiosRequestConfig) => {
    if (config.headers) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  };
}

export function subscribeTokenInterceptor(token: string) {
  const id = api.interceptors.request.use(tokenInterceptor(token));
  return id;
}

export function unsubscribeTokenInterceptor(id: number) {
  api.interceptors.request.eject(id);
}
