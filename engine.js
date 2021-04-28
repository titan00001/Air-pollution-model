// contains all the necessary modules to model the air pollution using given criteria
console.log("Hello");
// calculate xg

// calculate sigmaY and sigmaZ
// Based on the graph prepared by D. O. Martin (1976)
function sigmaY(x, stabilityClass) {

    const xList = [100, 200, 400, 700, 1000, 2000, 4000, 7000, 10000, 20000];
    const yList = {
        A: [27, 50, 94, 155, 215, 390],
        B: [19, 36, 67, 112, 155, 295, 550, 890, 1190, 2150],
        C: [13, 23, 44, 74, 105, 200, 370, 610, 840, 1540],
        D: [8, 15, 29, 48, 68, 130, 245, 400, 550, 1000],
        E: [6, 11, 21, 36, 51, 96, 180, 300, 420, 760],
        F: [4, 8, 14, 24, 34, 64, 120, 200, 275, 500]
    }

    return interpolationHelper(xList, yList[stabilityClass], x);
}

function sigmaZ(x, stabilityClass) {

    const xList = [100, 200, 400, 700, 1000, 2000, 4000, 7000, 10000, 20000];
    const yList = {
        A: [14, 29, 72, 215, 455, 1950],
        B: [11, 20, 40, 73, 110, 230, 500, 780, 1350, 2900],
        C: [7, 14, 26, 43, 61, 115, 220, 360, 510, 950],
        D: [5, 8, 15, 24, 32, 50, 77, 109, 135, 205],
        E: [4, 6, 11, 17, 21, 34, 49, 66, 79, 110],
        F: [2, 4, 7, 11, 14, 22, 31, 39, 46, 60]
    }

    return interpolationHelper(xList, yList[stabilityClass], x);
}

// calculate probability
// stackParameters= {height, discharge, diameter}, envParameters = {windVel, stabilityClass}
function gaussianConcentration(x, y, z, stackParameters, envParameters) {

    let sigZ = sigmaZ(x, envParameters["stabilityClass"]);
    let sigY = sigmaY(x, envParameters["stabilityClass"]);

    // x < xg
    // returns concentration in microgram/m3
    return Math.floor(1000000 * stackParameters['discharge'] * Math.exp( y*y / (2*sigY*sigY) ) * Math.exp( -Math.pow(z-stackParameters["height"], 2)/ (2*sigZ*sigZ)) / (Math.PI * 2 * sigY * sigZ));

}

function interpolationHelper(xList, yList, x) {

    // x < 2000 m
    // Implement binary search

    for(let i = 0; i < xList.length; i++) {
        if(xList[i] > x) {

            return (yList[i] + ( (yList[i+1] - yList[i]) * x / (xList[i+1] - xList[i]) ) );
        }
    }

}

export {
    gaussianConcentration
};

