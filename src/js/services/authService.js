import { PublicClientApplication } from '@azure/msal-browser';

// MSAL configuration
const msalConfig = {
    auth: {
        clientId: process.env.AZURE_CLIENT_ID || 'your-client-id-here', // Will be set in Azure
        authority: 'https://login.microsoftonline.com/common', // Multi-tenant
        redirectUri: window.location.origin + '/.auth/login/aad/callback'
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false
    }
};

// Login request configuration
const loginRequest = {
    scopes: ['User.Read', 'openid', 'profile', 'email']
};

// Create MSAL instance
let msalInstance = null;

export class AuthService {
    static async initialize() {
        if (!msalInstance) {
            msalInstance = new PublicClientApplication(msalConfig);
            await msalInstance.initialize();
        }
        return msalInstance;
    }

    static async login() {
        await this.initialize();

        try {
            const response = await msalInstance.loginPopup(loginRequest);
            console.log('Login successful:', response.account);
            return response.account;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    static async logout() {
        await this.initialize();

        try {
            await msalInstance.logoutPopup();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    static async getCurrentUser() {
        await this.initialize();

        const accounts = msalInstance.getAllAccounts();
        return accounts.length > 0 ? accounts[0] : null;
    }

    static async getAccessToken() {
        await this.initialize();

        const account = await this.getCurrentUser();
        if (!account) {
            throw new Error('No user logged in');
        }

        try {
            const response = await msalInstance.acquireTokenSilent({
                ...loginRequest,
                account: account
            });
            return response.accessToken;
        } catch (error) {
            console.warn('Silent token acquisition failed, trying popup:', error);

            try {
                const response = await msalInstance.acquireTokenPopup(loginRequest);
                return response.accessToken;
            } catch (popupError) {
                console.error('Token acquisition failed:', popupError);
                throw popupError;
            }
        }
    }

    static async isAuthenticated() {
        const user = await this.getCurrentUser();
        return user !== null;
    }

    static async getUserInfo() {
        const user = await this.getCurrentUser();
        if (!user) return null;

        return {
            name: user.name,
            email: user.username,
            id: user.homeAccountId
        };
    }
}

// Initialize on module load
AuthService.initialize().catch(console.error);