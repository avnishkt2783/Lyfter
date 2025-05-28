// utils/regex.jsx

const regexPatterns = {
  phone: /^[6-9]\d{9}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  aadharNumber: /^\d{4}\s\d{4}\s\d{4}$/,
  drivingLicenseNumber: /^[A-Z]{2}\d{2}\s?\d{11}$/,
  licensePlateNumber: /^[A-Z]{2}\d{2}\s?[A-Z]{1,3}\s?\d{4}$/,

    //forgot password page (check email and password)
//profile page(phone number, pincode)

};

/**
 * Get regex for a specific field.
 * @param {string} type - Type of field (e.g., 'phone', 'email', 'password')
 * @returns {RegExp} - The corresponding regex pattern.
 */
export function getRegex(type) {
  return regexPatterns[type] || null;
}
