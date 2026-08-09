# Integracja z portalem eMU

## Przegląd

eMU to system ERP/web portal firmy Comarch używany do zarządzania klientami, wydarzeniami, zadaniami serwisowymi i bazą wiedzy. Hermes Agent integruje się z eMU przez Playwright (browser automation) oraz REST API, realizując synchronizację danych, monitoring zmian i read-only dostęp do informacji o klientach.

## Architektura integracji

```
┌─────────────────────────────────────────────────────────────────┐
│                    eMU INTEGRATION LAYER                        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Login &      │  │ Data Reading │  │ Event Operations     │  │
│  │ Session Mgmt │  │ (read-only)  │  │ (CRUD z approval)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                     │              │
│  ┌──────▼─────────────────▼─────────────────────▼───────────┐  │
│  │              Playwright + REST API                       │  │
│  │                                                           │  │
│  │  • Session cookies & token management                    │  │
│  │  • Select2 dropdown automation (jQuery)                   │  │
│  │  • Direct URL navigation (bypass UI clicks)               │  │
│  │  • Incremental sync z checkpointami                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Task         │  │ Alert System │  │ Knowledge Base       │  │
│  │ Operations   │  │ (mid-day,    │  │ Sync & Query         │  │
│  │              │  │  cancel)     │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Skille Hermes (15+)

| Skill | Funkcja |
|-------|---------|
| `emu-login-session` | Logowanie do portalu, zarządzanie sesją, detekcja wygasania |
| `emu-data-reading` | Read-only odczyt danych (events, tasks, customers) |
| `emu-event-operations` | CRUD wydarzeń (tworzenie, edycja, status) |
| `emu-task-operations` | CRUD zadań serwisowych |
| `emu-event-task-relations` | Powiązania dwukierunkowe wydarzenia ↔ zadania |
| `emu-events-incremental-sync` | Incremental sync z checkpointami |
| `emu-knowledge-base` | Audyt, sync, kalibracja LLM, backup/restore bazy wiedzy |
| `emu-knowledge-query` | Wyszukiwanie w bazie wiedzy (embeddings + FTS5) |
| `emu-portal-operations` | Skill wejściowy — deleguje do wyspecjalizowanych |
| `emu-ui-navigation` | Bezpośredne URL-e modułów, filtry, nawigacja |
| `emu-select2-js-automation` | Automatyzacja Select2 dropdowns przez jQuery |
| `emu-alert-system` | Alerty mid-day i cancellation alerts |
| `emu-customer-fingerprint` | Identyfikacja klienta z treści maila (stopka, NIP) |
| `emu-assistant-distribution-plan` | Plan dystrybucji profilu asystenta |

## Kluczowe procesy

### 1. Logowanie i zarządzanie sesją

- **Playwright** otwiera portal eMU, loguje się, przechowuje cookies
- Detekcja wygasania sesji — automatyczne re-login
- Credentials: lokalny credential store poza repo i logami
- Po każdej zatwierdzonej zmianie: komentarz admin `=== Czynności administracyjne ===`

### 2. Synchronizacja wydarzeń (Incremental Sync)

```
eMU /events endpoint
  → Checkpoint (last_sync_timestamp)
  → Fetch only changed events since checkpoint
  → Update local SQLite cache
  → Emit alerts for:
      - New events
      - Zmiany statusu interpretowane przez mapowanie wdrożeniowe
      - Cancellations
  → Advance checkpoint
