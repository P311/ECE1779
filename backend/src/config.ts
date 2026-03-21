export const config = {
  port: parseInt(process.env.PORT || '3000'),
  databaseUrl: process.env.DATABASE_URL || 'postgres://dev:devpass@localhost:5432/eventdb',
  adminApiKey: process.env.ADMIN_API_KEY || 'admin-dev-key'
};
