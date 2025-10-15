// src/api.js (tạo 1 lần)
import axios from "axios";

const API_BASE_URL = "https://swp391-be-production.up.railway.app";

console.log("API Base URL:", API_BASE_URL); // Debug log

export const api = axios.create({
  baseURL: API_BASE_URL, // Force production API
  withCredentials: true, // gửi/nhận cookie refreshToken
});
