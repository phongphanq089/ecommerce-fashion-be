import '@fastify/jwt';

declare module 'fastify' {
  interface FastifyRequest {
    jwt: import('@fastify/jwt').JWT;
  }
  export interface FastifyInstance {
    authenticate: any;
  }
}
