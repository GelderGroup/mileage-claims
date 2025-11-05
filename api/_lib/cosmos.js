// api/_lib/cosmos.js
import { CosmosClient } from "@azure/cosmos";

let _client;
const _containers = new Map(); // key: `${db}:${container}` -> container

function getClient() {
    const conn = process.env.COSMOS_CONNECTION_STRING;
    if (!conn) throw new Error("COSMOS_CONNECTION_STRING missing");
    if (!_client) _client = new CosmosClient(conn);
    return _client;
}

/**
 * Returns a memoized Cosmos container handle.
 * Creates the client once per process, container handles are cheap.
 */
export function getCosmosContainer(dbName, containerName) {
    if (!dbName || !containerName) throw new Error("dbName and containerName required");
    const key = `${dbName}:${containerName}`;
    if (_containers.has(key)) return _containers.get(key);

    const client = getClient();
    const db = client.database(dbName);
    const container = db.container(containerName);

    _containers.set(key, container);
    return container;
}

/** Optional: quick health check you can call from a ping function */
export async function cosmosPing(dbName) {
    const client = getClient();
    await client.database(dbName).read();
    return true;
}
