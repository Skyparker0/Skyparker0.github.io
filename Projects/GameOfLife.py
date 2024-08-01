# -*- coding: utf-8 -*-
"""
Created on Tue Apr 27 08:03:55 2021

@author: batte
"""

import pygame
import sys
import numpy as np

class GameOfLife(object):
    
    def __init__(self, width, height):
        self.width = width
        self.height = height
        self.cells = np.zeros((width, height))
        
    def get(self,x,y):
        return self.cells[x % self.width,y % self.height]
    
    def put(self,x,y,num):
        self.cells[x % self.width,y % self.height] = num
        
    def live_neighbors(self,x,y):
        count = 0
        for checkx in range(x-1, x+2):
            for checky in range(y-1, y+2):
                if checkx == x and checky == y:
                    continue
                if self.get(checkx,checky) == 1:
                    count += 1
        return count
    
    def update(self):
        updatedCells = np.zeros((self.width, self.height))
        for x in range(self.width):
            for y in range(self.height):
                live_neighbors = self.live_neighbors(x,y)
                
                if self.get(x,y) == 1:
                        
                    if live_neighbors < 2:
                        updatedCells[x,y] = 0
                    elif live_neighbors > 3:
                        updatedCells[x,y] = 0
                    else:
                        updatedCells[x,y] = 1
                else:
                    if live_neighbors == 3:
                        updatedCells[x,y] = 1
                    else:
                        updatedCells[x,y] = 0

        
        self.cells = updatedCells
        
    def draw(self, surface):
        for x in range(self.width):
            for y in range(self.height):
                live = self.get(x,y)
                color = (255,255,255) if live == 1 else (0,0,0)
                pygame.draw.rect(surface,color, pygame.Rect(
                    x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE))

WIDTH = 500
HEIGHT = 500
TILE_SIZE = 5

pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
clock = pygame.time.Clock()
    
gol = GameOfLife(WIDTH//TILE_SIZE, HEIGHT//TILE_SIZE)

# boxSize = 20
# for x in range(50-boxSize,50+boxSize):
#     for y in range(50-boxSize,50+boxSize):
#         gol.put(x,y,1)

# for x in range(20,30):
#     gol.put(x,20,1)

import random
string = ""
for y in range(48,51):
    for x in range(48,51):
        number = 1 if random.random() > 0.3 else 0
        gol.put(x,y,number)
        string += str(number)
    string += " "
print(string)

clock.tick(1)
gol.draw(screen)
pygame.display.flip()
clock.tick(2)

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
                        
    screen.fill((0,0,0))
    gol.update()
    gol.draw(screen)
    pygame.display.flip()
    clock.tick(2)