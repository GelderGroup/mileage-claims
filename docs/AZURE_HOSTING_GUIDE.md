# Azure Hosting & Microsoft 365 Integration Guide

## 🏢 **What You Can Do with Entry-Level Azure + M365 Business**

### ✅ **Available Services (Included in M365 Business)**

- **Azure Static Web Apps** (Free tier) - Perfect for hosting your mileage app
- **Azure AD (Entra ID)** - Already included with M365 Business
- **Microsoft Graph API** - Access to user profiles and authentication
- **Azure Functions** (Free tier) - For backend API endpoints
- **Azure Table Storage** or **SharePoint Lists** - For simple data storage

## 🎯 **Recommended Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                    AZURE + M365 ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────┘

🌐 FRONTEND (Azure Static Web Apps - FREE)
┌─────────────────────────────────┐
│     Mileage Claims App          │
│  ┌───────────────────────────┐  │
│  │ • Your re:dom app         │  │
│  │ • MSAL.js authentication  │  │
│  │ • Static hosting          │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
              │ authenticates via
              ▼
🔐 AUTHENTICATION (Entra ID - INCLUDED)
┌─────────────────────────────────┐
│       Azure AD (Entra)          │
│  ┌───────────────────────────┐  │
│  │ • M365 user accounts      │  │
│  │ • Single Sign-On          │  │
│  │ • Access tokens           │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
              │ calls
              ▼
⚡ BACKEND API (Azure Functions - FREE TIER)
┌─────────────────────────────────┐
│      Serverless Functions       │
│  ┌───────────────────────────┐  │
│  │ • Save mileage entries    │  │
│  │ • Validate permissions    │  │
│  │ • Export data for sync    │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
              │ stores in
              ▼
💾 DATA STORAGE (Choose One)
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│     Azure Table Storage         │    │      SharePoint Lists           │
│  ┌───────────────────────────┐  │    │  ┌───────────────────────────┐  │
│  │ • Simple key-value store  │  │ OR │  │ • Native M365 integration │  │
│  │ • Very cheap              │  │    │  │ • Easy export to Excel    │  │
│  │ • Easy to sync            │  │    │  │ • Familiar to users       │  │
│  └───────────────────────────┘  │    │  └───────────────────────────┘  │
└─────────────────────────────────┘    └─────────────────────────────────┘
```

## 🚀 **Implementation Steps**

### **Step 1: Set Up Azure Static Web Apps (FREE)**

1. **In Azure Portal**:

   - Create new "Static Web App" resource
   - Connect to your GitHub repo
   - Set build folder to `dist`
   - Deploy automatically on push

2. **Build Configuration** (`staticwebapp.config.json`):

```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "auth": {
    "identityProviders": {
      "azureActiveDirectory": {
        "userDetailsClaim": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
        "registration": {
          "openIdIssuer": "https://login.microsoftonline.com/{tenant-id}/v2.0",
          "clientIdSettingName": "AZURE_CLIENT_ID",
          "clientSecretSettingName": "AZURE_CLIENT_SECRET"
        }
      }
    }
  }
}
```

### **Step 2: Set Up Entra ID App Registration**

1. **In Entra ID Admin Center**:

   - App Registrations → New Registration
   - Name: "Mileage Claims App"
   - Supported account types: "Accounts in this organizational directory only"
   - Redirect URI: `https://your-app.azurestaticapps.net/.auth/login/aad/callback`

2. **Configure API Permissions**:

   - Microsoft Graph → User.Read (to get user profile)
   - Grant admin consent

