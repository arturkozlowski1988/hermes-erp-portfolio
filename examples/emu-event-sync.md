# Przykład: wykrycie anulowanego wydarzenia eMU

> Wszystkie identyfikatory, osoby, daty i treści poniżej są syntetyczne. Przykład pokazuje mechanikę, nie dane produkcyjne.

## Scenariusz

Użytkownik anuluje spotkanie w portalu eMU. System wykrywa zmianę, porównuje ją z lokalnym snapshotem i przygotowuje prywatny alert operacyjny.

## Krok po kroku

### 1. Stan bazowy

```text
Wydarzenie: EXAMPLE-001
Tytuł: Konsultacja wdrożeniowa
Termin: 2026-01-15 10:00–11:00
Status: CONFIRMED
Uczestnicy: Konsultant A, Konsultant B
```

### 2. Zmiana w portalu

Status przechodzi z `CONFIRMED` do `CANCELLED`.

### 3. Scanner wykrywa różnicę

```text
Cron: eMU Cancellation Check (30 8 * * 1-5)
  → odczyt checkpointu
  → pobranie rekordów zmienionych od checkpointu
  → porównanie z lokalnym snapshotem
  → wykrycie: EXAMPLE-001, CONFIRMED → CANCELLED
```

### 4. Prywatny alert

```text
┌──────────────────────────────────────┐
│  ANULOWANE WYDARZENIE                │
│                                      │
│  ID: EXAMPLE-001                     │
│  Tytuł: Konsultacja wdrożeniowa      │
│  Status: CONFIRMED → CANCELLED       │
│  Uczestnicy: 2                       │
│                                      │
│  [Otwórz eMU]  [Załatwione]          │
└──────────────────────────────────────┘
```

Alert zawiera bezpośredni link do rekordu, ale publiczny przykład celowo go nie pokazuje.

### 5. Aktualizacja lokalnego snapshotu

```sql
UPDATE emu_events
SET status = :cancelled_status,
    modified_at = :modified_at
WHERE event_id = :event_id;
```

Zapytanie ilustruje kontrakt danych. Wartości są wiązane parametrami, nie konkatenowane w SQL.

### 6. Reakcja orkiestratora

Agent sprawdza konsekwencje:

- czy istnieją zadania lub wydarzenia powiązane,
- czy trzeba przygotować komunikację,
- czy zwolniony termin wpływa na plan dnia,
- czy zmiana wymaga tylko potwierdzenia, czy decyzji.

```text
Wydarzenie EXAMPLE-001 zostało anulowane.
Powiązane zadania: brak
Wpływ na dzień: zwolniony termin
Proponowana akcja: potwierdź / odłóż / otwórz w eMU
```

## Jobs zaangażowane w ten flow

| Job | Harmonogram | Rola |
|---|---|---|
| `eMU Events Morning Sync` | 06:45 pn–pt | buduje poranny snapshot wydarzeń |
| `eMU Cancellation Check` | 08:30 pn–pt | wykrywa anulowania |
| `eMU Mid-Day Change Alert` | 12:15 pn–pt | wykrywa ważne zmiany w ciągu dnia |
| `eMU Events Incremental Sync` | 20:00 codziennie | domyka dzienny przyrost |

## Mechanizm checkpointu

```text
checkpoint: last_sync_timestamp

1. Read checkpoint
2. Fetch records modified since checkpoint
3. For each changed event:
   a. compare with local snapshot
   b. detect meaningful status changes
   c. emit an alert only if needed
   d. update local snapshot
4. Advance checkpoint to max(modified_at)
5. Commit
```

Reset checkpointu jest operacją serwisową przeznaczoną wyłącznie do kontrolowanego pełnego resyncu. Zwykłe uruchomienie zawsze kontynuuje od ostatniego potwierdzonego punktu.

## Guardrails

- odczyt i porównanie nie modyfikują rekordu w portalu,
- alert trafia wyłącznie do prywatnego kanału operatora,
- duplikat tej samej zmiany nie tworzy kolejnego alertu,
- checkpoint przechodzi do przodu dopiero po poprawnym zapisie lokalnego stanu,
- mapowanie statusów jest konfiguracją wdrożenia i nie jest publikowane w repo.
