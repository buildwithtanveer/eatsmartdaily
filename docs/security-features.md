# Security Features

The EatSmartDaily application implements multiple layers of security to protect against common web vulnerabilities.

## HTTP Security Headers

The application sets comprehensive security headers via Next.js middleware:

### Content Security Policy (CSP)
- `default-src 'self'` - Restricts resources to same origin
- `script-src` - Allows scripts from trusted sources
- `style-src` - Allows styles from trusted sources
- `img-src` - Controls image loading
- `connect-src` - Restricts AJAX/fetch requests
- `frame-src` - Controls embedded frames
- `object-src 'none'` - Blocks plugins like Flash
- `upgrade-insecure-requests` - Forces HTTPS

### Additional Headers
- `Strict-Transport-Security` - Enforces HTTPS with 2-year max-age
- `X-Frame-Options` - Prevents clickjacking with SAMEORIGIN
- `X-XSS-Protection` - Legacy XSS protection
- `X-Content-Type-Options` - Prevents MIME type sniffing
- `Referrer-Policy` - Limits referrer information
- `Permissions-Policy` - Disables sensitive browser features

## Authentication & Authorization

### NextAuth.js Integration
- JWT-based authentication
- Role-based access control (ADMIN, EDITOR, AUTHOR, USER)
- Session management with 24-hour expiration
- Secure token storage

### Password Security
- BCrypt hashing for passwords
- Salted password storage
- Secure credential validation

## Input Sanitization

### HTML Sanitization
- Uses `sanitize-html` package
- Whitelist approach for allowed tags and attributes
- Special handling for rich content in posts and ads

### Data Validation
- Zod schema validation for API routes
- Client-side and server-side validation
- Type-safe input processing

## Rate Limiting

### Distributed Rate Limiting
- Upstash Redis for production environments
- Sliding window algorithm
- Per-endpoint limits
- Automatic fallback to in-memory for development

## Database Security

### Prisma ORM
- SQL injection prevention
- Type-safe database queries
- Parameterized queries
- Access control through Prisma schema

### Data Validation
- Schema-level constraints
- Input validation before database operations
- Proper escaping of user inputs

## Additional Security Measures

### CSRF Protection
- Session-based authentication
- Secure session handling

### Privacy Protection
- IP address hashing for analytics
- GDPR-compliant data handling
- Opt-out mechanisms for tracking

## Security Best Practices

### Environment Variables
- Sensitive data stored in environment variables
- No hardcoded secrets
- Secure configuration management

### Error Handling
- Generic error messages to prevent information disclosure
- Detailed logging for debugging
- Sentry integration for error tracking