import { gaussianConcentration, sigmaY, sigmaZ, interpolationHelper } from './engine.js';

// Default Parameters (can be updated by controller)
const defaultStackParameters = {
    height: 100, // m (effective stack height)
    diameter: 2, // m (physical diameter, less important for Gaussian model directly unless used for plume rise)
    posX: 70, // m (canvas coordinates, will be handled by view, but good to note)
    posY: 0, // m (canvas coordinates)
    discharge: 20, // g/s (pollutant emission rate Q)
    // gasTemperature: 150, // Celsius (for plume rise calculations - not used in current Gaussian formula directly)
    // exitVelocity: 10, // m/s (for plume rise calculations - not used in current Gaussian formula directly)
};

const defaultEnvironmentParameters = {
    windVelocity: 7, // m/s at stack height
    stabilityClass: "D", // A-F
    ambientTemperature: 25, // Celsius (can affect plume rise, stability)
    cloudCover: 10, // percent (conceptual, used for visual in old script)
    backgroundConcentration: 0 // µg/m³
};

// Simulation State (managed by controller, initialized with defaults)
// This is a conceptual placeholder. The controller will hold the actual current state.
// For now, model.js mainly provides calculation functions and default parameter structures.

/**
 * Recalculates gaussianConcentration. 
 * This is the primary calculation function exposed by the model.
 */
function getConcentrationAtPoint(x, y, z, currentStackParams, currentEnvParams) {
    return gaussianConcentration(x, y, z, currentStackParams, currentEnvParams);
}

// Re-exporting core calculation logic. These were improved in engine.js already.
// If engine.js is kept separate, these imports are fine.
// If engine.js contents are fully merged into model.js, these imports would be removed
// and the functions (gaussianConcentration, sigmaY, sigmaZ, interpolationHelper) would be defined directly here.
// For this step, assuming we are creating model.js and it will use the corrected engine.js

export {
    defaultStackParameters,
    defaultEnvironmentParameters,
    getConcentrationAtPoint,
    // Also re-exporting these so controller can access them if needed,
    // or they can be called internally by getConcentrationAtPoint.
    gaussianConcentration, 
    sigmaY, 
    sigmaZ,
    interpolationHelper
}; 