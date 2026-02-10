# Development Setup Guide

## Running on ops3-19ee08662.qiyi.virtual

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Access to the server

### Environment Configuration

The `.env` file should be configured as follows for development:

```bash
# Environment - Set to "dev" or "test" for development
ENV=dev

# App URL - The URL where your app is accessible
# IMPORTANT: This must match the actual URL CAS can reach
NEXT_PUBLIC_APP_URL="http://ops3-19ee08662.qiyi.virtual:3000"

# CAS Configuration
CAS_REDIRECT_URL="http://ops3-19ee08662.qiyi.virtual:3000/dashboard/"

# Pangaea API Configuration
PANGAEA_API_BASE_URL="http://ops3-19ee08662.qiyi.virtual:8080"
```

### Installation

```bash
# Install dependencies
npm install

# Copy .env.example to .env and configure
cp .env.example .env
# Edit .env with your settings
```

### Running Development Server

```bash
# Start development server
npm run dev

# The app will be available at:
# - Local: http://localhost:3000
# - Network: http://ops3-19ee08662.qiyi.virtual:3000
```

### CAS Authentication Flow

1. **Login Route**: `/api/auth/cas/login`
   - Redirects to CAS server for authentication
   - Uses test CAS server when `ENV=dev` or `ENV=test`

2. **Callback Route**: `/api/auth/cas/callback`
   - Receives ticket from CAS
   - Validates ticket with CAS `/serviceValidate` endpoint
   - Creates session cookie
   - Redirects to original destination

3. **Middleware**: Protects routes and redirects unauthenticated users to CAS login

### Important Notes

1. **NEXT_PUBLIC_APP_URL**: Must be set correctly so CAS can redirect back to your app
   - If running on `ops3-19ee08662.qiyi.virtual:3000`, set it to that exact URL
   - CAS uses this URL to validate tickets, so it must match exactly

2. **CAS Service URL Matching**: 
   - The service URL sent to CAS during login must EXACTLY match the one used for ticket validation
   - This is handled automatically, but ensure `NEXT_PUBLIC_APP_URL` is set correctly

3. **Port Configuration**:
   - Default port is 3000
   - To use a different port: `PORT=3001 npm run dev`
   - Update `NEXT_PUBLIC_APP_URL` accordingly

### Troubleshooting

**CAS Login Issues:**
- Check that `ENV=dev` is set in `.env`
- Verify `NEXT_PUBLIC_APP_URL` matches the actual server URL
- Check server logs for CAS callback errors
- Ensure CAS server can reach your callback URL

**Route 404 Errors:**
- Clear Next.js cache: `rm -rf .next`
- Restart dev server
- Check that route files exist in `src/app/api/`

**Session Issues:**
- Check browser cookies for `cas_session`
- Verify session cookie is being set (check Network tab)
- Clear cookies and try logging in again

### API Routes

- `/api/auth/cas/login` - CAS login initiation
- `/api/auth/cas/callback` - CAS callback handler
- `/api/auth/logout` - Logout and CAS logout
- `/api/auth/me` - Get current user session
- `/api/pangaea-envs` - Pangaea environments
- `/api/env-templates` - Environment templates
- `/api/config-branches` - Config branches

### Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

For production, update `.env`:
- Remove or set `ENV` to production value
- Update `NEXT_PUBLIC_APP_URL` to production URL
- Update `PANGAEA_API_BASE_URL` to production API
