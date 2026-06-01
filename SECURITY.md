# Security Policy

## Reporting a vulnerability

Please report security issues privately by opening a GitHub security advisory for this repository.

Do not disclose suspected vulnerabilities publicly until a maintainer has investigated and coordinated a fix.

## Supported versions

Security fixes target the default branch and the current production deployment.

## Expectations

- Do not commit secrets, tokens, private keys, or production credentials.
- Run `npm run audit:prod` and `npm run quality:pr` before release-oriented changes.
- Treat dependency, authentication, authorization, XSS, CSRF, and deployment-role findings as release blockers unless explicitly triaged.
