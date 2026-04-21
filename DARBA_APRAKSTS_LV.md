## Mērķis un uzdevumi

Noslēguma darba mērķis ir izstrādāt tiešsaistes platformu `DropBeat` mūzikas relīžu publicēšanai un mākslinieku profilu pārvaldībai. Sistēma nodrošina datu ievadi, rediģēšanu, dzēšanu, meklēšanu un analītiku, izmantojot datu bāzi un tīmekļa saskarni.

Galvenie uzdevumi:
- izstrādāt datu bāzes struktūru ar savstarpēji saistītām tabulām;
- realizēt lietotāju autentifikāciju un lomu pārvaldību;
- izveidot relīžu kataloga pārvaldību (CRUD);
- realizēt vienkāršo un paplašināto filtrēšanu, kārtošanu un meklēšanu;
- izveidot statistikas sadaļu ar datu apvienošanu (JOIN) un agregāciju (GROUP BY).

## Prasību apraksts

Sistēma izstrādāta atbilstoši noslēguma darba prasībām:
- datu bāzē ir vismaz 4 tabulas (`users`, `artists`, `genres`, `releases`, `artist_profiles`, `release_stats`);
- datu pārvaldība notiek caur tīmekļa formām;
- validācija tiek veikta gan autentifikācijas laukiem, gan relīžu datiem;
- lietotājiem pieejamas lomas (`admin`, `artist`, `listener`);
- realizēta datu kārtošana, meklēšana un filtri;
- statistikas sadaļā izmantoti JOIN un agregācijas vaicājumi.

Nefunkcionālās prasības:
- tumšs, mūsdienīgs un lietotājam saprotams interfeiss;
- pielāgota navigācija starp sadaļām;
- API un frontend atdalīta arhitektūra.

## Datu bāzes apraksts

Sistēmas kodols ir relāciju datu bāze ar šādām galvenajām tabulām:

- `users` – lietotāju konti, autentifikācijas dati un loma;
- `artists` – mākslinieka pamatinformācija, saistīta ar lietotāja kontu;
- `artist_profiles` – papildus profila dati (bio, sociālie tīkli, pilsēta);
- `genres` – relīžu žanru klasifikators;
- `releases` – relīžu dati (nosaukums, tips, datums, statuss, žanrs, autors);
- `release_stats` – relīžu statistikas dati pa datumiem (stream, like, share).

Saiknes:
- `users (1) -> (1) artists`;
- `artists (1) -> (N) releases`;
- `genres (1) -> (N) releases`;
- `releases (1) -> (N) release_stats`;
- `artists (1) -> (1) artist_profiles`.

## Testēšanas daļa

Tika veikta funkcionālā un tehniskā testēšana:

- **Autentifikācija:** pārbaudīta reģistrācija, pieslēgšanās un atslēgšanās;
- **CRUD:** pārbaudīta relīžu pievienošana un attēlošana katalogā;
- **Filtri:** pārbaudīta meklēšana pēc atslēgvārda, filtrēšana pēc žanra un tipa;
- **Statistika:** pārbaudīts, ka žanru statistika tiek iegūta no vairākām tabulām ar JOIN;
- **Validācija:** pārbaudītas kļūdas pie nepareizi aizpildītiem laukiem;
- **Būvēšana:** frontend veiksmīgi būvējas ar `npm run build`, backend testi izpildās ar `php artisan test`.

## Secinājumi

Darba gaitā izdevās izstrādāt funkcionējošu sistēmas prototipu, kas atbilst galvenajām noslēguma darba prasībām. Risinājums demonstrē pilnu datu plūsmu: no lietotāja autentifikācijas līdz relīžu publicēšanai, filtrēšanai un statistiskai analīzei.

Turpmākās attīstības virzieni:
- failu augšupielāde relīžu vākiem un audio;
- detalizētāka administratora sadaļa;
- datu eksports PDF/XLSX formā;
- vairāku valodu atbalsts interfeisā.
