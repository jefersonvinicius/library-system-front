import axios, { AxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
});

function tokenInterceptor(token: string) {
  return (config: AxiosRequestConfig) => {
    console.log('HERER');
    if (config.headers) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  };
}

export function subscribeTokenInterceptor(token: string) {
  const id = api.interceptors.request.use(tokenInterceptor(token));
  console.log('Subscribed token interceptor with id ' + id);
  return id;
}

export function unsubscribeTokenInterceptor(id: number) {
  console.log('Unsubscribe token interceptor ' + id);
  api.interceptors.request.eject(id);
}
