// src/services/api.js (hoặc src/api.js)
import axios from "axios";

const API_BASE_URL = "https://swp391-be-production.up.railway.app";
console.log("API Base URL:", API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // gửi/nhận cookie refreshToken
  headers: {
    'Content-Type': 'application/json'
  }
});

// THÊM INTERCEPTOR ĐỂ TỰ ĐỘNG GỬI TOKEN
api.interceptors.request.use(
  (config) => {
    // Lấy accessToken từ localStorage
    const token = localStorage.getItem('accessToken');
    
    // Nếu có token, thêm vào header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token được gửi:', token); // Debug log
    } else {
      console.log('Không tìm thấy token trong localStorage'); // Debug log
    }
    
    return config;
  },
  (error) => {
    console.error('Lỗi request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor xử lý response errors (tùy chọn)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log lỗi để debug
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Request error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response?.status === 401) {
      const errorMsg = error.response?.data?.message || '';
      
      // Nếu token hết hạn hoặc không hợp lệ
      if (errorMsg.toLowerCase().includes('token') || 
          errorMsg.toLowerCase().includes('unauthorized')) {
        console.log('Token không hợp lệ, cần đăng nhập lại');
        // Có thể tự động redirect về login
        // window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);