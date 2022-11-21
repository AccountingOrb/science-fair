const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let gravity = 100;

let ball;
let floor;

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

class Ball {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;

        this.color = `rgb(${getRandomNumber(20, 230)}, ${getRandomNumber(20, 230)}, ${getRandomNumber(20, 230)})`;
    }

    update() {

    }

    draw() {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
        context.fillStyle = this.color;
        context.fill();
    }
}

class Floor {
    constructor() {
        this.x = 0;
        this.width = canvas.width;
        this.height = 10;
        this.y = canvas.height - this.height;

        this.color = `rgb(20, 20, 20)`;
    }

    update() {

    }

    draw() {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    ball.update();
    ball.draw();

    floor.update();
    floor.draw();
}

function init() {
    ball = new Ball(canvas.width / 2, canvas.height / 2, 50);
    floor = new Floor();

    setInterval(draw, 33);
}

init();
