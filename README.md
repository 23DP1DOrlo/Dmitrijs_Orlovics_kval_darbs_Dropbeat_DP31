# DropBeat - lokalais starts

Projekts ir sadalīts 2 daļās:
- `backend/DropbeatApi` (`Laravel 13`, `PHP 8+`, `Sanctum`, `Eloquent`, `SQLite`)
- `frontend/Dropbeat` (`React`, `Vite`, `React Router`)

Mērķis: lai pēc `git clone` projektu varētu palaist lokāli bez ārējas datubāzes servera.

## 1) Backend (SQLite uz lokālā datora)

```bash
cd backend/DropbeatApi
composer run setup
php artisan migrate --seed
php artisan serve
```

Backend/API: `http://127.0.0.1:8000`

## 2) Frontend

Atver jaunu termināli:

```bash
cd frontend/Dropbeat
cp .env.example .env
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## Svarigi par datu saglabasanu

- Lai dati **nepazustu**, ikdiena izmanto `php artisan migrate` (nevis `migrate:fresh`).
- Komanda `migrate:fresh --seed` **izdzes visu** datubazi un izveido demo datus no jauna.

## Demo konti

- `admin@dropbeat.lv` / `Admin123!`
- `artist@dropbeat.lv` / `Artist123!`
- `listener@dropbeat.lv` / `Listener123!`
