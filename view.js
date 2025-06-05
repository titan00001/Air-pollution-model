// View Layer: Responsible for all rendering on the canvas

let canvas = null;
let ctx = null;

// Will be set by controller based on model data or UI
let currentStackHeight = 100; 
let currentStackBase = 0; // Will be calculated based on canvas height and ground height

// Components (pure rendering functions/classes)

function Stack(diameter, height, posX, posY = 0) {
    this.diameter = diameter;
    this.height = height;
    this.posX = posX;
    this.posY = posY; // Not used in current render, stack is at stackBase
    this.baseWidth = 10;

    this.render = function(context, baseHeight) {
        context.beginPath();
        context.moveTo(this.posX - this.baseWidth, baseHeight);
        context.lineTo(this.posX , baseHeight - this.height);
        context.lineTo(this.posX + this.diameter, baseHeight - this.height);
        context.lineTo(this.posX + this.diameter + this.baseWidth, baseHeight);
        context.closePath();
        context.strokeStyle = "#0d0d0d";
        context.stroke();
        context.fillStyle = "rgb(102, 34, 0)";
        context.fill();
    }
}

// Smoke rendering will now take calculated concentration data
function Smoke(posX) { 
    this.posX = posX; // Stack X position for smoke origin

    // renderPoints is an array of {x, y, concentration} objects
    // x, y are canvas coordinates relative to smoke source origin if needed, or absolute
    // For this refactor, z in model becomes y on canvas (height)
    // x in model becomes x on canvas (downwind distance)
    this.render = function(context, renderPoints, baseHeight, stackModelHeight) {
        const intervalX = 3; // Define visual particle size or grid cell size
        const intervalY = 3;

        for(const point of renderPoints) {
            // point.x is downwind distance, point.z is height from ground
            // point.concentration is the calculated concentration
            
            if(point.concentration < 1) continue; // Filter low concentrations

            let particleColor = colorUtility(point.concentration);
            
            // Calculate canvas coordinates
            // canvasX is point.x (downwind) + stack's posX
            // canvasY is baseHeight - point.z (height from ground)
            let canvasX = this.posX + point.x;
            let canvasY = baseHeight - point.z;

            context.beginPath();
            // Draw a small rectangle or circle for the particle/cell
            // Arc version: context.arc(canvasX + intervalX/2, canvasY - intervalY/2, intervalY/2, 0, 2 * Math.PI);
            context.rect(canvasX, canvasY - intervalY, intervalX, intervalY); 
            context.fillStyle = particleColor;
            context.fill();
            // Optional: stroke for particles
            // context.strokeStyle = particleColor; // or a slightly darker version
            // context.stroke();
            context.closePath();
        }
    }
}

function colorUtility(concentration) {
    // Same as before, could be made more configurable later
    if(concentration < 50) {
        return "rgb(0, 204, 0)";
    } else if (concentration < 100) {
        return "rgb(102, 255, 102)"
    } else if (concentration < 250) {
        return "rgb(255, 255, 26)"
    } else if (concentration < 350) {
        return "rgb(255, 153, 51)"
    } else if (concentration < 430) {
        return "rgb(230, 0, 0)"
    } else {
        return "rgb(204, 41, 0)"
    }
}

function Sky() {
    this.render = function(context, canvasWidth, renderHeight) {
        context.fillStyle = "#33ccff";
        context.fillRect(0, 0, canvasWidth, renderHeight);
    }
}

function Ground(groundHeight = 50) {
    this.groundHeight = groundHeight; // Visual height of the ground area from bottom

    this.render = function(context, canvasWidth, canvasHeight) {
        const groundBaseY = canvasHeight - this.groundHeight;
        context.fillStyle = "#00b36b";
        context.fillRect(0, groundBaseY, canvasWidth, this.groundHeight);
        return groundBaseY; // Return the y-coordinate of the ground surface
    }
}

function Cloud(posX, posY, xDiameter, yDiameter) {
    this.posX = posX;
    this.posY = posY; // y is height from top of canvas for clouds
    this.xDiameter = xDiameter;
    this.yDiameter = yDiameter;

    this.render = function(context) {
        for(let i = 0; i < 5; i++) {
            let x = this.posX - (this.xDiameter/2) + Math.ceil(Math.random()*this.xDiameter);
            let y = this.posY - (this.yDiameter/2) + Math.ceil(Math.random()*this.yDiameter);
            let r = Math.ceil(Math.random()* (Math.min(this.xDiameter, this.yDiameter)/3) );
            if (r < 5) r = 5;

            context.beginPath();
            context.arc(x, y, r, 0, 2 * Math.PI)
            // context.strokeStyle = "#d9d9d9"
            // context.stroke();
            context.fillStyle = "#f0f0f0"; // Lighter clouds
            context.fill();
            context.closePath();
        }
    }
}

