# Session Management System

This document describes the database-based session management system implemented in the SvelteKit application.

## Overview

The session management system provides secure, database-backed session storage with comprehensive administrative controls. It replaces the previous JWT-based approach with a more robust database solution that offers better security, monitoring, and management capabilities.

## Features

- **Database-backed sessions**: All sessions are stored in PostgreSQL with automatic expiration
- **Admin management interface**: Complete session monitoring and management through admin dashboard
- **Automatic cleanup**: Expired sessions are automatically cleaned up
- **User session tracking**: Monitor active sessions per user
- **Security controls**: Force logout users by invalidating their sessions
- **Audit trail**: Track session creation, updates, and deletions

## Architecture

### Database Schema

The sessions are stored in the `session` table with the following structure:

```sql
CREATE TABLE session (
  id SERIAL PRIMARY KEY,
  sessionToken VARCHAR(1024) UNIQUE NOT NULL,
  userId INTEGER NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  expires TIMESTAMP NOT NULL
);
```

### Session Strategy

The application now uses `strategy: 'database'` instead of JWT tokens, providing:

- Better security (sessions can be invalidated server-side)
- Centralized session management
- Automatic cleanup of expired sessions
- User activity monitoring

## Configuration

### Auth Configuration

The session configuration in `src/lib/auth.js`:

```javascript
session: {
  strategy: 'database',
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60, // 24 hours
}
```

- **maxAge**: Maximum session duration (30 days)
- **updateAge**: How often to update session timestamps (24 hours)

### Environment Variables

Ensure these environment variables are set:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/app
AUTH_SECRET=your-secret-key-here
```

## Session Management API

### Admin Sessions Endpoint

**GET** `/admin/sessions`
- Retrieves paginated list of all sessions
- Supports filtering by user ID
- Returns session data with user information

**DELETE** `/admin/sessions`
- Delete specific session by `sessionToken`
- Delete all sessions for a user by `userId`

**POST** `/admin/sessions`
- Action: `cleanup` - Remove all expired sessions

### Query Parameters

- `page`: Page number for pagination (default: 1)
- `limit`: Number of sessions per page (default: 20)
- `userId`: Filter sessions by specific user ID

## Session Manager Class

The `SessionManager` class provides comprehensive session management utilities:

### Core Methods

```javascript
// Create a new session
SessionManager.createSession(sessionToken, userId, expires)

// Get session by token
SessionManager.getSession(sessionToken)

// Get session with user data
SessionManager.getSessionWithUser(sessionToken)

// Update session expiration
SessionManager.updateSession(sessionToken, expires)

// Delete specific session
SessionManager.deleteSession(sessionToken)

// Delete all user sessions
SessionManager.deleteUserSessions(userId)

// Clean up expired sessions
SessionManager.cleanupExpiredSessions()

// Get active sessions for user
SessionManager.getUserActiveSessions(userId)

// Get session count for user
SessionManager.getUserSessionCount(userId)
```

## Admin Interface

### Sessions Management Page

Access the sessions management interface at `/admin/sessions` (admin role required).

**Features:**
- View all active and expired sessions
- Filter sessions by user ID
- Delete individual sessions
- Delete all sessions for a specific user
- Bulk cleanup of expired sessions
- Pagination for large numbers of sessions
- Real-time session status monitoring

**Session Information Displayed:**
- User details (name, email, role, ID)
- Session token (truncated for security)
- Expiration date and time
- Time until expiry
- Session status (Active/Expired)

## Maintenance Scripts

### Session Cleanup Utility

The `scripts/cleanup-sessions.js` script provides automated session cleanup:

```bash
# Perform actual cleanup
pnpm run sessions:cleanup

# Dry run (show what would be cleaned)
pnpm run sessions:cleanup:dry

# Verbose cleanup with detailed output
pnpm run sessions:cleanup:verbose
```

**Features:**
- Automatic detection of expired sessions
- Statistics before and after cleanup
- Dry-run mode for testing
- Verbose logging for debugging
- Graceful shutdown handling

### Scheduled Cleanup

For production environments, set up a cron job to run cleanup regularly:

```bash
# Clean up expired sessions daily at 2 AM
0 2 * * * cd /path/to/app && pnpm run sessions:cleanup

# Clean up expired sessions every 6 hours
0 */6 * * * cd /path/to/app && pnpm run sessions:cleanup
```

## Security Considerations

### Session Security

- Sessions are automatically expired based on `maxAge`
- Expired sessions are automatically cleaned up
- Sessions can be manually invalidated by administrators
- Session tokens are stored securely in the database
- Cascade deletion when users are removed

### Access Control

- Session management is restricted to admin users only
- All session operations require authentication
- User sessions can only be managed by administrators
- Session data is protected by proper authorization checks

## Monitoring and Analytics

### Session Metrics

The system provides real-time session statistics:

- Total active sessions
- Sessions per user
- Expired session count
- Sessions expiring soon
- Cleanup operation results

### Logging

Comprehensive logging for all session operations:

- Session creation and updates
- Session deletions and cleanups
- Error handling and debugging
- Administrative actions

## Migration from JWT

### Changes Made

1. **Auth Strategy**: Changed from `strategy: 'jwt'` to `strategy: 'database'`
2. **Session Callbacks**: Updated to work with database sessions
3. **Database Schema**: Sessions table already existed and was properly configured
4. **Admin Interface**: Added comprehensive session management UI

### Benefits

- **Better Security**: Sessions can be invalidated server-side
- **Centralized Control**: All sessions managed from admin dashboard
- **Audit Trail**: Complete history of session activities
- **User Management**: Force logout users by deleting their sessions
- **Resource Management**: Automatic cleanup prevents database bloat

## Troubleshooting

### Common Issues

**Session not persisting:**
- Check database connection
- Verify session table exists
- Check AUTH_SECRET environment variable

**Admin access denied:**
- Ensure user has admin role
- Check session authentication
- Verify route protection

**Cleanup script errors:**
- Verify database connection string
- Check script permissions
- Ensure all dependencies are installed

### Debug Mode

Enable debug mode in auth configuration:

```javascript
debug: process.env.NODE_ENV !== 'production'
```

This provides detailed logging for authentication and session operations.

## Best Practices

### Session Management

1. **Regular Cleanup**: Run cleanup scripts regularly to prevent database bloat
2. **Monitor Usage**: Use admin dashboard to monitor session patterns
3. **Security Reviews**: Regularly review active sessions for suspicious activity
4. **User Communication**: Inform users about session timeouts and security policies

### Performance

1. **Indexing**: Ensure proper database indexes on session tables
2. **Cleanup Frequency**: Balance cleanup frequency with performance impact
3. **Pagination**: Use pagination for large session lists
4. **Caching**: Consider caching frequently accessed session data

### Security

1. **Strong Secrets**: Use strong, unique AUTH_SECRET values
2. **HTTPS Only**: Ensure sessions are only transmitted over HTTPS
3. **Regular Rotation**: Consider rotating session secrets periodically
4. **Access Monitoring**: Monitor admin access to session management

## Future Enhancements

### Planned Features

- **Session Analytics**: Detailed usage patterns and statistics
- **Geolocation Tracking**: Track session locations for security
- **Device Fingerprinting**: Identify and track device types
- **Advanced Cleanup**: Configurable cleanup policies and schedules
- **Session Notifications**: Alert users about suspicious session activity

### Integration Opportunities

- **SIEM Systems**: Integration with security information systems
- **User Behavior Analytics**: Advanced user activity monitoring
- **Compliance Reporting**: Automated compliance and audit reports
- **API Rate Limiting**: Session-based rate limiting for API endpoints
