
// Disable arrow keys for scrolling when the iframe is focused
window.addEventListener("keydown", function(e) {
  e.preventDefault();
});


let canvas = document.getElementById("drawCanvas");
let context = canvas.getContext("2d");

context.imageSmoothingEnabled = false;


let carSpritesheet = new Image();
carSpritesheet.src = "carWithoutWheels.png";
let shadowImg = new Image();
shadowImg.src = "shadow.png"
let tireSpritesheet = new Image();
tireSpritesheet.src = "carWheels.png";

let background = new Image();
background.src = "map.png";

let character = new Car(0,1200);
let music = new Audio("Roundabout8Bit.mp3");
let engineNoise = new Audio("")

let pixelsPerMeter = 20;
let cameraDistance = 1;

let drawVectors = [];
let particles = [];

let colorPixel = 0;

let objectiveList = [];
let objectiveNum = 0;
document.addEventListener('DOMContentLoaded', function() {
  objectiveList = [
    new Objective(200,1200),
    new Objective(400,1200),
    new Objective(900,1150),
    new Objective(1200,1070),
    new Objective(1500,1111),
    new Objective(1700,1360),
    new Objective(2000,1400),
    new Objective(2200,1400),
    new Objective(2500,1350),
    new Objective(2800,1300),
    new Objective(3200,1200),
    new Objective(3300,1200),
    new Objective(3300 + 400,1000),
    new Objective(3300 + 700,750),
    new Objective(3300 + 1100,550),
    new Objective(3300 + 1500,300),
    new Objective(3300 + 1700,0),
    new Objective(3300 + 1800,0 - (2550-2300)),
  ];


  let posVector = new Vector(3300 + 1800,0 - (2550-2300))
  let directionVector = new Vector(200,-400)
  for (let i = 0; i < 100; i ++) {
    directionVector = directionVector.rotated(Math.random()*Math.PI/2 - Math.PI/4);
    console.log(directionVector);
    posVector = posVector.added(directionVector);
    objectiveList.push(new Objective(posVector.x,posVector.y));
  }
});

//Button detection
let leftPressed = false;
let rightPressed = false;
let upPressed = false;
let downPressed = false;
let spacePressed = false;



let musicPlaying = false;

document.addEventListener("keydown", function(event) {
  // if (!musicPlaying) {
  //   musicPlaying = true;
  //   music.play();
  //   music.currentTime = 20; // Adjust as needed
  // }
  if (event.shiftKey) {

    spacePressed = true;
  }  if (event.key === "ArrowLeft") {
    leftPressed = true;
  }  if (event.key === "ArrowRight") {
    rightPressed = true;
  }  if (event.key === "ArrowUp") {
    upPressed = true;
  }  if (event.key === "ArrowDown") {
    downPressed = true;
  }
});

document.addEventListener("keyup", function(event) {
  if (!event.shiftKey) {
    spacePressed = false;
  }  if (event.key === "ArrowLeft") {
    leftPressed = false;
  }  if (event.key === "ArrowRight") {
    rightPressed = false;
  }  if (event.key === "ArrowUp") {
    upPressed = false;
  }  if (event.key === "ArrowDown") {
    downPressed = false;
  }
});
//


// setInterval(animate, 1000/60);
//dynamic simulation of animation at non set frame rate
requestAnimationFrame(animate);
let oldTime = 0;
function animate(timeStamp) {
  let deltaTime = (timeStamp - oldTime)/1000;
  if (deltaTime>0.1) console.log("lagSpike", deltaTime);
  oldTime = timeStamp;

  update(deltaTime);
  draw();
  requestAnimationFrame(animate);
}

function update(deltaTime) {
  drawVectors = [];
  character.update(deltaTime);
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  character.draw();
  for (let vectorToDraw of drawVectors) {
    vectorToDraw.draw();
  }
}

let viewAngle = 60;
let dViewAngle = -0.1;