function CloudCover(numberOfClouds, canvasWidth, skyHeight) {
    this.clouds = [];
    for(let i = 0; i < numberOfClouds; i++) {
        let cPosX = Math.ceil(Math.random()*canvasWidth);
        let cPosY = Math.ceil(Math.random()* (skyHeight * 0.6)); // Clouds in upper 60% of sky area
        let cXDiameter = Math.ceil(Math.random()*150) + 50; // Min diameter 50
        let cYDiameter = Math.ceil(Math.random()*80) + 30; // Min diameter 30
        this.clouds.push(new Cloud(cPosX, cPosY, cXDiameter, cYDiameter));
    }

    this.render = function(context) {
        for(let cloud of this.clouds) {
            cloud.render(context);
        }
    }
}

function ScaleX(interval, canvasWidth, groundSurfaceY) {
    this.interval = interval;
    this.render = function(context) {
        for(let i = 0; i < canvasWidth; i += this.interval) {
            context.beginPath();
            context.moveTo(i, groundSurfaceY);
            context.lineTo(i, groundSurfaceY - 10)
            context.closePath();
            context.strokeStyle = "#0d0d0d";
            context.stroke();
            context.fillStyle = "black";
            context.font = "10px Arial";
            context.fillText(i, i + 2, groundSurfaceY - 12);
        }
    }
}

function ScaleY(interval, canvasHeight, groundSurfaceY, stackModelHeight) {
    this.interval = interval;
    // Renders scale from ground up to a bit above stackModelHeight
    const maxScaleHeight = stackModelHeight + interval; 
    this.render = function(context) {
        for(let h = 0; h <= maxScaleHeight; h += this.interval) {
            const yPos = groundSurfaceY - h;
            if (yPos < 0) break; // Don't draw above canvas top

            context.beginPath();
            context.moveTo(0, yPos);
            context.lineTo(10, yPos);
            context.closePath();
            context.strokeStyle = "#0d0d0d";
            context.stroke();
            context.fillStyle = "black";
            context.font = "10px Arial";
            context.fillText(h, 12, yPos + 3);
        }
    }
}

/**
 * Initializes the view, sets up canvas and context.
 * @param {HTMLCanvasElement} canvasElement - The canvas element from HTML.
 */
function initView(canvasElement) {
    canvas = canvasElement;
    // Set canvas dimensions (can be dynamic based on window or fixed)
    canvas.width = window.innerWidth * 0.75; 
    canvas.height = window.innerHeight * 0.75;
    // canvas.width = 2000; // Or fixed, as in original script.scss
    // canvas.height = 1000;

    ctx = canvas.getContext("2d");
    currentStackHeight = 100; // Default, can be passed from model
    // ground height from bottom of canvas
    const visualGroundHeight = 50; 
    currentStackBase = canvas.height - visualGroundHeight;
}

/**
 * Main drawing function for the scene.
 * @param {object} modelState - Object containing all necessary data from the model.
 *                              e.g., { stackParams, envParams, smokeData (renderPoints) }
 */
function drawScene(modelState) {
    if (!ctx || !canvas) {
        console.error("View not initialized. Call initView(canvasElement) first.");
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get parameters from modelState (example structure)
    const stackParams = modelState.stackParameters;
    const envParams = modelState.environmentParameters;
    const smokeRenderPoints = modelState.smokeData; // This will be an array of {x, z, concentration}

    // Visual elements
    const groundHeightFromBottom = 50;
    const ground = new Ground(groundHeightFromBottom);
    const sky = new Sky();
    const cloudCover = new CloudCover(envParams.cloudCover || 5, canvas.width, canvas.height - groundHeightFromBottom);
    
    // Stack object from view.js, using model parameters
    // stackParams.height is the effective plume height from model
    // stackParams.diameter is physical diameter
    // stackParams.posX is the model's x-position for the stack (view might adapt this)
    const stackDrawable = new Stack(stackParams.diameter, stackParams.height, stackParams.posX);
    
    // Smoke object from view.js, needs stack's X position for its origin
    const smokeDrawable = new Smoke(stackParams.posX);

    // Render sequence
    const groundSurfaceY = ground.render(ctx, canvas.width, canvas.height);
    sky.render(ctx, canvas.width, groundSurfaceY);
    cloudCover.render(ctx);

    // Render smoke: smokeRenderPoints should be pre-calculated by controller using model
    if (smokeRenderPoints) {
        smokeDrawable.render(ctx, smokeRenderPoints, groundSurfaceY, stackParams.height);
    }
    stackDrawable.render(ctx, groundSurfaceY);
    
    // Scales - these might need actual stack height from model for Y scale relevance
    const scaleX = new ScaleX(50, canvas.width, groundSurfaceY);
    const scaleY = new ScaleY(50, canvas.height, groundSurfaceY, stackParams.height);
    scaleX.render(ctx);
    scaleY.render(ctx);
}

export { initView, drawScene, Stack, Smoke, Sky, Ground, Cloud, CloudCover, ScaleX, ScaleY, colorUtility }; 