```

**Cron jobs:**
- `eMU Events Incremental Sync` — codziennie 20:00 (sync przyrostowy)
- `eMU Events Morning Sync` — 6:45 pn–pt (poranny sync)
- `eMU Cancellation Check` — 8:30 pn–pt (sprawdzenie anulowanych)
- `eMU Mid-Day Change Alert` — 12:15 pn–pt (alerty zmian w ciągu dnia)

### 3. Odczyt danych (Read-Only)

Domyślnie wszystkie operacje na eMU są **read-only**. Zapis (create/edit/status/komentarz) tylko po **explicit** zgodzie użytkownika w bieżącej sesji.

**Dostępne dane:**
- Wydarzenia (events) — kalendarz, statusy, uczestnicy
- Zadania serwisowe (tasks) — opisy, statusy, komentarze
- Klienci — kontrolowany kontekst identyfikacyjny i konfiguracyjny
- Komentarze — historia komunikacji

### 4. Alerty

| Alert | Trigger | Dostawa |
|-------|---------|---------|
| Mid-Day Change Alert | Zmiana statusu wydarzenia w ciągu dnia | Telegram |
| Cancellation Alert | Anulowanie wydarzenia | Telegram |
| Comment Notification | Nowy komentarz w zadaniu/wydarzeniu | Telegram |
| Comment Reminder | Przypomnienie o nieodpowiedzianych komentarzach | Telegram |

### 5. Customer Fingerprint

Identyfikacja klienta z treści maila przychodzącego:

- Ekstrakcja minimalnych identyfikatorów firmowych ze stopki
- Dopasowanie do bazy klientów w eMU
- Kontekst dla pipeline email — agent wie, od jakiego klienta jest mail

### 6. Select2 Dropdown Automation

eMU używa biblioteki Select2 dla dropdownów. Standardowa automatyzacja Playwright nie działa. Rozwiązanie:

- **jQuery injection** — `page.evaluate()` z Select2 API
- `emu-select2-js-automation` skill — wzorce dla różnych typów dropdownów
- Obejście problemów z renderowaniem, lazy loading, AJAX

## Cron jobs eMU

| Job | Schedule | Opis |
|-----|----------|------|
| `eMU Events Incremental Sync` | `0 20 * * *` | Przyrostowy sync wydarzeń |
| `eMU Events Morning Sync` | `45 6 * * 1-5` | Poranny sync |
| `eMU Cancellation Check` | `30 8 * * 1-5` | Sprawdzenie anulowanych |
| `eMU Mid-Day Change Alert` | `15 12 * * 1-5` | Alerty zmian |
| `eMU Data Prune` | `0 6 * * 1` | Czyszczenie starych danych |
| `emu-comment-notification-scan` | `3-48/15 8-16 * * 1-5` | Skan komentarzy |
| `emu-comment-reminder` | `10 9-16 * * 1-5` | Przypomnienia komentarzy |
| `eMU assigned task tech scan` | `1-46/15 8-16 * * 1-5` | Skan przypisanych zadań |
| `emu-return-briefing` | `0 8 * * 1-5` | Poranny briefing zwrotny |
| `eMU SQLite Dual-Read Diagnostic` | `10 7,12,20 * * 1-5` | Diagnostyka dual-read |
| `emu-msg-enrich-batch` | `every 30m` | Enrichment wiadomości |
| `emu-kb-full-sync-batch` | `every 15m` | Sync bazy wiedzy |
| `emu-kb-embedding-batch` | `every 180m` | Embeddings |
| `emu-kb-progress-report` | `0 7 * * *` | Raport postępu KB |
| `emu-knowledge-weekly-report` | `0 12 * * 0` | Tygodniowy raport KB |
| `eMU Changelog Monitor (wt)` | `30 16 * * 2` | Monitor changelog (wtorek) |
| `eMU Changelog Monitor (czw)` | `5 8 * * 4` | Monitor changelog (czwartek) |
| `customer-fingerprint-weekly-monitor` | `20 9 * * 1` | Tygodniowy monitor fingerprint |

## Statusy eMU

Mapowanie kodów statusów jest konfiguracją wdrożeniową i nie jest publikowane. Warstwa alertów operuje na znaczeniu statusu — np. przyjęte, w realizacji, zakończone lub odwołane — oraz zachowuje surowy kod wyłącznie w prywatnym stanie audytowym.