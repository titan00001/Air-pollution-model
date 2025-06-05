// contains all the necessary modules to model the air pollution using given criteria
// calculate xg

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
// stackParameters= {height, discharge, diameter}, envParameters = {windVel, stabilityClass}
function gaussianConcentration(x, y, z, stackParameters, envParameters) {
  if (x <= 0) return 0; // Concentration is effectively zero at or behind the source

  let sigZ = sigmaZ(x, envParameters["stabilityClass"]);
  let sigY = sigmaY(x, envParameters["stabilityClass"]);

  if (sigY === undefined || sigZ === undefined) {
    console.error("Sigma Y or Sigma Z is undefined. Check stability class data and interpolation range for x:", x);
    return 0; // or handle error appropriately
  }

  // Ground-level source with reflection (effective height H)
  // C = (Q / (pi * sigY * sigZ * u)) * exp(-y^2 / (2 * sigY^2)) * exp(-(z-H)^2 / (2 * sigZ^2))
  // For ground reflection, we add a virtual source: exp(-(z+H)^2 / (2 * sigZ^2))
  // Here, assuming z is receptor height and stackParameters.height is effective plume height H.

  const Q = stackParameters["discharge"]; // emission rate, g/s
  const u = envParameters["windVelocity"]; // wind speed, m/s
  const H = stackParameters["height"]; // effective stack height, m

  if (u === 0) return Infinity; // Or handle as a calm condition appropriately

  const term1 = Q / (Math.PI * sigY * sigZ * u);
  const term2 = Math.exp(- (y * y) / (2 * sigY * sigY));
  // Term3 includes ground reflection by considering the source and its image
  const term3 = Math.exp(-Math.pow(z - H, 2) / (2 * sigZ * sigZ)) +
                Math.exp(-Math.pow(z + H, 2) / (2 * sigZ * sigZ));

  // returns concentration in microgram/m3 (Q is in g/s, so multiply by 1e6)
  let concentration = term1 * term2 * term3 * 1000000;
  return Math.floor(concentration);
}

function interpolationHelper(xPoints, yPoints, xValue) {
  if (xValue <= xPoints[0]) {
    return yPoints[0];
  }

  for (let i = 1; i < xPoints.length; i++) {
    if (xValue <= xPoints[i]) {
      // Found the interval [xPoints[i-1], xPoints[i]] that brackets xValue
      const x1 = xPoints[i - 1];
      const y1 = yPoints[i - 1];
      const x2 = xPoints[i];
      const y2 = yPoints[i];

      if (y1 === undefined || y2 === undefined) {
        // This can happen if yPoints is shorter than xPoints (e.g. stability class A data)
        // Fallback to the last valid yPoint or the first one if near the beginning
        return yPoints[Math.min(i-1, yPoints.length -1)] || yPoints[0];
      }
      
      // Linear interpolation formula: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
      return y1 + (xValue - x1) * (y2 - y1) / (x2 - x1);
    }
  }

  // xValue is greater than all xPoints, extrapolate by returning the last yPoint
  return yPoints[yPoints.length - 1];
}

export { gaussianConcentration, sigmaY, sigmaZ, interpolationHelper };