3. **Create Client Secret**:
   - Certificates & secrets → New client secret
   - Copy the value (you'll need this)

### **Step 3: Add Authentication to Your App**

Install MSAL.js:

```bash
npm install @azure/msal-browser
```

Create authentication service:

```javascript
// src/js/services/authService.js
import { PublicClientApplication } from "@azure/msal-browser";

const msalConfig = {
  auth: {
    clientId: "your-client-id-here",
    authority: "https://login.microsoftonline.com/your-tenant-id",
    redirectUri: window.location.origin,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export class AuthService {
  static async initialize() {
    await msalInstance.initialize();
  }

  static async login() {
    try {
      const response = await msalInstance.loginPopup({
        scopes: ["User.Read"],
      });
      return response.account;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  static async logout() {
    await msalInstance.logoutPopup();
  }

  static getCurrentUser() {
    const accounts = msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  static async getAccessToken() {
    const account = this.getCurrentUser();
    if (!account) return null;

    try {
      const response = await msalInstance.acquireTokenSilent({
        scopes: ["User.Read"],
        account: account,
      });
      return response.accessToken;
    } catch (error) {
      // Fallback to interactive login
      const response = await msalInstance.acquireTokenPopup({
        scopes: ["User.Read"],
      });
      return response.accessToken;
    }
  }
}
```

### **Step 4: Set Up Data Storage**

#### **Option A: Azure Table Storage (Recommended for simplicity)**

Create Azure Functions API:

```javascript
// api/saveMileageEntry/index.js
const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
  // Verify authentication
  if (!req.headers["x-ms-client-principal"]) {
    context.res = { status: 401, body: "Unauthorized" };
    return;
  }

  const user = JSON.parse(Buffer.from(req.headers["x-ms-client-principal"], "base64").toString());

  const tableClient = TableClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING, "MileageEntries");

  const mileageEntry = {
    partitionKey: user.userDetails, // User email
    rowKey: Date.now().toString(), // Unique ID
    date: req.body.date,
    startPostcode: req.body.startPostcode,
    endPostcode: req.body.endPostcode,
    miles: req.body.miles,
    submittedAt: new Date().toISOString(),
    status: "submitted",
  };

  try {
    await tableClient.createEntity(mileageEntry);
    context.res = {
      status: 200,
      body: { success: true, id: mileageEntry.rowKey },
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: { error: "Failed to save entry" },
    };
  }
};
```

#### **Option B: SharePoint Lists (Better for business users)**

```javascript
// api/saveMileageEntry/index.js
const { Client } = require('@microsoft/microsoft-graph-client');

module.exports = async function (context, req) {
    // Get access token for Graph API
    const graphClient = Client.init({
        authProvider: /* your auth provider */
    });

    const listItem = {
        fields: {
            Date: req.body.date,
            StartPostcode: req.body.startPostcode,
            EndPostcode: req.body.endPostcode,
            Miles: req.body.miles,
            SubmittedBy: user.userDetails,
            SubmittedAt: new Date().toISOString()
        }
    };

    try {
        await graphClient
            .sites('{site-id}')
            .lists('{list-id}')
            .items
            .post(listItem);

        context.res = { status: 200, body: { success: true } };
    } catch (error) {
        context.res = { status: 500, body: { error: 'Failed to save' } };
    }
};
```

### **Step 5: Update Your Mileage App**

Modify your service to call Azure Functions:

```javascript
// src/js/services/mileageService.js
export class MileageService {
  static async saveMileageEntry(data) {
    const token = await AuthService.getAccessToken();

    const response = await fetch("/api/saveMileageEntry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to save mileage entry");
    }

    return await response.json();
  }
}
```

## 💰 **Cost Breakdown (Entry-Level)**

| Service                   | Cost      | What You Get                        |
| ------------------------- | --------- | ----------------------------------- |
| **Azure Static Web Apps** | FREE      | 100GB bandwidth, custom domains     |
| **Azure Functions**       | FREE      | 1M requests/month, 400K GB-seconds  |
| **Azure Table Storage**   | ~$1/month | 5GB storage, millions of operations |
| **Entra ID**              | INCLUDED  | With M365 Business subscription     |
| **SharePoint**            | INCLUDED  | With M365 Business subscription     |

**Total additional cost: ~$0-2/month**

## 🔄 **Data Export for On-Premises Processing**

Create export function:

```javascript
// api/exportMileageData/index.js
module.exports = async function (context, req) {
  // Verify internal service authentication
  if (req.headers["x-api-key"] !== process.env.INTERNAL_API_KEY) {
    context.res = { status: 401 };
    return;
  }

  const tableClient = TableClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING, "MileageEntries");

  const entities = tableClient.listEntities({
    filter: `status eq 'submitted'`,
  });

  const data = [];
  for await (const entity of entities) {
    data.push({
      id: entity.rowKey,
      user: entity.partitionKey,
      date: entity.date,
      startPostcode: entity.startPostcode,
      endPostcode: entity.endPostcode,
      miles: entity.miles,
      submittedAt: entity.submittedAt,
    });
  }

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: data,
  };
};
```

Your on-premises service can then call:

```bash
curl -H "x-api-key: your-secret-key" \
  https://your-app.azurestaticapps.net/api/exportMileageData
```

## 🎯 **Next Steps**

1. **Create Azure Static Web App** (5 minutes)
2. **Set up Entra ID app registration** (10 minutes)
3. **Add MSAL authentication to your app** (30 minutes)
4. **Create Azure Functions for data storage** (45 minutes)
5. **Test end-to-end flow** (15 minutes)

This gives you a **enterprise-grade solution** using only **free/included Azure services** with your M365 Business account! 🚀

Would you like me to help you implement any specific part of this architecture?
