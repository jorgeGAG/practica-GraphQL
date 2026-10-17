# Práctica de Laboratorio: Optimización de Modelos de Datos con GraphQL y DataLoader

* **Materia:** Patrones de Diseño de APIs (Maestría en Software)
* **Tema:** GraphQL y Patrón DataLoader
* **Repositorio:** https://github.com/jorgeGAG/practica-GraphQL.git

---

## 1. Contexto y Objetivo de la Práctica
Para la empresa ficticia **LogiTech SaaS**, el equipo de Frontend requiere un tablero unificado de clientes con sus facturas. 

El objetivo de este laboratorio es:
1. Diseñar e implementar un esquema GraphQL (*Schema-First*).
2. Identificar el problema de rendimiento **Consulta N+1** mediante los logs de la base de datos simulada.
3. Mitigar el problema utilizando el patrón **DataLoader** (agrupamiento por lotes y caché por petición).

---

## 2. Entregables Técnicos
El proyecto contiene los archivos solicitados en la guía de práctica:

* **`schema.graphql`**: Definición del sistema de tipos (SDL) con `Cliente`, `Factura` y `Query`.
* **`resolvers.naive.js`**: Implementación de la solución ingenua (que provoca el problema N+1).
* **`resolvers.js`**: Implementación de la solución optimizada con DataLoader.
* **`dataloaders.js`**: Función de carga por lotes (*Batch Function*) para resolver facturas en un solo viaje.
* **`database.js`**: Base de datos simulada con latencia y soporte de consultas individuales y por lote (*Batch*).
* **`server.js`**: Servidor GraphQL listo y optimizado.
* **`server-naive.js`**: Servidor en el puerto 4000 (Solución sin optimizar).
* **`server-optimized.js`**: Servidor en el puerto 4001 (Solución optimizada con DataLoader).
* **`reporte.txt`**: Reporte técnico de consultas y métricas de rendimiento.

---

## 3. Demostración y Pruebas en Ambos Puertos

Se prepararon dos servidores para comparar la ejecución en vivo:

### Escenario 1: Solución Ingenua (Puerto 4000)
Ejecutar en la terminal:
```bash
node server-naive.js
```
* **Apollo Sandbox:** http://localhost:4000/
* **Resultado en consola:** Ejecuta **4 consultas** (1 para clientes y 3 individuales en rojo para las facturas de cada cliente).

### Escenario 2: Solución Optimizada con DataLoader (Puerto 4001)
Ejecutar en otra terminal:
```bash
node server-optimized.js
```
* **Apollo Sandbox:** http://localhost:4001/
* **Resultado en consola:** Ejecuta únicamente **2 consultas** (1 para clientes y 1 por lote en verde con `WHERE cliente_id IN (...)`).

---

## 4. Consulta GraphQL de Prueba
En ambos puertos se ejecuta la misma consulta en Apollo Sandbox:

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

---

## 5. Resultados
* **Sin optimizar (Puerto 4000):** 4 consultas a la base de datos ($1 + 3$) $\rightarrow$ $800\text{ ms}$ de latencia.
* **Con DataLoader (Puerto 4001):** 2 consultas a la base de datos ($1 + 1$) $\rightarrow$ $400\text{ ms}$ de latencia.
* **Conclusión:** Se reducen las consultas a la mitad y se pasa de complejidad $O(N)$ a complejidad constante $O(1)$.
