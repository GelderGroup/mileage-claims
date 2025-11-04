# Azure EasyAuth Setup Guide

This guide will walk you through configuring Azure EasyAuth for your Static Web App to enable secure, enterprise-grade authentication.

## What is Azure EasyAuth?

Azure EasyAuth (officially called "Authentication") is a built-in authentication service for Azure App Service and Static Web Apps that:

- **Handles all authentication complexity** - No JWT libraries needed
- **Enterprise-grade security** - Microsoft-managed, SOC-compliant
- **Zero additional cost** - Included free with Static Web Apps
- **Automatic token refresh** - No manual token management
- **Multi-provider support** - Microsoft, Google, Facebook, Twitter, etc.

## Setup Steps

### 1. Navigate to Your Static Web App

1. Go to the [Azure Portal](https://portal.azure.com)
2. Find your Static Web App (should be named like `mileage-claims-app` or similar)
3. Click on it to open the resource

### 2. Configure Authentication

1. In the left sidebar, click on **"Authentication"**
2. Click **"Add identity provider"**

### 3. Choose Microsoft as Identity Provider

1. Select **"Microsoft"** from the dropdown
2. Configure the following settings:

#### App registration type:

- Select **"Create new app registration"**

#### Name:

- Enter: `Mileage Claims App`

#### Supported account types:

- Select **"Current tenant - Single tenant"** (most secure for enterprise)
- OR select **"Any Azure AD directory - Multitenant"** if you need broader access

#### Restrict access:

- Select **"Require authentication"**

#### Unauthenticated requests:

- Select **"HTTP 302 Found redirect: recommended for websites"**

### 4. Save Configuration

1. Click **"Add"** at the bottom
2. Wait for the configuration to be applied (may take 2-3 minutes)

### 5. Verify Configuration

After setup completes, you should see:

- **Identity provider**: Microsoft
- **Status**: Enabled
- **Client ID**: (automatically generated)

### 6. Optional: Configure Additional Settings

Click on your Microsoft provider to access advanced options:

#### Client secret expiration:

- Default is fine (Azure manages this automatically)

#### Allowed token audiences:

- Should be auto-populated correctly

#### Issuer URL:

- Should be: `https://sts.windows.net/{your-tenant-id}/`

## How EasyAuth Works

Once configured, Azure EasyAuth automatically:

1. **Redirects unauthenticated users** to Microsoft sign-in page
2. **Validates tokens** using Microsoft's trusted certificates
3. **Sets authentication headers** on all API requests:

   - `x-ms-client-principal`: Base64-encoded user information
   - `x-ms-client-principal-id`: User's unique ID
   - `x-ms-client-principal-name`: User's display name

4. **Protects all routes** by default (unless explicitly excluded)

## Code Changes Summary

Your application has been updated to work with EasyAuth:

### Frontend Changes:

- **Removed manual token handling** from API calls
- **Simplified authentication flow** - Azure handles everything
- **Added X-Requested-With headers** for AJAX identification

### Backend API Changes:

- **Updated all API endpoints** to read user info from EasyAuth headers
- **Removed JWT validation libraries** that were causing errors
- **Simplified user identification** using `x-ms-client-principal` header

### Key Benefits:

- **No more 500 errors** from JWT validation issues
- **Automatic token refresh** - users stay signed in
- **Enterprise security** - SOC 2 compliant, Microsoft-managed
- **Zero maintenance** - No certificate updates, no library updates

## Testing the Setup

After configuration is complete:

1. **Deploy the updated code** (we'll do this next)
2. **Visit your app** - you should be redirected to Microsoft sign-in
3. **Sign in with your M365 account**
4. **Test vehicle registration** - should work without authentication errors
5. **Test mileage submission** - should save successfully to Cosmos DB

## Troubleshooting

### If you get redirected to sign-in repeatedly:

- Check that your app registration supports your account type
- Verify the Static Web App domain is configured correctly

### If API calls still fail:

- Check that EasyAuth is enabled and configured
- Ensure your account has access to the configured tenant

### If you can't access the app at all:

- Temporarily change "Unauthenticated requests" to "Allow unauthenticated access"
- Test authentication step by step

## Next Steps

Once EasyAuth is configured:

1. Deploy the updated application code
2. Test the complete authentication and data submission flow
3. Configure any additional security settings as needed

## Security Notes

With EasyAuth enabled:

- **All API endpoints are automatically protected**
- **User identity is cryptographically verified** by Microsoft
- **Tokens are managed automatically** - no client-side storage needed
- **Session management is handled** by Azure infrastructure

This provides enterprise-grade security with zero ongoing maintenance.
