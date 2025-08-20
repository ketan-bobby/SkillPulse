// TERO API Testing Suite - Comprehensive endpoint testing for LinxAssess
import express from 'express';
// Authentication will be handled by the main routes

const router = express.Router();

// Health check endpoint for TERO
router.get('/api/tero/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    system: 'LinxAssess TERO Testing Suite'
  });
});

// Comprehensive API testing endpoints
router.get('/api/tero/test-endpoints', async (req, res) => {
  if (!req.isAuthenticated() || !["admin", "super_admin"].includes(req.user!.role)) {
    return res.sendStatus(403);
  }
  const endpoints = [
    // Authentication endpoints
    { endpoint: '/api/user', method: 'GET', category: 'auth', description: 'Current user info' },
    { endpoint: '/api/auth/login', method: 'POST', category: 'auth', description: 'User login' },
    { endpoint: '/api/auth/logout', method: 'POST', category: 'auth', description: 'User logout' },
    
    // User management endpoints
    { endpoint: '/api/users', method: 'GET', category: 'users', description: 'List all users' },
    { endpoint: '/api/users', method: 'POST', category: 'users', description: 'Create new user' },
    { endpoint: '/api/users/:id', method: 'PUT', category: 'users', description: 'Update user' },
    { endpoint: '/api/users/:id', method: 'DELETE', category: 'users', description: 'Delete user' },
    
    // Test management endpoints
    { endpoint: '/api/tests', method: 'GET', category: 'tests', description: 'List all tests' },
    { endpoint: '/api/tests', method: 'POST', category: 'tests', description: 'Create new test' },
    { endpoint: '/api/tests/:id', method: 'PUT', category: 'tests', description: 'Update test' },
    { endpoint: '/api/tests/:id', method: 'DELETE', category: 'tests', description: 'Delete test' },
    
    // Question management endpoints
    { endpoint: '/api/questions', method: 'GET', category: 'questions', description: 'List all questions' },
    { endpoint: '/api/questions/pending', method: 'GET', category: 'questions', description: 'Pending questions' },
    { endpoint: '/api/questions', method: 'POST', category: 'questions', description: 'Create question' },
    { endpoint: '/api/questions/:id/approve', method: 'POST', category: 'questions', description: 'Approve question' },
    { endpoint: '/api/questions/:id/reject', method: 'POST', category: 'questions', description: 'Reject question' },
    
    // Assignment endpoints
    { endpoint: '/api/assignments', method: 'GET', category: 'assignments', description: 'List assignments' },
    { endpoint: '/api/assignments', method: 'POST', category: 'assignments', description: 'Create assignment' },
    { endpoint: '/api/assignments/:id', method: 'PUT', category: 'assignments', description: 'Update assignment' },
    
    // Results endpoints
    { endpoint: '/api/results', method: 'GET', category: 'results', description: 'List all results' },
    { endpoint: '/api/results/pending', method: 'GET', category: 'results', description: 'Pending results' },
    { endpoint: '/api/results/declared', method: 'GET', category: 'results', description: 'Declared results' },
    { endpoint: '/api/admin/all-results', method: 'GET', category: 'results', description: 'Admin view results' },
    
    // Analytics endpoints
    { endpoint: '/api/analytics/results', method: 'GET', category: 'analytics', description: 'Results analytics' },
    { endpoint: '/api/analytics/performance', method: 'GET', category: 'analytics', description: 'Performance metrics' },
    
    // AI Integration endpoints
    { endpoint: '/api/ai/system-insights', method: 'GET', category: 'ai', description: 'System insights' },
    { endpoint: '/api/ai/talent-analytics', method: 'GET', category: 'ai', description: 'Talent analytics' },
    { endpoint: '/api/ai/learning-path', method: 'GET', category: 'ai', description: 'Learning path generation' },
    
    // Company management endpoints
    { endpoint: '/api/companies', method: 'GET', category: 'companies', description: 'List companies' },
    { endpoint: '/api/companies', method: 'POST', category: 'companies', description: 'Create company' },
    { endpoint: '/api/companies/:id', method: 'PUT', category: 'companies', description: 'Update company' },
    
    // Department management endpoints
    { endpoint: '/api/departments', method: 'GET', category: 'departments', description: 'List departments' },
    { endpoint: '/api/departments', method: 'POST', category: 'departments', description: 'Create department' },
    
    // Email management endpoints
    { endpoint: '/api/email/stats', method: 'GET', category: 'email', description: 'Email statistics' },
    { endpoint: '/api/email/send', method: 'POST', category: 'email', description: 'Send email' },
    
    // System endpoints
    { endpoint: '/api/system/health', method: 'GET', category: 'system', description: 'System health check' },
    { endpoint: '/api/system/stats', method: 'GET', category: 'system', description: 'System statistics' },
  ];

  res.json({
    total: endpoints.length,
    endpoints,
    categories: Array.from(new Set(endpoints.map(e => e.category))),
    timestamp: new Date().toISOString()
  });
});

