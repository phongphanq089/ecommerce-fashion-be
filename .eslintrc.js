// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser', // Chỉ định parser cho TypeScript
  extends: [
    'eslint:recommended', // Sử dụng các quy tắc được khuyến nghị của ESLint
    'plugin:@typescript-eslint/recommended', // Sử dụng các quy tắc được khuyến nghị từ @typescript-eslint/eslint-plugin
    'plugin:prettier/recommended', // Bật eslint-plugin-prettier và eslint-config-prettier. Đây phải là cấu hình cuối cùng trong mảng extends.
  ],
  parserOptions: {
    ecmaVersion: 2021, // Cho phép phân tích cú pháp các tính năng ECMAScript hiện đại
    sourceType: 'module', // Cho phép sử dụng import
  },
  env: {
    node: true, // Bật các biến toàn cục của Node.js
    es2021: true,
  },
  rules: {
    // Tại đây, bạn có thể ghi đè hoặc thêm các quy tắc ESLint cụ thể.
    // Ví dụ:
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
