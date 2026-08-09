# Rozwój i weryfikacja portfolio

Repozytorium zawiera statyczną stronę HTML/CSS/JS oraz techniczną dokumentację Markdown. GitHub Pages publikuje zawartość katalogu głównego bez Jekylla (`.nojekyll`).

## Wymagania

- Node.js 20 lub nowszy,
- npm,
- Python 3 do lokalnego serwera,
- opcjonalnie Python Playwright do wizualnego QA.

## Podstawowa weryfikacja

```bash
npm test
npm run build
```

`npm test` sprawdza strukturę strony, SEO, wymagane workflowy, interakcje zdefiniowane w JS, mobile CSS i pliki publikacji.

`npm run build`:

1. uruchamia testy,
2. czyści `dist/`,
3. kopiuje publiczne pliki,
4. potwierdza obecność kluczowych artefaktów.

## Lokalny podgląd

```bash
npm start
# http://localhost:4173
```

## Wizualne QA

Po zainstalowaniu Python Playwright i przeglądarki Chromium:

```bash
python3 scripts/visual_qa.py
```

Harness sprawdza:

- desktop i mobile,
- brak poziomego overflow,
- błędy konsoli,
- zakładki workflowów,
- filtrowanie i wyszukiwanie cronów,
- dialog wersji angielskiej,
- mobilną nawigację,
- WCAG 2.1 AA przez axe-core.

Zrzuty trafiają do ignorowanego katalogu `.qa/`.

## Publikacja

GitHub Pages publikuje branch `main` z katalogu `/`.

Przed pushem:

```bash
npm run build
git diff --check
git status --short
```

Repo nie zawiera danych klientów, konfiguracji produkcyjnych, baz SQLite ani poświadczeń. Wszystkie przykłady muszą pozostać syntetyczne.

## Struktura

```text
hermes-erp-portfolio/
├── index.html                         # publiczna wizytówka
├── assets/
│   ├── css/styles.css                 # system wizualny
│   ├── js/app.js                      # interakcje + katalog cronów
│   └── img/                           # diagram i social card
├── docs/                              # proof layer i dokumentacja
├── examples/                          # zanonimizowane scenariusze
├── diagrams/architecture.svg          # diagram do README
├── tests/site.test.mjs                # testy statyczne
├── scripts/build.mjs                  # deterministyczny build
├── scripts/visual_qa.py               # opcjonalny browser QA
├── package.json
└── .nojekyll
```
