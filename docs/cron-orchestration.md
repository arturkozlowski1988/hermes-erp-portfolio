# Orkiestracja cron: 43 aktywne jobs

> Snapshot produkcyjnego `~/.hermes/cron/jobs.json`: **2026-08-08**.

Wszystkie 43 pozycje były aktywne w chwili audytu. Katalog na stronie i poniższy rejestr używają bieżących nazw schedulera, nie historycznych aliasów.

## Dwa tryby wykonania

| Tryb | Liczba | Zastosowanie |
|---|---:|---|
| **Agentowy** | 22 | zadania wymagające klasyfikacji, syntezy, decyzji lub raportu |
| **Script-only** | 21 | deterministyczne skanery, sync, health-checki, backupy i watchdogi |
| **Razem** | **43** | wszystkie aktywne |

Job script-only dostarcza dokładnie stdout skryptu. Pusty stdout oznacza ciszę. Job agentowy może dostać prompt, skille, wynik skryptu przygotowawczego i kontekst z innego joba.

## Podział funkcjonalny

Ten podział jest warstwą prezentacyjną portfolio. Scheduler przechowuje płaską listę jobs.

| Grupa | Liczba | Rola |
|---|---:|---|
| Poczta i proposals | 5 | alerty, drafty, klasyfikacja spraw i feedback |
| eMU | 13 | wydarzenia, komentarze, assigned tasks i analiza propozycji |
| tech-worker | 4 | monitoring Optima, routing, review i watchdog |
| Wiedza | 7 | sync, enrichment, embeddings, FTS5 i raport jakości |
| Briefingi | 5 | poranek, zwroty, wieczór oraz planowanie tygodnia |
| Infrastruktura | 9 | backup, health-checki, dual-read, skille i watchdog |
| **Razem** | **43** | |

## Pełny rejestr

### 1. Poczta i proposals — 5

| Job | Harmonogram | Rola |
|---|---|---|
| `mailops-email-alert` | `5 7-16 * * 1-5` | sygnały z poczty w dni robocze |
| `email-draft-generator` | `10 8-15 * * 1-5` | draft odpowiedzi z kontekstem wątku |
| `sent-feedback-daily` | `0 18 * * *` | porównanie draftów z realnie wysłanymi wiadomościami |
| `email-to-task-scan` | `3-48/15 8-15 * * 1-5` | klasyfikacja e-maila jako proposal, manual review lub skip |
| `proposal-notifier` | `5-50/15 8-15 * * 1-5` | publikacja nowych propozycji w Decision Hub |

### 2. eMU — 13

| Job | Harmonogram | Rola |
|---|---|---|
| `eMU Events Incremental Sync` | `0 20 * * *` | domknięcie przyrostu wydarzeń |
| `eMU Data Prune` | `0 6 * * 1` | kontrolowane czyszczenie stanu roboczego |
| `eMU Changelog Monitor (wt)` | `30 16 * * 2` | wtorkowy punkt kontroli zmian portalu |
| `eMU Changelog Monitor (czw)` | `5 8 * * 4` | czwartkowy punkt kontroli zmian portalu |
| `eMU Events Morning Sync` | `45 6 * * 1-5` | poranny snapshot wydarzeń |
| `eMU Cancellation Check` | `30 8 * * 1-5` | wykrycie anulowań |
| `eMU Mid-Day Change Alert` | `15 12 * * 1-5` | porównanie bieżącego stanu z porannym snapshotem |
| `s14-execution-monitor` | `5 14 * * 1-5` | kontrola wykonania S14 |
| `emu-proposal-deep-analyzer` | `30 21 * * 1-5` | pogłębiona analiza propozycji po dniu pracy |
| `emu-comment-notification-scan` | `3-48/15 8-16 * * 1-5` | nowe komentarze do zadań i wydarzeń |
| `emu-comment-reminder` | `10 9-16 * * 1-5` | przypomnienia tylko dla nierozstrzygniętych komentarzy |
| `eMU assigned task tech scan` | `1-46/15 8-16 * * 1-5` | pełny odczyt przypisanych zadań technicznych |
| `customer-fingerprint-weekly-monitor` | `20 9 * * 1` | tygodniowa kontrola jakości identyfikacji klientów |

### 3. tech-worker — 4

| Job | Harmonogram | Rola |
|---|---|---|
| `comarch-optima-monitoring` | co 10 080 min (7 dni) | techniczny monitoring obszaru Comarch Optima |
| `tech-worker-proposal-router` | `7-52/15 8-16 * * 1-5` | idempotentny routing zaakceptowanych spraw do Kanban |
| `tech-worker-orchestrator-review` | `12-57/15 8-17 * * 1-5` | review `REPORT.md`, artefaktów i blokerów |
| `tech-pipeline-watchdog` | `0 8-17/2 * * 1-5` | timeouty, zakleszczenia i brakujące handoffy |

