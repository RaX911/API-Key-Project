import { z } from 'zod';
import { 
  insertApiKeySchema, 
  insertBtsTowerSchema, 
  insertMsisdnSchema, 
  apiKeys, 
  btsTowers, 
  msisdnData,
  islands,
  provinces,
  regencies,
  districts,
  villages
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  // === API KEY MANAGEMENT ===
  keys: {
    list: {
      method: 'GET' as const,
      path: '/api/keys' as const,
      responses: {
        200: z.array(z.custom<typeof apiKeys.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/keys' as const,
      input: insertApiKeySchema,
      responses: {
        201: z.custom<typeof apiKeys.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    revoke: {
      method: 'PATCH' as const,
      path: '/api/keys/:id/revoke' as const,
      responses: {
        200: z.custom<typeof apiKeys.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },

  // === BTS MANAGEMENT ===
  bts: {
    list: {
      method: 'GET' as const,
      path: '/api/bts' as const,
      input: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        operator: z.string().optional(),
      }).optional(),
      responses: {
        200: z.object({
          items: z.array(z.custom<typeof btsTowers.$inferSelect>()),
          total: z.number(),
          page: z.number(),
          totalPages: z.number(),
        }),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/bts/:id' as const,
      responses: {
        200: z.custom<typeof btsTowers.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bts' as const,
      input: insertBtsTowerSchema,
      responses: {
        201: z.custom<typeof btsTowers.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/bts/:id' as const,
      input: insertBtsTowerSchema.partial(),
      responses: {
        200: z.custom<typeof btsTowers.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/bts/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },

  // === MSISDN LOOKUP & MANAGEMENT ===
  msisdn: {
    lookup: {
      method: 'GET' as const,
      path: '/api/msisdn/lookup' as const,
      input: z.object({
        msisdn: z.string(),
      }),
      responses: {
        200: z.custom<any>(), // Uses complex MsisdnLookupResponse type
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/msisdn' as const,
      input: z.object({
        page: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.object({
          items: z.array(z.custom<typeof msisdnData.$inferSelect>()),
          total: z.number(),
        }),
      },
    },
  },

  // === REGIONAL DATA (Simplified for Overview) ===
  stats: {
    dashboard: {
      method: 'GET' as const,
      path: '/api/stats/dashboard' as const,
      responses: {
        200: z.object({
          totalBts: z.number(),
          totalMsisdn: z.number(),
          activeKeys: z.number(),
          regionsCovered: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
