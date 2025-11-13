import { mount } from '../js/ui/dom.js';
import App from "./App";
import { MileageModal } from './Components/index.js';

const contentElement = document.getElementById('content-wrapper');

const view = new App();
mount(contentElement, view);

// const view = new MileageModal();

// mount(contentElement, view);

// For demo purposes, open the modal immediately
// view.open();