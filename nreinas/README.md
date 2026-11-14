# N reinas: el mismo CSP con dos librerías

Laboratorio del curso de Inteligencia Artificial: el problema de las N reinas resuelto con librerías de restricciones, en Prolog y en Python.

Una variable por fila: `Qi` es la columna de la reina de la fila `i`. Las restricciones piden columnas distintas y diagonales distintas.

## Prolog: `clp(fd)`

Viene incluida con SWI-Prolog.

```
swipl -q prolog/nqueens.pl 8          # una solución, se guarda en queens8.json
swipl prolog/nqueens.pl               # consola con todo cargado
?- queens(8, Cols).
?- count_solutions(8, K).
?- time_first(30, ff).                % tiempo a la primera solución con una opción de labeling
```

## Python: `python-constraint`

```
pip install python-constraint
python3 python/nqueens.py 8                   # una solución, se guarda en queens8.json
python3 python/nqueens.py 8 --count           # contar soluciones
python3 python/nqueens.py 200 --min-conflicts # búsqueda local
```

Desde Python también se puede medir el efecto de forward checking: `nqueens.time_first(20, forwardcheck=False)`.

El archivo tiene dos modelos: `build()`, con `AllDifferentConstraint` para las columnas, que usa el backtracking, y `build_pairs()`, con una restricción por par de filas, que usa min-conflicts. Con el primero, la búsqueda local no puede contar bien los conflictos y falla incluso con N = 20.

## Ver el tablero

`ver_tablero.html` abre cualquier `queensN.json` de los dos programas, dibuja el tablero y comprueba que ninguna reina ataque a otra. Basta con abrirlo en el navegador.

## Verificación

Los dos programas dan 1, 0, 0, 2, 10, 4, 40, 92, 352, 724, 2,680 y 14,200 soluciones para N = 1 a 12, y para N = 6, 8 y 10 encuentran exactamente las mismas soluciones.
