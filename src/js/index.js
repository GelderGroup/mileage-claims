import { mount, setChildren } from 'redom';
import App from "./App";
import { MoonSolidIcon, SunSolidIcon } from './utils/icons.js';

function initializeTheme() {
    const html = document.documentElement;
    const btn = document.getElementById('theme-btn');

    const moonIcon = MoonSolidIcon();
    const sunIcon = SunSolidIcon();

    const setThemeIcon = () => setChildren(btn, html.dataset.theme === 'dark' ? moonIcon : sunIcon);

    btn.addEventListener('click', () => {
        html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('ts-theme', html.dataset.theme);
        setThemeIcon();
    });

    // Set initial theme
    html.dataset.theme = localStorage.getItem('ts-theme') || 'dark';
    setThemeIcon();
}

initializeTheme();

const contentElement = document.getElementById('content-wrapper');
const app = new App();
mount(contentElement, app);