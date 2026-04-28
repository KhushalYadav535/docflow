# Production Deployment Configuration

## Frontend (Vercel) Environment Variables

Set these in your Vercel dashboard (Project Settings → Environment Variables):

```
NEXT_PUBLIC_API_URL=https://docflowbackend-1.onrender.com/api
```

## Backend (Render) Environment Variables

Set these in your Render dashboard (Environment tab):

```
CORS_ORIGIN=https://docflow-nu.vercel.app
```

**Note:** The backend CORS is configured to accept multiple origins separated by commas. You can add multiple frontend URLs if needed:
```
CORS_ORIGIN=https://docflow-nu.vercel.app,https://www.docflow.com,http://localhost:3000
```

## Verification

After setting environment variables:
1. **Redeploy both services** (Vercel and Render will automatically redeploy when env vars change, or trigger manual redeploy)
2. Check browser console for API connection errors
3. Test login functionality to verify backend connection

## Troubleshooting

- **CORS errors**: Make sure `CORS_ORIGIN` in Render includes your Vercel frontend URL
- **404 errors**: Verify `NEXT_PUBLIC_API_URL` in Vercel points to `https://docflowbackend-1.onrender.com/api` (include `/api` path)
- **Connection refused**: Check Render service is running and accessible
