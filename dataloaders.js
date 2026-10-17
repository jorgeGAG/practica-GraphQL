import DataLoader from 'dataloader';

/**
 * Función fábrica que crea una instancia nueva de DataLoader por cada petición HTTP.
 * 
 * Reglas fundamentales de DataLoader:
 * 1. El arreglo resultante de valores debe tener la misma longitud que el arreglo de claves.
 * 2. Cada índice en el arreglo resultante debe corresponder exactamente al mismo índice de la clave solicitada.
 * 
 * @param {Object} db - Capa de persistencia / base de datos
 * @returns {DataLoader} Instancia de DataLoader para facturas
 */
export const createFacturasLoader = (db) => {
    return new DataLoader(async (clienteIds) => {
        // Ejecuta la consulta agrupada por lotes (Batch Query)
        return await db.fetchFacturasByClienteIdsBatch(clienteIds);
    });
};
