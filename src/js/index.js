import { mount } from "redom";
import App from "./App";
import MileageModal from "./Components/MileageModal";

const contentElement = document.getElementById('content-wrapper');
// const app = new App();
// mount(contentElement, app);

const view = new MileageModal();

mount(contentElement, view);

// For demo purposes, open the modal immediately
view.open();