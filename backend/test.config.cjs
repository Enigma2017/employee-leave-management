/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  verbose: true,
  clearMocks: true,
  // Путь и шаблон для поиска тестов
  testMatch: [
    '**/tests/**/*.test.cjs',   // ищем все .test.cjs внутри папки tests
    '**/?(*.)+(spec|test).cjs' // альтернативный вариант
  ],
};