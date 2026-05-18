# Saako Backend

Minimal Node/Express backend to provide persistence for the Saako dashboard.

Endpoints:
- GET /api/state → returns stored JSON state
- POST /api/state → accepts JSON body and stores it (responds 204)

Run locally:

```powershell
cd backend
npm install
npm start
```

Deployment notes:
- Ensure `PORT` environment variable is set by your host.
- Allow CORS from your hosted frontend domain.
