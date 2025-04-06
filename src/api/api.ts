import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const api = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string | null) => void;
    reject: (error: AxiosError) => void;
}> = [];

const processQueue = (error?: AxiosError, token: string | null = null): void => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError): Promise<AxiosResponse> => {
        if (!error.config) {
            return Promise.reject(new Error('Missing request config'));
        }

        const originalRequest = error.config as CustomAxiosRequestConfig;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise<string | null>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers['Authorization'] = `Bearer ${token!}`;
                    return axios(originalRequest);
                });
            }

            isRefreshing = true;

            return new Promise<AxiosResponse>((resolve, reject) => {
                axios
                    .post('http://localhost:3000/auth/refresh', {}, { withCredentials: true })
                    .then((response) => {
                        const newToken = response.data.accessToken as string;
                        localStorage.setItem('accessToken', newToken);
                        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                        processQueue(undefined, newToken);
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        resolve(axios(originalRequest));
                    })
                    .catch((err: AxiosError) => {
                        processQueue(err);
                        localStorage.removeItem('accessToken');
                        window.location.href = '/login';
                        reject(new Error('Failed to refresh token'));
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            });
        }

        return Promise.reject(
            error instanceof Error ? error : new Error(JSON.stringify(error))
        );
    }
);

export default api;
