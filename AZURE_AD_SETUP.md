# Azure AD App Registration Setup Guide

## Overview

This guide sets up Microsoft 365 authentication for the Mileage Claims application.

## Prerequisites

- Azure subscription with Entra ID (Azure AD) access
- Static Web App URL (get from Azure Portal)
- Permission to create app registrations in Azure AD

## Step 1: Create App Registration

### 1.1 Navigate to Azure AD

1. Go to **Azure Portal** (portal.azure.com)
2. Search for **"Azure Active Directory"** or **"Entra ID"**
3. Click on your Azure AD tenant (gelder.co.uk)

### 1.2 Create New App Registration

1. In the left menu, click **"App registrations"**
2. Click **"New registration"**
3. Fill in the details:

   - **Name**: `Mileage Claims App`
   - **Supported account types**:
     - Select "Accounts in this organizational directory only (gelder.co.uk only - Single tenant)"
   - **Redirect URI**:
     - Type: "Single-page application (SPA)"
     - URL: `https://YOUR-STATIC-WEB-APP-URL.azurestaticapps.net/.auth/login/aad/callback`
     - (Replace YOUR-STATIC-WEB-APP-URL with actual URL)

4. Click **"Register"**

### 1.3 Configure Authentication

1. Go to **"Authentication"** in the left menu
2. Under **"Single-page application"**, verify your redirect URI is listed
3. Under **"Implicit grant and hybrid flows"**, check:
   - ✅ **Access tokens** (used for implicit flows)
   - ✅ **ID tokens** (used for implicit and hybrid flows)
4. Click **"Save"**

### 1.4 Configure API Permissions

1. Go to **"API permissions"** in the left menu
2. Click **"Add a permission"**
3. Select **"Microsoft Graph"**
4. Select **"Delegated permissions"**
5. Add these permissions:
   - ✅ **User.Read** (Sign in and read user profile)
   - ✅ **openid** (Sign users in)
   - ✅ **profile** (View users' basic profile)
   - ✅ **email** (View users' email address)
6. Click **"Add permissions"**
7. Click **"Grant admin consent for gelder.co.uk"** (requires admin)
8. Click **"Yes"** to confirm

### 1.5 Copy Required Values

Go to **"Overview"** and copy these values:

- **Application (client) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Directory (tenant) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**SAVE THESE VALUES** - you'll need them for configuration!

## Step 2: Update Static Web App Configuration

### 2.1 Set Environment Variables

In your Static Web App resource:

1. Go to **"Configuration"** in the left menu
2. Click **"Application settings"**
3. Add these settings:

   - **Name**: `AZURE_CLIENT_ID`
   - **Value**: Your Application (client) ID from step 1.5

   - **Name**: `AZURE_TENANT_ID`
   - **Value**: Your Directory (tenant) ID from step 1.5

4. Click **"Save"**

### 2.2 Verify URLs Match

Ensure the redirect URI in your app registration exactly matches:
`https://YOUR-ACTUAL-STATIC-WEB-APP-URL.azurestaticapps.net/.auth/login/aad/callback`

## Step 3: Test Authentication

1. Visit your Static Web App URL
2. Click **"Sign In"** button
3. Should redirect to Microsoft 365 login
4. Enter your gelder.co.uk credentials
5. Should redirect back to the app and show your name

## Troubleshooting

### Common Issues:

- **Redirect URI mismatch**: Ensure URLs match exactly (including https://)
- **Permissions not granted**: Admin must grant consent for the organization
- **Wrong tenant**: Ensure app registration is in gelder.co.uk tenant
- **Environment variables**: Must be set in Static Web App configuration

### Error Messages:

- **"AADSTS50011"**: Redirect URI mismatch
- **"AADSTS65001"**: User or admin has not consented
- **"AADSTS700016"**: Application not found in directory

## Security Notes

- Only gelder.co.uk users can authenticate
- Permissions are minimal (just user profile reading)
- All authentication tokens are handled by Azure
- No user data is stored outside Azure

## Next Steps

After successful authentication setup:

1. Test user login/logout flow
2. Test mileage entry submission
3. Verify data storage in Azure Tables
4. Set up data export functionality
   chore:redeploy agin
