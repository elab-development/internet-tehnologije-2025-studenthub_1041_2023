# StudentHub — opis aplikacije i tehnologije

StudentHub je full-stack web aplikacija namenjena digitalizaciji procesa studentske službe, sa fokusom na upravljanje ispitima, prijavama i evidencijom ocena. Tradicionalni način rada, zasnovan na papirnim obrascima, fizičkom odlasku u studentsku službu i ručnom vođenju evidencije, često dovodi do grešaka, kašnjenja i nedostatka transparentnosti. StudentHub rešava ovaj problem tako što omogućava da se ključne akademske aktivnosti obavljaju online, brzo i pouzdano, uz jasno definisane uloge i odgovornosti. Cilj je da se smanji administrativno opterećenje i da studenti u svakom trenutku imaju uvid u svoje obaveze i rezultate.

![StudentHub Logo Slika](./sluzba-frontend/public/logo.png)

Glavni cilj aplikacije jeste da objedini procese prijave ispita, upravljanja predmetima i unosa ocena u jedinstven, intuitivan sistem. StudentHub omogućava studentima da pregledaju predmete koje mogu da slušaju na osnovu godine studija, evidentiraju koje su predmete upisali, prijavljuju i uređuju prijave ispita, kao i da prate istoriju izlazaka i osvojenih ocena. Službeni radnici dobijaju centralizovan alat za upravljanje studentima, predmetima i ispitnim prijavama, čime se smanjuje rizik od duplih evidencija, grešaka u unosu i gubitka podataka.

## Ciljna grupa i uloge korisnika

Ciljna grupa korisnika obuhvata tri tipa korisnika:

- **Posetilac (guest)**: korisnik koji još uvek nije registrovan ili ulogovan.
- **Student (student)**: korisnik koji upravlja sopstvenim predmetima, prijavama ispita, ocenama i izveštajima.
- **Službeni radnik (sluzbenik)**: zaposleni u studentskoj službi koji vodi evidenciju predmeta, studenata i ocena.

## Ključne funkcionalnosti

### Posetilac
- Registracija novog studenta (unos: ime, prezime, broj indeksa, email, lozinka, smer, godina studija).
- Prijava u sistem (student ili službeni radnik) preko email-a i lozinke.

### Student
- Prikaz liste predmeta koje student može da sluša na osnovu godine studija.
- Prikaz liste predmeta koje je student već upisao (pivot tabela `predmet_user`).
- Detaljan prikaz pojedinačnog predmeta (naziv, profesor, ESPB, godina, semestar, obavezni/izborni status).
- Prijava ispita za predmete koje student sluša, uz pravila:
  - provera da student sluša predmet,
  - sprečavanje duple prijave za isti predmet i rok (ako je to pravilo aktivno),
  - automatsko računanje rednog broja prijave za kombinaciju student–predmet.
- Izmena prijave ispita (npr. promena roka) samo ako prijava pripada studentu i još nema unetu ocenu.
- Poništavanje prijave ispita samo ako prijava pripada studentu i nema unetu ocenu (trajni delete u bazi).
- Pregled istorije prijava i ocena (predmet, rok, status, ocena).
- Pregled studentskih metrika (npr. broj položenih, prosečna ocena, broj prijava).
- Eksport prijava i ocena u PDF izveštaj (podaci o studentu + tabela sa rezultatima).

### Službeni radnik
- Pregled liste svih studenata (ime, prezime, broj indeksa, smer, godina).
- Kreiranje predmeta (naziv, ESPB, godina, semestar, obavezni/izborni, profesor), uz validacije.
- Ažuriranje predmeta (naziv, ESPB, godina, semestar, status, profesor), uz provere ispravnosti.
- Pregled svih prijava ispita u sistemu (sa pripadajućim studentima i predmetima).
- Unos ocene za prijavu ispita (provera postojanja prijave i opsega ocene).
- Izmena već unete ocene pod istim uslovima validacije.

## Opšta pravila sistema
- Sistem razlikuje dozvoljene funkcionalnosti na osnovu uloge (student ili službeni radnik) i zabranjuje neovlašćen pristup.
- Sistem prikazuje jasne poruke o greškama kod nevalidnih podataka, nepostojećih resursa i nedovoljnih prava.
- Podaci o korisnicima, predmetima, prijavama i ocenama se čuvaju i ažuriraju dosledno tako da svi prikazi uvek odražavaju trenutno stanje.

---

# Predlog tehnologija koje će biti korišćene

## Frontend — React

