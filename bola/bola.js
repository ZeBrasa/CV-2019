// Posição das variaveis
let x = 0;
let y = 0;
let z = 0;

// velocidade
let vx = 0;
let vy = 0;
let vz = 0;

// Aceleração
let ax = 0;
let ay = 0;
let az = 0;

let vMultiplier = 0.007;
let bMultiplier = 0.6;

function setup() {
  createCanvas(displayWidth, displayHeight);
  fill(0);
}

function draw() {
  background(450);
  ballMove();
  ellipse(x, y, 50, 50);
}

//função do movimento da bola
function ballMove() {
  ax = accelerationX;
  ay = accelerationY;
  az = accelarationZ;

  vx = vx + ay;
  vy = vy + ax;
  vz = vz + az;
  y = y + vy * vMultiplier;
  x = x + vx * vMultiplier;
  z = z + vz * vMultiplier;

  // Faz Bounce quando chega perto do limite do Canvas
  if (x < 0) {
    x = 0;
    vx = -vx * bMultiplier;
  }
  if (y < 0) {
    y = 0;
    vy = -vy * bMultiplier;
  }
  if (z < 0) {
    z = 0;
    vz = -vz * Multiplier;
  }
  if (x > width - 20) {
    x = width - 20;
    vx = -vx * bMultiplier;
  }
  if (y > height - 20) {
    y = height - 20;
    vy = -vy * bMultiplier;
  }
  if (z > length - 20) {
    z = length - 20;
    vz = -vz * bMultiplier;
}

