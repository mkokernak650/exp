# Budget Review Deployment

## GitHub

This folder is the deployable Budget Review app:

```bash
cd outputs/budget-web-app
git init
git add .
git commit -m "Deploy Budget Review app"
git remote add origin git@github.com:OWNER/REPO.git
git push -u origin main
```

Replace `OWNER/REPO` with the GitHub repository that should host Budget Review.

## Cloudflare Access

To make sure only `mkokernak@consumerexp.com` can access the app, use Cloudflare Zero Trust Access:

1. Create a Cloudflare Access application for the Budget Review hostname.
2. Add one allow policy:
   - Selector: `Emails`
   - Value: `mkokernak@consumerexp.com`
3. Do not add broad allow rules such as everyone at a domain.
4. If Render is the origin, point the Cloudflare hostname to Render and keep Cloudflare Access in front of it.

## Render

Render should deploy this app as a Node web service, not a plain static site, when access enforcement is required.

Required environment variables:

- `REQUIRE_CLOUDFLARE_ACCESS=1`
- `ALLOWED_EMAIL=mkokernak@consumerexp.com`
- `CLOUDFLARE_ACCESS_TEAM_DOMAIN=<your Cloudflare Zero Trust team domain>`
- `CLOUDFLARE_ACCESS_AUD=<Cloudflare Access application audience tag>`

With those settings, direct requests that do not include a valid Cloudflare Access identity for `mkokernak@consumerexp.com` receive `403 Access denied`. The Node server verifies the Cloudflare Access JWT signature, audience, issuer, expiration, and email before serving files.

Keep the Render URL private when possible and use the Cloudflare-protected hostname as the public address.

## Cloudflare Pages

Cloudflare Pages can host the static files directly, but the access restriction must be configured in Cloudflare Zero Trust Access for the Pages hostname. Static files alone cannot securely restrict access by email.
