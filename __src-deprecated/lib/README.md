# Tauri Backend Handlers

 - Central module for all frontend-to-backend communication.
 - All Tauri invoke() calls should go through this module.
 - This provides a clean abstraction layer between the frontend and backend, making it easy to mock, test, or replace backend implementations.
