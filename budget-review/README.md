# Budget Review

Budget Review is a private monthly payable and account review application for Michael Kokernak.

## Run Locally

```bash
npm start
```

The app is static HTML, CSS, and JavaScript served by `server.js`.

## Private Access

For production, run the app behind Cloudflare Zero Trust Access and allow only:

```text
mkokernak@consumerexp.com
```

When `REQUIRE_CLOUDFLARE_ACCESS=1`, `server.js` verifies the Cloudflare Access JWT signature, audience, issuer, expiration, and user email before serving the app.
