import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

interface ConnectionOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  healthCheckInterval?: number;
}

class DatabaseConnectionManager {
  private pool: Pool | null = null;
  private db: any = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastHealthCheck: Date = new Date();
  
  private readonly options: Required<ConnectionOptions> = {
    maxRetries: 5,
    initialDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    backoffMultiplier: 2,
    healthCheckInterval: 60000 // 1 minute
  };

  constructor(options: ConnectionOptions = {}) {
    this.options = { ...this.options, ...options };
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }

    await this.connect();
    this.startHealthCheck();
  }

  private async connect(): Promise<void> {
    try {
      console.log('Initializing database connection...');
      
      this.pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 10000, // 10 seconds
        idleTimeoutMillis: 30000, // 30 seconds
        max: 20, // Maximum pool size
      });

      this.db = drizzle({ client: this.pool, schema });
      
      // Test the connection
      await this.healthCheck();
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Database connection established successfully');
      
    } catch (error) {
      console.error('Failed to connect to database:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private async reconnectWithBackoff(): Promise<void> {
    if (this.reconnectAttempts >= this.options.maxRetries) {
      throw new Error(`Failed to reconnect after ${this.options.maxRetries} attempts`);
    }

    const delay = Math.min(
      this.options.initialDelay * Math.pow(this.options.backoffMultiplier, this.reconnectAttempts),
      this.options.maxDelay
    );

    console.log(`Attempting to reconnect (attempt ${this.reconnectAttempts + 1}/${this.options.maxRetries}) in ${delay}ms...`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    this.reconnectAttempts++;
    
    try {
      await this.connect();
    } catch (error) {
      console.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error);
      await this.reconnectWithBackoff();
    }
  }

  private async healthCheck(): Promise<boolean> {
    try {
      if (!this.pool) {
        throw new Error('Database pool not initialized');
      }

      // Simple health check query
      const result = await this.pool.query('SELECT 1 as health_check');
      this.lastHealthCheck = new Date();
      
      if (!this.isConnected) {
        console.log('Database connection restored');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      }
      
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      this.isConnected = false;
      
      // Attempt reconnection
      this.reconnectWithBackoff().catch(reconnectError => {
        console.error('Failed to reconnect during health check:', reconnectError);
      });
      
      return false;
    }
  }

  private startHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(() => {
      this.healthCheck();
    }, this.options.healthCheckInterval);
  }

  public async executeQuery<T>(
    operation: (db: any) => Promise<T>,
    operationType: 'read' | 'write' = 'read'
  ): Promise<T> {
    if (!this.isConnected) {
      console.log('Database not connected, attempting to reconnect...');
      await this.reconnectWithBackoff();
    }

    try {
      return await operation(this.db);
    } catch (error: any) {
      console.error(`Database ${operationType} operation failed:`, error);
      
      // Check if it's a connection-related error
      if (this.isConnectionError(error)) {
        console.log('Connection error detected, attempting to reconnect...');
        this.isConnected = false;
        await this.reconnectWithBackoff();
        
        // Retry the operation once after reconnection
        return await operation(this.db);
      }
      
      throw error;
    }
  }

  private isConnectionError(error: any): boolean {
    const connectionErrorCodes = [
      '57P01', // admin_shutdown
      '57P02', // crash_shutdown
      '57P03', // cannot_connect_now
      '08000', // connection_exception
      '08003', // connection_does_not_exist
      '08006', // connection_failure
    ];

    const connectionErrorMessages = [
      'terminating connection due to administrator command',
      'connection terminated',
      'server closed the connection unexpectedly',
      'connection reset by peer',
      'ECONNRESET',
      'ENOTFOUND',
      'ETIMEDOUT',
    ];

    if (error.code && connectionErrorCodes.includes(error.code)) {
      return true;
    }

    if (error.message) {
      return connectionErrorMessages.some(msg => 
        error.message.toLowerCase().includes(msg.toLowerCase())
      );
    }

    return false;
  }

  public getConnectionStatus(): {
    isConnected: boolean;
    lastHealthCheck: Date;
    reconnectAttempts: number;
  } {
    return {
      isConnected: this.isConnected,
      lastHealthCheck: this.lastHealthCheck,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  public async close(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.db = null;
      this.isConnected = false;
    }
  }

  // Getter for the database instance
  public get database() {
    return this.db;
  }

  // Getter for the pool instance
  public get connectionPool() {
    return this.pool;
  }
}

// Create singleton instance
export const connectionManager = new DatabaseConnectionManager({
  maxRetries: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  healthCheckInterval: 60000
});

// Export the database instance
export const db = connectionManager.database;
export const pool = connectionManager.connectionPool;

// Helper function for database operations
export const withDatabase = async <T>(
  operation: (db: any) => Promise<T>,
  operationType: 'read' | 'write' = 'read'
): Promise<T> => {
  return connectionManager.executeQuery(operation, operationType);
};

// Health check endpoint helper
export const getDatabaseHealth = () => connectionManager.getConnectionStatus();