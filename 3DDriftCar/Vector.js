
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

  // Static method to create a new vector from an angle (in radians)
  static fromAngle(angle) {
    return new Vector(Math.cos(angle), Math.sin(angle));
  }
}

// Example usage:
const vector1 = new Vector(3, 4);
const vector2 = new Vector(1, 2);

console.log("Vector 1:", vector1);
console.log("Vector 2:", vector2);

vector1.add(vector2);
console.log("After adding Vector 2 to Vector 1:", vector1);

vector1.subtract(vector2);
console.log("After subtracting Vector 2 from Vector 1:", vector1);

vector1.multiply(2);
console.log("After multiplying Vector 1 by 2:", vector1);

console.log("Magnitude of Vector 1:", vector1.magnitude());

vector1.normalize();
console.log("Normalized Vector 1:", vector1);

const angleVector = Vector.fromAngle(Math.PI / 3);
console.log("Vector from angle (60 degrees):", angleVector);



export default Vector;