### 4. Wiedza — 7

| Job | Harmonogram | Rola |
|---|---|---|
| `ERP KB FTS5 auto-rebuild` | `0 6 * * *` | odbudowa indeksu pełnotekstowego |
| `wiki-nightly-healthcheck` | `0 0 * * *` | nocna kontrola spójności wiki |
| `emu-knowledge-weekly-report` | `0 12 * * 0` | tygodniowy raport jakości wiedzy |
| `emu-msg-enrich-batch` | co 30 min | enrichment wiadomości i załączników MSG |
| `emu-kb-full-sync-batch` | co 15 min | przyrostowy pełny sync do kanonicznego SQLite |
| `emu-kb-progress-report` | `0 7 * * *` | postęp i regresy pipeline’u wiedzy |
| `emu-kb-embedding-batch` | co 180 min | aktualizacja embeddingów nowych treści |

### 5. Briefingi — 5

| Job | Harmonogram | Rola |
|---|---|---|
| `morning-briefing` | `0 7 * * *` | plan dnia i sprawy wymagające reakcji |
| `emu-return-briefing` | `0 8 * * 1-5` | sprawy zwrócone i ponownie otwarte |
| `weekly-report` | `0 15 * * 5` | piątkowe wykonanie, blokery i ryzyka |
| `weekly-planning` | `0 18 * * 0` | niedzielne priorytety i zależności |
| `evening-reminder` | `0 17 * * 1-5` | sprawy otwarte na koniec dnia |

### 6. Infrastruktura — 9

| Job | Harmonogram | Rola |
|---|---|---|
| `erp-vault-git-pull` | `15 8-16/2 * * 1-5` | kontrolowana synchronizacja vaultu |
| `pipeline-health-check` | `30 6 * * *` | gotowość głównych skanerów |
| `proposal-store-health-check` | `35 6 * * *` | integralność proposal store i callbacków |
| `weekend-skill-maintenance` | `0 2 * * 6,0` | testy i porządkowanie skilli |
| `eMU SQLite Dual-Read Diagnostic` | `10 7,12,20 * * 1-5` | porównanie dwóch ścieżek odczytu |
| `hindsight-health-check` | `17 */4 * * *` | zdrowie pamięci Hindsight co 4 godziny |
| `hindsight-daily-logical-backup` | `20 3 * * *` | logiczny backup Hindsight |
| `db-daily-backup` | `45 4 * * *` | weryfikowane kopie lokalnych baz |
| `hermes-infra-watchdog` | `0,30 * * * *` | kontrola infrastruktury co 30 minut |

## Rytm doby

```text
00:00   wiki health-check
03:20   logiczny backup Hindsight
04:45   backup lokalnych baz
06:00   FTS5 + poniedziałkowy prune
06:30   health-check pipeline’u
06:35   health-check proposal store
06:45   poranny snapshot eMU
07:00   briefing + raport postępu KB
08:00   return briefing i początek głównych skanerów
08–18   drafty, proposals, komentarze, routing i review
20:00   przyrostowy sync wydarzeń
21:30   pogłębiona analiza proposals w dni robocze
co 15m  sync KB oraz wybrane skanery operacyjne
co 30m  enrichment MSG i watchdog infrastruktury
co 180m embeddingi
```

## Dlaczego to nie jest jeden cron

Każda klasa pracy ma inny kontrakt:

- **sync** może działać często i cicho,
- **alert** powinien wysłać komunikat tylko po wykryciu wyjątku,
- **proposal** musi utrzymać lifecycle i idempotencję,
- **tech-worker** potrzebuje trwałego workspace i review,
- **backup** musi zostać zweryfikowany,
- **briefing** ma scalać stan, nie powtarzać surowe logi.

Rozdzielenie tych odpowiedzialności upraszcza retry, ogranicza lawinę powiadomień i pozwala diagnozować awarię jednego łańcucha bez zatrzymywania pozostałych.

## Zasady bezpieczeństwa schedulera

1. Job nie planuje kolejnych jobów rekurencyjnie.
2. Script-only pozostaje cichy, gdy nie ma nic do zgłoszenia.
3. Skanery są read-only, dopóki osobna akcja nie uzyska zgody.
4. Routing używa kluczy idempotencji.
5. Retry nie może powielić taska, draftu ani powiadomienia.
6. Health-check i backup są osobnymi odpowiedzialnościami.
7. Joby agentowe dostają tylko potrzebne skille i kontekst.

## Diagnostyka

Dla każdego joba sprawdzane są:

- ostatnie uruchomienie i kod wyjścia,
- świeżość checkpointu,
- rozmiar kolejki pending,
- duplikaty kluczy idempotencji,
- stan usług zależnych,
- różnica między pustym wynikiem a awarią.

Szczegóły kompletnego handoffu między jobami: [pełny workflow operacyjny](full-operational-workflow.md).