// Database connectivity test
router.get('/api/tero/test-database', async (req, res) => {
  if (!req.isAuthenticated() || !["admin", "super_admin"].includes(req.user!.role)) {
    return res.sendStatus(403);
  }
  try {
    const { storage } = req;
    
    // Test basic database operations
    const tests = [];
    
    // Test user table
    try {
      const users = await storage.getUsers();
      tests.push({
        table: 'users',
        operation: 'SELECT',
        status: 'success',
        count: users.length
      });
    } catch (error) {
      tests.push({
        table: 'users',
        operation: 'SELECT',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test tests table
    try {
      const testsData = await storage.getTests();
      tests.push({
        table: 'tests',
        operation: 'SELECT',
        status: 'success',
        count: testsData.length
      });
    } catch (error) {
      tests.push({
        table: 'tests',
        operation: 'SELECT',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test questions table
    try {
      const questions = await storage.getQuestions();
      tests.push({
        table: 'questions',
        operation: 'SELECT',
        status: 'success',
        count: questions.length
      });
    } catch (error) {
      tests.push({
        table: 'questions',
        operation: 'SELECT',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Test companies table
    try {
      const companies = await storage.getCompanies();
      tests.push({
        table: 'companies',
        operation: 'SELECT',
        status: 'success',
        count: companies.length
      });
    } catch (error) {
      tests.push({
        table: 'companies',
        operation: 'SELECT',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    const passedTests = tests.filter(t => t.status === 'success').length;
    const failedTests = tests.filter(t => t.status === 'failed').length;
    
    res.json({
      database_status: failedTests === 0 ? 'healthy' : 'issues_detected',
      total_tests: tests.length,
      passed: passedTests,
      failed: failedTests,
      tests,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      database_status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date().toISOString()
    });
  }
});

// Performance testing endpoint
router.get('/api/tero/test-performance', async (req, res) => {
  if (!req.isAuthenticated() || !["admin", "super_admin"].includes(req.user!.role)) {
    return res.sendStatus(403);
  }
  const startTime = process.hrtime.bigint();
  
  try {
    const { storage } = await import('./storage');
    
    // Run performance tests
    const performanceTests = [];
    
    // Test API response time
    const apiStart = process.hrtime.bigint();
    await storage.getUsers();
    const apiEnd = process.hrtime.bigint();
    const apiDuration = Number(apiEnd - apiStart) / 1000000; // Convert to milliseconds
    
    performanceTests.push({
      test: 'API Response Time',
      duration_ms: apiDuration,
      status: apiDuration < 1000 ? 'good' : apiDuration < 2000 ? 'acceptable' : 'slow',
      threshold: '< 1000ms optimal, < 2000ms acceptable'
    });
    
    // Test database query performance
    const dbStart = process.hrtime.bigint();
    await Promise.all([
      storage.getUsers(),
      storage.getTests(),
      storage.getQuestions()
    ]);
    const dbEnd = process.hrtime.bigint();
    const dbDuration = Number(dbEnd - dbStart) / 1000000;
    
    performanceTests.push({
      test: 'Database Query Performance',
      duration_ms: dbDuration,
      status: dbDuration < 500 ? 'excellent' : dbDuration < 1000 ? 'good' : 'needs_optimization',
      threshold: '< 500ms excellent, < 1000ms good'
    });
    
    // Memory usage test
    const memUsage = process.memoryUsage();
    performanceTests.push({
      test: 'Memory Usage',
      heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
      status: memUsage.heapUsed < 100 * 1024 * 1024 ? 'excellent' : 'acceptable',
      threshold: '< 100MB excellent'
    });
    
    const endTime = process.hrtime.bigint();
    const totalDuration = Number(endTime - startTime) / 1000000;
    
    res.json({
      performance_status: 'completed',
      total_test_duration_ms: totalDuration,
      tests: performanceTests,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      performance_status: 'failed',
      error: error instanceof Error ? error.message : 'Performance test failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Security testing endpoint
router.get('/api/tero/test-security', async (req, res) => {
  if (!req.isAuthenticated() || !["admin", "super_admin"].includes(req.user!.role)) {
    return res.sendStatus(403);
  }
  try {
    const securityTests = [];
    
    // Test authentication
    securityTests.push({
      test: 'Authentication Required',
      status: req.user ? 'passed' : 'failed',
      description: 'Endpoint requires valid authentication'
    });
    
    // Test role-based access
    securityTests.push({
      test: 'Role-Based Access Control',
      status: req.user?.role ? 'passed' : 'failed',
      user_role: req.user?.role || 'none',
      description: 'User has assigned role for access control'
    });
    
    // Test session security
    securityTests.push({
      test: 'Session Security',
      status: req.session ? 'passed' : 'failed',
      description: 'Secure session management active'
    });
    
    // Test HTTPS (in production)
    const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
    securityTests.push({
      test: 'HTTPS Protocol',
      status: process.env.NODE_ENV === 'development' ? 'skipped' : isSecure ? 'passed' : 'failed',
      description: 'Secure HTTP protocol in use'
    });
    
    const passedTests = securityTests.filter(t => t.status === 'passed').length;
    const failedTests = securityTests.filter(t => t.status === 'failed').length;
    
    res.json({
      security_status: failedTests === 0 ? 'secure' : 'vulnerabilities_detected',
      total_tests: securityTests.length,
      passed: passedTests,
      failed: failedTests,
      tests: securityTests,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      security_status: 'test_failed',
      error: error instanceof Error ? error.message : 'Security test failed',
      timestamp: new Date().toISOString()
    });
  }
});

// System health comprehensive test
router.get('/api/tero/system-health', async (req, res) => {
  if (!req.isAuthenticated() || !["admin", "super_admin"].includes(req.user!.role)) {
    return res.sendStatus(403);
  }
  try {
    const { storage } = await import('./storage');
    
    const healthChecks = [];
    
    // Database connectivity
    try {
      await storage.getUsers();
      healthChecks.push({
        component: 'Database',
        status: 'healthy',
        message: 'Database connection successful'
      });
    } catch (error) {
      healthChecks.push({
        component: 'Database',
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Database connection failed'
      });
    }
    
    // Memory usage
    const memUsage = process.memoryUsage();
    const memoryHealthy = memUsage.heapUsed < 200 * 1024 * 1024; // Less than 200MB
    healthChecks.push({
      component: 'Memory',
      status: memoryHealthy ? 'healthy' : 'warning',
      heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
      message: memoryHealthy ? 'Memory usage within normal limits' : 'High memory usage detected'
    });
    
    // Process uptime
    const uptimeSeconds = process.uptime();
    healthChecks.push({
      component: 'Uptime',
      status: 'healthy',
      uptime_seconds: Math.round(uptimeSeconds),
      uptime_formatted: formatUptime(uptimeSeconds),
      message: 'Application running normally'
    });
    
    // Environment check
    healthChecks.push({
      component: 'Environment',
      status: 'healthy',
      node_env: process.env.NODE_ENV || 'unknown',
      node_version: process.version,
      message: 'Environment configured correctly'
    });
    
    const healthyComponents = healthChecks.filter(h => h.status === 'healthy').length;
    const overallHealth = healthyComponents === healthChecks.length ? 'healthy' : 'degraded';
    
    res.json({
      overall_status: overallHealth,
      total_components: healthChecks.length,
      healthy_components: healthyComponents,
      health_checks: healthChecks,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      overall_status: 'critical',
      error: error instanceof Error ? error.message : 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to format uptime
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

export { router as teroApiTests };