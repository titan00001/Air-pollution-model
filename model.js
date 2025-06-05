// model.js

// --- Core Calculation Logic (formerly in engine.js) ---

// calculate sigmaY and sigmaZ
// Based on the graph prepared by D. O. Martin (1976)
function sigmaY(x, stabilityClass) {
  // Note: xList has 10 points. Ensure yList[stabilityClass] has a corresponding number of points.
  // yList.A currently has 6 points, which will cause issues with the interpolation for higher x values with stability class A.
  const xList = [100, 200, 400, 700, 1000, 2000, 4000, 7000, 10000, 20000];
  const yList = {
    A: [27, 50, 94, 155, 215, 390], // WARNING: Only 6 data points
    B: [19, 36, 67, 112, 155, 295, 550, 890, 1190, 2150],
    C: [13, 23, 44, 74, 105, 200, 370, 610, 840, 1540],
    D: [8, 15, 29, 48, 68, 130, 245, 400, 550, 1000],
    E: [6, 11, 21, 36, 51, 96, 180, 300, 420, 760],
    F: [4, 8, 14, 24, 34, 64, 120, 200, 275, 500],
  };

  return interpolationHelper(xList, yList[stabilityClass] || yList["D"], x); // Fallback to 'D' if class data missing/incomplete, though ideally class A data should be fixed
}

function sigmaZ(x, stabilityClass) {
  // Note: xList has 10 points. Ensure yList[stabilityClass] has a corresponding number of points.
  // yList.A currently has 6 points, which will cause issues with the interpolation for higher x values with stability class A.
  const xList = [100, 200, 400, 700, 1000, 2000, 4000, 7000, 10000, 20000];
  const yList = {
    A: [14, 29, 72, 215, 455, 1950], // WARNING: Only 6 data points
    B: [11, 20, 40, 73, 110, 230, 500, 780, 1350, 2900],
    C: [7, 14, 26, 43, 61, 115, 220, 360, 510, 950],
    D: [5, 8, 15, 24, 32, 50, 77, 109, 135, 205],
    E: [4, 6, 11, 17, 21, 34, 49, 66, 79, 110],
    F: [2, 4, 7, 11, 14, 22, 31, 39, 46, 60],
  };

  return interpolationHelper(xList, yList[stabilityClass] || yList["D"], x); // Fallback to 'D' if class data missing/incomplete, though ideally class A data should be fixed
}

// calculate probability
function gaussianConcentration(x, y, z, stackParameters, envParameters) {
  if (x <= 0) return 0; // Concentration is effectively zero at or behind the source

  let sigZ = sigmaZ(x, envParameters["stabilityClass"]);
  let sigY = sigmaY(x, envParameters["stabilityClass"]);

  if (sigY === undefined || sigZ === undefined) {
    console.error("Sigma Y or Sigma Z is undefined. Check stability class data and interpolation range for x:", x, "Stability:", envParameters["stabilityClass"]);
    return 0; // or handle error appropriately
  }

  const Q = stackParameters["discharge"]; // emission rate, g/s
  const u = envParameters["windVelocity"]; // wind speed, m/s
  const H = stackParameters["height"]; // effective stack height, m

  if (u === 0) {
      // For calm conditions (u=0), Gaussian model is not typically valid.
      // Return a very high number or handle as a special case.
      // For simplicity here, returning a high value if receptor is directly above (x=0, y=0, z=H)
      // This needs a more sophisticated approach for calms.
      return (x === 0 && y === 0 && z === H) ? Infinity : 0;
  }

  const term1 = Q / (Math.PI * sigY * sigZ * u);
  const term2 = Math.exp(- (y * y) / (2 * sigY * sigY));
  const term3 = Math.exp(-Math.pow(z - H, 2) / (2 * sigZ * sigZ)) +
                Math.exp(-Math.pow(z + H, 2) / (2 * sigZ * sigZ));

  let concentration = term1 * term2 * term3 * 1000000; // µg/m³
  return Math.floor(concentration);
}

function interpolationHelper(xPoints, yPoints, xValue) {
  if (xValue <= xPoints[0]) {
    return yPoints[0];
  }

  // Ensure yPoints has enough data for interpolation up to the end of xPoints
  const effectiveYPointsLength = Math.min(xPoints.length, yPoints.length);

  for (let i = 1; i < xPoints.length; i++) { // Iterate based on xPoints
    if (xValue <= xPoints[i]) {
      const x1 = xPoints[i - 1];
      const y1 = yPoints[i - 1]; // y1 should exist if yPoints covers x1
      const x2 = xPoints[i];
      let y2 = yPoints[i]; // y2 might be undefined if yPoints is short

      if (i >= effectiveYPointsLength) { // If current xPoint index is beyond available yPoints data
          y2 = yPoints[effectiveYPointsLength -1]; // Use last available yPoint for y2
          if (i-1 >= effectiveYPointsLength) { // If x1 also beyond yPoints data (should not happen with min check)
            return yPoints[effectiveYPointsLength-1]; // return last yPoint
          } 
      } else if (y2 === undefined) { // Defensive check if yPoints[i] is undefined within its supposed range
          y2 = yPoints[effectiveYPointsLength-1];
      }
      
      if (y1 === undefined) { // Should not happen if xValue > xPoints[0]
          return yPoints[0]; 
      }

      // Linear interpolation formula: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
      if (x2 === x1) return y1; // Avoid division by zero if xPoints are not distinct
      return y1 + (xValue - x1) * (y2 - y1) / (x2 - x1);
    }
  }
  // xValue is greater than all xPoints, extrapolate by returning the last yPoint of the *effective length*
  return yPoints[effectiveYPointsLength - 1];
}

