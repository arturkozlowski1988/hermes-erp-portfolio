# Architektura systemu

## Przegląd

System składa się z jednej instancji Hermes Agent działającej na WSL2, komunikującej się z użytkownikiem przez Telegram Gateway. Hermes orkiestruje 43 zadania cykliczne (cron), integruje się z portalem eMU (Playwright + REST API), obsługuje pocztę (himalaya CLI), zarządza bazą wiedzy (SQLite + embeddings) i łączy się z Microsoft SQL Server (Comarch ERP Optima).

## Diagram architektury

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TELEGRAM (Mobile/Desktop)                    │
│                                                                      │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │ Chat DM   │  │ Mini Apps    │  │ Quick Cmds  │  │ Topics      │  │
│  │ (natural  │  │ (HTML draft  │  │ (/draft-ok_│  │ (thread per │  │
│  │  language)│  │  artifacts)  │  │  <id>)      │  │  session)   │  │
│  └─────┬─────┘  └──────┬───────┘  └──────┬──────┘  └─────────────┘  │
└────────┼───────────────┼─────────────────┼──────────────────────────┘
         │               │                 │
         └───────────────┼─────────────────┘
                         │  Telegram Bot API
┌────────────────────────┼─────────────────────────────────────────────┐
│                        ▼                                             │
│              ┌─────────────────┐                                    │
│              │  Hermes Gateway │  ← nasłuchuje wiadomości TG         │
│              │  (systemd svc)  │                                    │
│              └────────┬────────┘                                    │
│                       │                                             │
│              ┌────────▼────────┐                                    │
│              │  Hermes Agent   │                                    │
│              │  (Python, WSL2) │                                    │
│              │                 │                                    │
│              │  ┌───────────┐  │                                    │
│              │  │ MoA Hub   │  │  ← Mixture of Agents               │
│              │  │ balanced  │  │    (DeepSeek + Kimi + Qwen → GLM)  │
│              │  │ code      │  │                                    │
│              │  │ premium   │  │                                    │
│              │  └───────────┘  │                                    │
│              │                 │                                    │
│              │  ┌───────────┐  │     ┌───────────┐                 │
│              │  │ Profile:  │  │     │ Profile:  │                 │
│              │  │ default   │──┼────►│tech-worker│                 │
│              │  │ (orkiest.)│  │     │(SQL/ERP)  │                 │
│              │  └───────────┘  │     └───────────┘                 │
│              │       │         │          │                          │
│              │  ┌───────────┐  │     ┌───────────┐                 │
│              │  │ Profile:  │  │     │  Cron     │                 │
│              │  │ optima_api│  │     │ Scheduler │                 │
│              │  └───────────┘  │     │ (43 jobs)│                 │
│              └─────────────────┘     └─────┬─────┘                 │
│                                            │                        │
│  ┌──────────────────┬──────────────────────┼──────────────────┐    │
│  │                  │                      │                  │    │
│  ▼                  ▼                      ▼                  ▼    │
│┌─────────┐  ┌──────────────┐  ┌──────────────────┐  ┌──────────┐  │
││ Email   │  │ eMU Portal   │  │ Knowledge Base   │  │ ERP SQL  │  │
││ Pipeline│  │              │  │                  │  │          │  │
││         │  │ Playwright   │  │ SQLite           │  │ MSSQL    │  │
││himalaya │  │ REST API     │  │ nomic-embed      │  │sqlcmd    │  │
││IMAP/SMTP│  │ Select2 auto │  │ FTS5             │  │read-only │  │
││Mini Apps│  │ Session mgmt │  │ LLM classify     │  │          │  │
│└─────────┘  └──────────────┘  └──────────────────┘  └──────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Infrastruktura                            │  │
│  │  Hindsight (vector memory) · DB backup · Health checks      │  │
│  │  ERP vault (git) · Private Artifact Server                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

## Warstwy systemu

