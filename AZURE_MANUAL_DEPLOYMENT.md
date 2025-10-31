# Azure Manual Deployment Guide for Mileage Claims App

## Prerequisites

- Azure subscription (free tier works fine)
- Azure CLI installed locally
- Microsoft 365 business account for authentication
- Node.js and npm installed

## Step 1: Install Required Tools

1. **Install Azure CLI** (if not already installed):

   - Download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli
   - Or via PowerShell: `winget install Microsoft.AzureCLI`

2. **Install Azure Static Web Apps CLI**:

   ```powershell
   npm install -g @azure/static-web-apps-cli
   ```

3. **Login to Azure**:
   ```powershell
   az login
   ```

## Step 2: Create Azure Static Web App (Portal Method)

1. **Create Static Web App**:

   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource"
   - Search for "Static Web Apps" and select it
   - Click "Create"

2. **Configure the Static Web App**:

   - **Subscription**: Choose your Azure subscription
   - **Resource Group**: Create new or select existing
   - **Name**: `mileage-claims-app` (or your preferred name)
   - **Plan type**: Free
   - **Region**: Choose closest to your location
   - **Source**: Other (since we're deploying manually)

3. **Review and Create**: Click "Review + create" then "Create"

4. **Get Deployment Token**:
   - After creation, go to your Static Web App resource
   - Click "Manage deployment token" in the Overview
   - Copy the deployment token (you'll need this)

## Step 3: Build Your Application

1. **Build the frontend**:

   ```powershell
   npm run build
   ```

2. **Install API dependencies**:
   ```powershell
   cd api
   npm install
   cd ..
   ```

## Step 4: Deploy Using Azure CLI

1. **Deploy to Azure Static Web Apps**:

   ```powershell
   az staticwebapp deploy `
     --name mileage-claims-app `
     --resource-group your-resource-group `
     --source ./dist `
     --api-source ./api
   ```

   Or using the SWA CLI with your deployment token:

   ```powershell
   swa deploy ./dist --api-location ./api --deployment-token "your-deployment-token-here"
   ```

## Step 5: Configure Microsoft 365 Authentication

1. **Create App Registration** in Azure Active Directory:

   - Go to Azure Portal → Azure Active Directory → App registrations
   - Click "New registration"
   - **Name**: `Mileage Claims App`
   - **Supported account types**: "Accounts in this organizational directory only"
   - **Redirect URI**:
     - Type: Single-page application (SPA)
     - URL: `https://your-app-name.azurestaticapps.net` (replace with your actual URL)
   - Click "Register"

2. **Configure Authentication**:

   - In your app registration, go to "Authentication"
   - Under "Single-page application", add your redirect URI if not already added
   - Under "Implicit grant and hybrid flows", check:
     - ✅ Access tokens
     - ✅ ID tokens
   - Save

3. **Copy Application Details**:
   - Go to "Overview" tab
   - Copy the **Application (client) ID**
   - Copy the **Directory (tenant) ID**

## Step 6: Configure Environment Variables

1. **In Azure Static Web Apps**:
   - Go to your Static Web App in Azure Portal
   - Click "Configuration" in the left menu
   - Add these application settings:
     - `AZURE_CLIENT_ID`: Your Application (client) ID from step 5
     - `AZURE_TENANT_ID`: Your Directory (tenant) ID from step 5
     - `AzureWebJobsStorage`: Connection string to Azure Storage (created automatically)

## Step 7: Update Configuration Files

1. **Update `src/js/services/authService.js`**:
   Replace the placeholder values:

   ```javascript
   const msalConfig = {
     auth: {
       clientId: "YOUR_CLIENT_ID", // Replace with your actual client ID
       authority: "https://login.microsoftonline.com/YOUR_TENANT_ID", // Replace with your tenant ID
       redirectUri: "https://your-app-name.azurestaticapps.net",
     },
   };
   ```

2. **Rebuild and redeploy**:
   ```powershell
   npm run build
   swa deploy ./dist --api-location ./api --deployment-token "your-deployment-token"
   ```

## Step 8: Test the Application

1. **Visit your app** at `https://your-app-name.azurestaticapps.net`
2. **Test authentication**:
   - Click "Sign In"
   - Use your Microsoft 365 business account
   - Should redirect back and show your name
3. **Test mileage submission**:
   - Click "Add Mileage Entry"
   - Fill in the form
   - Click "Save Entry"
   - Should save to Azure Table Storage

## Step 9: Future Updates

For future updates, simply:

1. Make your code changes
2. Build: `npm run build`
3. Deploy: `swa deploy ./dist --api-location ./api --deployment-token "your-token"`

## Alternative: PowerShell Deployment Script

Create a `deploy.ps1` file for easy redeployment:

```powershell
# Build the application
Write-Host "Building application..." -ForegroundColor Green
npm run build

# Deploy to Azure
Write-Host "Deploying to Azure..." -ForegroundColor Green
swa deploy ./dist --api-location ./api --deployment-token "YOUR_DEPLOYMENT_TOKEN_HERE"

Write-Host "Deployment complete!" -ForegroundColor Green
```

Then run: `.\deploy.ps1`

## Security Notes

- Your repository stays private on your local machine/private repo
- Deployment token should be kept secure (consider using Azure Key Vault for production)
- All sensitive configuration is done through Azure portal, not in code
- Authentication and data remain secure in Azure

## Cost Estimate

- **Azure Static Web Apps**: Free tier (includes 100GB bandwidth, custom domains)
- **Azure Functions**: Free tier (1M requests/month)
- **Azure Table Storage**: ~$0.05/month for typical usage
- **Azure Active Directory**: Free (included with Microsoft 365)

**Total monthly cost**: Under $1 for typical small business usage

## Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Review Azure Function logs in the Azure Portal
3. Verify authentication configuration in Azure AD
4. Ensure all environment variables are set correctly in Azure portal

Happy mileage tracking! 🚗📊