**React** je moderna JavaScript biblioteka za izgradnju korisničkih interfejsa zasnovana na komponentnom pristupu. U StudentHub aplikaciji React predstavlja prezentacioni sloj (SPA) kroz koji korisnici izvršavaju sve aktivnosti: registraciju i prijavu, pregled predmeta, upravljanje prijavama ispita, prikaz rezultata i generisanje PDF izveštaja. Korišćenjem hook-ova (`useState`, `useEffect`, i dr.) ostvaruje se jednostavno upravljanje stanjem i asinhronim pozivima, dok klijentsko rutiranje (npr. React Router) omogućava fluidno kretanje kroz aplikaciju bez punog osvežavanja stranice.

Ključni UI elementi uključuju:
- tabele i liste za predmete i prijave,
- kontrolisane forme za registraciju, prijavu, prijavu ispita i unos ocene,
- role-based navigaciju (student/službenik),
- prikaz metrika i eksport u PDF.

## Backend — Laravel (REST API)

**Laravel** obezbeđuje serverski sloj sistema i sadrži:
- poslovnu logiku (pravila za prijavu/izmenu/poništavanje ispita, rad sa ocenama),
- validaciju podataka,
- autorizaciju na osnovu uloge,
- komunikaciju sa bazom preko **Eloquent ORM**-a,
- izlaganje REST API ruta za React frontend.

Autentifikacija je zasnovana na tokenu, gde se pri uspešnoj prijavi korisniku vraća token, a pristup zaštićenim rutama se kontroliše preko tokena.

## Baza podataka — MySQL

**MySQL** je relaciona baza podataka koja čuva podatke o:
- korisnicima (studenti i službenici),
- predmetima,
- prijavama ispita,
- relaciji student–predmet (pivot tabela `predmet_user`),
- ocenama i statusima prijava.

Laravel migracije definišu strukturu tabela, tipove, indekse i relacije, dok se test podaci mogu generisati kroz seedere.

## Integracije (javni web servisi)

StudentHub se može proširiti integracijama koje studentima daju dodatnu vrednost:
- **API za praznike** (npr. prikaz državnih praznika radi planiranja rokova i obaveza),
- **YouTube API** (prikaz edukativnih video materijala relevantnih za učenje i polaganje ispita).

## DevOps i alati

- **Git** za kontrolu verzija i praćenje istorije promena.
- **GitHub** za udaljeni repozitorijum, pull request-ove, code review i organizaciju zadataka (Issues/Projects).
- Dokumentovanje API-ja kroz **OpenAPI** specifikaciju i prikaz u **Swagger UI**.

---

# Tehnologije korišćene (sažetak)

- **Frontend**
  - React
  - JavaScript
  - React Router (rutiranje)
  - axios / fetch (HTTP pozivi ka API-ju)

- **Backend**
  - PHP 8+
  - Laravel (REST API, validacija, kontroleri, Eloquent ORM)
  - Token-based autentifikacija (npr. Sanctum ili sličan mehanizam)

- **Baza**
  - MySQL (lokalno razvojno okruženje preko XAMPP-a po potrebi)

- **Integracije**
  - API za praznike (kalendar neradnih dana)
  - YouTube API (edukativni sadržaj)

- **DevOps / alati**
  - Git + GitHub
  - Swagger UI + OpenAPI (API dokumentacija)
  - Docker i Docker Compose

## Pokretanje projekta (lokalno bez Docker-a)

> Pretpostavke: instalirani **Node 18+**, **PHP 8.2+**, **Composer**, **XAMPP**.
> NAPOMENA: U XAMPP-u pokrenuti: **Apache** i **MySQL**

1. Klonirajte repozitorijum:
```bash
    git clone https://github.com/elab-development/internet-tehnologije-2025-studenthub_1041_2023.git
```
2. Pokrenite backend:
```bash
   cd sluzba-backend
   composer install
   php artisan migrate:fresh --seed
   php artisan serve
```
    
3. Pokrenite frontend:
```bash
   cd sluzba-frontend
   npm install
   npm start
```
    
4.  Frontend pokrenut na: [http://localhost:3000](http://localhost:3000) Backend API pokrenut na: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)

## Pokretanje projekta uz Docker

> Pretpostavke: instaliran i pokrenut **Docker Desktop**.
> NAPOMENA: U XAMPP-u pokrenuti: **Apache** (**MySQL** sada pokrece Docker, tako da njega ne pokretati!)

1. Klonirajte repozitorijum:
```bash
    git clone https://github.com/elab-development/internet-tehnologije-2025-studenthub_1041_2023.git
```

2. Pokrenite Docker kompoziciju:
```bash
    docker compose down -v
    docker compose up --build
```

3.  Frontend pokrenut na: [http://localhost:3000](http://localhost:3000) Backend API pokrenut na: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)