# Security policy

This portfolio includes a public website and a separately authenticated administrative interface.

## Reporting a vulnerability

Please **do not** open a public issue containing credentials, personal data, exploit details, or a live security vulnerability. Contact the repository owner privately through an established project contact channel.

## Credentials and data

Never commit passwords, API service-role keys, tokens, private customer data, or database exports. Supabase authorization must be enforced server-side through database policies and authentication; hiding a button in the browser is not an access-control boundary.

## Supported deployment

Security fixes should be applied to the production `main` branch and validated against the deployed website.
