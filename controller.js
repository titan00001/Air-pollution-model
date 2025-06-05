// Controller Layer: Handles user input, manages model state, and updates the view.

import * as Model from './model.js';
import * as View from './view.js';

// --- Application State ---
let currentStackParams = { ...Model.defaultStackParameters };
let currentEnvParams = { ...Model.defaultEnvironmentParameters };

// --- UI Element References ---
let stackHeightSlider, windVelocitySlider, windDirectionInput;
let stackHeightValueSpan, windVelocityValueSpan;
let stabilityClassSelect, ambientTemperatureInput, backgroundConcentrationInput;
let pointXInput, pointYInput, pointZInput, checkConcentrationButton, pointConcentrationResultSpan;

// --- Initialization ---
function init() {
    const canvasElement = document.getElementById('screen');
    if (!canvasElement) {
        console.error("Canvas element #screen not found!");
        return;
    }
    View.initView(canvasElement); // Initialize the view with the canvas

    // Get UI elements
    stackHeightSlider = document.getElementById('stackHeight');
    windVelocitySlider = document.getElementById('windVelocity');
    windDirectionInput = document.getElementById('windDirection');
    stackHeightValueSpan = document.getElementById('stackHeightValue');
    windVelocityValueSpan = document.getElementById('windVelocityValue');

    stabilityClassSelect = document.getElementById('stabilityClass');
    ambientTemperatureInput = document.getElementById('ambientTemperature');
    backgroundConcentrationInput = document.getElementById('backgroundConcentration');

    // Get UI elements for point concentration check
    pointXInput = document.getElementById('pointX');
    pointYInput = document.getElementById('pointY');
    pointZInput = document.getElementById('pointZ');
    checkConcentrationButton = document.getElementById('checkConcentrationButton');
    pointConcentrationResultSpan = document.getElementById('pointConcentrationResult');

    // Set initial values for UI from defaults and attach event listeners
    if (stackHeightSlider) {
        stackHeightSlider.value = currentStackParams.physicalHeight;
        if(stackHeightValueSpan) stackHeightValueSpan.textContent = currentStackParams.physicalHeight;
        stackHeightSlider.addEventListener('input', handleStackHeightChange);
    }
    if (windVelocitySlider) {
        windVelocitySlider.value = currentEnvParams.windVelocity;
        if(windVelocityValueSpan) windVelocityValueSpan.textContent = currentEnvParams.windVelocity;
        windVelocitySlider.addEventListener('input', handleWindVelocityChange);
    }
    if (windDirectionInput) {
        windDirectionInput.value = currentEnvParams.windDirection;
        windDirectionInput.addEventListener('input', handleWindDirectionChange);
    }
    if (stabilityClassSelect) {
        stabilityClassSelect.value = currentEnvParams.stabilityClass;
        stabilityClassSelect.addEventListener('change', handleStabilityClassChange);
    }
    if (ambientTemperatureInput) {
        ambientTemperatureInput.value = currentEnvParams.ambientTemperature;
        ambientTemperatureInput.addEventListener('input', handleAmbientTemperatureChange);
    }
    if (backgroundConcentrationInput) {
        backgroundConcentrationInput.value = currentEnvParams.backgroundConcentration;
        backgroundConcentrationInput.addEventListener('input', handleBackgroundConcentrationChange);
    }

    // Event listener for point concentration check button
    if (checkConcentrationButton) {
        checkConcentrationButton.addEventListener('click', handleCheckPointConcentration);
    }

    // Initial scene rendering
    requestRender();
}

// --- Model Interaction & Data Preparation ---

/**
 * Generates the data points needed for rendering the smoke plume.
 * This involves iterating over a grid and calculating concentration at each point.
 * @returns {Array<object>} smokeData - [{x, z, concentration}, ...]
 */
function calculateSmokeData() {
    const smokeData = [];
    // Ensure View.canvas is available before accessing its width
    const canvasWidth = View.canvas ? View.canvas.width : 2000; 
    const plumeRise = Model.calculatePlumeRise(currentStackParams, currentEnvParams);
    const simHeightOfConcern = currentStackParams.physicalHeight + plumeRise + 300; // physical height + plume rise + buffer
    
    const intervalX = 3; 
    const intervalY = 3;

    for (let x_model = intervalX; x_model < canvasWidth - currentStackParams.posX; x_model += intervalX) { 
        for (let z_model = 0; z_model <= simHeightOfConcern; z_model += intervalY) { 
            let concentration = Model.getConcentrationAtPoint(x_model, 0, z_model, currentStackParams, currentEnvParams);
            // Add background concentration if it's a feature to be visualized directly in plume values
            // concentration += currentEnvParams.backgroundConcentration; // This might make visualization tricky if bg is high
            if (concentration >= 1) { 
                smokeData.push({ 
                    x: x_model, 
                    z: z_model, 
                    concentration: concentration 
                });
            }
        }
    }
    return smokeData;
}

