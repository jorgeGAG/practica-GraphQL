/**
 * RESOLUTORES - SOLUCIÓN OPTIMIZADA CON DATALOADER (Mitigación N+1)
 * 
 * En este enfoque optimizado:
 * 1. Query.clientes realiza 1 consulta para traer N clientes.
 * 2. Para cada cliente, se invoca context.loaders.facturasLoader.load(parent.id).
 * 3. DataLoader recolecta todos los IDs en el mismo ciclo del event loop (tick)
 *    y ejecuta UNA ÚNICA consulta agrupada por lotes (Batch).
 * Total de consultas: 1 + 1 = 2 consultas fijas, sin importar el número N de clientes.
 */

export const resolvers = {
    Query: {
        clientes: async (_parent, _args, context) => {
            return await context.db.fetchAllClientes();
        },
    },
    Cliente: {
        facturas: async (parent, _args, context) => {
            // DataLoader agrupa las peticiones y las resuelve en lote
            return await context.loaders.facturasLoader.load(parent.id);
        }
    }
};
