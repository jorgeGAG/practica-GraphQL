# Práctica de Laboratorio: Optimización de Modelos de Datos con GraphQL y DataLoader

Proyecto desarrollado para la materia **Patrones de Diseño de APIs / Software** en el programa de **Maestría en Ingeniería de Software**.

---

## 🎯 Objetivo de la Práctica
Identificar y resolver de manera práctica el **Problema de Consulta N+1** en arquitecturas GraphQL mediante la implementación del patrón **DataLoader** (agrupamiento por lotes y almacenamiento en caché por petición).

---

## 📌 ¿Qué es el Problema N+1?
Al realizar una consulta anidada en GraphQL (por ejemplo, obtener una lista de clientes y para cada uno sus facturas históricas):
* **1 consulta** inicial para traer la lista de los $N$ clientes:
  `SELECT * FROM clientes;`
* **N consultas individuales**, una por cada cliente, para consultar sus facturas:
  `SELECT * FROM facturas WHERE cliente_id = '...';`

Si se tienen 100 clientes, se disparan **101 consultas** a la base de datos, lo que provoca alta latencia, saturación del pool de conexiones y lentitud general.

---

## 💡 Solución Implementada: DataLoader
Para resolverlo, se aplicó la librería **DataLoader** con las siguientes directrices arquitectónicas:
1. **Método por Lotes (`Batch`)**: Se creó una función en la base de datos que recibe un arreglo de IDs y realiza una única consulta SQL con la cláusula `IN`:
   `SELECT * FROM facturas WHERE cliente_id IN ('c-1', 'c-2', 'c-3');`
2. **Ciclo de vida por petición (`Per-Request Context`)**: El DataLoader se instancia dinámicamente dentro de la función `context` de Apollo Server, evitando fugas de memoria o que diferentes usuarios compartan datos en caché.
3. **Resolutores optimizados**: El resolver de `Cliente.facturas` invoca `context.loaders.facturasLoader.load(parent.id)`.

---

## 📊 Comparativa de Resultados

| Métrica | Solución Naive (Sin Optimizar) | Solución Optimizada (DataLoader) | Mejora |
| :--- | :---: | :---: | :---: |
| **Consultas a BD** | **4 consultas** ($1 + 3$) | **2 consultas** ($1 + 1$) | **-50%** de consultas |
| **Tiempo de respuesta** | ~800 ms | ~400 ms | **2x más rápido** |
| **Complejidad de consultas** | $O(N)$ consultas | $O(1)$ constante | Escalabilidad garantizada |

---

## 📂 Estructura del Proyecto

```text
graphql-main/
├── schema.graphql        # Definición del esquema SDL (Schema-First)
├── dataloaders.js        # Fábrica e implementación de DataLoader
├── resolvers.js          # Resolutores optimizados con DataLoader
├── resolvers.naive.js    # Resolutores con la solución ingenua (N+1)
├── database.js           # Capa de datos simulada con soporte individual y batch
├── server.js             # Servidor principal optimizado (Puerto 4000)
├── server-naive.js       # Servidor sin optimizar para pruebas comparativas (Puerto 4000)
├── server-optimized.js   # Servidor optimizado en puerto independiente (Puerto 4001)
├── reporte.txt           # Reporte técnico con métricas de consola
├── package.json          # Dependencias y scripts
└── README.md             # Documentación del proyecto
```

---

## 🚀 Instrucciones de Ejecución

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone <URL_DE_TU_REPOSITORIO>
cd graphql-main
npm install
```

### 2. Ejecutar el Servidor Principal (Optimizado)
```bash
node server.js
```
Abre en tu navegador: [http://localhost:4000/](http://localhost:4000/)

### 3. Ejecutar la Consulta de Prueba
En el sandbox de Apollo ejecuta la siguiente consulta:

```graphql
query GetDashboardData {
  clientes {
    nombre
    sector
    facturas {
      monto
    }
  }
}
```

### 4. Pruebas Comparativas de Escenarios
Si deseas reproducir ambos escenarios por separado:
* **Escenario Naive (Puerto 4000):**
  ```bash
  node server-naive.js
  ```
  *(Observa en consola las 4 consultas individuales en rojo)*

* **Escenario Optimizado (Puerto 4001):**
  ```bash
  node server-optimized.js
  ```
  *(Observa en consola únicamente 2 consultas, una de ellas en verde con BATCH)*

---

## 🛠️ Tecnologías Utilizadas
* **Node.js** (v18+)
* **Apollo Server** (@apollo/server)
* **GraphQL**
* **DataLoader**
