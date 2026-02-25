import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as mariadb from "mariadb";

let aivenPoolShimInstalled = false;

function installAivenMariadbPoolShim() {
  if (aivenPoolShimInstalled) return;
  aivenPoolShimInstalled = true;

  const originalCreatePool = mariadb.createPool.bind(mariadb);

  (mariadb as typeof mariadb & { createPool: typeof mariadb.createPool }).createPool = (
    config: mariadb.PoolConfig,
  ) => {
    const shouldShim =
      typeof config === "object" &&
      config !== null &&
      !!config.host &&
      !!config.ssl;

    if (!shouldShim) {
      return originalCreatePool(config);
    }

    // Fallback pool shim for environments where mariadb's TLS pooling times out
    // against some managed MySQL providers (Aiven here). Single connections work.
    return {
      async query(query: unknown, values?: unknown) {
        const conn = await mariadb.createConnection(config);
        try {
          return await (conn as unknown as { query: (q: unknown, v?: unknown) => Promise<unknown> }).query(
            query,
            values,
          );
        } finally {
          await conn.end();
        }
      },
      async getConnection() {
        return mariadb.createConnection(config);
      },
      async end() {
        return;
      },
    } as unknown as mariadb.Pool;
  };
}

export function createPrismaMariaDbAdapter(databaseUrl: string) {
  const url = new URL(databaseUrl);
  const sslMode = url.searchParams.get("ssl-mode")?.toUpperCase();

  // The mariadb driver used by the Prisma adapter does not honor MySQL-style
  // `ssl-mode=REQUIRED` URL parameters consistently for pooled connections.
  // Build an explicit config and install a pool shim so Aiven TLS works.
  if (sslMode === "REQUIRED") {
    installAivenMariadbPoolShim();

    return new PrismaMariaDb({
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ""),
      connectTimeout: 10_000,
      ssl: { rejectUnauthorized: false },
    });
  }

  return new PrismaMariaDb(databaseUrl);
}
