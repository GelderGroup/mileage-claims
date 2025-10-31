# Azure Static Web App Permissions Guide

## Available Roles for Static Web Apps

### **Website Contributor** (Recommended)

**What it allows:**

- ✅ View Static Web App settings and URL
- ✅ Configure application settings (environment variables)
- ✅ View deployment history and logs
- ✅ Manage custom domains
- ✅ Configure authentication providers
- ❌ Cannot delete the resource

### **Contributor** (Full Access)

**What it allows:**

- ✅ Everything Website Contributor can do
- ✅ Delete the Static Web App
- ✅ Modify resource-level settings
- ✅ Full management access

### **Reader** (View Only)

**What it allows:**

- ✅ View Static Web App URL and basic info
- ❌ Cannot change any settings
- ❌ Cannot configure environment variables

## How to Grant Permissions

### Method 1: At Resource Level

1. **Go to Azure Portal** → **Static Web Apps** → **Your app**
2. **Click "Access control (IAM)"** in left menu
3. **Click "Add" → "Add role assignment"**
4. **Select role**: "Website Contributor"
5. **Assign access to**: User, group, or service principal
6. **Select**: nick.adkinson@gelder.co.uk
7. **Click "Review + assign"**

### Method 2: At Resource Group Level

1. **Go to the Resource Group** containing the Static Web App
2. **Click "Access control (IAM)"**
3. **Add role assignment**: "Contributor"
4. **Assign to**: nick.adkinson@gelder.co.uk

## What Nick Needs

### Minimum Required:

- **Website Contributor** on the Static Web App resource

### What this enables:

- View the app URL
- Set environment variables (AZURE_CLIENT_ID, AZURE_TENANT_ID)
- Complete the authentication setup
- Monitor app performance and logs

### Alternative:

If you prefer not to grant permissions right away, you can:

1. **Share the app URL** manually
2. **Set the environment variables** yourself using the values from Azure AD app registration
3. **Grant permissions later** when needed

## Commands Nick Can Run After Getting Permissions

```bash
# View Static Web Apps
az staticwebapp list --output table

# Show specific app details
az staticwebapp show --name [app-name] --resource-group [rg-name]

# List app settings
az staticwebapp appsettings list --name [app-name] --resource-group [rg-name]

# Set environment variables
az staticwebapp appsettings set --name [app-name] --resource-group [rg-name] --setting-names AZURE_CLIENT_ID=[value]
```

## Next Steps After Permissions Granted

1. **Nick verifies access**: `az staticwebapp list`
2. **Get app URL**: From Azure portal or CLI
3. **Test current deployment**: Visit the URL
4. **Complete Azure AD setup**: Follow AZURE_AD_SETUP.md
5. **Set environment variables**: Either via portal or CLI
6. **Test authentication**: End-to-end testing
