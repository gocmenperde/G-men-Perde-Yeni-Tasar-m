import { PrismaClient } from "@prisma/client";

    const db = new PrismaClient();

    try {
    const tables = await db.$queryRawUnsafe(      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
    );
    const result = [];
    for (const { table_name: tableName } of tables) {
      const quotedName = `"${String(tableName).replaceAll('"', '""')}"`;
      const countRows = await db.$queryRawUnsafe(`SELECT count(*)::int AS count FROM public.${quotedName}`);
      const columns = await db.$queryRawUnsafe(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
        tableName,
      );
      result.push({ table: tableName, rows: countRows[0]?.count ?? 0, columns: columns.map(({ column_name, data_type }) => `${column_name}:${data_type}`) });
    }
    console.log(JSON.stringify(result, null, 2));
    } finally {
    await db.$disconnect();
    }
    