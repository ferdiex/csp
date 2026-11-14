# Colorea el mapa: problemas de satisfacción de restricciones

Material del curso de Inteligencia Artificial: problemas de satisfacción de restricciones (CSP).

**Usar:** https://ferdiex.github.io/csp/

## La página

Un CSP para colorear el mapa de Australia, como en las láminas del curso, o el de México: cada región es una variable, el dominio es {rojo, verde, azul} y dos regiones vecinas no pueden tener el mismo color.

- Se colorea tocando las regiones del mapa o los nodos del grafo de restricciones.
- Las violaciones se marcan en el mapa, en el grafo y en la lista de restricciones.
- La página indica cuándo la asignación es completa y consistente, es decir, una solución.
- **El agente:** resuelve el mapa con búsqueda con backtracking, paso a paso o de corrido, y anota cada decisión: qué región elige, qué color prueba, cuándo lo rechaza y cuándo retrocede. Respeta los colores que el alumno ya puso.
- **Las heurísticas** se activan por separado: MRV (la región con menos colores posibles), grado (la que tiene más vecinos sin colorear) y LCV (el color que menos opciones les quita a los vecinos). Los contadores de asignaciones, retrocesos y colores probados y rechazados permiten compararlas. Por ejemplo, con Victoria fija en azul, el agente retrocede 26 veces sin heurísticas y ninguna con MRV.

- **México:** sus 32 estados como grafo, con cada estado en su posición aproximada y sus 69 fronteras. Se puede usar un dominio de 3 o 4 colores. Con 3 colores no hay solución: hay grupos de cuatro estados vecinos todos entre sí, como Hidalgo, Estado de México, Tlaxcala y Puebla. Para demostrarlo, el agente retrocede 717 veces sin heurísticas, 13,200 solo con la de grado y apenas 15 con MRV y grado juntas.

- **Inferencia:** el agente puede propagar restricciones con forward checking o con AC-3, debajo de cada región se ven los colores que todavía le quedan, y un contador muestra cuántos colores eliminó la propagación sin llegar a probarlos. En el ejemplo de la lámina 26 del curso (WA en rojo y Q en verde), sin inferencia el agente retrocede 7 veces, con forward checking 1 vez, y AC-3 detecta que no hay solución antes de asignar nada. En México con 3 colores, que no tiene solución, el agente necesita 717 retrocesos para demostrarlo sin inferencia, 549 con forward checking y 45 con AC-3.

- **N reinas:** en la carpeta `nreinas/`, el mismo CSP resuelto con librerías: `clp(fd)` en Prolog y `python-constraint` en Python, con búsqueda local (min-conflicts) y un visor del tablero.

## Presentaciones

1. `presentaciones/1_csp_laboratorio.pdf`: colorear el mapa, el agente con backtracking y las heurísticas; la tarea.
2. `presentaciones/2_csp_forward_checking.pdf`: forward checking y AC-3; la tarea.
3. `presentaciones/3_csp_nreinas.pdf`: las N reinas con clp(fd) y python-constraint; el laboratorio (en inglés).

## Archivos

```
csp/
├── index.html        la página
├── csp.js            los mapas, las restricciones y el agente
├── nreinas/          las N reinas en Prolog y Python, y el visor
└── presentaciones/   las presentaciones en PDF
```

Para usarla sin internet basta con abrir `index.html` en el navegador.

Fernando Montes-Gonzalez, Universidad Veracruzana
