import { mount } from '../js/ui/dom.js';
import App from "./App";

const contentElement = document.getElementById('content-wrapper');
const app = new App();
mount(contentElement, app);