# 🎯 Final Authentication Setup - NEXT STEPS

## ✅ Completed So Far

- [x] Static Web App deployed: `https://icy-moss-0a168e003.3.azurestaticapps.net`
- [x] Environment variables configured (AZURE_TENANT_ID, STATIC_WEB_APP_URL)
- [x] Authentication code ready in the app

## 🔧 Remaining Steps

### Step 1: Create Azure AD App Registration

**WHO:** Your boss or Azure admin
**WHERE:** Azure Portal → Azure Active Directory → App registrations

1. Click "New registration"
2. Name: `Mileage Claims App`
3. Supported account types: `Accounts in this organizational directory only`
4. Redirect URI:
   - Platform: `Web`
   - URL: `https://icy-moss-0a168e003.3.azurestaticapps.net/.auth/login/aad/callback`
5. Click "Register"
6. **Copy the Application (client) ID** - you'll need this!

### Step 2: Configure Authentication

In the newly created app registration:

1. Go to **Authentication** section
2. Under "Implicit grant and hybrid flows":
   - ✅ Check "Access tokens"
   - ✅ Check "ID tokens"
3. Click "Save"

### Step 3: Add Client ID to Environment Variables

**WHO:** Your boss or you (if you have contributor access)

```powershell
az staticwebapp appsettings set --name "mileage-claims-app" --resource-group "rg-mileage-claims" --setting-names AZURE_CLIENT_ID="[YOUR-ACTUAL-CLIENT-ID]"
```

Replace `[CLIENT-ID-FROM-STEP-1]` with the actual Application (client) ID from Step 1.

### Step 4: Test Authentication

1. Visit: `https://icy-moss-0a168e003.3.azurestaticapps.net`
2. Click "Sign In with Microsoft 365"
3. Log in with your gelder.co.uk account
4. Should see your name/email displayed
5. Try submitting a mileage entry

## 🔍 Verification Checklist

- [ ] Azure AD app registration created
- [ ] Client ID configured in Static Web App settings
- [ ] Login button works and redirects to Microsoft login
- [ ] After login, user name/email is displayed
- [ ] Mileage submission works and saves data
- [ ] No console errors in browser developer tools

## 🚨 If Something Goes Wrong

### Authentication Doesn't Work

1. Check browser console for errors (F12 → Console)
2. Verify redirect URI exactly matches: `https://icy-moss-0a168e003.3.azurestaticapps.net/.auth/login/aad/callback`
3. Ensure both Access tokens and ID tokens are enabled in Azure AD app

### Data Not Saving

1. Check Network tab in browser dev tools (F12 → Network)
2. Look for POST requests to `/api/saveMileageEntry`
3. Check response status and error messages

### Need Help

- Check `TROUBLESHOOTING.md` for common issues
- Environment variables can be viewed with: `az staticwebapp appsettings list --name "mileage-claims-app" --resource-group "rg-mileage-claims"`

## 📋 Quick Command Reference

```powershell
# Check current settings
az staticwebapp appsettings list --name "mileage-claims-app" --resource-group "rg-mileage-claims"

# Set client ID (replace with actual value)
az staticwebapp appsettings set --name "mileage-claims-app" --resource-group "rg-mileage-claims" --setting-names AZURE_CLIENT_ID="your-client-id-here"

# Check deployment status
az staticwebapp show --name "mileage-claims-app" --resource-group "rg-mileage-claims" --query "defaultHostname"
```

---

**🎉 Once completed, your mileage claims app will be fully functional with Microsoft 365 authentication!**
