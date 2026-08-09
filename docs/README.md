# Dokumentacja techniczna

Strona główna jest wizytówką systemu. Ten katalog opisuje mechanikę pod spodem: stan, crony, punkty decyzji i kontrakty między komponentami.

## Zacznij tutaj

- [Pełny workflow operacyjny](full-operational-workflow.md) — e-mail, proposal store, Mini Apps, eMU, tech-worker, REVIEW i delivery.
- [Architektura systemu](architecture.md) — warstwy i przepływ danych.
- [Pipeline poczty](email-pipeline.md) — draft odpowiedzi oraz niezależny draft zadania.
- [Orkiestracja 43 cronów](cron-orchestration.md) — rytm dnia i pełny rejestr jobs.

## Integracje i warstwy danych

- [Integracja z portalem eMU](emu-workflow.md)
- [Baza wiedzy: FTS5 + embeddings](knowledge-base.md)
- [Stack technologiczny](tech-stack.md)
- [Przykłady przepływów](../examples/)
- [Diagram architektury SVG](../diagrams/architecture.svg)

## Zakres publiczny

Dokumentacja pokazuje wzorce, granice bezpieczeństwa i zanonimizowane przykłady. Nie zawiera wiadomości klientów, danych eMU, adresów e-mail, identyfikatorów rekordów ani sekretów.
