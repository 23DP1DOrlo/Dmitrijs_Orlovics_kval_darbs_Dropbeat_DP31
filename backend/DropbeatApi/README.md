## DropBeat Backend (Laravel + SQLite)

Backend ir konfigurēts darbam ar lokālu `SQLite` datubāzi, lai projektu varētu palaist uz jebkura datora bez MySQL/PostgreSQL uzstādīšanas.

### Ātra palaišana

1. Atver backend mapi:

```bash
cd backend/DropbeatApi
```

2. Vienreizēja setup komanda:

```bash
composer run setup
```

Šī komanda automātiski:
- uzstāda `composer` atkarības;
- izveido `.env` no `.env.example`;
- ģenerē aplikācijas atslēgu;
- izveido failu `database/database.sqlite` (ja tā nav);
- palaiž migrācijas.

3. Ielādē sākuma datus (nenodzēšot esošos):

```bash
php artisan migrate --seed
```

4. Startē API serveri:

```bash
php artisan serve
```

API adrese: `http://127.0.0.1:8000`

### Deploy/Production datubāze (MySQL vai PostgreSQL)

Lokāli var palikt `SQLite`, bet deploy vidē ieteicams izmantot `MySQL` vai `PostgreSQL`.

1. Uz servera izveido `.env` ar production vērtībām:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.tavs-domens.lv
FRONTEND_URL=https://tavs-domens.lv

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dropbeat
DB_USERNAME=dropbeat_user
DB_PASSWORD=strong_password
```

2. Palaid deploy komandas:

```bash
php artisan optimize:clear
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
```

3. Nekad nelieto `migrate:fresh` production vidē.

### Datu saglabāšana

- Komanda `php artisan migrate` saglabā esošos datus.
- Komanda `php artisan migrate:fresh --seed` izdzēš visas tabulas un izveido demo datus no jauna.

### Demo lietotāji

- `admin@dropbeat.lv` / `Admin123!`
- `artist@dropbeat.lv` / `Artist123!`
- `listener@dropbeat.lv` / `Listener123!`
