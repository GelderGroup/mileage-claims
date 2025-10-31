# Quick Setup Reference Card

## 📋 For Your Boss - Complete Setup Checklist

### 1. Share Static Web App URL ✅ COMPLETED

- [x] Go to Azure Portal → Static Web Apps → Your app
- [x] Copy URL from Overview page
- [x] Share with Nick: `https://icy-moss-0a168e003.3.azurestaticapps.net`

### 2. Grant Permissions (Optional but Recommended)

- [ ] Static Web App → Access control (IAM) → Add role assignment
- [ ] Role: "Website Contributor" (or "Contributor" for full access)
- [ ] User: nick.adkinson@gelder.co.uk

### 3. Create Azure AD App Registration

- [ ] Azure AD → App registrations → New registration
- [ ] Name: "Mileage Claims App"
- [ ] Redirect URI: `https://icy-moss-0a168e003.3.azurestaticapps.net/.auth/login/aad/callback`
- [ ] Save Client ID and Tenant ID

### 4. Set Environment Variables

- [ ] Static Web App → Configuration → Application settings
- [ ] Add: `AZURE_CLIENT_ID` = [client-id-from-step-3]
- [ ] Add: `AZURE_TENANT_ID` = [tenant-id-from-step-3]

## 🔧 For Nick - After Getting Access

### 1. Test Current Deployment

- [ ] Visit the Static Web App URL
- [ ] Verify app loads and UI works
- [ ] Test "Add Mileage Entry" modal

### 2. Complete Authentication Setup

- [ ] Follow AZURE_AD_SETUP.md guide
- [ ] Configure environment variables
- [ ] Test Microsoft 365 login

### 3. End-to-End Testing

- [ ] Login with M365 account
- [ ] Submit a test mileage entry
- [ ] Verify data saves to Azure storage

## 🚨 Troubleshooting Quick Fixes

### App Won't Load

- Check Static Web App URL is correct
- Verify deployment completed successfully

### Authentication Fails

- Verify Client ID and Tenant ID are set correctly
- Check redirect URI matches exactly (including `/.auth/login/aad/callback`)
- Ensure admin consent granted for app permissions

### API Calls Fail

- Check Azure Functions are deployed
- Verify environment variables are set
- Test authentication token is being generated

## 📞 Need Help?

- All configuration guides are in the project files
- AZURE_AD_SETUP.md has step-by-step instructions
- ENVIRONMENT_VARIABLES.md explains all required settings
