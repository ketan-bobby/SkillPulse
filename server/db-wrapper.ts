import { db } from "./db";

// Simple wrapper for database operations with retry logic
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a connection-related error
      const isConnectionError = 
        error.code === '57P01' || // admin_shutdown
        error.code === '08000' || // connection_exception
        error.message?.includes('terminating connection') ||
        error.message?.includes('connection terminated') ||
        error.message?.includes('ECONNRESET');
      
      if (isConnectionError && attempt < maxRetries) {
        console.log(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError;
}

// For read operations (non-critical, shorter timeout)
export async function executeRead<T>(operation: () => Promise<T>): Promise<T> {
  return executeWithRetry(operation, 2, 500);
}

// For write operations (critical, more retries)
export async function executeWrite<T>(operation: () => Promise<T>): Promise<T> {
  return executeWithRetry(operation, 3, 1000);
}