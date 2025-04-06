export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname === "/" ? "index.html" : url.pathname.slice(1);

    const assetRequest = new Request(`https://worker-cdn.internal/${pathname}`, {
      method: request.method,
      headers: request.headers,
      redirect: 'manual'
    });

    let response = await env.ASSETS.fetch(assetRequest);

    if (response.status === 404) {
      const fallbackRequest = new Request("https://worker-cdn.internal/index.html", {
        method: request.method,
        headers: request.headers,
        redirect: 'manual'
      });
      response = await env.ASSETS.fetch(fallbackRequest);
    }

	console.log("PATH:", pathname);

    return response;
  }
};
