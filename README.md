# DropBeat

DropBeat ir mūzikas relīžu platforma ar:
- relīžu katalogu un detalizētām lapām,
- vērtēšanu un komentēšanu,
- lomu sistēmu (`admin`, `artist`, `listener`),
- admin moderācijas funkcijām,
- autentifikāciju un paroles atjaunošanu.

## Tehnoloģijas

- Frontend: `React 19`, `Vite 8`, `React Router`, `Axios`
- Backend: `Laravel 13`, `PHP 8.3+`, `Sanctum`, `Eloquent`
- Datubāze: `SQLite` (lokāli) vai `PostgreSQL/MySQL` (piem., Neon)

## Projekta struktūra

- `backend/DropbeatApi` — Laravel API
- `frontend/Dropbeat` — React klients

## Ātrā palaišana (lokāli)

### 1) Backend

```bash
cd backend/DropbeatApi
composer run setup
php artisan migrate --seed
php artisan serve --host=127.0.0.1 --port=8000
```

API: `http://127.0.0.1:8000`

### 2) Frontend

Atver jaunu termināli:

```bash
cd frontend/Dropbeat
cp .env.example .env
npm install
npm run dev
```

Frontend: `http://127.0.0.1:5173`

## Frontend `.env`

`frontend/Dropbeat/.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

## Datubāzes konfigurācija

### Lokāli (SQLite)

Pēc noklusējuma var lietot SQLite no `.env.example`.

### Neon / PostgreSQL

`backend/DropbeatApi/.env` piemērs:

```env
DB_CONNECTION=pgsql
DB_HOST=ep-xxxxxx-pooler.eu-central-1.aws.neon.tech
DB_PORT=5432
DB_DATABASE=neondb
DB_USERNAME=neondb_owner
DB_PASSWORD=your_password
DB_SSLMODE=require
```

Pēc `.env` izmaiņām:

```bash
php artisan optimize:clear
php artisan migrate
```

## E-pasti / Forgot Password

### SMTP (reāla e-pasta nosūtīšana)

`backend/DropbeatApi/.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM_ADDRESS=your_email@gmail.com
MAIL_FROM_NAME="DropBeat"
MAIL_TIMEOUT=10
```

### Lokālais režīms (`APP_ENV=local`)

Lokālajā vidē paroles atjaunošanas saite var tikt ģenerēta servera logā:
- fails: `backend/DropbeatApi/storage/logs/laravel.log`
- meklē: `Password reset link generated`

## Demo konti

- `admin@dropbeat.lv` / `Admin123!`
- `artist@dropbeat.lv` / `Artist123!`
- `listener@dropbeat.lv` / `Listener123!`

## Noderīgas komandas

Backend:

```bash
php artisan route:list
php artisan migrate:status
php artisan optimize:clear
```

Frontend:

```bash
npm run dev
npm run build
npm run lint
```

## Biežākās problēmas

### `Could not open input file: artisan`
Tu esi nepareizajā mapē. Palaid komandas no:
`backend/DropbeatApi`

### `Neapstrādāta servera kļūda.` ar `SQLSTATE[08006]`
Laravel nevar pieslēgties DB (host/port/SSL/firewall). Pārbaudi `DB_*` un `DB_SSLMODE`.

### Frontend neredz backend
Pārliecinies, ka:
- backend darbojas uz pareizā porta,
- `VITE_API_URL` norāda uz šo portu.

### `migrate:fresh`
Neizmanto to, ja gribi saglabāt datus. Tas izdzēš visas tabulas.
