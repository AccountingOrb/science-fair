const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const extraInfoLabel = document.getElementById('extra-info');

let gravity = 0;
let elasticity = 0;
let plottedPointsSpeed = 5;
let showVelocity = false;
let plotDisplacement = false;
let plotVelocity = false;
let plotGravPotentialEnergy = false;
let plotKineticEnergy = false;

let ball;
let floor;
let pauseButton;
const graphPoints = [];

let paused = false;
let msElapsed = 0;

const heldKeys = {};

const FRAME_RATE = 1000 / 60;

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max-min) + min);
}

function getIncreasedOrDecreasedHtml(increased) {
    return `<span style="color: ${increased ? 'green' : 'red'}">${increased ? 'increased' : 'decreased'}</span>`;
}

function pixelsToCm(value) {
    return value * 0.026458;
}

function pixelsPerFrameToCmPerSecond(value) {
    return pixelsToCm(value * 59.99999999999988);
}

function msToSeconds(value) {
    return value / 1000;
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return new Vector2(e.clientX - rect.left, e.clientY - rect.top);
}

function isInsideRect(input, rectPosition, rectSize) {
    return input.x > rectPosition.x && input.x < rectPosition.x + rectSize.x && input.y < rectPosition.y + rectSize.y && input.y > rectPosition.y;
}

{ // Set up gravity slider.
    const gravitySlider = document.getElementById('gravity-slider');
    const gravityLabel = document.getElementById('gravity-label');

    let lastGravity = gravitySlider.value;

    function update() {
        gravity = gravitySlider.value;
        gravityLabel.innerText = `Gravity (${gravity}):`;

        if (gravity > lastGravity) {
            extraInfoLabel.innerHTML = `You have ${getIncreasedOrDecreasedHtml(true)} the acceleration of gravity, therefore a greater downwards force is applied.`;
        } else if (gravity < lastGravity) {
            extraInfoLabel.innerHTML = `You have ${getIncreasedOrDecreasedHtml(false)} the acceleration of gravity, therefore a smaller downwards force is applied.`;
        }

        lastGravity = gravity;
    }

    update();
    gravitySlider.oninput = update;
}

{ // Set up elasticity slider.
    const elasticitySlider = document.getElementById('elasticity-slider');
    const elasticityLabel = document.getElementById('elasticity-label');

    let lastElasticity = elasticitySlider.value;

    function update() {
        elasticity = elasticitySlider.value;
        elasticityLabel.innerText = `Elasticity (${elasticity}):`;

        if (elasticity > lastElasticity) {
            extraInfoLabel.innerHTML = `You have ${getIncreasedOrDecreasedHtml(true)} the elasticity of the ball, therefore more force will be applied to make the ball return to its original shape when it hits the ground and gets compressed. This shape restoration force is what causes the ball to bounce.`;
        } else if (elasticity < lastElasticity) {
            extraInfoLabel.innerHTML = `You have ${getIncreasedOrDecreasedHtml(false)} the elasticity of the ball, therefore less force will be applied to make the ball return to its original shape when it hits the ground and gets compressed. This shape restoration force is what causes the ball to bounce.`;
        }

        lastElasticity = elasticity;
    }

    update();
    elasticitySlider.oninput = update;
}

{ // Set up plottedPointsSpeed slider.
    const plottedPointsSpeedSlider = document.getElementById('plotted-points-speed-slider');
    const plottedPointsSpeedLabel = document.getElementById('plotted-points-speed-label');

    function update() {
        plottedPointsSpeed = plottedPointsSpeedSlider.value;
        plottedPointsSpeedLabel.innerText = `Plotted points speed (${plottedPointsSpeed}):`;
    }

    update();
    plottedPointsSpeedSlider.oninput = update;
}

{ // Set up showVelocity checkbox.
    const showVelocityCheckbox = document.getElementById('show-velocity-checkbox');

    function update() {
        showVelocity = showVelocityCheckbox.checked;
    }

    update();
    showVelocityCheckbox.oninput = update;
}

