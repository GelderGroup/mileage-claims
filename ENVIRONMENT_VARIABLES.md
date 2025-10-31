# Environment Variables Configuration

## Required Environment Variables for Azure Static Web App

### Azure AD Configuration

These must be set in Azure Portal → Static Web App → Configuration → Application settings:

```
AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Automatically Provided by Azure

These are automatically available in Azure Functions:

```
AzureWebJobsStorage=[connection-string-auto-generated]
AZURE_STATIC_WEB_APPS_API_TOKEN=[auto-generated]
```

### Where to Set These

#### In Azure Portal:

1. Go to your Static Web App resource
2. Click "Configuration" in left menu
3. Click "Application settings" tab
4. Click "Add" for each variable
5. Click "Save" when done

#### Values to Use:

- **AZURE_CLIENT_ID**: From Azure AD App Registration → Overview → Application (client) ID
- **AZURE_TENANT_ID**: From Azure AD App Registration → Overview → Directory (tenant) ID

### How They're Used in Code:

#### Frontend (AuthService):

```javascript
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    redirectUri: window.location.origin + "/.auth/login/aad/callback",
  },
};
```

#### Backend (Azure Functions):

```javascript
const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/discovery/v2.0/keys`,
});
```

### Verification

After setting environment variables:

1. Redeploy your application (if needed)
2. Check browser console for any "undefined" client ID errors
3. Test authentication flow
4. Verify API calls work with proper tokens
