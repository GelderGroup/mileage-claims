import { el } from 'redom';
import { AuthService } from '../../services/authService.js';

export class LoginComponent {
    constructor() {
        this.user = null;
        this.onLoginChange = null;
        this.createElement();
        this.checkAuthState();
    }

    createElement = () => {
        this.loginBtn = el('button.primary', 'Sign in with Microsoft 365');
        this.logoutBtn = el('button.secondary', 'Sign out');
        this.userInfo = el('.user-info');

        this.el = el('.auth-container',
            this.userInfo,
            this.loginBtn,
            this.logoutBtn
        );

        // Initially hide logout button
        this.logoutBtn.style.display = 'none';
    }

    async checkAuthState() {
        try {
            const isAuthenticated = await AuthService.isAuthenticated();
            if (isAuthenticated) {
                const userInfo = await AuthService.getUserInfo();
                this.showLoggedInState(userInfo);
            } else {
                this.showLoggedOutState();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showLoggedOutState();
        }
    }

    showLoggedInState(userInfo) {
        this.user = userInfo;
        this.userInfo.textContent = `Welcome, ${userInfo.name}`;
        this.userInfo.style.display = 'block';
        this.loginBtn.style.display = 'none';
        this.logoutBtn.style.display = 'inline-block';

        if (this.onLoginChange) {
            this.onLoginChange(true, userInfo);
        }
    }

    showLoggedOutState() {
        this.user = null;
        this.userInfo.style.display = 'none';
        this.loginBtn.style.display = 'inline-block';
        this.logoutBtn.style.display = 'none';

        if (this.onLoginChange) {
            this.onLoginChange(false, null);
        }
    }

    onmount = () => {
        this.loginBtn.addEventListener('click', this.handleLogin);
        this.logoutBtn.addEventListener('click', this.handleLogout);
    }

    onunmount = () => {
        this.loginBtn.removeEventListener('click', this.handleLogin);
        this.logoutBtn.removeEventListener('click', this.handleLogout);
    }

    handleLogin = async () => {
        try {
            this.loginBtn.disabled = true;
            this.loginBtn.textContent = 'Signing in...';

            const account = await AuthService.login();
            const userInfo = await AuthService.getUserInfo();
            this.showLoggedInState(userInfo);
        } catch (error) {
            alert('Login failed: ' + error.message);
            this.showLoggedOutState();
        } finally {
            this.loginBtn.disabled = false;
            this.loginBtn.textContent = 'Sign in with Microsoft 365';
        }
    }

    handleLogout = async () => {
        try {
            await AuthService.logout();
            this.showLoggedOutState();
        } catch (error) {
            console.error('Logout failed:', error);
            // Still show logged out state even if logout fails
            this.showLoggedOutState();
        }
    }

    getCurrentUser() {
        return this.user;
    }
}