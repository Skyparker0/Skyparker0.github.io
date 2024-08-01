from js import document, window
import math
import random

# Initialize canvas
canvas = document.getElementById("gameCanvas")
context = canvas.getContext("2d")

# Game settings
STEMLENGTH = 10
width, height = 800, 700
canvas.width, canvas.height = width, height

# Random seed for reproducibility
seed = random.randrange(sys.maxsize)
random.seed(seed)
print("Seed was:", seed)

class Node:
    def __init__(self, size, parent, angle, color):
        self.size = size
        self.parent = parent
        self.angle = angle
        self.color = color
        self.children = []
        self.updatedPos = (400, 700) if parent is None else (0, 0)
        self.updatedAngle = 0 if parent is None else 90
        self.age = 0
        self.maxBorn = random.randint(1, 4)

    def update(self):
        self.age += 1
        if self.parent is not None:
            parentAngle = self.parent.updatedAngle
            parentX, parentY = self.parent.updatedPos

            self.updatedAngle = parentAngle + self.angle
            self.updatedAngle += (math.sin(self.age * 1/self.size)) * 5

            self.updatedPos = (
                parentX + STEMLENGTH*self.size*math.cos(math.radians(self.updatedAngle+270))*min(1, math.log(self.age, 40)),
                parentY + STEMLENGTH*self.size*math.sin(math.radians(self.updatedAngle+270))*min(1, math.log(self.age, 40))
            )

        if len(self.children) < self.maxBorn and self.size > 5 and random.random() < 0.1:
            cSize = self.size * random.randint(50, 90) / 100
            cAngle = random.randint(-30, 30)
            cColor = [min(255, max(0, i + random.randint(-40, 40))) for i in self.color]
            newNode = Node(cSize, self, cAngle, cColor)
            self.children.append(newNode)

        for child in self.children:
            child.update()

    def draw(self):
        context.beginPath()
        context.arc(self.updatedPos[0], self.updatedPos[1], self.size/3, 0, 2*math.pi)
        context.fillStyle = f'rgb({self.color[0]}, {self.color[1]}, {self.color[2]})'
        context.fill()
        context.closePath()
        
        for child in self.children:
            context.beginPath()
            context.moveTo(self.updatedPos[0], self.updatedPos[1])
            context.lineTo(child.updatedPos[0], child.updatedPos[1])
            context.lineWidth = child.size
            context.strokeStyle = f'rgb({self.color[0]}, {self.color[1]}, {self.color[2]})'
            context.stroke()
            context.closePath()
        
        if not self.size > 5:
            context.beginPath()
            context.arc(self.updatedPos[0], self.updatedPos[1], self.size*3, 0, 2*math.pi)
            context.fillStyle = f'rgb({self.color[0]}, {self.color[1]}, {self.color[2]})'
            context.fill()
            context.closePath()

        for child in self.children:
            child.draw()

startNode = Node(20, None, 0, [min(255, max(0, i + random.randint(-50, 125))) for i in (0, 125, 0)])

def main_loop(*args):
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)
    startNode.update()
    startNode.draw()
    window.requestAnimationFrame(main_loop)

# Start the game loop
window.requestAnimationFrame(main_loop)
