# -*- coding: utf-8 -*-
"""
Created on Tue Nov 23 14:36:16 2021

@author: batte
"""

import pygame
import sys
import math
import random

seed = random.randrange(sys.maxsize)
random.seed(seed)
print("Seed was:", seed)

class Node:
    
    def __init__(self,size,parent,angle,color):
        self.size = size
        self.parent = parent
        self.angle = angle
        self.color = color
        self.children = []
        self.updatedPos = (400,700) if parent == None else (0,0)
        self.updatedAngle = 0 if parent == None else 90
        self.age = 0
        self.maxBorn = random.randint(1,4)
        
    def update(self):
        self.age += 1
        if self.parent != None:
            parentAngle = self.parent.updatedAngle
            parentX,parentY = self.parent.updatedPos
            
            self.updatedAngle = parentAngle + self.angle
            self.updatedAngle += (math.sin(self.age *1/self.size))*5
            # mx,my = pygame.mouse.get_pos()
            # if mx - parentX <= 0:
            #     angle = -math.degrees(math.atan2(mx - parentX,my - parentY)) - 180
            # else:
            #     angle = -math.degrees(math.atan2(mx - parentX,my - parentY)) + 180
        
            # self.updatedAngle += (angle - self.updatedAngle)/10
            
            self.updatedPos = \
                (parentX + STEMLENGTH*self.size*math.cos(math.radians(self.updatedAngle+270))*min(1,math.log(self.age,40)),
                 parentY + STEMLENGTH*self.size*math.sin(math.radians(self.updatedAngle+270))*min(1,math.log(self.age,40)))
            
            
        if len(self.children) < self.maxBorn and self.size > 5 and random.random() < 0.1:
            cSize = self.size*random.randint(50,90)/100
            cAngle = random.randint(-30,30)
            cColor = [min(255,max(0,i+ random.randint(-40, 40))) for i in self.color]
            newNode = Node(cSize,self,cAngle,cColor)
            self.children.append(newNode)
            
        for child in self.children:
            child.update()
        
        
        
    def draw(self,surface):
        pygame.draw.circle(surface, self.color,[int(i) for i in self.updatedPos],int(self.size/3))
        for child in self.children:
            pygame.draw.line(surface, self.color,[int(i) for i in self.updatedPos], \
                              [int(i) for i in child.updatedPos],int(child.size))
        if not self.size > 5:
            pygame.draw.circle(surface, self.color,[int(i) for i in self.updatedPos],int(self.size*3))
          
        for child in self.children:
            child.draw(surface)
        
        
        
        
pygame.init()
screen = pygame.display.set_mode((800, 700))
clock = pygame.time.Clock()    
 
clock.tick(0)

STEMLENGTH = 10

startNode = Node(20,None,0,[min(255,max(0,i+ random.randint(-50, 125))) for i in (0,125,0)])

while True:
    for event in pygame.event.get():
                if event.type == pygame.QUIT:
                        pygame.quit()
                        sys.exit()
                        
    screen.fill((0,0,0))
    startNode.update()
    startNode.draw(screen)
    pygame.display.flip()
    clock.tick(20)