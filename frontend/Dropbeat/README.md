# DropBeat Frontend (React + Vite)

### Ātra palaišana

1. Atver frontend mapi:

```bash
cd frontend/Dropbeat
```

2. Izveido `.env` no parauga:

```bash
cp .env.example .env
```

3. Uzstādi atkarības un palaid:

```bash
npm install
npm run dev
```

Frontend adrese: `http://localhost:5173`

### API adrese

Frontend lasa API adresi no `VITE_API_URL`. Pēc noklusējuma:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```