function Car(x,y) {
  this.x = x;
  this.y = y;
  this.dx = 0;
  this.dy = 0;
  this.angle = 0;
  this.dAngle = 0;
  this.turnSpeed = 5;
  this.mass = 1000;
  this.drawSize = 100;

  this.width = 10 * this.drawSize/16;
  this.length = 12 * this.drawSize/16;
  this.wheelDist = Math.sqrt(this.width*this.width + this.length*this.length);
  this.inertia = 1/12 * this.mass * (this.width*this.width + this.length*this.length);

  this.wheelAngle = 0;
  this.maxSteering = Math.PI/4;

  // this.frontAxleRotation = 0;
  // this.backAxleRotation = 0;
  // this.wheelRadius = 20

  this.isTouchingObjective = function(objective) {
    let vecBetween = new Vector(this.x-objective.x,this.y-objective.y);
    return (this.length/5 + objective.radius) > vecBetween.magnitude();
  }
  this.drawArrowToObjective = function(objective) {
    let vecBetween = new Vector(this.x-objective.x,this.y-objective.y);
    if (vecBetween.magnitude() > 200) {
      vecBetween.normalized().scalarMultiplied(-200).draw();
    } else {
      vecBetween.scalarMultiplied(-1).draw();
    }
  }

  this.update = function(deltaTime) {
    this.x += this.dx * deltaTime;
    this.y += this.dy * deltaTime;
    this.angle += this.dAngle * deltaTime;

    // check for objective

    if (this.isTouchingObjective(objectiveList[objectiveNum])) {
      console.log(this);
      objectiveNum++;
    }

//START OF CAR PHYSICS

    //vectors
    let force = new Vector(0,0);
    let velocity = new Vector(this.dx,this.dy);
    let speed = velocity.magnitude();
    let unitVelocity = velocity.normalized();
    let heading = Vector.fromAngle(this.angle);

    //set the cameraDistance based on speed

    //constants
    let frictionCoef = 1; //subject to change
    let dragConstant = 0.4;
    let rollingResConst = dragConstant*30;
    let engineForce = 1000000 * 0.5;
    let brakeConstant = engineForce/2;
    // we want to handle parallel and perpendicular forces;
    // PARALLEL FORCES ARE engine torque+friction and air drag and rolling resistance and braking
    // Traction rear wheel drive
    let traction = new Vector(0,0);
    if (upPressed) {
      traction = traction.added(heading.scalarMultiplied(frictionCoef*engineForce));
    }
    if (downPressed) { //braking
      traction = traction.subtracted(heading.scalarMultiplied(frictionCoef*brakeConstant));
    }
    console.log(spacePressed);
    if (spacePressed) { //handbreak
      console.log("space!")
      traction = velocity.normalized().scalarMultiplied(-frictionCoef*brakeConstant);
    }
    //Drag
    let drag = velocity.scalarMultiplied(dragConstant*speed * -1); //

    //rolling resistance
    let rollingResistance = velocity.scalarMultiplied(rollingResConst*-1); //

    // For now let's disable parts of the physics code...

    // now for perpendicular forces on the car:
    // horizontal friction on the tires: tires are pointing a different direction than the car is moving
    // so the tires want to roll, and try to cancel out horizontal motion

    //project the velocity onto the direction of the wheels; than try and cancel out straffing

//frontWheels
    let lateralHeading = heading.rotated(Math.PI/2)
    let frontLateralProjection = velocity.subtracted(velocity.projectedOnto(heading.rotated(this.wheelAngle)));
//backWheels
    let backLateralProjection = velocity.projectedOnto(lateralHeading);


    let slipScale = this.mass/4*frictionCoef*-1;
    let frontLatForce = frontLateralProjection.scalarMultiplied(slipScale*2);
    let backLatForce = backLateralProjection.scalarMultiplied(slipScale*2);

    let lateralForce = frontLatForce.added(backLatForce);

    if (backLateralProjection.magnitude()-30 > speed*0.7){
      particles.push(new DriftMark(this.x,this.y,0,this.angle));
    }
    // drawVectors.push(lateralForce);
    // we also want to calculate the torque this has on the car
    // torque = Inertia * rotational Acceleration
    // torque = force * distance
    // alpha = (force*distance) / Inertia
    let torque = new Vector(0,0);
    let alpha = 0;

    // so now we have the diagonals going to each wheel; let's base torque off of this
    let vectorToFrontLeft = new Vector(-this.width/2,-this.length/2).rotated((this.angle+Math.PI/2));
    let vectorToFrontRight = new Vector(this.width/2,-this.length/2).rotated((this.angle+Math.PI/2));

    //these are separate when I add them to a list?
    //each torque caused by motion
    torque = frontLatForce.subtracted(frontLatForce.projectedOnto(vectorToFrontLeft)).scalarMultiplied(this.wheelDist);
    torque = torque.added(frontLatForce.subtracted(frontLatForce.projectedOnto(vectorToFrontRight)).scalarMultiplied(this.wheelDist));
    torque = torque.added(backLatForce.subtracted(backLatForce.projectedOnto(vectorToFrontLeft)).scalarMultiplied(-this.wheelDist));
    torque = torque.added(backLatForce.subtracted(backLatForce.projectedOnto(vectorToFrontRight)).scalarMultiplied(-this.wheelDist));
    // drawVectors.push(torque);

    //Now I should cancel out rotation using more torque

    let spinFrictionFrontLeft = heading.rotated(this.wheelAngle).projectedOnto(vectorToFrontLeft.rotated(-Math.PI/2)).scalarMultiplied(slipScale*this.dAngle*this.wheelDist); //this has distance * friction so far
    let spinFrictionFrontRight = heading.rotated(this.wheelAngle).projectedOnto(vectorToFrontRight.rotated(-Math.PI/2)).scalarMultiplied(slipScale*this.dAngle*-this.wheelDist); //this has distance * friction so far
    let spinFrictionBackLeft = heading.projectedOnto(vectorToFrontRight.rotated(-Math.PI/2)).scalarMultiplied(slipScale*this.dAngle*-this.wheelDist); //this has distance * friction so far
    let spinFrictionBackRight = heading.projectedOnto(vectorToFrontLeft.rotated(-Math.PI/2)).scalarMultiplied(slipScale*this.dAngle*this.wheelDist); //this has distance * friction so far

    let antiSpin = spinFrictionBackLeft.added(spinFrictionBackRight.added(spinFrictionFrontLeft.added(spinFrictionFrontRight)))
    torque = torque.added(antiSpin.scalarMultiplied(10));

    // front left force =

    // let's put the torque at the front of the car
    // torque = frontLatForce.scalarMultiplied(this.length/2).added(backLatForce.scalarMultiplied(this.length/2 * -1)); //torque is the same for front and back tires so we double. Let's do front torque

    if (false) { // we are making this disabled for now
      if (torque.dot(lateralHeading) > 0) {  // if drifting like this / moving forward
        alpha = torque.magnitude()/this.inertia;
      } else if (torque.dot(lateralHeading) < 0) {  // if drifting like this \ moving forward
        alpha = -torque.magnitude()/this.inertia;
      }
      this.dAngle += alpha*deltaTime;
    } else {
      // get direction of car vs velocity instead of using just speed
      let speedForward = speed/100 + Math.cbrt(speed*5 - 125) + 5; // don't want it to grow out of control
      let dotSpeedHeading = velocity.normalized().dot(heading);
      this.dAngle = this.wheelAngle * speedForward * dotSpeedHeading * deltaTime * 10;//this.wheelAngle*3 * speed/1000;

    }


    force = lateralForce.added(traction.added(drag.added(rollingResistance)));
    // drawVectors.push(force);

    // console.log("actual full force", force);
    this.dx += force.x/this.mass *deltaTime;
    this.dy += force.y/this.mass *deltaTime;

    cameraDistance = 1 + 1/(1+10*Math.exp(-0.004*speed)); // lets use the logistic function

// END OF CAR PHYSICS



    //
    if (leftPressed) {
      this.wheelAngle = Math.max(this.wheelAngle - this.turnSpeed * deltaTime, -this.maxSteering);
      // this.angle -=this.turnSpeed*deltaTime
    }
    if (rightPressed) {
      this.wheelAngle = Math.min(this.wheelAngle + this.turnSpeed * deltaTime, this.maxSteering);
      // this.angle +=this.turnSpeed*deltaTime
    }
    if (!(rightPressed||leftPressed)) {
      if (this.wheelAngle > 0) this.wheelAngle -= this.turnSpeed * deltaTime;
      else this.wheelAngle += this.turnSpeed * deltaTime;
      if (Math.abs(this.wheelAngle - 0)  <= this.turnSpeed*deltaTime) this.wheelAngle = 0;
    }
    // if (upPressed) {
    //   this.dy += Math.sin(this.angle) * this.speed * deltaTime;
    //   this.dx += Math.cos(this.angle) * this.speed * deltaTime;
    // }
    // if (downPressed) {
    //   this.dy -= Math.sin(this.angle) * this.speed * deltaTime;
    //   this.dx -= Math.cos(this.angle) * this.speed * deltaTime;
    // }
  }

  this.draw = function() {
    //0 viewAngle = ground level. 90 = top down.
    // viewAngle += dViewAngle;
    // if (viewAngle < 0 || viewAngle > 90) dViewAngle *= -1;
    //viewAngle = 90;

    let gapScale = 2.5
    let scaleY =  1 * Math.sin(viewAngle * Math.PI / 180);
    let layerGap =  gapScale * Math.cos(viewAngle * Math.PI / 180);

    let heightList = [1,3,1,1,2,2,1,1,1];
    let layerNum = 0;
    let offsetMultiply = this.drawSize/50;



    //Grid
    // let gridSize = 300/cameraDistance;
    // let a = 0
    // for (let x = Math.floor((this.x-canvas.width/2)/gridSize)*gridSize; x < Math.ceil((this.x+canvas.width/2)/gridSize)*gridSize; x += gridSize) {
    //   context.fillStyle = "black";
    //   context.fillRect(canvas.width/2-this.x + x, 0,10/cameraDistance,canvas.height);
    //   a++;
    // }
    // console.log(a)
    // for (let y = Math.floor((this.y-canvas.width/(Math.max(scaleY,0.2)))/gridSize)*gridSize;
    //     y < Math.ceil((this.y+canvas.width/(Math.max(2*scaleY,0.2)))/gridSize)*gridSize; y += gridSize/cameraDistance) {
    //   context.fillStyle = "black";
    //   context.fillRect(0, canvas.height/2-this.y*scaleY + y *scaleY, canvas.width, 10*scaleY);
    // }
    // draw the racetrack background
    let mapScale = 2;
    context.save();
    context.translate(canvas.width/2,canvas.height/2);
    context.scale(1/cameraDistance,1*scaleY/cameraDistance);
    context.scale(mapScale,mapScale);
    context.translate(-this.x,-this.y)//*scaleY);

    // continous edges
    let tileX = Math.floor(this.x/background.width*2)/2;
    let tileY = Math.floor(this.y/background.height*2)/2;

    for (let tileXMult = Math.ceil(tileX - 1); tileXMult < tileX + 1; tileXMult++) {
      for (let tileYMult = Math.ceil(tileY - 1); tileYMult < tileY + 1; tileYMult++) {
        context.drawImage(background, 0+tileXMult*background.width, 0+tileYMult*background.height, background.width, background.height);
      }
    }
    context.restore();
    //
    // context.save();
    // context.scale(1,1*scaleY);
    // context.translate(canvas.width/2-this.x +background.width/2, canvas.height/2-this.y*scaleY +background.height/2*scaleY);
    // context.drawImage(background, -background.width/2, -background.height/2, background.width, background.height);
    // context.restore();
    // //
    // colorPixel = context.getImageData(canvas.width/2, canvas.height/2, 1, 1).data;
    // console.log(colorPixel);


    // draw objective
    let currObjective = objectiveList[objectiveNum];
    context.save();
    context.translate(canvas.width/2,canvas.height/2);
    context.scale(1/cameraDistance,1*scaleY/cameraDistance);
    context.scale(mapScale,mapScale);
    context.translate(-this.x,-this.y);

    context.translate(currObjective.x,currObjective.y);
    context.fillStyle = "green"; // Example: red color with full opacity
    context.globalAlpha = 0.5;
    context.beginPath();
    context.arc(0, 0, currObjective.radius, 0, 2 * Math.PI);
    context.fill();
    context.restore();

    this.drawArrowToObjective(objectiveList[objectiveNum]);

    for (let i = 0; i<10; i++) {
      let shadowScale = 2
      context.save()
      context.translate(canvas.width/2-i*shadowScale/cameraDistance, canvas.height/2+i*shadowScale*scaleY/cameraDistance);
      context.scale(1/cameraDistance,scaleY/cameraDistance);
      context.rotate(this.angle - Math.PI/2);
      context.globalAlpha = 0.2;
      context.drawImage(shadowImg, -this.drawSize/2, -this.drawSize/2, this.drawSize, this.drawSize);
      context.restore()
    }


    // draw particles
    for (let i = particles.length-1; i >= 0; i--) {
      particle = particles[i];
      particle.age++;
      if (particle.age > 500) {
        particles.splice(i,1);
        continue;
      }

      context.save();
      context.translate(canvas.width/2,canvas.height/2);
      context.scale(1/cameraDistance,1*scaleY/cameraDistance);
      context.scale(mapScale,mapScale);
      context.translate(-this.x,-this.y);
      context.translate(particle.x,particle.y);
      context.rotate(particle.angle + Math.PI/2);
      context.globalAlpha = 0.5 - 0.5 * particle.age/500; // Adjust this value as needed (0 = fully transparent, 1 = fully opaque)
      context.fillStyle = "black"; // Example: red color with full opacity
      let driftWidth = 1/8
      let driftHeight = 1/8
      //context.fillRect(-this.drawSize/2,-this.drawSize/10+this.length/2, this.drawSize, this.drawSize/5); // Adjust x, y, width, height as needed
      context.scale(1/mapScale,1/mapScale);
      context.fillRect(-this.width/2,-this.drawSize*driftHeight/2+this.length/2, this.drawSize*driftWidth, this.drawSize*driftHeight); //backLeft
      context.fillRect(this.width/2,-this.drawSize*driftHeight/2+this.length/2, -this.drawSize*driftWidth, this.drawSize*driftHeight); //back right
      context.fillRect(-this.width/2,+this.drawSize*driftHeight/2-this.length/2, this.drawSize*driftWidth, this.drawSize*driftHeight);
      context.fillRect(this.width/2,+this.drawSize*driftHeight/2-this.length/2, -this.drawSize*driftWidth, this.drawSize*driftHeight);
      context.restore();
    }



    for (let i = 0; i < heightList.length; i++) {
      for (let h = 0; h < heightList[i]; h++) {
        // context.save()
        // context.translate(canvas.width/2, canvas.height/2 - layerNum*offset*offsetMultiply);
        // context.rotate(this.angle + Math.PI/2);
        // context.drawImage(carSpritesheet, i * 16, 0, 16, 16, -this.drawSize/2, -this.drawSize/2, this.drawSize, this.drawSize);
        // context.restore()

        context.save()
        context.translate(canvas.width/2, canvas.height/2 - layerNum*layerGap*offsetMultiply/cameraDistance);
        context.scale(1/cameraDistance,scaleY/cameraDistance);
        context.rotate(this.angle + Math.PI/2);
        context.drawImage(carSpritesheet, i * 16, 0, 16, 16, -this.drawSize/2, -this.drawSize/2, this.drawSize, this.drawSize);
        context.restore();


        // draw wheels
        if (i<4) {
          context.save()
          context.translate(canvas.width/2, canvas.height/2 - layerNum*layerGap*offsetMultiply/cameraDistance);
          context.scale(1/cameraDistance,scaleY/cameraDistance);
          context.rotate(this.angle + Math.PI/2);
          context.translate(-this.drawSize/2 + 4/16 * this.drawSize,-this.drawSize/2 + 4/16 * this.drawSize);
          context.rotate(this.wheelAngle);
          context.drawImage(tireSpritesheet, 3+i * 16, 2, 2, 4, -1/16*this.drawSize, -2/16*this.drawSize, this.drawSize*2/16, this.drawSize*4/16);
          context.restore()

          context.save()
          context.translate(canvas.width/2, canvas.height/2 - layerNum*layerGap*offsetMultiply/cameraDistance);
          context.scale(1/cameraDistance,scaleY/cameraDistance);
          context.rotate(this.angle + Math.PI/2);
          context.translate(-this.drawSize/2 + 12/16 * this.drawSize,-this.drawSize/2 + 4/16 * this.drawSize);
          context.rotate(this.wheelAngle);
          context.scale(-1,1);
          context.drawImage(tireSpritesheet, 3+i * 16, 2, 2, 4, -1/16*this.drawSize, -2/16*this.drawSize, this.drawSize*2/16, this.drawSize*4/16);
          context.restore()
        }

        //


        layerNum++;
      }
    }

  }
}

