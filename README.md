# Segmentacion de Clientes con K-Means

Proyecto web desarrollado para la asignatura **Inteligencia Artificial II**.

Este trabajo aplica **aprendizaje no supervisado** mediante el algoritmo **K-Means** para segmentar clientes y proponer estrategias comerciales diferenciadas. La aplicacion incluye una version base y una version contextualizada al caso paraguayo, adaptada al comercio fronterizo de **Ciudad del Este**.

## Caracteristicas

- Segmentacion de clientes con K-Means.
- Metodo del codo para estimar el numero optimo de clusters.
- Evaluacion con **Silhouette** y **Davies-Bouldin**.
- Visualizacion de clusters en 2D y mediante **PCA**.
- Clasificador interactivo para nuevos clientes.
- Caso contextualizado a Paraguay con datos adaptados.
- Informe academico integrado en la propia aplicacion.

## Caso contextualizado

Para evitar que el proyecto sea solo una reproduccion de un tutorial, se agrego un caso propio basado en un escenario realista de **Shopping del Este**, en Ciudad del Este, Alto Parana. Este dataset incluye variables adaptadas al contexto local, como:

- Ingreso en salarios minimos paraguayos.
- Origen del cliente.
- Frecuencia de visitas mensuales.
- Ticket promedio en guaranies.

## Tecnologias utilizadas

- React
- Vite
- TypeScript
- Tailwind CSS
- Recharts

## Requisitos

- Node.js 18 o superior
- npm

## Instalacion

```bash
npm install
```

## Ejecucion en desarrollo

```bash
npm run dev
```

Luego abre la direccion que aparezca en la terminal, normalmente:

```bash
http://localhost:5173
```

## Compilacion para produccion

```bash
npm run build
```

## Vista previa del build

```bash
npm run preview
```

## Estructura principal del proyecto

- `src/App.tsx`: aplicacion principal.
- `src/components/`: componentes visuales y de analisis.
- `src/lib/`: logica de K-Means, datasets y modelos.
- `index.html`: pagina base del proyecto.


## Autor

Trabajo practico final para la materia **Inteligencia Artificial II**.
