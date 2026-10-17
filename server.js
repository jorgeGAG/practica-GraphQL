import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import DataLoader from 'dataloader';

// 1. SIMULACIÓN DE LA BASE DE DATOS (MOCK DB)
const CLIENTES_DB = [
    { id: "c-1", nombre: "Corporación Alfa", sector: "Finanzas" },
    { id: "c-2", nombre: "Logística Beta", sector: "Transporte" },
    { id: "c-3", nombre: "Industrias Gamma", sector: "Manufactura" }
];

const FACTURAS_DB = [
    { id: "f-1", clienteId: "c-1", monto: 1500.00 },
    { id: "f-2", clienteId: "c-1", monto: 2300.50 },
    { id: "f-3", clienteId: "c-2", monto: 450.00 },
    { id: "f-4", clienteId: "c-3", monto: 8900.00 }
];

// Helper para simular latencia de red (200ms)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const db = {
    async fetchAllClientes() {
        console.log("\x1b[36m%s\x1b[0m", "[DB READ] SELECT * FROM clientes;");
        await delay(200);
        return CLIENTES_DB;
    },
    // Método que causaba el problema N+1 (solución ingenua)
    async fetchFacturasByClienteId(clienteId) {
        console.log("\x1b[31m%s\x1b[0m", `[DB READ] SELECT * FROM facturas WHERE cliente_id = '${clienteId}';`);
        await delay(200);
        return FACTURAS_DB.filter(f => f.clienteId === clienteId);
    },
    // FUNCIÓN OPTIMIZADA PARA EL DATALOADER (BATCH)
    async fetchFacturasByClienteIdsBatch(clienteIds) {
        console.log("\x1b[32m%s\x1b[0m", `[DB BATCH READ] SELECT * FROM facturas WHERE cliente_id IN (${clienteIds.map(id => `'${id}'`).join(', ')});`);
        await delay(200);
        // Retorna un arreglo donde cada elemento corresponde al orden estricto de clienteIds
        return clienteIds.map(id => FACTURAS_DB.filter(f => f.clienteId === id));
    }
};

// 2. DEFINICIÓN DEL ESQUEMA (SDL)
const typeDefs = `#graphql
  type Cliente {
    id: ID!
    nombre: String!
    sector: String!
    facturas: [Factura!]!
  }

  type Factura {
    id: ID!
    monto: Float!
  }

  type Query {
    clientes: [Cliente!]!
  }
`;

// 3. RESOLUTORES OPTIMIZADOS CON DATALOADER
const resolvers = {
    Query: {
        clientes: async () => await db.fetchAllClientes(),
    }
    //     ,
    // Cliente: {
    //     facturas: async (parent) => {
    //         // SOLUCIÓN INGENUA: Llama a la BD por cada cliente
    //         return await db.fetchFacturasByClienteId(parent.id);
    //     }
    // }
    
    ,
    Cliente: {
        facturas: async (parent, _args, context) => {
            // Se invoca el loader inyectado en el contexto por petición
            return await context.loaders.facturasLoader.load(parent.id);
        }
    }

    
};

// 4. FÁBRICA DE DATALOADER (INSTANCIACIÓN POR PETICIÓN / PER-REQUEST)
const createFacturasLoader = () => {
    return new DataLoader(async (clienteIds) => {
        return await db.fetchFacturasByClienteIdsBatch(clienteIds);
    });
};

// 5. INICIALIZACIÓN DEL SERVIDOR CON CONTEXTO DINÁMICO
const server = new ApolloServer({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    // El contexto dinámico garantiza una instancia limpia de DataLoader por cada petición
    context: async () => {
        return {
            loaders: {
                facturasLoader: createFacturasLoader()
            }
        };
    }
});

console.log(`🚀 Servidor listo en Académico listo en: ${url}`);
