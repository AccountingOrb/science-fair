const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

let gravity = 100;

let ball;
let floor;

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

    update() {
        if (this.position.y + this.radius >= floor.position.y) {
            this.velocity.y = -this.velocity.y; // TODO: make it lose energy realistically
            this.position.y = floor.position.y - this.radius - 5;

            return;
        }

        const acceleration = gravity / 1000;
        this.velocity.add(new Vector2(0, acceleration * FRAME_RATE));
        this.position.add(this.velocity);
    }

    draw() {
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, true);
        context.fillStyle = this.color;
        context.fill();
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

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    floor.update();
    floor.draw();

    ball.update();
    ball.draw();
}

function init() {
    ball = new Ball(canvas.width / 2, canvas.height / 2 - 100, 50);
    floor = new Floor();

    setInterval(draw, FRAME_RATE);
}

init();
