// Posição das variaveis
let x = 0;
let y = 0;
//let z = 0;
let xx = 30;
let yy = 0;
//let zz = 0;

// velocidade
let vx = 0;
let vy = 0;
//let vz = 0;
let vxx=0;
let vyy = 0;
//let vzz = 0;

// Aceleração
let ax = 0;
let ay = 0;
//let az = 0;
let axx = 0;
let ayy = 0;
//let azz = 0;

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
  ellipse (xx, yy, 50, 50);
}

//função do movimento da bola
function ballMove() {
  ax = accelerationX;
  ay = accelerationY;
  //az = accelarationZ;

  axx = accelerationX;
  ayy = accelerationY;
  //azz = accelarationZ;

  vx = vx + ay;
  vy = vy + ax;
  // vz = vz + az;
  y = y + vy * vMultiplier;
  x = x + vx * vMultiplier;
  //z = z + vz * vMultiplier;

  vxx = vxx + ayy;
  vyy = vyy + axx;
  //vzz = vzz + azz;
  yy = yy + vyy * vMultiplier;
  xx = xx + vxx * vMultiplier;
  //zz = zz + vzz * vMultiplier;

  // Faz Bounce quando chega perto do limite do Canvas
  if (x < 0) {
    x = 0;
    vx = -vx * bMultiplier;
  }
  if (xx < 0) {
    xx = 0;
    vxx = -vxx * bMultiplier;
  }
  if (y < 0) {
    y = 0;
    vy = -vy * bMultiplier;
  }
    if (yy < 0) {
    yy = 0;
    vyy = -vyy * bMultiplier;
  }
  /*if (z < 0) {
    z = 0;
    vz = -vz * Multiplier;
  }*/
    /*if (zz < 0) {
    zz = 0;
    vzz = -vzz * Multiplier;
  }*/
  if (x > width - 20) {
    x = width - 20;
    vx = -vx * bMultiplier;
  }
  if (xx > width - 20) {
    xx = width - 20;
    vxx = -vxx * bMultiplier;
  }
  if (y > height - 20) {
    y = height - 20;
    vy = -vy * bMultiplier;
  }
  if (yy > height - 20) {
    yy = height - 20;
    vyy = -vyy * bMultiplier;
  }
  /*if (z > length - 20) {
    z = length - 20;
    vz = -vz * bMultiplier;
}*/
    /*if (zz > length - 20) {
    zz = length - 20;
    vzz = -vzz * bMultiplier;
}*/
}
