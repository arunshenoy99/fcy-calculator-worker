import handler from '../src/index'; // adjust path as needed
import { describe, it, expect, vi } from 'vitest';

describe('Cloudflare Worker fetch handler', () => {
  it('should fallback to index.html when asset is not found (404)', async () => {
    const request = new Request('https://example.com/unknown-page');

    const env = {
      ASSETS: {
        fetch: vi
          .fn()
          .mockResolvedValueOnce(new Response('Not found', { status: 404 }))
          .mockResolvedValueOnce(
            new Response('<html><head><title>FCY Transaction Calculator</title></head></html>', { status: 200 })
          ),
      },
    };

    const ctx = {};

    const response = await handler.fetch(request, env, ctx);
    const text = await response.text();

    expect(env.ASSETS.fetch).toHaveBeenCalledTimes(2);
    expect(env.ASSETS.fetch.mock.calls[0][0].url).toBe('https://worker-cdn.internal/unknown-page');
    expect(env.ASSETS.fetch.mock.calls[1][0].url).toBe('https://worker-cdn.internal/index.html');
    expect(response.status).toBe(200);
    expect(text).toContain('<title>FCY Transaction Calculator</title>');
  });

  it('should serve existing asset directly if found', async () => {
    const request = new Request('https://example.com/style.css');

    const env = {
      ASSETS: {
        fetch: vi
          .fn()
          .mockResolvedValueOnce(new Response('body { color: red; }', { status: 200 })),
      },
    };

    const ctx = {};

    const response = await handler.fetch(request, env, ctx);
    const text = await response.text();

    expect(env.ASSETS.fetch).toHaveBeenCalledTimes(1);
    expect(env.ASSETS.fetch.mock.calls[0][0].url).toBe('https://worker-cdn.internal/style.css');
    expect(response.status).toBe(200);
    expect(text).toBe('body { color: red; }');
  });

  it('should handle root path and serve index.html', async () => {
    const request = new Request('https://example.com/');

    const env = {
      ASSETS: {
        fetch: vi
          .fn()
          .mockResolvedValueOnce(new Response('<html><head><title>FCY Transaction Calculator</title></head></html>', { status: 200 })),
      },
    };

    const ctx = {};

    const response = await handler.fetch(request, env, ctx);
    const text = await response.text();

    expect(env.ASSETS.fetch).toHaveBeenCalledTimes(1);
    expect(env.ASSETS.fetch.mock.calls[0][0].url).toBe('https://worker-cdn.internal/index.html');
    expect(text).toContain('<title>FCY Transaction Calculator</title>');
  });

  it('should not fallback if original fetch succeeds (200)', async () => {
    const request = new Request('https://example.com/script.js');

    const env = {
      ASSETS: {
        fetch: vi
          .fn()
          .mockResolvedValueOnce(new Response('console.log("hi")', { status: 200 })),
      },
    };

    const ctx = {};

    const response = await handler.fetch(request, env, ctx);
    const text = await response.text();

    expect(env.ASSETS.fetch).toHaveBeenCalledTimes(1);
    expect(env.ASSETS.fetch.mock.calls[0][0].url).toBe('https://worker-cdn.internal/script.js');
    expect(text).toBe('console.log("hi")');
  });

  it('should not fallback if response is not 404 (e.g., 500)', async () => {
    const request = new Request('https://example.com/broken');

    const env = {
      ASSETS: {
        fetch: vi
          .fn()
          .mockResolvedValueOnce(new Response('Internal Server Error', { status: 500 })),
      },
    };

    const ctx = {};

    const response = await handler.fetch(request, env, ctx);
    const text = await response.text();

    expect(env.ASSETS.fetch).toHaveBeenCalledTimes(1);
    expect(env.ASSETS.fetch.mock.calls[0][0].url).toBe('https://worker-cdn.internal/broken');
    expect(response.status).toBe(500);
    expect(text).toBe('Internal Server Error');
  });
});