// --- View Updates ---
function requestRender() {
    const smokeDataForView = calculateSmokeData();
    const modelState = {
        stackParameters: currentStackParams,
        environmentParameters: currentEnvParams,
        smokeData: smokeDataForView
    };
    View.drawScene(modelState);
}

// --- Event Handlers ---
function handleStackHeightChange(event) {
    const newHeight = parseFloat(event.target.value);
    currentStackParams.physicalHeight = newHeight;
    if(stackHeightValueSpan) stackHeightValueSpan.textContent = newHeight;
    requestRender();
}

function handleWindVelocityChange(event) {
    const newVelocity = parseFloat(event.target.value);
    currentEnvParams.windVelocity = newVelocity;
    if(windVelocityValueSpan) windVelocityValueSpan.textContent = newVelocity;
    // Handle u=0 case in model, but view might also want to know
    if (newVelocity === 0) {
        console.warn("Wind velocity is 0. Gaussian model behavior is ill-defined for calms.");
        // Optionally, display a message on UI or alter visualization
    }
    requestRender();
}

function handleWindDirectionChange(event) {
    const newDirection = parseFloat(event.target.value);
    currentEnvParams.windDirection = newDirection;
    // Note: The current Gaussian model in model.js does not use windDirection to rotate the plume.
    // This parameter is stored and can be used for future enhancements (e.g., visual compass, coordinate rotation).
    console.log(`Wind direction changed to: ${newDirection}°N. Model calculation itself is not yet rotated.`);
    requestRender();
}

function handleStabilityClassChange(event) {
    currentEnvParams.stabilityClass = event.target.value;
    console.log(`Stability class changed to: ${currentEnvParams.stabilityClass}`);
    requestRender();
}

function handleAmbientTemperatureChange(event) {
    const newTemp = parseFloat(event.target.value);
    currentEnvParams.ambientTemperature = newTemp;
    requestRender();
}

function handleBackgroundConcentrationChange(event) {
    const newBgConc = parseFloat(event.target.value);
    currentEnvParams.backgroundConcentration = newBgConc;
    // Note: The Gaussian model calculates concentration *added* by the source.
    // Visualizing background concentration would require adding it to the calculated values or a separate visual layer.
    // Currently, it's stored but not directly added to the plume's visual intensity.
    console.log(`Background concentration changed to: ${newBgConc} µg/m³. This is not yet visually added to plume.`);
    requestRender();
}

// --- Event Handler for Point Concentration Check ---
function handleCheckPointConcentration() {
    if (!pointXInput || !pointYInput || !pointZInput || !pointConcentrationResultSpan) {
        console.error("Point concentration UI elements not found.");
        return;
    }
    const x = parseFloat(pointXInput.value);
    const y = parseFloat(pointYInput.value);
    const z = parseFloat(pointZInput.value);

    if (isNaN(x) || isNaN(y) || isNaN(z)) {
        pointConcentrationResultSpan.textContent = "Invalid input (X,Y,Z must be numbers)";
        return;
    }

    // Note: Wind direction is not yet accounted for in getConcentrationAtPoint for coordinate rotation.
    // The (x,y,z) here are assumed to be in the plume's coordinate system (x downwind, y crosswind).
    const concentration = Model.getConcentrationAtPoint(x, y, z, currentStackParams, currentEnvParams);
    
    // Add background concentration for the point check, if desired as total concentration.
    const totalConcentration = concentration + currentEnvParams.backgroundConcentration;

    pointConcentrationResultSpan.textContent = `${totalConcentration.toFixed(2)}`; // Display with 2 decimal places

    // Highlight this point on the canvas
    const Z_OFFSET = 50; // Corresponds to groundHeightFromBottom in view.js
    View.highlightPoint(currentStackParams.posX + x, View.canvas.height - Z_OFFSET - z, totalConcentration);
    requestRender(); // Re-render to show the new point immediately
}

// --- Start the application ---
document.addEventListener('DOMContentLoaded', init); 