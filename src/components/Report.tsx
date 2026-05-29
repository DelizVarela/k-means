import { useState } from "react";

interface Section {
  id: string;
  title: string;
  body: React.ReactNode;
}

const P = ({ children }: { children: React.ReactNode }) => (
  <p className="mb-3 leading-relaxed text-slate-600">{children}</p>
);
const UL = ({ items }: { items: string[] }) => (
  <ul className="mb-3 ml-5 list-disc space-y-1 text-slate-600">
    {items.map((i, k) => (
      <li key={k}>{i}</li>
    ))}
  </ul>
);

const sections: Section[] = [
  {
    id: "2",
    title: "2. Resumen",
    body: (
      <P>
        Este trabajo aborda la segmentación de clientes mediante aprendizaje no supervisado. Se aplica
        el algoritmo <strong>K-Means</strong> sobre el dataset público <em>Mall Customers</em> (200
        registros) para agrupar clientes según su ingreso anual y puntaje de gasto. La metodología
        incluye preprocesamiento, método del codo, entrenamiento, visualización con PCA y evaluación
        con índices de Silhouette y Davies-Bouldin. Se obtienen 5 segmentos diferenciados que permiten
        proponer estrategias comerciales específicas.
      </P>
    ),
  },
  {
    id: "3",
    title: "3. Introducción",
    body: (
      <>
        <P>
          Las empresas generan grandes volúmenes de datos sobre sus clientes pero pocas los aprovechan
          estratégicamente. La segmentación permite identificar grupos con comportamientos similares,
          posibilitando atención personalizada y campañas más efectivas.
        </P>
        <P>
          El problema es inherentemente <strong>no supervisado</strong>: no existe una clasificación
          previa correcta; el objetivo es descubrir la estructura subyacente de los datos. K-Means es
          el algoritmo de referencia por su simplicidad, eficiencia y buenos resultados con datos
          numéricos, combinado con PCA para una visualización interpretable.
        </P>
      </>
    ),
  },
  {
    id: "4",
    title: "4. Planteamiento del problema",
    body: (
      <>
        <P>
          <strong>¿Qué se resuelve?</strong> Los centros comerciales acumulan datos (edad, ingreso,
          comportamiento de compra) pero los usan de forma indiferenciada, tratando a todos los
          clientes por igual.
        </P>
        <P>
          <strong>¿Por qué importa?</strong> La falta de segmentación genera campañas ineficientes y
          pérdida de ingresos. Conocer los perfiles permite estrategias diferenciadas.
        </P>
        <strong className="text-slate-700">Limitaciones de la solución actual:</strong>
        <UL
          items={[
            "No captura la interacción entre múltiples variables simultáneamente.",
            "Es subjetiva y depende del criterio del analista.",
            "No escala bien cuando crece el volumen de datos.",
            "No detecta patrones ocultos.",
          ]}
        />
        <P>
          <strong>Mejora esperada con IA:</strong> una segmentación objetiva, reproducible y basada en
          datos, sin definir categorías de antemano.
        </P>
      </>
    ),
  },
  {
    id: "5",
    title: "5. Objetivos",
    body: (
      <>
        <P>
          <strong>General:</strong> Aplicar K-Means para segmentar clientes según su comportamiento de
          compra, obteniendo grupos diferenciados para diseñar estrategias personalizadas.
        </P>
        <strong className="text-slate-700">Específicos:</strong>
        <UL
          items={[
            "Explorar y preprocesar el dataset Mall Customers.",
            "Determinar el número óptimo de clusters (método del codo).",
            "Implementar y entrenar el modelo K-Means.",
            "Visualizar los clusters (dispersión 2D y PCA).",
            "Analizar e interpretar las características de cada segmento.",
            "Proponer estrategias comerciales por cluster.",
          ]}
        />
      </>
    ),
  },
  {
    id: "6",
    title: "6. Marco teórico",
    body: (
      <>
        <P>
          <strong>Aprendizaje no supervisado:</strong> el algoritmo aprende patrones sin etiquetas;
          busca la estructura inherente de los datos.
        </P>
        <P>
          <strong>K-Means:</strong> divide n observaciones en k grupos minimizando la inercia (WCSS =
          Σ Σ ‖xᵢ − μₖ‖²). Pasos: inicialización (k-means++), asignación al centroide más cercano,
          actualización de centroides y convergencia.
        </P>
        <P>
          <strong>Método del codo:</strong> grafica WCSS vs k y elige el punto donde la disminución se
          vuelve marginal. <strong>PCA:</strong> reduce la dimensionalidad para visualizar clusters.
        </P>
        <P>
          <strong>Métricas:</strong> Silhouette (−1 a 1, mayor mejor), Davies-Bouldin (menor mejor) y
          WCSS (compacidad).
        </P>
      </>
    ),
  },
  {
    id: "7",
    title: "7. Contextualización (Caso Paraguay) 🇵🇾",
    body: (
      <>
        <P>
          Para cumplir el requisito de <strong>datos propios y contextualizados</strong>, el problema
          se adapta a un caso real: <strong>"Shopping del Este"</strong>, centro comercial de Ciudad
          del Este (Alto Paraná), en plena Triple Frontera PY–BR–AR, uno de los mayores polos de
          comercio fronterizo de Sudamérica.
        </P>
        <strong className="text-slate-700">Adaptaciones realizadas sobre el dataset:</strong>
        <UL
          items={[
            "Ingreso expresado en salarios mínimos paraguayos (SM 2026 ≈ Gs. 2.800.000) y convertido a guaraníes.",
            "Variable 'origen del cliente': Local, Brasileño, Argentino, Turista interno.",
            "Variable 'frecuencia de visitas mensuales' al shopping.",
            "Variable 'ticket promedio' de consumo en guaraníes.",
            "Reglas de comportamiento que reflejan que los turistas BR/AR tienen alto gasto (electrónica, perfumería) independientemente del ingreso declarado.",
          ]}
        />
        <P>
          Esta adaptación transforma el clustering en una herramienta accionable para el comercio local:
          permite diseñar atención bilingüe, beneficios de cambio de divisas y campañas en fechas clave
          paraguayas, capturando patrones que la segmentación manual tradicional no detecta.
        </P>
      </>
    ),
  },
  {
    id: "8",
    title: "8. Metodología",
    body: (
      <UL
        items={[
          "Recolección: dataset Mall Customers (Kaggle), 200 registros.",
          "Limpieza: sin valores nulos; Gender codificado (0=Female, 1=Male).",
          "Selección: Annual Income y Spending Score (variables del comportamiento de compra).",
          "Normalización: StandardScaler (media 0, desviación 1).",
          "k óptimo: método del codo (k = 1..10) → k = 5.",
          "Modelo: K-Means++, max_iter=300, tol=1e-4, random_state=42.",
          "Evaluación: Silhouette, Davies-Bouldin, visualización con PCA.",
        ]}
      />
    ),
  },
  {
    id: "13",
    title: "13. Conclusiones",
    body: (
      <UL
        items={[
          "K-Means identificó exitosamente 5 segmentos diferenciados sin etiquetas previas.",
          "El método del codo confirmó k=5 con un Silhouette aceptable (>0.5).",
          "El segmento más valioso es 'Clientes Objetivo' (alto ingreso / alto gasto).",
          "La implementación es eficiente, reproducible y extensible a datasets mayores.",
          "La IA no supervisada transforma datos crudos en conocimiento accionable.",
        ]}
      />
    ),
  },
  {
    id: "14",
    title: "14. Líneas futuras",
    body: (
      <UL
        items={[
          "Incorporar más variables: frecuencia de visitas, categorías, canal de compra.",
          "Comparar K-Means con DBSCAN y clustering jerárquico.",
          "Validar el modelo con datos reales de una empresa local.",
          "Esta misma app web (✓ ya implementada) como interfaz de clasificación.",
          "Aprendizaje activo y AutoML para optimización de hiperparámetros.",
        ]}
      />
    ),
  },
  {
    id: "15",
    title: "15. Referencias (APA 7)",
    body: (
      <ol className="ml-5 list-decimal space-y-2 text-sm text-slate-600">
        <li>MacQueen, J. (1967). Some methods for classification and analysis of multivariate observations. <em>Proc. Fifth Berkeley Symposium</em>, 1(14), 281–297.</li>
        <li>Jain, A. K. (2010). Data clustering: 50 years beyond K-means. <em>Pattern Recognition Letters</em>, 31(8), 651–666.</li>
        <li>Hastie, T., Tibshirani, R., & Friedman, J. (2009). <em>The Elements of Statistical Learning</em> (2nd ed.). Springer.</li>
        <li>Scikit-learn developers. (2024). <em>sklearn.cluster.KMeans</em>. scikit-learn documentation.</li>
        <li>Xu, R., & Wunsch, D. (2005). Survey of clustering algorithms. <em>IEEE Trans. Neural Networks</em>, 16(3), 645–678.</li>
        <li>Choudhary, V. (2018). <em>Customer Segmentation Tutorial in Python</em> [Dataset]. Kaggle.</li>
      </ol>
    ),
  },
];

export function Report() {
  const [open, setOpen] = useState<string | null>("2");
  return (
    <div className="space-y-3">
      {sections.map((s) => (
        <div key={s.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <button
            onClick={() => setOpen(open === s.id ? null : s.id)}
            className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            {s.title}
            <span className={`text-indigo-500 transition-transform ${open === s.id ? "rotate-180" : ""}`}>▾</span>
          </button>
          {open === s.id && <div className="border-t border-slate-100 px-5 py-4 text-sm">{s.body}</div>}
        </div>
      ))}
    </div>
  );
}
