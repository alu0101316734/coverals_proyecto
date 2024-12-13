import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest', // Usa ts-jest como preset
  testEnvironment: 'node', // Entorno para pruebas en Node.js
  verbose: true,          // Muestra resultados detallados
  moduleFileExtensions: ['ts', 'js'], // Archivos soportados
  coverageDirectory: './coverage',
  collectCoverage: true,
  coverageReporters: ['text', 'text-summary', 'lcov'],
  testMatch: ['**/*.test.ts'], // Busca archivos .test.ts

};

export default config;
