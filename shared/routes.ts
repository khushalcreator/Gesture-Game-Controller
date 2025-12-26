import { z } from 'zod';
import { insertGameProfileSchema, insertCustomGestureSchema, gameProfiles, customGestures } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  profiles: {
    list: {
      method: 'GET' as const,
      path: '/api/profiles',
      responses: {
        200: z.array(z.custom<typeof gameProfiles.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/profiles',
      input: insertGameProfileSchema.omit({ userId: true }), // User ID inferred from session
      responses: {
        201: z.custom<typeof gameProfiles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/profiles/:id',
      responses: {
        200: z.custom<typeof gameProfiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/profiles/:id',
      input: insertGameProfileSchema.omit({ userId: true }).partial(),
      responses: {
        200: z.custom<typeof gameProfiles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/profiles/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  gestures: {
    list: {
      method: 'GET' as const,
      path: '/api/gestures',
      responses: {
        200: z.array(z.custom<typeof customGestures.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/gestures',
      input: insertCustomGestureSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof customGestures.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/gestures/:id',
      responses: {
        204: z.void(),
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