class DriftMark {
  constructor(x,y,age,angle) {
    this.x = x || 0;
    this.y = y || 0;
    this.age = age;
    this.angle = angle;
  }
}

class Objective {
  constructor(x,y) {
    this.x = x || 0;
    this.y = y || 0;
    this.radius = 100;
  }
}

class Vector {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  // Add another vector to this vector
  added(otherVector) {
    return new Vector(this.x + otherVector.x, this.y + otherVector.y);
  }

  // Subtract another vector from this vector
  subtracted(otherVector) {
    return new Vector(this.x - otherVector.x, this.y - otherVector.y);
  }

  // Multiply this vector by a scalar
  scalarMultiplied(scalar) {
    return new Vector(this.x*scalar,this.y*scalar);
  }

  vectorMultiplied(otherVector) {
    return new Vector(this.x * otherVector.x, this.y * otherVector.y);
  }

  // Get the magnitude (length) of the vector
  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  //unitVector
  normalized() {
    const mag = this.magnitude();
    return new Vector(this.x / mag, this.y / mag);
  }

  dot(otherVector) {
    return this.x * otherVector.x + this.y * otherVector.y;
  }

  rotated(radians) {
    const cosTheta = Math.cos(radians);
    const sinTheta = Math.sin(radians);

    const newX = this.x * cosTheta - this.y * sinTheta;
    const newY = this.x * sinTheta + this.y * cosTheta;

    return new Vector(newX, newY);
  }

  projectedOnto(otherVector) {
    const dotProduct = this.dot(otherVector);
    const magB = otherVector.magnitude();
    const unitB = otherVector.normalized();

    return unitB.scalarMultiplied(dotProduct / magB);
  }

  // Static method to create a new vector from an angle (in radians)
  static fromAngle(angle) {
    return new Vector(Math.cos(angle), Math.sin(angle));
  }

  toAngle() {
    return Math.atan(this.y/this.x);
  }

  draw() {
    context.save()
    context.fillStyle = "blue";
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(canvas.width/2, canvas.height/2);
    context.lineTo(canvas.width/2 + this.x, canvas.height/2 + this.y);
    context.stroke();
    context.restore()
  }
}
