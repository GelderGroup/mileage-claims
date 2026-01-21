import { mount, setChildren } from 'redom';
import App from "./App";
import { MoonIcon, SunIcon } from './utils/icons.js';

function initializeTheme() {
    const html = document.documentElement;
    const btn = document.getElementById('theme-btn');
    const favIconLink = document.getElementById('fav-icon-link');

    const moonIcon = MoonIcon();
    const sunIcon = SunIcon();

    const setThemeIcon = () => setChildren(btn, html.dataset.theme === 'dark' ? moonIcon : sunIcon);
    const setFavicon = () => favIconLink.href = html.dataset.theme === 'dark' ? 'lib/assets/favicon-light.svg' : 'lib/assets/favicon-dark.svg';

    btn.addEventListener('click', () => {
        html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('ts-theme', html.dataset.theme);
        setThemeIcon();
        // setFavicon();
    });

    // Set initial theme
    html.dataset.theme = localStorage.getItem('ts-theme') || 'dark';
    setThemeIcon();
    // setFavicon();
}

initializeTheme();

const contentElement = document.getElementById('content-wrapper');
const app = new App();
mount(contentElement, app);