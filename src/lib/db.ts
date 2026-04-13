export const db = {
  insertInto: (table: string) => ({
    values: (values: any) => ({
      returning: (fields: string) => ({
        execute: async () => {
          return values.map((v: any) => ({ id: 'mock-id-' + Math.random() }))
        },
      }),
    }),
  }),
  deleteFrom: (table: string) => ({
    where: (field: string, op: string, value: any) => ({
      execute: async () => {},
    }),
  }),
}
