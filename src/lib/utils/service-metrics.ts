import { logger } from '@/lib/monitoring';

export function wrapService<T extends object>(service: T, serviceName: string): T {
  return new Proxy(service, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver) as any;
      if (typeof original !== 'function') return original;
      const methodName = String(prop);
      const wrapped = async (...args: any[]) => {
        const start = Date.now();
        try {
          const result = await original.apply(target, args);
          const durationMs = Date.now() - start;
          logger.info('service_call', { service: serviceName, method: methodName, durationMs });
          return result;
        } catch (err: any) {
          const durationMs = Date.now() - start;
          logger.error('service_call_error', err, {
            service: serviceName,
            method: methodName,
            durationMs,
          });
          throw err;
        }
      };
      return wrapped;
    },
  });
}