{ // Set up plotDisplacement checkbox.
    const plotDisplacementCheckbox = document.getElementById('plot-displacement-checkbox');

    function update() {
        plotDisplacement = plotDisplacementCheckbox.checked;
    }

    update();
    plotDisplacementCheckbox.oninput = update;
}

{ // Set up plotVelocity checkbox.
    const plotVelocityCheckbox = document.getElementById('plot-velocity-checkbox');

    function update() {
        plotVelocity = plotVelocityCheckbox.checked;
    }

    update();
    plotVelocityCheckbox.oninput = update;
}

{ // Set up plotGravPotentialEnergy checkbox.
    const plotGravPotentialEnergyCheckbox = document.getElementById('plot-grav-potential-energy-checkbox');

    function update() {
        plotGravPotentialEnergy = plotGravPotentialEnergyCheckbox.checked;
    }

    update();
    plotGravPotentialEnergyCheckbox.oninput = update;
}

{ // Set up plotKineticEnergy checkbox.
    const plotKineticEnergyCheckbox = document.getElementById('plot-kinetic-energy-checkbox');

    function update() {
        plotKineticEnergy = plotKineticEnergyCheckbox.checked;
    }

    update();
    plotKineticEnergyCheckbox.oninput = update;
}

{ // Set up showExtraInfo checkbox.
    const showExtraInfoCheckbox = document.getElementById('show-extra-info-checkbox');

    function update() {
        extraInfoLabel.hidden = !showExtraInfoCheckbox.checked;
    }

    update();
    showExtraInfoCheckbox.oninput = update;
}

class Vector2 {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    add(vec) {
        this.x += vec.x;
        this.y += vec.y;
    }

    subtract(vec) {
        this.x -= vec.x;
        this.y -= vec.y;
    }
}

class Ball {
    constructor(x, y, radius) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2();
        this.radius = radius;

        this.color = `rgb(${getRandomNumber(20, 230)}, ${getRandomNumber(20, 230)}, ${getRandomNumber(20, 230)})`;
    }

    applyForce(force) {
        this.velocity.add(force);
    }

    update() {
        if (this.position.y + this.radius > floor.position.y) {
            const impactVelocity = this.velocity;
            const cancelForce = -impactVelocity.y;
            this.applyForce(new Vector2(0, cancelForce - (impactVelocity.y * elasticity))); // First, cancel out the force of gravity, then apply a force upwards which is a percentage of the impact force.
            this.position.y = floor.position.y - this.radius; // Make sure it doesn't get stuck in the ground.

            return;
        }

        const acceleration = gravity / 1000;
        this.applyForce(new Vector2(0, acceleration * FRAME_RATE)); // Multiply by FRAME_RATE to make it framerate independent.
        this.position.add(this.velocity);
    }

    draw() {
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, true);
        context.fillStyle = this.color;
        context.fill();

        if (showVelocity) {
            context.beginPath();
            context.moveTo(this.position.x, this.position.y);
            context.lineTo(this.position.x, this.position.y + (this.velocity.y * 5));
            context.lineWidth = 3;
            context.strokeStyle = 'black';
            context.stroke();

            context.fillStyle = 'white';
            context.strokeStyle = 'black';
            context.font = '20px Roboto';
            context.lineWidth = 3;
            const velocityText = pixelsPerFrameToCmPerSecond(this.velocity.y).toFixed(2) +  ' cm/s [DOWN]';
            context.strokeText(velocityText, this.position.x - 75, this.position.y - this.radius - 20);
            context.fillText(velocityText, this.position.x - 75, this.position.y - this.radius - 20);
        }
    }
}

class Floor {
    constructor() {
        this.width = canvas.width;
        this.height = 10;
        this.position = new Vector2(0, canvas.height - this.height);

        this.color = `rgb(20, 20, 20)`;
    }

    update() {

    }

    draw() {
        context.fillStyle = this.color;
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}

class GraphPoint {
    constructor(x, y, radius, color) {
        this.radius = radius;
        this.position = new Vector2(x, y);
        this.color = color;
    }

    update() {
        this.position.x -= plottedPointsSpeed;
    }

    draw() {
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, true);
        context.fillStyle = this.color;
        context.fill();
    }
}

