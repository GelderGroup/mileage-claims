import { createEmptyLine } from './mileage.js';

/**
 * Creates modal state and actions for handling mileage entry modals
 * This returns functions that components can use to manage modal state
 */
export function createModalActions() {
    return {
        // Create initial state (component should call this in its script)
        createState() {
            return {
                isOpen: false,
                editingLine: null,
                tempLine: null
            };
        },

        // Actions that modify state
        openForAdd(state) {
            state.tempLine = createEmptyLine();
            state.editingLine = null;
            state.isOpen = true;
        },

        openForEdit(state, line) {
            state.tempLine = { ...line }; // Create a copy for editing
            state.editingLine = line;
            state.isOpen = true;
        },

        close(state) {
            state.isOpen = false;
            // Clean up
            setTimeout(() => {
                state.tempLine = null;
                state.editingLine = null;
            }, 300);
        },

        save(state, lines, savedLine) {
            if (state.editingLine) {
                // Update existing line
                const index = lines.findIndex((l) => l.id === state.editingLine.id);
                if (index !== -1) {
                    lines[index] = savedLine;
                }
            } else {
                // Add new line
                lines.push(savedLine);
            }
            this.close(state);
            return [...lines]; // Return new array for reactivity
        },

        getTitle(state) {
            return state.editingLine ? 'Edit Mileage Entry' : 'Add Mileage Entry';
        }
    };
}