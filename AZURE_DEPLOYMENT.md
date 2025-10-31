# Azure Deployment Guide for Mileage Claims App

## Prerequisites

- Azure subscription (free tier works fine)
- GitHub account
- Microsoft 365 business account for authentication

## Step 1: Prepare GitHub Repository

Since your project is already synced with GitHub, you're ready to deploy! Just ensure:

1. **All changes are committed and pushed** to your `main` branch
2. **Your repository is public** (or you have GitHub Pro for private repo deployments)

If you need to make the repository public:

- Go to your GitHub repository settings
- Scroll down to "Danger Zone"
- Click "Change repository visibility"
- Select "Make public"

## Step 2: Create Azure Static Web App

1. **Create Azure Static Web App**:
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
   - **Source**: GitHub
   - **GitHub account**: Sign in to your GitHub account
   - **Organization**: `data-handler` (your GitHub username)
   - **Repository**: Select `mileage-claims`
   - **Branch**: `main`
   - **Build Presets**: Custom
   - **App location**: `/` (root)
   - **Api location**: `/api`
   - **Output location**: `/dist`

3. **Review and Create**: Click "Review + create" then "Create"

## Step 3: Configure Microsoft 365 Authentication
   - **Branch**: `main`
   - **Build Presets**: Custom
   - **App location**: `/` (root)
   - **Api location**: `/api`
   - **Output location**: `/dist`

3. **Review and Create**: Click "Review + create" then "Create"

## Step 3: Configure Microsoft 365 Authentication

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

## Step 3: Configure Environment Variables

1. **In Azure Static Web Apps**:
   - Go to your Static Web App in Azure Portal
   - Click "Configuration" in the left menu
   - Add these application settings:
     - `AZURE_CLIENT_ID`: Your Application (client) ID from step 2
     - `AZURE_TENANT_ID`: Your Directory (tenant) ID from step 2
     - `AzureWebJobsStorage`: Connection string to Azure Storage (created automatically)

## Step 4: Update Configuration Files

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

2. **Commit and push** these changes to trigger automatic deployment

## Step 5: Install Dependencies

Before deploying, ensure all dependencies are installed:

```bash
# Install frontend dependencies
npm install

# Install API dependencies
cd api
npm install
cd ..
```

## Step 6: Test the Application

1. **Wait for deployment** (usually 2-3 minutes)
2. **Visit your app** at `https://your-app-name.azurestaticapps.net`
3. **Test authentication**:
   - Click "Sign In"
   - Use your Microsoft 365 business account
   - Should redirect back and show your name
4. **Test mileage submission**:
   - Click "Add Mileage Entry"
   - Fill in the form
   - Click "Save Entry"
   - Should save to Azure Table Storage

## Step 7: Monitor and Troubleshoot

1. **View logs**:

   - Azure Portal → Your Static Web App → Functions → Monitor
   - Check for any errors in the API functions

2. **Common issues**:
   - **Authentication fails**: Check client ID and tenant ID are correct
   - **API calls fail**: Check that Azure Functions are deployed correctly
   - **Cors errors**: Ensure redirect URI matches exactly

## Step 8: Optional Enhancements

1. **Custom domain**: Add your own domain in Static Web Apps configuration
2. **API authentication**: Add more robust token validation in Azure Functions
3. **Data export**: Add functionality to export mileage data to Excel/CSV
4. **Approval workflow**: Add manager approval process

## Security Notes

- The app uses Microsoft 365 authentication, so only users in your organization can access it
- Data is stored in Azure Table Storage with user-specific partitioning
- All API calls require valid authentication tokens
- HTTPS is enforced by default on Azure Static Web Apps

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
4. Ensure all environment variables are set correctly

Happy mileage tracking! 🚗📊
