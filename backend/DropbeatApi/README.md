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

### Datu saglabāšana

- Komanda `php artisan migrate` saglabā esošos datus.
- Komanda `php artisan migrate:fresh --seed` izdzēš visas tabulas un izveido demo datus no jauna.

### Demo lietotāji

- `admin@dropbeat.lv` / `Admin123!`
- `artist@dropbeat.lv` / `Artist123!`
- `listener@dropbeat.lv` / `Listener123!`
