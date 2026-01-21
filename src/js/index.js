import { mount, setChildren } from 'redom';
import App from "./App";
import { MoonIcon, SunIcon } from './utils/icons.js';

function initializeTheme() {
    const html = document.documentElement;
    const btn = document.getElementById('theme-btn');
    const moonIcon = MoonIcon();
    const sunIcon = SunIcon();

    const setIcon = () => setChildren(btn, html.dataset.theme === 'dark' ? moonIcon : sunIcon);

    btn.addEventListener('click', () => {
        html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('ts-theme', html.dataset.theme);
        setIcon();
    });

    // Set initial theme
    html.dataset.theme = localStorage.getItem('ts-theme') || 'dark';
    setIcon();
}

initializeTheme();

const contentElement = document.getElementById('content-wrapper');
const app = new App();
mount(contentElement, app);