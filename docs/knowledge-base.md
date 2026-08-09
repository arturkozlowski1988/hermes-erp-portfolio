# Baza wiedzy (Knowledge Base)

## Przegląd

System bazy wiedzy łączy dane z portalu eMU (tickety, wydarzenia, zadania, komentarze) z LLM classification i vector embeddings, tworząc przeszukiwalne repozytorium wiedzy organizacyjnej. Użytkownik może zadawać pytania w języku naturalnym przez Telegram i otrzymywać odpowiedzi oparte na rzeczywistych danych.

## Architektura

```
┌──────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE BASE PIPELINE                       │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ eMU      │─►│ Full     │─►│ LLM      │─►│ Vector           │ │
│  │ Portal   │  │ Sync     │  │ Classify │  │ Embeddings       │ │
│  │ (source) │  │          │  │          │  │ (nomic-embed)    │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────┬─────────┘ │
│                                                        │         │
│  ┌─────────────────────────────────────────────────────▼───────┐ │
│  │                    SQLite Store                              │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐    │ │
│  │  │ Content    │  │ Metadata   │  │ FTS5 Index          │    │ │
│  │  │ (text)     │  │ (status,   │  │ (full-text search)  │    │ │
│  │  │            │  │  dates,    │  │                     │    │ │
│  │  │            │  │  category) │  │                     │    │ │
│  │  └────────────┘  └────────────┘  └────────────────────┘    │ │
│  └─────────────────────────┬───────────────────────────────────┘ │
│                            │                                     │
│  ┌─────────────────────────▼───────────────────────────────────┐ │
│  │                    Query API                                │ │
│  │  • Natural language → SQL                                   │ │
│  │  • Vector similarity search                                 │ │
│  │  • FTS5 full-text search                                    │ │
│  │  • Hybrid: vector + FTS5                                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Pipeline danych

### 1. Full Sync (co 15 minut)

**Skrypt:** `emu_kb_full_sync.py`

- Pobiera dane z eMU Portal (events, tasks, comments, knowledge articles)
- Incremental — checkpoint `last_sync_timestamp` (uwaga: `--offset 0` resetuje checkpoint)
- Domyślny limit przebiegu: 200 rekordów; stronicowanie API po 100
- Zapis do prywatnego, lokalnego store SQLite

### 2. LLM Classification

**Model produkcyjny:** `deepseek-v4-flash`

**Klasyfikacja:**
- Kategoria problemu (konfiguracja, błąd, pytanie, wniosek)
- Priorytet (krytyczny, wysoki, średni, niski)
- Produkt (Optima, eMU, BI, infrastruktura)
- Grupa wykonawcza (performer_group)

**Uwaga:** `performer_group` API/sync mismatch — znany problem, obsługiwany w skilllach.

### 3. Vector Embeddings (co 3 godziny)

**Model:** `nomic-embed-text` (768 wymiarów)

**Skrypt:** `emu_kb_embed.py`

- Generuje embeddings dla każdej jednostki wiedzy
- Batch processing — `--generate` flag
- Przechowuje wektory w SQLite (blob)
- Używane do semantic search — znajdowanie podobnych problemów

### 4. FTS5 Index (codziennie 6:00)

- Auto-rebuild indeksu full-text search
- Cron: `ERP KB FTS5 auto-rebuild` — `0 6 * * *`
- Obsługuje polskie znaki i stemming

## Query API

**Skrypt:** `emu_kb_api.py`

Użytkownik zadaje pytanie przez Telegram → agent używa `emu-knowledge-query` skill:

1. **Text→SQL** — natural language → SQL query (lokalny erp-vault SQL + real eMU examples)
2. **Vector search** — semantic similarity (cosine similarity na embeddings)
3. **FTS5 search** — full-text search z rankingiem
4. **Hybrid** — kombinacja vector + FTS5 dla najlepszych wyników

## Skrypty

| Skrypt | Funkcja |
|--------|---------|
| `emu_kb_full_sync.py` | Główny sync z eMU → SQLite |
| `emu_kb_embed.py` | Generowanie embeddings (nomic-embed-text) |
| `emu_kb_api.py` | Query API (vector + FTS5) |
| `build_kb.py` | Budowanie bazy od zera |
| `audit_vault.py` | Audyt jakości bazy wiedzy |
| `audit_knowledge_orphans.py` | Wykrywanie osieroconych wpisów |

## Cron jobs

| Job | Schedule | Opis |
|-----|----------|------|
| `emu-kb-full-sync-batch` | `every 15m` | Pełny sync z eMU |
| `emu-kb-embedding-batch` | `every 180m` | Generowanie embeddings |
| `emu-kb-progress-report` | `0 7 * * *` | Codzienny raport postępu |
| `emu-knowledge-weekly-report` | `0 12 * * 0` | Tygodniowy raport |
| `ERP KB FTS5 auto-rebuild` | `0 6 * * *` | Rebuild FTS5 indeksu |

## Bezpieczeństwo

| Zasada | Implementacja |
|--------|---------------|
| **NEVER distribute** | Baza eMU zawiera dane klientów (NIP, nazwy, problemy) — tylko do użytku wewnętrznego |
| Read-only default | Zgoda użytkownika przed INSERT/UPDATE/DELETE/ALTER |
| Backup przed zmianą | Zweryfikowany backup logiczny przed operacją zapisu |
| Separacja | eMU KB (prywatna) vs ERP KB (publiczna dokumentacja Comarch) |

## Backup

- **Codzienny:** `db-daily-backup` cron — `45 4 * * *`
- **Format:** SQLite dump
- **Retencja:** 14 poprawnych przebiegów + 2 nieudane do diagnostyki
- **Lokacja:** prywatny lokalny store backupów

## Metryki

| Metryka | Wartość |
|---------|---------|
| Embedding dimensions | 768 (nomic-embed-text) |
| Sync frequency | co 15 minut |
| Embedding frequency | co 3 godziny |
| FTS5 rebuild | codziennie 6:00 |
| Quality LLM | deepseek-v4-flash |
| Storage | prywatny SQLite store |