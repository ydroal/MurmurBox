import axios from 'axios';

// const axiosInstance = axios.create();

// ベースURLの設定
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_ENDPOINT,
  withCredentials: true // HttpOnly Cookieをリクエストに自動で含める
});

// axiosのデフォルト設定
// インターセプターの設定
// axiosInstance.interceptors.request.use(config => {
//   console.log('リクエストが送信されました:', config);
//   return config;
// });

export default axiosInstance;
