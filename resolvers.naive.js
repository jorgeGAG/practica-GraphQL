/**
 * RESOLUTORES - SOLUCIÓN INGENUA (Causa el problema de consulta N+1)
 * 
 * En este enfoque ingenuo:
 * 1. Query.clientes realiza 1 consulta para traer N clientes.
 * 2. Para CADA uno de los N clientes, GraphQL ejecuta el resolver Cliente.facturas,
 *    provocando N consultas adicionales individuales a la base de datos.
 * Total de consultas: 1 + N
 */

export const resolversNaive = {
    Query: {
        clientes: async (_parent, _args, context) => {
            return await context.db.fetchAllClientes();
        },
    },
    Cliente: {
        facturas: async (parent, _args, context) => {
            // Consulta individual por cada cliente -> Problema N+1
            return await context.db.fetchFacturasByClienteId(parent.id);
        }
    }
};
