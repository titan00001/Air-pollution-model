// Controller Layer: Handles user input, manages model state, and updates the view.

import * as Model from './model.js';
import * as View from './view.js';

// --- Application State ---
let currentStackParams = { ...Model.defaultStackParameters };
let currentEnvParams = { ...Model.defaultEnvironmentParameters };

// --- Initialization ---
function init() {
    const canvasElement = document.getElementById('screen');
    if (!canvasElement) {
        console.error("Canvas element #screen not found!");
        return;
    }
    View.initView(canvasElement); // Initialize the view with the canvas

    // Initial scene rendering
    requestRender();

    // TODO: Add event listeners for UI controls once they are in index.html
    // e.g., document.getElementById('windSpeedSlider').addEventListener('input', handleWindSpeedChange);
}

// --- Model Interaction & Data Preparation ---

/**
 * Generates the data points needed for rendering the smoke plume.
 * This involves iterating over a grid and calculating concentration at each point.
 * @returns {Array<object>} smokeData - [{x, z, concentration}, ...]
 */
function calculateSmokeData() {
    const smokeData = [];
    const canvasWidth = View.canvas ? View.canvas.width : 2000; // Get canvas width from view or default
    const simHeightOfConcern = currentStackParams.height * 2.5; // How high to calculate concentrations
    
    const intervalX = 3; // Resolution of calculation grid (matches visual particle size)
    const intervalY = 3;

    // The model's gaussianConcentration expects:
    // x: downwind distance from stack base
    // y: crosswind distance (0 for centerline)
    // z: height above ground

    for (let x_model = intervalX; x_model < canvasWidth - currentStackParams.posX; x_model += intervalX) { // x_model is distance from stack
        for (let z_model = 0; z_model <= simHeightOfConcern; z_model += intervalY) { // z_model is height from ground
            const concentration = Model.getConcentrationAtPoint(x_model, 0, z_model, currentStackParams, currentEnvParams);
            if (concentration >= 1) { // Only add points with some concentration
                smokeData.push({ 
                    x: x_model, // downwind distance from stack for view rendering
                    z: z_model, // height from ground for view rendering
                    concentration: concentration 
                });
            }
        }
    }
    return smokeData;
}


// --- View Updates ---

function requestRender() {
    // Prepare the complete model state for the view
    const smokeDataForView = calculateSmokeData();
    const modelState = {
        stackParameters: currentStackParams,
        environmentParameters: currentEnvParams,
        smokeData: smokeDataForView
    };
    View.drawScene(modelState);
}

// --- Event Handlers (Placeholders for now) ---
/*
function handleWindSpeedChange(event) {
    currentEnvParams.windVelocity = parseFloat(event.target.value);
    // Could add a debounce here if updates are too frequent
    requestRender();
}

function handleStackHeightChange(event) {
    currentStackParams.height = parseFloat(event.target.value);
    requestRender();
}
// ... other handlers for other parameters
*/

// --- Start the application ---
document.addEventListener('DOMContentLoaded', init); 