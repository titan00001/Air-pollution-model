console.log("hello");

const screen = document.querySelector("#screen");
screen.height = (window.innerHeight * 0.75);
screen.width = (window.innerWidth * 0.75);

// Components
function Stack(diameter, height, posX, posY = 0) {
    
    this.diameter = diameter;
    this.height = height;
    this.posX = posX;
    this.posY = posY;
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
        context.fillStyle = "#993300";
        context.fill();
    }
}

function Smoke() {

}

function Sky() {

    this.render = function(context, height) {

        context.fillStyle = "#33ccff";
        context.fillRect(0, 0, screen.width, height);
    }
}

function Ground(height = 50) {

    this.height = height;

    this.render = function(context) {
        
        context.fillStyle = "#00b36b";
        context.fillRect(0, height, screen.width, screen.height);
    }

}

function Cloud(posX, height, xDiameter, yDiameter) {

    this.posX = posX;
    this.height = height;
    this.xDiameter = xDiameter;
    this.yDiameter = yDiameter;

    this.render = function(context) {
        for(let i = 0; i < 5; i++) {

            let x = this.posX - (this.xDiameter/2) + Math.ceil(Math.random()*this.xDiameter);
            let y = this.height - (this.yDiameter/2) + Math.ceil(Math.random()*this.yDiameter);
            let r = Math.ceil(Math.random()*60);

            context.beginPath();
            context.arc(x, y, r, 0, 2 * Math.PI)
            context.strokeStyle = "#d9d9d9"
            context.stroke();
            context.fillStyle = "#d9d9d9";
            context.fill();
            context.closePath();
        }
    }
}

function CloudCover(coverPercent, height) {

    this.height = screen.height - height;
    this.cover = coverPercent * 1;

    this.cloudArray = [];

    for(let i = 0; i < this.cover; i++) {
        let height = Math.ceil(Math.random()*this.height);
        let posX = Math.ceil(Math.random()*screen.width);
        let xDiameter = Math.ceil(Math.random()*200);
        let yDiameter = Math.ceil(Math.random()*120);
        
        this.cloudArray.push(new Cloud(posX, height, xDiameter, yDiameter));
    }

    this.render = function(context) {
        for(let i = 0; i < this.cover; i++) {
            this.cloudArray[i].render(context);
        }
    }


}

function ScaleX(interval) {

    this.interval = interval;

    this.render = function(context) {
        for(let i = 0; i < screen.width; i += interval) {

            context.beginPath();
            context.moveTo(i, screen.height);
            context.lineTo(i, screen.height - 10)
            context.closePath();
            context.strokeStyle = "#0d0d0d";
            context.stroke();
            context.fillStyle = "black";
            context.font = "10px Arial";
            context.fillText(i, i + 2, screen.height - 12);

        }
    }
}

function ScaleY(interval) {

    this.interval = interval;

    this.render = function(context, stackHeight) {
        for(let i = stackHeight; i >= 0; i -= interval) {

            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(10, i)
            context.closePath();
            context.stroke();
            context.fillStyle = "black";
            context.font = "10px Arial";
            context.fillText(stackHeight - i, 10, i - 3);

        }
    }
}

function RenderFrame(context) {

    this.stackBase = screen.height - 50;
    this.stackHeight = 100;
    this.stackDiameter = 20;
    this.stackPosX = 10;

    const scaleX = new ScaleX(50);
    const scaleY = new ScaleY(50);
    const ground = new Ground(this.stackBase);
    const sky = new Sky();
    const cloudCover = new CloudCover(10, 450);
    const stack1 = new Stack(this.stackDiameter, this.stackHeight, posX = 70);
    this.context = context;

    
    ground.render(this.context);
    sky.render(this.context, this.stackBase);
    cloudCover.render(this.context);
    stack1.render(this.context, this.stackBase);
    scaleX.render(this.context);
    scaleY.render(this.context, this.stackBase);

}

RenderFrame(screen.getContext("2d"));



