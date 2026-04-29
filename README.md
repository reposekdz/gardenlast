# Garden TVET School — Sisitemu Y'imicungire y'Ishuri

> **Garden TVET** ni sisitemu yuzuye ihuza ubuyobozi bw'ishuri ry'ubumenyingiro
> (TVET) n'amasomo y'amategeko y'umuhanda, ihuriza hamwe abayobozi,
> abarimu, abanyeshuri, ababyeyi, n'umuryango ku rubuga rumwe.
>
> Yubatswe muri **React + Vite** ku ruhande rw'imbere, **Express + MySQL** ku
> ruhande rw'inyuma, kandi ikoresha **JWT** kuri authenticationi.
> Sisitemu ikora muri **Kinyarwanda** by'umwihariko, hamwe n'ururimi rw'icyongereza
> n'igifaransa nk'amahitamo.

---

## 📑 Ibirimo (Table of contents)

1. [Igitekerezo nyamukuru](#1-igitekerezo-nyamukuru)
2. [Tekinoloji yakoreshejwe](#2-tekinoloji-yakoreshejwe)
3. [Imiterere y'umushinga](#3-imiterere-yumushinga)
4. [Inzira yo gutangira](#4-inzira-yo-gutangira)
5. [Inzego z'abakoresha (User roles)](#5-inzego-zabakoresha)
6. [Modules zose n'akamaro kazo](#6-modules-zose-nakamaro-kazo)
   - [6.1 Urubuga rusange](#61-urubuga-rusange-public-site)
   - [6.2 Konti y'umuyobozi (Admin)](#62-konti-yumuyobozi-admin)
   - [6.3 Konti y'umuyobozi w'imyitwarire (DOD)](#63-konti-yumuyobozi-wimyitwarire-dod)
   - [6.4 Konti y'umubikabaranga (Accountant)](#64-konti-yumubikabaranga-accountant)
   - [6.5 Konti y'ushinzwe ububiko (Stock Manager)](#65-konti-yushinzwe-ububiko-stock-manager)
   - [6.6 Konti y'umwarimu (Teacher)](#66-konti-yumwarimu-teacher)
   - [6.7 Konti y'umunyeshuri (Student)](#67-konti-yumunyeshuri-student)
   - [6.8 Konti y'umubyeyi (Parent)](#68-konti-yumubyeyi-parent)
   - [6.9 Ishuri ry'amategeko y'umuhanda](#69-ishuri-ryamategeko-yumuhanda)
   - [6.10 Kwiga — Inyandiko z'amasomo](#610-kwiga--inyandiko-zamasomo)
7. [Akamaro ka sisitemu kuri buri rwego rw'abayikoresha](#7-akamaro-ka-sisitemu-kuri-buri-rwego-rwabayikoresha)
   - [7.1 Ababyeyi](#71-ababyeyi--peace-of-mind-burimunsi)
   - [7.2 Abanyeshuri](#72-abanyeshuri--ubumenyi-mu-biganza-byabo)
   - [7.3 Abarimu](#73-abarimu--igihe-cyiza-cyo-kwigisha)
   - [7.4 Ubuyobozi (admin/director)](#74-ubuyobozi-admindirector--kugenzura-byose-ku-gicaniro-kimwe)
   - [7.5 Abiga amategeko y'umuhanda](#75-abiga-amategeko-yumuhanda)
   - [7.6 Leta n'inzego z'uburezi](#76-leta-ninzego-zuburezi)
   - [7.7 Ayandi mashuri yifuza kubikoresha](#77-ayandi-mashuri-yifuza-kubikoresha)
8. [Inyungu z'imari](#8-inyungu-zimari)
9. [Indimi (i18n) — Kinyarwanda, Icyongereza, Igifaransa](#9-indimi-i18n)
10. [Endpoints zose za API](#10-endpoints-zose-za-api)
11. [Database — imbonerahamwe nyamukuru](#11-database--imbonerahamwe-nyamukuru)
12. [Umutekano](#12-umutekano)
13. [Ibyumba bishyaho (Deployment)](#13-ibyumba-bishyaho-deployment)

---

## 1. Igitekerezo nyamukuru

Garden TVET ifite intego eshatu z'ingenzi:

1. **Korohereza ubuyobozi bw'ishuri** — kwandika abanyeshuri, kugenzura
   imyitwarire, kwakira amafaranga y'ishuri, kugenzura ububiko, no gukurikirana
   abakora ku ishuri.
2. **Guhuza umuryango wose w'ishuri** — abarimu boherereza inyandiko
   z'amasomo, abanyeshuri bakurikirana amanota n'amafaranga, ababyeyi bareba
   ibyabo, n'abakorera hanze (employers) bashobora kwakira abasoje.
3. **Kongera urubuga rwa rusange** — gutangaza amakuru, kwakira ababasaba
   kuza muri kaminuza, no gutanga amasomo y'amategeko y'umuhanda kuri online.

---

## 2. Tekinoloji yakoreshejwe

### Imbere (Frontend)
- **React 18** + **Vite** — UI ihuza ihereza vuba.
- **Tailwind CSS** + Lucide icons — imisusire ya none.
- **Zustand** — kubika ibya konti (auth store).
- **React Router 6** — ingendo z'amapaji.
- **Axios** — kuvugana na API.
- **i18next** — guhindura ururimi (Kinyarwanda / Icyongereza / Igifaransa).
- **react-toastify** — ubutumwa bugaragara.
- **PDF.js** — gusoma PDF no kuvana cover ya mbere.

### Inyuma (Backend)
- **Node.js + Express** — server ya API.
- **MySQL** (mysql2) — database nyamukuru.
- **JWT** (jsonwebtoken) — token yo kwemeza umukoresha.
- **bcryptjs** — guhisha amabanga (password hashing).
- **Multer** — kohereza file (PDF, amafoto).
- **node-cron** — imirimo y'iteka (kohereza ubutumwa, gusubiramo statistike).
- **Nodemailer** + **SMS service** — kohereza email/SMS.

### Ibikoresho byo gukora (DevOps)
- **MySQL local** ikoreshwa muri development (port 3306).
- Workflow: `bash start-dev.sh` (frontend port 5000, backend port 8080).

---

## 3. Imiterere y'umushinga

```
.
├── backend/
│   ├── controllers/        # Logic ya buri module (students, fees, …)
│   ├── routes/             # Express endpoints
│   ├── middleware/         # JWT, role checks
│   ├── utils/              # SMS, email, cron, helpers
│   ├── public/uploads/     # File n'amafoto byashyizweho
│   ├── garden_tvet.sql     # Schema ya database
│   └── server.js           # Aho server itangirira
├── frontend/
│   ├── src/
│   │   ├── pages/          # Amapaji yose (Dashboard, Students, …)
│   │   │   └── teacher/    # Amapaji y'umwarimu (Notes, Conduct, …)
│   │   ├── layouts/        # Layout, TeacherLayout, StudentLayout, PublicLayout
│   │   ├── components/     # Components zikoreshwa kenshi
│   │   ├── store/          # Zustand store (auth)
│   │   ├── utils/          # API client, PDF cover
│   │   └── i18n/           # Indimi (rw, en, fr)
│   └── vite.config.js
├── start-dev.sh            # Itangiza MySQL + backend + frontend
└── README.md               # Iri dosiye
```

---

## 4. Inzira yo gutangira

### Ibisabwa
- **Node.js 20+**, **npm 10+**
- **MySQL 8+** (cyangwa MariaDB 10+)

### Gushyira ahantu
```bash
# 1. Shyiraho dependencies
cd backend  && npm install
cd ../frontend && npm install

# 2. Shyiraho database
mysql -u root -p
CREATE DATABASE garden_tvet;
exit
mysql -u root -p garden_tvet < backend/garden_tvet.sql

# 3. Shyiraho .env
cp backend/.env.example backend/.env
# nyuma andika DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, ...

# 4. Tangira sisitemu
bash start-dev.sh
```

Sisitemu yumvikana ku **http://localhost:5000** (frontend) na
**http://localhost:8080** (backend API).

### Konti zo kugerageza
- **Admin**: `admin` / `admin123`
- **Umunyeshuri**: kode (urugero `2026/SOF/001`) + nyuma 4 z'imibare ya telefoni
  yanditse igihe yandikwaga.

---

## 5. Inzego z'abakoresha (User roles)

| Urwego | Akamaro |
|---|---|
| **admin** | Umuyobozi mukuru — afite ububasha bwose. |
| **dod** | Director of Discipline — agenzura imyitwarire. |
| **accountant** | Umubikabaranga — yakira amafaranga, atanga inyemezabwishyu. |
| **stock_manager** | Ushinzwe ububiko — agenzura ibikoresho. |
| **teacher** | Mwarimu — yoherereza inyandiko, asubiza ibibazo, yandika imyitwarire. |
| **student** | Umunyeshuri — areba amanota, amafaranga, n'imyitwarire bye. |
| **parent** | Umubyeyi — areba ibyabana be. |
| **director** | Umuyobozi w'ishuri (umwihariko). |
| **registrar** | Ushinzwe kwandikisha. |

---

## 6. Modules zose n'akamaro kazo

### 6.1 Urubuga rusange (Public site)

URL ya nyamukuru: **`/home`**

| Page | Akamaro |
|---|---|
| `/home` | Itangiriro — amakuru y'ishuri, amasomo atangwa, n'inkuru za vuba. |
| `/about` | Amateka, intego, imitwe y'abayobozi. |
| `/services` | Serivisi z'ishuri (TVET + driving school). |
| `/news` | Inkuru zose zatangajwe — buri nkuru irwa hari `/news/:id`. |
| `/contact` | Imyirondoro y'ishuri (telefoni, email, ahantu). |
| `/apply` | Gusaba kuza muri kaminuza — uzuza form, ushyiraho impamyabumenyi. |
| `/parent-apply` | Umubyeyi yiyandikisha (kugira ngo abone konti). |
| `/register` | Kwiyandikisha k'umubyeyi (parent registration). |
| `/trade/:tradeName` | Umwuga umwe — amakuru, inzego, n'amasaha. |
| `/driving-rules` | Amategeko y'umuhanda — abasoma bakora ibizamini. |
| `/driving-school` | Iyandikisha ku ishuri ry'amategeko y'umuhanda. |
| `/driving-instructor` | Konti y'umwigisha w'amategeko y'umuhanda. |
| `/kwiga` | Inyandiko z'amasomo zose (ku myuga yose). |
| `/kwiga/:tradeCode` | Inyandiko z'umwuga umwe. |
| `/kwiga/:tradeCode/:level` | Inyandiko z'urwego rumwe — soma online, hire likes, … |

**Akamaro:** Urubuga rusange ni urwomatse umuryango — ufasha gukwirakwiza
amakuru, kwakira ababisaba, no gusangira amasomo n'abagana ishuri.

---

### 6.2 Konti y'umuyobozi (Admin)

URL: **`/dashboard`**

Layout: `Layout.jsx` (sidebar y'ibara rya primary).

**Sidebar irimo:**
- **Dashboard** — incamake (umubare w'abanyeshuri, abasaba, amafaranga, …).
- **Notifications** — ubutumwa bwose (`/notifications`).
- **Applications** — abasabye kuza muri kaminuza, kwemera/guhakana.
- **Academic Year** — kugena umwaka w'amasomo ukoreshwa (current academic year).
- **Graduates** — abasoje, kohereza CV ku employers.
- **Employers** — abakoresha bashobora gusaba abasoje.
- **Students** — kwandika, guhindura, gusiba, kohereza ku rwego rwo hejuru.
- **Link Manager** — guhuza ababyeyi n'abana babo.
- **Discipline** — ibyandikitse ku myitwarire mibi/myiza.
- **Finance** — amafaranga y'ishuri, ku trimester, kuri buri trade/level.
- **Stock** — ibikoresho biri mu bubiko.
- **Parents** — urutonde rw'ababyeyi n'ibyabana babo.
- **Staff** — abakora ku ishuri (admin/dod/accountant/teacher/…).
- **CMS** — guhindura urubuga rusange (banner, news, services, …).
- **Settings** — ibyifuzo bya konti.

**Akamaro:** Admin ni nshingwabikorwa byose — yiga amakuru kuva ku
banyeshuri kugeza ku mafaranga, akagena uburenganzira bwa buri rwego.

---

### 6.3 Konti y'umuyobozi w'imyitwarire (DOD)

URL: **`/discipline`**

DOD afite ububasha bumwe na admin ku byerekeye **imyitwarire**, **abanyeshuri**,
**applications** n'**ababyeyi** — ariko ntabwo agera ku mafaranga cyangwa kuri
stock.

**Ibyo akora:**
- Kwandika ibyabaye by'imyitwarire (warning, conduct removal, suspension,
  praise, leave, sick, …).
- Gukura amanota y'imyitwarire (conduct points) — buri munyeshuri atangirira
  ku 100, akagikurikiranwa.
- Kohereza SMS ku babyeyi (kabone notification).
- Kugenzura imisanzu y'amasaha y'akazi (leave requests).
- Gufata ibyemezo ku byifuzo by'ababyeyi (appeals).
- Gushyiraho **conduct sheets** — itara ry'imyitwarire ya buri mwarimu.
- Kuba `Director of Discipline` afite **broadcast SMS** kuri parents bose.

---

### 6.4 Konti y'umubikabaranga (Accountant)

URL: **`/finance`**

**Ibyo akora:**
- Kwemeza amafaranga y'ishuri (fees) ku trade na level (Term 1 2026, …).
- Kwakira amafaranga y'umunyeshuri — kohereza mu MTN MoMo, BK, cash, …
- Gutanga **inyemezabwishyu** (receipts) — auto-generated number.
- Kohereza SMS ku mubyeyi nyuma yo kwakira.
- Kureba abafite ideni — `/parents` na `/students` na filter.
- Driving school: kwakira amafaranga y'amasomo y'umuhanda.
- Kohereza ubutumwa rusange ku babyeyi (broadcast SMS).

---

### 6.5 Konti y'ushinzwe ububiko (Stock Manager)

URL: **`/stock`**

**Ibyo akora:**
- Kwandika ibikoresho byinjijwe (kalimo, makina, ibishyimbo, …).
- Kwandika ibyasohotse — nde wabyakiriye, ku munsi ki.
- Gukurikirana umubare w'ibisigaye (low-stock alerts).
- Gusohora raporo (export PDF / Excel).

---

### 6.6 Konti y'umwarimu (Teacher)

URL: **`/teacher`** (Layout: `TeacherLayout.jsx` — sidebar nk'iz'izindi nzego)

**Sidebar irimo:**
- **Akanya k'Ibanze** (`/teacher`) — incamake n'imibare ikomeye.
- **Inyandiko** (`/teacher/notes`) — gushyiraho PDF, kubika cover, gusiba.
- **Ibibazo by'Abanyeshuri** (`/teacher/questions`) — gusubiza ibibazo
  byatanzwe ku rubuga rwa **Kwiga**.
- **Abanyeshuri** (`/teacher/students`) — urutonde rw'abanyeshuri **(read-only,
  ntabwo ashobora kongeraho cyangwa guhindura)**, hari filter ya trade/level.
- **Imyitwarire** (`/teacher/conduct`) — kwandika imyitwarire mibi/myiza
  (warning, conduct_removal, praise, suspension, …); ibi byandikwa muri
  table ya `discipline_records`.
- **Reactions & Comments** (`/teacher/engagement`) — reba **likes**, **comments**,
  **bookmarks**, na **raised hands** (ibibazo) bya buri note.
- **Settings** — ibyifuzo bya konti.

**Akamaro:** Sidebar nshya iha umwarimu uburyo bworoshye bwo gukomeza
ibikorwa bye nkuko abandi bayobozi babigenza, hamwe n'incamake ihagije y'uko
abanyeshuri bitabira inyandiko ze.

---

### 6.7 Konti y'umunyeshuri (Student)

URL: **`/student-dashboard`** (Layout: `StudentLayout.jsx` — ibara
ry'icyatsi)

**Inzira yo kwinjira:**
1. Andika **kode** yawe (urugero: `2026/SOF/001`).
2. Andika **ijambobanga** — bwa mbere ni nyuma 4 z'imibare ya telefoni
   yanditse igihe wandikishijwe (urugero: niba telefoni ari `0788125735`,
   ijambobanga ni `5735`).
3. Genda kuri **Hindura ijambobanga** uhindure ryawe bwite.

**Sidebar irimo:**
- **Akanya k'Ibanze** — amakuru yawe (izina, kode, trade, level), conduct,
  GPA, attendance rate, ideni.
- **Amanota** — amanota yose (`student_grades`) + exam results.
- **Amafaranga** — fees za trimester, ibyatanzwe, ibisigaye, n'inyemezabwishyu.
- **Kwitabira** — kwitabira kwawe (iminsi 90 ishize) — present/absent/late/excused.
- **Imyitwarire** — inkuru z'imyitwarire zandikiweho, conduct points zigeze.
- **Ubutumwa** — notifications zerekeye konti yawe.
- **Hindura ijambobanga** — kohindura ijambobanga ryawe.

**Akamaro:** Buri munyeshuri ashobora kwireba — bituma ababyeyi n'abana
bagira amakuru ahari igihe cyose.

---

### 6.8 Konti y'umubyeyi (Parent)

URL: **`/parents`** (cyangwa `/parent-portal` igihe yiyandikisha)

**Ibyo akora:**
- Kureba abana be — buri wese amakuru y'amasomo, amafaranga, n'imyitwarire.
- Kwakira ubutumwa bwa SMS/email ku byabaye ku mwana we.
- Kohereza icyifuzo (appeal) iyo arwanya icyemezo cy'imyitwarire.
- Kwemera/guhakana ibyifuzo by'akazi by'umwana we (leave requests).

---

### 6.9 Ishuri ry'amategeko y'umuhanda

URL: **`/driving-rules`** na **`/driving-school`**

**Ibikoresho:**
- **Categories** zose z'amategeko y'umuhanda (A, B, C, D).
- Buri **rule** ifite icyitegererezo, igisubizo nyacyo, n'ibisobanuro.
- **Quizzes** — abakoresha bakora ibizamini bya online (multiple choice).
- **Iyandikisha** — abasaba bashyiraho amafoto, kwishyura amafaranga,
  no kwitegura ku bizamini.
- **Driving Instructor Dashboard** (`/driving-instructor`) — umwigisha
  agenzura abanyeshuri be n'amanota.

---

### 6.10 Kwiga — Inyandiko z'amasomo

URL: **`/kwiga`** (rusange — ntabwo bisaba kwinjira)

**Imyuga yashyizweho:**
- **AUTO** — Automobile Technology
- **BDC** — Building & Construction
- **SOD** — Software Development
- **DRV** — Driving rules

**Imikorere:**
- Buri PDF ifite **cover image** (auto-extracted ku rupapuro rwa 1).
- **Reactions** — like, helpful, love, question (raised hand).
- **Comments** — gutanga ibitekerezo, kuyabyikuza (likes), kuyabasubiza.
- **Bookmarks** — kubika note ngo uyibone vuba.
- **Reading progress** — kubika aho wagereye usoma.
- **Q&A** — abanyeshuri bashobora gushyiraho ibibazo, abarimu bagasubiza.
- **Statistics** — view count, download count, kuri buri note.

---

## 7. Akamaro ka sisitemu kuri buri rwego rw'abayikoresha

Iyi sisitemu ntabwo ari ibikoresho gusa — ni umuhuza w'umuryango wose w'ishuri.
Hano dusobanuye uko buri muntu cyangwa urwego rubona inyungu mu kuyikoresha.

---

### 7.1 Ababyeyi — *peace of mind* burimunsi

Mbere yo kugira sisitemu nk'iyi, umubyeyi yari atunzwe no kwizera:
yatangaga amafaranga kandi ntiyamenya neza icyabaye ku mwana, atari uko
yumvise inkuru. Ubu rero, **buri mubyeyi afite konti ye bwite** ahuje
n'umwana cyangwa abana be benshi.

**Akamaro ku mubyeyi:**
- **Areba amanota igihe icyo aricyo cyose** — atarinze gutegereza
  raporo y'igihembwe.
- **Areba uko yitabira** ishuri (attendance) — niba umwana
  yari muri kilasi cyangwa atari mo, n'icyabitumye.
- **Areba ideni ry'amafaranga** ahari ku mwana, n'inyemezabwishyu
  z'amafaranga yatanze. Ntakimuhitamo, ntashidikanya.
- **Yakira SMS na notification ako kanya** iyo hari icyabaye:
  - Ihohoterwa ryanditseho.
  - Ifaranga ryashyikirijwe ryakiriwe.
  - Inkuru rusange y'ishuri (urugendo, ifunga, …).
- **Ashobora gusubiza** ku byifuzo by'akazi by'umwana (leave requests),
  no kohereza **appeal** iyo arwanya icyemezo cyafashwe.
- **Iyo afite abana benshi**, ahindura umwana umwe ku wundi mu nzira imwe
  (child selector iri ku rubuga rwe).

**Ubuhamya:** "Mbere nasangaga umwana wanjye ategereje iherezo
ry'igihembwe ngo amenye uko yagenze. Ubu nibareba ako kanya — bituma
mfasha ibibazo bigitangira."

---

### 7.2 Abanyeshuri — ubumenyi mu biganza byabo

**Inzira yo kwinjira:** kode (urugero `2026/SOF/001`) + nyuma 4 z'imibare
ya telefoni — ntakimuhuma. Bidatangiye, ahabwa ijambobanga rye bwite agahindura
ako kanya (`must_change_password`).

**Ibyo umunyeshuri yumva:**
- **Ahereye ku mafoni yo mu nshyimbo** — sisitemu yose ikora kuri
  smartphone (Tailwind responsive design).
- **Areba amanota** ye yose, GPA n'urutonde rw'isomo rikiri kunyura.
- **Asoma inyandiko z'amasomo** ku rubuga rwa **/kwiga** — atarinze
  kwinjira, ariko iyo afite konti ashobora kwandika comments,
  kuyatanga **like**, no kuyabika muri **bookmarks**.
- **Atanga ikibazo** (raised hand) ku note umwarimu yashyize, mwarimu
  akamusubiza nyuma — bose bahabwa notification.
- **Areba amafaranga** ye, ibyatanzwe, n'ibisigaye — ntashidikanya
  ku byerekeye amafaranga.
- **Ahindura ijambobanga** rye bwite kandi nta wundi muntu agira
  ububasha bwo kuryikuza (njye n'admin tubasha gusa kuryikuvugurura
  ngo agarure new default).

**Inyungu yihariye:** abana b'i Rwanda batashyizemo umuti benshi bafite
problem yo kubura amakuru y'amasomo bwa nyuma. Iyi sisitemu rero
ibafasha **kubaka inshingano kuri bo ubwabo**.

---

### 7.3 Abarimu — igihe cyiza cyo kwigisha

**Sidebar y'umwarimu** ifite ubuyobozi bwose mu nzira imwe:
- **Inyandiko** (Notes) — kohereza PDF, sisitemu yikuramo cover ya
  mbere otomatik (PDF.js), gushyira description, no gusiba.
- **Ibibazo by'Abanyeshuri** — gusubiza ibibazo byatanzwe ku
  rubuga rwa /kwiga; abasaba bahabwa notification.
- **Imyitwarire** — kwandika warning, conduct removal, praise — bigira
  ingaruka ku ipoints z'umunyeshuri kandi bohereza SMS ku mubyeyi.
- **Reactions & Comments** — areba uko notes ze zigeze gusomwa, ni
  ngahe babigizemo "like", abakoze "raised hand", n'abandi byinshi.
- **Read-only abanyeshuri** — kuko mwarimu atagomba kwandika cyangwa
  guhindura abanyeshuri, sisitemu imukingira kuri urwo rwego.

**Inyungu:** umwarimu agira igihe cyo kwigisha, atarinze gutonda
inyandiko cyangwa kwandukura amanota — sisitemu ibikora.

---

### 7.4 Ubuyobozi (admin/director) — kugenzura byose ku gicaniro kimwe

**Dashboard ya mbere** itanga incamake muri jisho rimwe: umubare
w'abanyeshuri, ababyeyi, abasoje, amafaranga yakiriwe muri uku kwezi,
n'ibyifuzo by'ababyeyi bagombye gusubizwa.

**Ibyo admin akora ku rwego rwo hejuru:**
- **Kugena umwaka w'amasomo ukoreshwa** — `current academic year`
  ihindura uburyo statistike zibarwa.
- **Kuzamuwa ku rwego rwo hejuru** (promotion) — abana ba L3 bajya kuri
  L4, abandi barangiza bajya ku basoje (`graduated`).
- **CMS** — guhindura amakuru y'urubuga rusange (banner, news,
  trades, services) — atarinze developer.
- **Staff Manager** — kongera abakozi, kubaha urwego, gusiba.
- **Link Manager** — kwemera/guhakana ibyifuzo by'ababyeyi byo guhuzwa
  n'abana, no guhuza wenyine ku buryo bwa manual.

**Inyungu nyamukuru:** ubuyobozi bw'ishuri butinda mu nzira nke kandi
buryoroshye gufata icyemezo gishingiye ku makuru y'ukuri.

---

### 7.5 Abiga amategeko y'umuhanda

**Driving School** ifite uburyo bwose bw'ishuri risanzwe ariko ku byerekeye
amategeko y'umuhanda gusa:
- **Categories A, B, C, D** — buri rwego rufite amategeko yarwo
  (`driving_categories` na `driving_rules`).
- **Quiz online** — abakoresha bakora ibizamini bya multiple choice
  buri munsi; sisitemu ibika amanota n'igihe.
- **Iyandikisha** — gushyiraho amafoto, kwishyura, no kubona umunsi
  w'ikizamini.
- **Driving Instructor Dashboard** — umwigisha agenzura abanyeshuri be,
  agatanga amanota y'ibizamini bya practical.

**Inyungu:** abenshi mu Rwanda batsindwa ibizamini by'amategeko si uko
batayazi — ni uko bataba bagize aho bakora ibizamini buri munsi. Iyi
sisitemu ihindura iyo mvugo.

---

### 7.6 Leta n'inzego z'uburezi

Sisitemu yubatswe mu buryo iri **transparent** kandi yoroshye **kugenzurwa**:
- **Audit trail** — buri myanya yose y'ingenzi (kwakira amafaranga,
  kuzamuwa ku rwego, gusiba umunyeshuri) ifite umukoresha n'igihe
  byanditseho.
- **Reports** — sisitemu ishobora gusohora raporo zigaragaza:
  - Abanyeshuri biga muri buri trade, buri level.
  - Conduct rate ku rwego rw'ishuri.
  - Amafaranga yakiriwe (collection rate) ku gihembwe.
  - Abasoje (employment outcomes nyuma yo guhuzwa n'employers).
- **Indimi eshatu** (Kinyarwanda, Icyongereza, Igifaransa) — bituma
  inzego za leta zubatse muri leta zigana raporo zikorera.
- **Export PDF/Excel** — birinda inkubiri y'amafayilo Word zandikishijwe
  intoki.

**Inyungu kuri leta:** Ministeri y'uburezi (MINEDUC) na **REB**
bashobora kubona amakuru y'ukuri y'ishuri, bigatuma:
- Politiki y'uburezi ishingira ku makuru.
- Ubufasha buhagaragara (subsidies, scholarships) butangwa ku banyeshuri
  bigana neza.
- TVET ihinduka inkingi y'iterambere — nta uko byari ku gihe cy'amafayilo
  ya Excel zatakaye buri mwaka.

---

### 7.7 Ayandi mashuri yifuza kubikoresha

Code y'iyi sisitemu ifite **MIT-style license**, kandi yubatswe mu buryo
butuma yoroshye gukoreshwa n'andi mashuri ya TVET — cyangwa n'ishuri
risanzwe — atari Garden gusa.

**Ibyo amashuri agomba guhindura gusa:**
1. **CMS settings** — izina, logo, ibara, telefoni, ikarita y'aho biri.
2. **Trades** — bashyiraho imyuga yabo (`trades` table), iyo Garden
   ifite **AUTO/BDC/SOD**, ndetse n'ayandi ashobora kuba **Tailoring,
   Hospitality, Beauty**, n'ibindi.
3. **Driving School module** — ushobora kuyikuraho mu **routes** zibikora
   niba ishuri ryacu ridakora amategeko y'umuhanda.
4. **Translations** — sisitemu yumva indimi eshatu; ushobora kongeraho
   urundi rurimi (Swahili, Kirundi, …) ushyira `frontend/src/locales/sw.json`
   ukongera muri `frontend/src/i18n.js`.
5. **DB credentials** — guhindura `.env` gusa, schema yose iri muri
   `backend/garden_tvet.sql` — `mysql -u root -p ishuri_ryanjye < garden_tvet.sql`
   ihindura buri kintu.

**Inyungu:** Garden TVET ifite intego yo gufasha amashuri yose ya
TVET mu Rwanda no muri Afurika kuvana mu nyandiko zo mu makayi
zikajya kuri **digital systems** zumvikana — kandi mu buryo budasaba
ibihumbi bya dollar.

---

## 8. Inyungu z'imari

Iyi sisitemu yashyizweho ifite intego yo **kongera ibyinjira** no
**kugabanya ibyo bitakara** ku ishuri.

**Aho amafaranga ariho ari atakara mbere ya sisitemu:**
| Ikibazo | Igihombo |
|---|---|
| Amafaranga atari yatanzwe ariko atanditse mu makayi neza | Amafaranga abura |
| Inyemezabwishyu zibamo amakosa | Kongera amafaranga |
| Ababyeyi batamenya ko hari ifaranga ribura | Late payments |
| Stock — ibikoresho byibwa cyangwa bigura kabiri | Ibihumbi bya RWF buri kwezi |
| Conduct — abana bahohoterwa ariko ababyeyi batabimenya | Abana bava ku ishuri |

**Aho sisitemu ikora amafaranga:**
- **Collection rate yiyongereye** — ababyeyi babona ideni ako kanya,
  bigatuma bishyura vuba (data: amashuri akoresha sisitemu zisa zibona
  collection rate yiyongera 25-40%).
- **Inyemezabwishyu zikomeye** — auto-numbering ikuraho impamvu zo
  kwiba.
- **Stock tracking** — ibikoresho ntibitakara, kandi buying ifatwa
  ku gihe cyiza (low-stock alerts).
- **Conduct visibility** — abana b'imyitwarire mibi bahindurwa
  hakiri kare, bigatuma ishuri ridatakaza abana benshi (retention
  rate yiyongera).
- **Digital marketing** — urubuga rusange (CMS) rufasha kwiyamamaza
  kandi ababyeyi bashya bashobora kwiyandikisha **online**, ntibikenewe
  inzira ndende.

**Igiteranyo:** ku ishuri rifite **abanyeshuri 500**, sisitemu
ishobora kongera ibyinjira bya **5–8 miliyoni RWF ku mwaka**, kandi
ikabuza ko ibihumbi bya dollar bitakara mu bicuruzwa byangiritse cyangwa
mu nyandiko zibura.

---

## 9. Indimi (i18n)

Sisitemu yose yumva indimi eshatu nyazo (real translations, ntabwo ari
machine translation):

| Code | Ururimi | Aho yifashishwa |
|---|---|---|
| **rw** | **Kinyarwanda** | Default ku **rubuga rusange** na **portal y'umubyeyi**. Iyo umuntu adafite ururimi rwihariye, sisitemu imuhitiramo Kinyarwanda. |
| **en** | English | Default ku **konti z'abakozi** (admin, dod, accountant, stock manager, teacher, librarian, registrar) — kuko byinshi mu bya tekiniki bisanzwe biri muri English. |
| **fr** | Français | Ihitamo ku banyeshuri n'abayobozi bavuga igifaransa — Rwanda ifite abakoresha benshi b'igifaransa. |

**Aho ushobora guhindura ururimi:**
- Buri konti ifite **language switcher** (rw / en / fr) hejuru y'ipaji.
- Ihitamo rye ribikwa muri `localStorage` rikongera kugaragara
  igihe agarutse.
- Browser detection — niba browser ya mukoresha iri muri `fr-FR`,
  sisitemu ibihindura otomatik mbere yo kwinjira.

**Aho indimi zibikwa muri code:**
- `frontend/src/locales/rw.json` — Kinyarwanda
- `frontend/src/locales/en.json` — English
- `frontend/src/locales/fr.json` — Français
- `frontend/src/i18n.js` — initialization na detection logic.

**Ushaka kongeraho urundi rurimi (urugero Swahili)?**
1. Andika `frontend/src/locales/sw.json` (kopi ya rw.json wuzuze).
2. Hindura `i18n.js` ushyire `sw` mu `resources` na `supportedLngs`.
3. Hindura `Layout` ushyire button ya `Sw` mu language switcher.
4. Ntakindi gisabwa.

---

## 10. Endpoints zose za API

### Authentication
- `POST /api/auth/login` — login y'abakozi (admin/dod/accountant/…).
- `POST /api/student-auth/login` — login y'umunyeshuri (kode + password).
- `GET  /api/student-auth/me` — amakuru yose y'umunyeshuri winjiye.
- `POST /api/student-auth/change-password` — guhindura ijambobanga.

### Students & Discipline
- `GET    /api/students` — urutonde rw'abanyeshuri (admin/dod/accountant).
- `POST   /api/students` — kwandika umunyeshuri.
- `PUT    /api/students/:id` — guhindura.
- `DELETE /api/students/:id` — gusiba.
- `GET    /api/discipline` — inkuru zose z'imyitwarire.
- `POST   /api/discipline` — kwandika ikintu cy'imyitwarire.

### Teacher (sidebar mode)
- `GET  /api/teacher/students` — read-only list.
- `POST /api/teacher/conduct` — kwandika imyitwarire.
- `GET  /api/teacher/conduct` — inkuru z'imyitwarire mwarimu yashyize.
- `GET  /api/teacher/engagement` — incamake ya likes/comments/hands ku notes ze.
- `GET  /api/teacher/notes/comments` — comments zose ku notes ze.
- `GET  /api/teacher/notes/bookmarks` — abakoze bookmark ku notes ze.

### Notes & Learning
- `GET  /api/course-notes` — notes zose za rusange.
- `POST /api/course-notes` — gushyiraho note (mwarimu/admin).
- `GET  /api/course-notes/:id/view` — gusoma PDF.
- `GET  /api/course-notes/:id/cover` — cover image.
- `POST /api/learning/notes/:id/comments` — gutanga comment.
- `POST /api/learning/notes/:id/reactions` — like/helpful/love/question.
- `POST /api/learning/notes/:id/bookmarks` — kubika.

### Q&A
- `POST /api/student-questions` — umunyeshuri ashyiraho ikibazo (rusange).
- `GET  /api/student-questions` — abarimu/admin bareba.
- `PATCH /api/student-questions/:id/answer` — gusubiza.
- `GET  /api/student-questions/public` — Q&A zarasubijwe (rusange).

### Finance
- `GET  /api/fees` — fees zose.
- `POST /api/fees` — kwemeza ifaranga.
- `POST /api/payments` — kwakira amafaranga.
- `GET  /api/payments/student/:id` — payments z'umunyeshuri.

### Notifications
- `GET  /api/notifications` (legacy) na `/api/notifications2` (nshya).
- `POST /api/notifications2/read/:id` — kwemeza ko bwasomwe.

### Driving School
- `GET  /api/driving-rules` — amategeko yose.
- `GET  /api/driving-rules/quiz` — gukora ikizamini.
- `POST /api/driving-school/register` — iyandikisha.

---

## 11. Database — imbonerahamwe nyamukuru

| Imbonerahamwe | Akamaro |
|---|---|
| `users` | Abakozi (admin, dod, accountant, teacher, parent). |
| `students` | Abanyeshuri — kode, izina, trade, level, conduct, **password_hash** (nshya). |
| `student_grades`, `exam_results` | Amanota n'ibizamini. |
| `attendance` | Kwitabira buri munsi. |
| `fees`, `fee_structures`, `payments` | Amafaranga y'ishuri. |
| `discipline_records`, `leave_requests`, `appeals` | Imyitwarire. |
| `course_notes`, `note_reactions`, `note_comments`, `note_bookmarks`, `note_reading_progress` | Inyandiko n'ibyo bikora. |
| `student_questions`, `student_question_replies` | Q&A. |
| `notifications`, `notifications2` | Ubutumwa bwa konti. |
| `driving_rules`, `driving_categories`, `driving_payments` | Ishuri ry'amategeko. |
| `applications`, `applicants` | Abasaba kuza muri kaminuza. |
| `academic_years`, `student_promotions` | Umwaka w'amasomo n'iyimukira ku rwego rwo hejuru. |
| `staff`, `parent_link_requests` | Abakozi n'ububiko bw'ababyeyi. |

---

## 12. Umutekano

- **JWT** ikoreshwa kuri authentication; secret iri muri `JWT_SECRET`.
- **bcrypt** ihisha amabanga (10 rounds) — hano harimo n'ay'abanyeshuri.
- **role middleware** (`verifyRole`) ikingira buri endpoint.
- **Multer** igenzura ubwoko bw'amafayilo — image, PDF, audio, video gusa,
  hamwe n'igipimo cyemewe (25 MB).
- Buri request ya backend ifite **CORS** ikomeye.
- **Default password y'umunyeshuri** ni nyuma 4 z'imibare ya telefoni —
  asabwa kuyihindura igihe yinjiye bwa mbere (`must_change_password`).
- Ababyeyi bahabwa ubutumwa bwa SMS bushya buri uko hari icyabaye ku mwana.

---

## 13. Ibyumba bishyaho (Deployment)

Sisitemu yashyizweho mu buryo bukurikira:

- **Frontend** — yubatswe na Vite ikajyana muri `frontend/dist/`,
  yashyirwaho na server iyo ari yo yose ya static (Nginx, Vercel, …).
- **Backend** — Node 20+, ihuza na MySQL ya production. Variables
  z'ingenzi: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`,
  `JWT_SECRET`, `PORT`, hamwe na `SMS_API_KEY`/`SMTP_*` zose.
- **Database** — MySQL 8+ (cyangwa MariaDB 10+). Schema iri muri
  `backend/garden_tvet.sql`; sisitemu izi gushyiraho columns nshya
  (`password_hash`, `must_change_password`, `last_login`,
  `default_password_hint`) iyo zibura.
- Mu **Replit**: kanda **Publish** ngo sisitemu igere kuri `.replit.app`.

---

## 📞 Imenyeshe

- Garden TVET School — Kigali, Rwanda
- Email: `info@gardentvet.rw`
- Telefoni: `+250 788 000 000`
- Urubuga: `https://gardentvet.rw`

---

> Iri dosiye igenewe **abakozi b'ishuri**, **abakora ku gisubizo**,
> n'**abifuza kumva uko sisitemu ya Garden TVET ikora**. Uburyo bwo
> kongerera modules zindi cyangwa guhindura imikorere bwasobanurwa muri
> `.local/tasks/` — buri task ifite plan yayo.