### 1. Warstwa dostępu (Telegram Gateway)

Użytkownik komunikuje się z systemem wyłącznie przez Telegram. To zapewnia:

- **Dostęp 24/7 z telefonu** — żadnego SSH, terminala, ani VPN
- **Mini Apps** — HTML artifacts renderowane w Telegram Web App (drafty maili, raporty)
- **Quick commands** — komendy z podkreślnikiem (`/draft-ok_<msg_id>`, `/emuack_<id>`)
- **Topics** — osobne wątki Telegram dla różnych sesji/tematów
- **Voice** — transkrypcja wiadomości głosowych (faster-whisper)

### 2. Warstwa agenta (Hermes Agent)

Centralny komponent — Python process na WSL2:

- **MoA (Mixture of Agents)** — dynamiczny dobór modeli do kosztu, ryzyka i klasy zadania
- **Skills** — specjalistyczne procedury ładowane kontekstowo
- **Memory** — persistent cross-session (built-in + Hindsight vector memory)
- **Delegation** — subagenty dla zadań równoległych (SQL, GUS, analizy)

### 3. Warstwa profili

Hermes rozdziela odpowiedzialności między izolowane role operacyjne:

| Rola | Zakres | Handoff |
|------|--------|---------|
| Orkiestrator | Telegram, crony, poczta, eMU i decyzje | proposal store + Kanban |
| Tech-worker | SQL/ERP/GUI i trwałe artefakty | `REPORT.md` + evidence |
| Profile specjalistyczne | dokumentacja API, research i retrieval | zweryfikowany raport do orkiestratora |

Nie każdy profil musi mieć aktywny gateway. Role komunikują się przez **Kanban board** i trwałe workspace'y, a nie przez ulotną pamięć rozmowy.

### 4. Warstwa integracji

| Integracja | Technologia | Kierunek |
|------------|-------------|----------|
| Email | himalaya CLI (IMAP/SMTP) | Bidirectional |
| eMU Portal | Playwright + REST API | Read + Write (z approval) |
| ERP Optima | MSSQL via sqlcmd (WSL→Windows) | Read-only |
| Knowledge Base | SQLite + Python scripts | Bidirectional |
| Windows Desktop | Windows MCP (computer_use) | Automation |
| Artifact Server | Prywatna usługa HTTP | Telegram Mini Apps |

### 5. Warstwa orkiestracji (Cron)

43 zadania cykliczne zarządzane przez Hermes Cron Scheduler:

- **Cron expressions** — standardowe (`0 7 * * *`) i interwały (`every 15m`)
- **Per-job knobs** — skills, model override, script pre-run, delivery target
- **Delivery** — `local` (cicho, logi), `telegram` (user-facing)
- **no_agent** — dla skryptów deterministycznych (nie wymaga LLM)
- **Per-job timeout i izolacja** — pojedynczy job nie powinien blokować schedulera

## Przepływ danych

```
Email (IMAP) ──► Hermes Cron ──► LLM Analysis ──► eMU Lookup ──► KB Query
                                                                      │
                                                                      ▼
                                                              Draft Generation
                                                                      │
                                                                      ▼
                                                              Telegram Mini App
                                                                      │
                                                          ┌───────────┤
                                                          ▼           ▼
                                                    /draft-ok_   /draft-skip_
                                                          │
                                                          ▼
                                                    SMTP Send
```

## Bezpieczeństwo

| Zasada | Implementacja |
|--------|---------------|
| Read-only default | eMU: zero write bez explicit zgody w sesji |
| Secret isolation | Lokalny credential store; żadnych sekretów w repo ani logach |
| Draft approval | Agent nigdy nie wysyła maila samodzielnie |
| Data isolation | Baza wiedzy eMU = prywatna, ERP KB = publiczna dokumentacja |
| Credential pools | Rotacja kluczy API, exhaustion detection |
| Command approval | `manual` mode — prompt przed destruktywnymi komendami |