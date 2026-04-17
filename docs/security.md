# Security

- Use a fresh wallet for deployment.
- Fund it only with the amount needed for deployment and demo transactions.
- Do not commit `.env`, private keys, API keys, seed phrases, or service tokens.
- Store production secrets in Render and Vercel.
- Expose only `NEXT_PUBLIC_*` variables to the frontend.
- Rotate any key exposed in logs, demos, screenshots, or git history.

