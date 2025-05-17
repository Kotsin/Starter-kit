export function interpolateSql(sql: string, params: any[]): string {
  return sql.replace(/\$(\d+)/g, (_, index) => {
    const param = params[Number(index) - 1];

    if (param === null) {
      return 'NULL';
    }

    if (typeof param === 'string') {
      return `'${param.replace(/'/g, "''")}'`;
    }

    if (param instanceof Date) {
      return `'${param.toISOString()}'`;
    }

    if (typeof param === 'object') {
      return `'${JSON.stringify(param).replace(/'/g, "''")}'`;
    }

    return String(param);
  });
}