class Button {
    constructor(x, y, width, height, image, callback) {
        this.position = new Vector2(x, y);
        this.size = new Vector2(width, height);
        this.image = image;

        canvas.addEventListener('mousedown', (e) => {
            if (!isInsideRect(getMousePos(e), this.position, this.size)) return;

            callback();
        });
    }

    draw() {
        if (paused) {
            context.clearRect(this.position.x, this.position.y, this.size.x, this.size.y);
        }

        context.drawImage(this.image, this.position.x, this.position.y, this.size.x, this.size.y);
    }
}

function draw() {
    if (!paused) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        floor.update();
        floor.draw();

        ball.update();
        ball.draw();

        if (plotDisplacement) {
            graphPoints.push(new GraphPoint(ball.position.x, ball.position.y, 5, 'rgb(67, 188, 224)'));
        }
        if (plotVelocity) {
            graphPoints.push(new GraphPoint(ball.position.x, (canvas.height / 2) + (ball.velocity.y), 5, 'rgb(33, 204, 110)'));
        }
        if (plotGravPotentialEnergy) {
            /*
                mgh

                m = 1

                Divide result by 120 to make it scale and fit to the canvas.
            */
            const height = canvas.height - ball.position.y - ball.radius;
            const gravPotentialEnergy = -(1 * gravity * height) / 120;

            graphPoints.push(new GraphPoint(ball.position.x, (canvas.height / 2) + gravPotentialEnergy, 5, 'rgb(144, 47, 196)'));
        }
        if (plotKineticEnergy) {
            /*
                (mv^2) / 2

                m = 1

                Divide result by 4 to make it scale and fit to the canvas.
            */
            const kineticEnergy = -((1 * Math.pow(ball.velocity.y, 2)) / 2) / 2;

            graphPoints.push(new GraphPoint(ball.position.x, (canvas.height / 2) + kineticEnergy, 5, 'rgb(232, 48, 23)'));
        }

        for (let i = 0; i < graphPoints.length; i++) {
            const graphPoint = graphPoints[i];
            graphPoint.update();
            graphPoint.draw();

            if (graphPoint.position.x < 0 - graphPoint.radius) {
                graphPoints.shift();
            }
        }

        msElapsed += FRAME_RATE;

        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.font = '20px Roboto';
        context.lineWidth = 3;
        const secondsElapsedText = msToSeconds(msElapsed).toFixed(2) +  ' s';
        context.strokeText(secondsElapsedText, 5, canvas.height - floor.height - 5);
        context.fillText(secondsElapsedText, 5, canvas.height - floor.height - 5);
    }

    pauseButton.draw();
}

function onClick(e) {
    if (!heldKeys[17]) return;
    
    const mousePos = getMousePos(e);

    const x = mousePos.x;
    const y = mousePos.y;
    
    ball.position = new Vector2(x, y - (ball.radius / 2));
    ball.velocity = new Vector2();
}

onkeydown = onkeyup = function(e) {
    heldKeys[e.keyCode] = e.type == 'keydown';
}

function init() {
    ball = new Ball(canvas.width / 2, canvas.height / 2 - 100, 50);
    floor = new Floor();
    {
        const pauseImage = new Image();
        pauseImage.src = 'assets/Pause.png';

        const playImage = new Image();
        playImage.src = 'assets/Play.png';

        pauseButton = new Button(canvas.width - 55, 5, 50, 50, pauseImage, () => {
            paused = !paused;

            pauseButton.image = paused ? playImage : pauseImage;

            context.fillStyle = 'white';
            context.strokeStyle = 'black';
            context.font = '20px Roboto';
            context.lineWidth = 3;
            const heightText = 'height = ' + Math.max(0, pixelsToCm((floor.position.y) - (ball.position.y + ball.radius))).toFixed(2) +  ' cm';
            context.strokeText(heightText, ball.position.x + ball.radius + 5, canvas.height - floor.height - 5);
            context.fillText(heightText, ball.position.x + ball.radius + 5, canvas.height - floor.height - 5);
        });
    }

    canvas.addEventListener('mousedown', onClick);

    setInterval(draw, FRAME_RATE);
}

init();
