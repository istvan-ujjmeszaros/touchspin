import express from 'express';
import path from 'path';

export default async function setup() {
  // Global setup for Vitest
  // This runs once before all tests
  
  console.log('Setting up Vitest global environment...');
  
  // Set process max listeners to avoid warnings
  process.setMaxListeners(30);
  
  // The webServer in playwright.config.ts will handle starting the server
  // so we don't need to start it here like we did with Jest
  
  console.log('Vitest global setup complete');
}

export async function teardown() {
  // Global teardown for Vitest
  // This runs once after all tests
  
  console.log('Tearing down Vitest global environment...');
  
  // Cleanup any global resources if needed
  
  console.log('Vitest global teardown complete');
}