from sympy import * 


theta, px, py = symbols('theta px py')

rot = Matrix([[cos(theta), -sin(theta), 0],
              [sin(theta), cos(theta), 0],
              [0, 0, 1]])

trans = Matrix([[1, 0, px],
                [0, 1, py],
                [0, 0, 1]])

print(rot*trans)
print(trans*rot)