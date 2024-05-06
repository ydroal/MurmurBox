import axios from 'axios';

// const axiosInstance = axios.create();

// ベースURLの設定
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_ENDPOINT
});

// axiosのデフォルト設定
// インターセプターの設定
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('jwt');
  config.headers.Authorization = token ? `Bearer ${token}` : '';
  return config;
});

export default axiosInstance;
