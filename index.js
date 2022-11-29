const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let gravity = 100;
let elasticity = 1.9;
let showVelocity = false;
let showDisplacementPoints = false;
let showVelocityPoints = false;

let ball;
let floor;
const graphPoints = [];

const FRAME_RATE = 1000 / 60;

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max-min) + min);
}

{ // Set up gravity slider.
    const gravitySlider = document.getElementById('gravity-slider');
    const gravityLabel = document.getElementById('gravity-label');

    function updateGravity() {
        gravity = gravitySlider.value;
        gravityLabel.innerText = `Gravity (${gravity}):`;
    }

    updateGravity();
    gravitySlider.oninput = updateGravity;
}

{ // Set up elasticity slider.
    const elasticitySlider = document.getElementById('elasticity-slider');
    const elasticityLabel = document.getElementById('elasticity-label');

    function updateElasticity() {
        elasticity = elasticitySlider.value;
        elasticityLabel.innerText = `Elasticity (${elasticity}):`;
    }

    updateElasticity();
    elasticitySlider.oninput = updateElasticity;
}

{ // Set up showVelocity checkbox.
    const showVelocityCheckbox = document.getElementById('show-velocity-checkbox');

    function updateShowVelocity() {
        showVelocity = showVelocityCheckbox.checked;
    }

    updateShowVelocity();
    showVelocityCheckbox.oninput = updateShowVelocity;
}

{ // Set up showDisplacementPoints checkbox.
    const showDisplacementPointsCheckbox = document.getElementById('show-displacement-points-checkbox');

    function updateShowDisplacementPoints() {
        showDisplacementPoints = showDisplacementPointsCheckbox.checked;
    }

    updateShowDisplacementPoints();
    showDisplacementPointsCheckbox.oninput = updateShowDisplacementPoints;
}

{ // Set up showVelocityPoints checkbox.
    const showVelocityPointsCheckbox = document.getElementById('show-velocity-points-checkbox');

    function updateShowVelocityPoints() {
        showVelocityPoints = showVelocityPointsCheckbox.checked;
    }

    updateShowVelocityPoints();
    showVelocityPointsCheckbox.oninput = updateShowVelocityPoints;
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
            let velocityText = `${this.velocity.y}`.slice(0, this.velocity.y < 0 ? 5 : 4) +  ' [DOWN]';
            context.strokeText(velocityText, this.position.x - 47, this.position.y - this.radius - 20);
            context.fillText(velocityText, this.position.x - 47, this.position.y - this.radius - 20);
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
        this.position.x -= 5;
    }

    draw() {
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, true);
        context.fillStyle = this.color;
        context.fill();
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    floor.update();
    floor.draw();

    ball.update();
    ball.draw();

    if (showDisplacementPoints) {
        graphPoints.push(new GraphPoint(ball.position.x, ball.position.y, 5, ball.color));
    }
    if (showVelocityPoints) {
        graphPoints.push(new GraphPoint(ball.position.x, canvas.height / 2 + (ball.velocity.y), 5, ball.color));
    }

    for (let i = 0; i < graphPoints.length; i++) {
        const graphPoint = graphPoints[i];
        graphPoint.update();
        graphPoint.draw();

        if (graphPoint.position.x < 0 - graphPoint.radius) {
            graphPoints.shift();
        }
    }
}

function init() {
    ball = new Ball(canvas.width / 2, canvas.height / 2 - 100, 50);
    floor = new Floor();

    setInterval(draw, FRAME_RATE);
}

init();
