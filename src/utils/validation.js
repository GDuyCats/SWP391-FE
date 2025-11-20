// Validation utility functions

/**
 * Validate email format
 * @param {string} email
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return { isValid: false, message: "Email không được để trống" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Email không hợp lệ" };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate username
 * @param {string} username
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateUsername = (username) => {
  if (!username || username.trim() === "") {
    return { isValid: false, message: "Tên người dùng không được để trống" };
  }

  if (username.length < 3) {
    return {
      isValid: false,
      message: "Tên người dùng phải có ít nhất 3 ký tự",
    };
  }

  if (username.length > 50) {
    return {
      isValid: false,
      message: "Tên người dùng không được quá 50 ký tự",
    };
  }

  // Only allow alphanumeric, underscore, and hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      message:
        "Tên người dùng chỉ được chứa chữ cái, số, gạch dưới và gạch ngang",
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate password
 * @param {string} password
 * @returns {object} { isValid: boolean, message: string }
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === "") {
    return { isValid: false, message: "Mật khẩu không được để trống" };
  }

  if (password.length < 6) {
    return { isValid: false, message: "Mật khẩu phải có ít nhất 6 ký tự" };
  }

  if (password.length > 100) {
    return { isValid: false, message: "Mật khẩu không được quá 100 ký tự" };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate phone number (Vietnam format)
 * @param {string} phone
 * @returns {object} { isValid: boolean, message: string }
 */
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === "") {
    return { isValid: false, message: "Số điện thoại không được để trống" };
  }

  // Remove spaces and special characters
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");

  // Vietnam phone format: 10-11 digits, start with 0
  const phoneRegex = /^0[0-9]{9,10}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return {
      isValid: false,
      message:
        "Số điện thoại không hợp lệ (phải có 10-11 số và bắt đầu bằng 0)",
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate required field
 * @param {string} value
 * @param {string} fieldName
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateRequired = (value, fieldName = "Trường này") => {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return { isValid: false, message: `${fieldName} không được để trống` };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate number
 * @param {string|number} value
 * @param {string} fieldName
 * @param {object} options - { min, max, allowZero }
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateNumber = (value, fieldName = "Giá trị", options = {}) => {
  const { min, max, allowZero = false } = options;

  if (value === "" || value === null || value === undefined) {
    return { isValid: false, message: `${fieldName} không được để trống` };
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} phải là số` };
  }

  if (!allowZero && num === 0) {
    return { isValid: false, message: `${fieldName} phải lớn hơn 0` };
  }

  if (num < 0) {
    return { isValid: false, message: `${fieldName} không được âm` };
  }

  if (min !== undefined && num < min) {
    return {
      isValid: false,
      message: `${fieldName} phải lớn hơn hoặc bằng ${min}`,
    };
  }

  if (max !== undefined && num > max) {
    return {
      isValid: false,
      message: `${fieldName} phải nhỏ hơn hoặc bằng ${max}`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate year (for vehicle year)
 * @param {string|number} year
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateYear = (year) => {
  const currentYear = new Date().getFullYear();

  if (!year || year === "") {
    return { isValid: false, message: "Năm sản xuất không được để trống" };
  }

  const yearNum = Number(year);

  if (isNaN(yearNum)) {
    return { isValid: false, message: "Năm sản xuất phải là số" };
  }

  if (yearNum < 1900) {
    return { isValid: false, message: "Năm sản xuất không hợp lệ" };
  }

  if (yearNum > currentYear + 1) {
    return {
      isValid: false,
      message: `Năm sản xuất không được lớn hơn ${currentYear + 1}`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate price
 * @param {string|number} price
 * @returns {object} { isValid: boolean, message: string }
 */
export const validatePrice = (price) => {
  return validateNumber(price, "Giá", { min: 1000, allowZero: false });
};

/**
 * Validate text length
 * @param {string} text
 * @param {string} fieldName
 * @param {object} options - { min, max }
 * @returns {object} { isValid: boolean, message: string }
 */
export const validateTextLength = (text, fieldName, options = {}) => {
  const { min = 0, max } = options;

  if (!text || text.trim() === "") {
    return { isValid: false, message: `${fieldName} không được để trống` };
  }

  const length = text.trim().length;

  if (length < min) {
    return {
      isValid: false,
      message: `${fieldName} phải có ít nhất ${min} ký tự`,
    };
  }

  if (max && length > max) {
    return {
      isValid: false,
      message: `${fieldName} không được vượt quá ${max} ký tự`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate multiple fields at once
 * @param {object} validations - { fieldName: validationResult }
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateForm = (validations) => {
  const errors = {};
  let isValid = true;

  Object.keys(validations).forEach((key) => {
    const validation = validations[key];
    if (!validation.isValid) {
      errors[key] = validation.message;
      isValid = false;
    }
  });

  return { isValid, errors };
};
