# FCY Calculator Worker

A Cloudflare Worker that serves a foreign currency (FCY) transaction calculator as a Single Page Application (SPA). This worker handles static asset delivery and supports client-side routing by falling back to `index.html` on unknown paths.

## Features

- Serves static assets from the `public/` directory using Cloudflare’s asset binding system.
- Supports SPA behavior by routing unknown paths back to `index.html`.
- Built with a lightweight deployment footprint using Cloudflare Workers.
- Includes test coverage via [Vitest](https://vitest.dev) and [cloudflare:test](https://developers.cloudflare.com/workers/testing/vitest-integration/).
- GitHub Actions CI/CD pipeline to deploy on every push to the `main` branch.

## Project Structure

```
fcy-calculator-worker/
├── public/                # Static assets (index.html, CSS, JS)
├── src/index.js          # Worker logic
├── test/index.spec.js    # Unit and integration tests
├── wrangler.jsonc        # Worker configuration
├── vitest.config.js      # Vitest test runner config
└── .github/workflows/    # GitHub Actions deployment setup
```

## Worker Behavior

- `GET /` → Serves `index.html`
- `GET /static.css` → Serves the file from `public/static.css` if available
- `GET /any/unknown/path` → Falls back to serving `index.html` (SPA support)
- On `404` from ASSETS, it defaults to `index.html` to ensure uninterrupted client-side routing

## Local Development

Install dependencies:

```bash
npm install
```

Start local development server:

```bash
npx wrangler dev
```

## Running Tests

```bash
npx vitest run
```

Ensure you're using the official Cloudflare Workers testing tools (`@cloudflare/vitest-pool-workers` and `cloudflare:test`) for accurate testing in a simulated runtime.

## Deployment

This project uses GitHub Actions for automated deployment. On every push to the `main` branch, the worker is deployed using Wrangler and your configured `CLOUDFLARE_API_TOKEN`.

To deploy manually:

```bash
npx wrangler deploy
```

## Environment Configuration

Ensure that the following environment variable is configured as a GitHub Secret:

- `CLOUDFLARE_API_TOKEN` – Token with permission to deploy Workers (`Account.Workers Scripts:Edit`)

## License

This project is licensed under the MIT License.
