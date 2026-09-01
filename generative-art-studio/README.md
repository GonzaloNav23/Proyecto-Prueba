# Generative Art Studio

Un estudio de arte generativo interactivo que corre íntegramente en el navegador, construido solo con **HTML, CSS y JavaScript vanilla**. Sin frameworks ni backend: ideal para alojar en GitHub Pages.

## Demo

Abre `index.html` en cualquier navegador o súbelo a GitHub Pages.

## Controles

- **⚙ (esquina superior derecha)**: muestra/oculta el panel de controles.
- **Modo**: selecciona entre los 4 algoritmos generativos.
- **Velocidad**: ajusta la velocidad de la animación.
- **Cantidad**: número de partículas/elementos.
- **Profundidad** (solo Árbol Fractal): cuántas ramas recursivas se dibujan.
- **Paleta de colores**: 5 paletas predefinidas (Aurora, Atardecer, Océano, Neón, Monocromático).
- **🎲 Aleatorio**: genera una composición aleatoria nueva.
- **💾 Guardar PNG**: exporta el canvas actual como imagen PNG.

## Modos de arte generativo

1. **Flow Field** — partículas que siguen un campo de ruido Simplex, dejando estelas de color que se desvanecen gradualmente.
2. **Partículas Reactivas** — partículas que huyen del cursor cuando este se acerca.
3. **Árbol Fractal** — árboles generados recursivamente; el ángulo (velocidad) y la profundidad de las ramas se ajustan en tiempo real.
4. **Constelación** — puntos que se mueven libremente y se conectan con líneas cuya opacidad depende de la distancia.

Todo cambia en tiempo real al mover los sliders, sin recargar la página, usando `requestAnimationFrame`.

## Estructura

```
index.html   → estructura y panel de controles
style.css    → diseño oscuro y minimalista
script.js    → toda la lógica y los 4 algoritmos
```

## Despliegue en GitHub Pages

1. Crea un repositorio en GitHub.
2. Sube estos 3 archivos (y el README).
3. En *Settings → Pages*, selecciona la rama `main` como fuente.
4. Tu estudio estará disponible en `https://<usuario>.github.io/<repo>/`.