// --- Model Parameters & State Management ---

const defaultStackParameters = {
    physicalHeight: 70, // m (actual height of the stack structure)
    diameter: 2,        // m (physical diameter of stack opening, for plume rise)
    exitVelocity: 10,   // m/s (stack gas exit velocity, for plume rise)
    gasTemperature: 150, // Celsius (stack gas temperature, for plume rise)
    posX: 50,           // X-coordinate on canvas for the stack base (pixels from left)
    discharge: 20,      // g/s (pollutant emission rate Q)
    // 'height' below is the *effective* stack height (physicalHeight + plumeRise).
    // It is calculated in getConcentrationAtPoint and passed to gaussianConcentration.
    // The value here is an initial estimate or fallback if plume rise isn't calculated for some reason.
    height: 70, // m (Initial/fallback effective stack height)
};

const defaultEnvironmentParameters = {
    windVelocity: 7,        // m/s (at stack height)
    windDirection: 270,     // degrees from North (e.g., 270 for West wind, 0 for North wind)
    stabilityClass: "D",    // A-F
    ambientTemperature: 25, // Celsius (for plume rise and stability determination)
    // cloudCover: 10,      // percent (visual only, managed by view/controller)
    backgroundConcentration: 0 // µg/m³ (not used in current formula, but good for future)
};

// --- Plume Rise Calculation (Placeholder for Briggs Equations) ---
/**
 * Calculates plume rise (Δh) using simplified or eventually full Briggs equations.
 * @param {object} stackParams - Stack parameters (exitVelocity, diameter, gasTemperature, physicalHeight).
 * @param {object} envParams - Environment parameters (windVelocity, ambientTemperature, stabilityClass).
 * @returns {number} deltaH - The calculated plume rise in meters.
 */
function calculatePlumeRise(stackParams, envParams) {
    const g = 9.81; // m/s^2, acceleration due to gravity
    const Vs = stackParams.exitVelocity; // m/s
    const D = stackParams.diameter; // m
    const Ts_K = stackParams.gasTemperature + 273.15; // Stack gas temp in Kelvin
    const Ta_K = envParams.ambientTemperature + 273.15; // Ambient temp in Kelvin
    const U = envParams.windVelocity; // Wind speed at stack height, m/s

    if (U === 0) return 50; // Arbitrary high rise for calm conditions, needs better model

    // Buoyancy flux parameter (Fb)
    const Fb = g * Vs * (D/2)**2 * (Ts_K - Ta_K) / Ts_K;

    // Momentum flux parameter (Fm) - not directly used in simpler Briggs for buoyant plumes usually
    // const Fm = Vs**2 * (D/2)**2 * (Ta_K / Ts_K);

    let deltaH = 0;

    // Simplified Briggs equations based on stability and Fb
    // For unstable/neutral (A, B, C, D):
    if (['A', 'B', 'C', 'D'].includes(envParams.stabilityClass)) {
        if (Fb < 55) {
            deltaH = 21.425 * Math.pow(Fb, 0.75) / U;
        } else {
            deltaH = 38.71 * Math.pow(Fb, 0.6) / U;
        }
    } 
    // For stable (E, F):
    else if (['E', 'F'].includes(envParams.stabilityClass)) {
        // This part requires more complex handling involving stability parameter 's'
        // s = (g / Ta_K) * (dTheta_dz) where dTheta_dz is potential temperature gradient
        // For simplicity, using a very basic stable condition formula (less accurate)
        // This often oversimplifies stable plume rise significantly.
        // A more robust approach would involve Monin-Obukhov length or Pasquill stability index to Brunt-Vaisala frequency.
        // For now, a highly simplified momentum-like rise for stable, or a cap:
        deltaH = 1.5 * Math.pow(Fb / U, 1/3) * Math.pow(1, -1/3); // Placeholder with s=1, needs real s
        // A common simplification for stable is also related to momentum if buoyancy is low.
        // Or, often, stable rise is capped at a certain value or compared with momentum rise.
        // Using a capped value from a simpler formula if Fb is small:
        if (Fb < 55) {
             deltaH = (1.6 * Math.pow(Vs * D, 0.6)) / U; // momentum part
        }
        // Effective plume rise in stable conditions is often lower than in unstable/neutral.
        // The formula above for stable is very basic and likely needs significant improvement for accuracy.
        deltaH = Math.min(deltaH, 5 * Vs * D / U); // Cap for stable conditions as a rough estimate
    }

    return deltaH > 0 ? deltaH : 0;
}


/**
 * Primary function to get concentration at a point.
 * Incorporates plume rise in the effective stack height.
 */
function getConcentrationAtPoint(x, y, z, currentStackParams, currentEnvParams) {
    let plumeRise = calculatePlumeRise(currentStackParams, currentEnvParams);
    let effectiveStackHeight = currentStackParams.physicalHeight + plumeRise;
    
    const paramsForGaussian = {
        ...currentStackParams,
        height: effectiveStackHeight 
    };
    return gaussianConcentration(x, y, z, paramsForGaussian, currentEnvParams);
}

export {
    defaultStackParameters,
    defaultEnvironmentParameters,
    getConcentrationAtPoint,
    // Exporting underlying functions can be useful for testing or more direct use
    gaussianConcentration, 
    sigmaY, 
    sigmaZ,
    interpolationHelper,
    calculatePlumeRise // Export if/when implemented
}; 