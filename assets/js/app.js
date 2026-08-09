const CRON_JOBS = [
  { name: 'mailops-email-alert', category: 'email', schedule: 'pn–pt · 07:05–16:05', description: 'Wychwytuje pilne wiadomości i wyjątki wymagające reakcji.' },
  { name: 'eMU Events Incremental Sync', category: 'emu', schedule: 'codziennie · 20:00', description: 'Domyka dzienny przyrost wydarzeń bez pełnego resyncu.' },
  { name: 'morning-briefing', category: 'briefing', schedule: 'codziennie · 07:00', description: 'Łączy pocztę, eMU, wydarzenia, zadania i stan systemu w jeden briefing.' },
  { name: 'email-draft-generator', category: 'email', schedule: 'pn–pt · 08:10–15:10', description: 'Buduje kontekst wątku i przygotowuje draft odpowiedzi.' },
  { name: 'erp-vault-git-pull', category: 'infra', schedule: 'pn–pt co 2 h · 08:15–16:15', description: 'Synchronizuje techniczny vault w kontrolowanych odstępach dnia pracy.' },
  { name: 'eMU Data Prune', category: 'emu', schedule: 'poniedziałek · 06:00', description: 'Czyści przeterminowany stan roboczy, zachowując dane audytowe.' },
  { name: 'sent-feedback-daily', category: 'email', schedule: 'codziennie · 18:00', description: 'Porównuje zaakceptowane drafty z realnie wysłanymi wiadomościami.' },
  { name: 'comarch-optima-monitoring', category: 'tech', schedule: 'co 7 dni', description: 'Monitoruje techniczne sygnały i zmiany istotne dla Comarch Optima.' },
  { name: 'eMU Changelog Monitor (wt)', category: 'emu', schedule: 'wtorek · 16:30', description: 'Sprawdza wtorkowe zmiany portalu i ich wpływ na automaty.' },
  { name: 'eMU Changelog Monitor (czw)', category: 'emu', schedule: 'czwartek · 08:05', description: 'Kontroluje drugi tygodniowy punkt zmian portalu eMU.' },
  { name: 'emu-return-briefing', category: 'briefing', schedule: 'pn–pt · 08:00', description: 'Zbiera sprawy zwrócone i wymagające ponownego działania.' },
  { name: 'weekly-report', category: 'briefing', schedule: 'piątek · 15:00', description: 'Podsumowuje wykonanie, opóźnienia, blokery i ryzyka tygodnia.' },
  { name: 'weekly-planning', category: 'briefing', schedule: 'niedziela · 18:00', description: 'Przygotowuje priorytety, zależności i plan wejścia w nowy tydzień.' },
  { name: 'evening-reminder', category: 'briefing', schedule: 'pn–pt · 17:00', description: 'Przypomina o otwartych wydarzeniach wymagających domknięcia.' },
  { name: 'eMU Events Morning Sync', category: 'emu', schedule: 'pn–pt · 06:45', description: 'Buduje poranny snapshot wydarzeń i zależności w eMU.' },
  { name: 'eMU Cancellation Check', category: 'emu', schedule: 'pn–pt · 08:30', description: 'Wysyła sygnał tylko po wykryciu anulowania lub istotnej zmiany.' },
  { name: 'eMU Mid-Day Change Alert', category: 'emu', schedule: 'pn–pt · 12:15', description: 'Porównuje bieżący stan dnia z porannym snapshotem.' },
  { name: 's14-execution-monitor', category: 'emu', schedule: 'pn–pt · 14:05', description: 'Monitoruje wykonanie grupy S14 i sygnalizuje odchylenia.' },
  { name: 'email-to-task-scan', category: 'email', schedule: 'co 15 min · 08:03–15:48', description: 'Klasyfikuje e-maile jako draft zadania, manual review lub skip.' },
  { name: 'proposal-notifier', category: 'email', schedule: 'co 15 min · 08:05–15:50', description: 'Publikuje nowe propozycje e-mail/eMU jako karty Decision Hub.' },
  { name: 'emu-proposal-deep-analyzer', category: 'emu', schedule: 'pn–pt · 21:30', description: 'Wykonuje pogłębioną analizę propozycji po zakończeniu dnia.' },
  { name: 'pipeline-health-check', category: 'infra', schedule: 'codziennie · 06:30', description: 'Kontroluje gotowość głównych skanerów przed rozpoczęciem dnia.' },
  { name: 'proposal-store-health-check', category: 'infra', schedule: 'codziennie · 06:35', description: 'Sprawdza proposal store, callbacki i kolejki decyzji.' },
  { name: 'ERP KB FTS5 auto-rebuild', category: 'knowledge', schedule: 'codziennie · 06:00', description: 'Odbudowuje indeks pełnotekstowy lokalnej bazy wiedzy.' },
  { name: 'wiki-nightly-healthcheck', category: 'knowledge', schedule: 'codziennie · 00:00', description: 'Kontroluje spójność wiki i lokalnych źródeł wiedzy.' },
  { name: 'weekend-skill-maintenance', category: 'infra', schedule: 'sobota i niedziela · 02:00', description: 'Testuje i porządkuje proceduralną pamięć agentów.' },
  { name: 'eMU SQLite Dual-Read Diagnostic', category: 'infra', schedule: 'pn–pt · 07:10, 12:10, 20:10', description: 'Porównuje dwie ścieżki odczytu i wykrywa regresje danych.' },
  { name: 'emu-comment-notification-scan', category: 'emu', schedule: 'co 15 min · 08:03–16:48', description: 'Wykrywa nowe komentarze w zadaniach i wydarzeniach.' },
  { name: 'emu-comment-reminder', category: 'emu', schedule: 'co 60 min · 09:10–16:10', description: 'Wraca tylko do nieobsłużonych komentarzy i odłożonych decyzji.' },
  { name: 'tech-worker-proposal-router', category: 'tech', schedule: 'co 15 min · 08:07–16:52', description: 'Tworzy idempotentne karty Kanban tylko dla spraw technicznych.' },
  { name: 'tech-worker-orchestrator-review', category: 'tech', schedule: 'co 15 min · 08:12–17:57', description: 'Weryfikuje REPORT.md, artefakty, testy i blokery specjalisty.' },
  { name: 'eMU assigned task tech scan', category: 'emu', schedule: 'co 15 min · 08:01–16:46', description: 'Czyta przypisane zadania, komentarze i załączniki bez zapisu do eMU.' },
  { name: 'emu-knowledge-weekly-report', category: 'knowledge', schedule: 'niedziela · 12:00', description: 'Raportuje jakość, pokrycie i problemy warstwy wiedzy eMU.' },
  { name: 'emu-msg-enrich-batch', category: 'knowledge', schedule: 'co 30 min', description: 'Rozpakowuje i wzbogaca wiadomości oraz załączniki MSG.' },
  { name: 'emu-kb-full-sync-batch', category: 'knowledge', schedule: 'co 15 min', description: 'Pobiera kolejne partie rekordów do kanonicznej bazy wiedzy.' },
  { name: 'emu-kb-progress-report', category: 'knowledge', schedule: 'codziennie · 07:00', description: 'Mierzy postęp i zgłasza zatrzymanie lub nieoczekiwany regres.' },
  { name: 'emu-kb-embedding-batch', category: 'knowledge', schedule: 'co 180 min', description: 'Aktualizuje wektory nomic-embed-text dla nowych treści.' },
  { name: 'customer-fingerprint-weekly-monitor', category: 'emu', schedule: 'poniedziałek · 09:20', description: 'Kontroluje jakość identyfikacji klientów z trwałych sygnałów.' },
  { name: 'tech-pipeline-watchdog', category: 'tech', schedule: 'pn–pt co 2 h · 08:00–16:00', description: 'Pilnuje timeoutów, zakleszczeń i brakujących handoffów.' },
  { name: 'hindsight-health-check', category: 'infra', schedule: 'co 4 h · :17', description: 'Weryfikuje dostępność i integralność pamięci wektorowej.' },
  { name: 'hindsight-daily-logical-backup', category: 'infra', schedule: 'codziennie · 03:20', description: 'Wykonuje logiczną kopię pamięci Hindsight.' },
  { name: 'db-daily-backup', category: 'infra', schedule: 'codziennie · 04:45', description: 'Tworzy i sprawdza kopie lokalnych baz danych systemu.' },
  { name: 'hermes-infra-watchdog', category: 'infra', schedule: 'co 30 min · 24/7', description: 'Kontroluje krytyczne usługi i stan infrastruktury Hermes.' },
];

const CATEGORY_LABELS = {
  email: 'email',
  emu: 'eMU',
  tech: 'tech-worker',
  knowledge: 'wiedza',
  briefing: 'briefing',
  infra: 'infra',
};

function setupNavigation() {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  const navLinks = [...document.querySelectorAll('.site-nav a')];

  const closeMenu = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Otwórz nawigację');
    nav.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  toggle?.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Otwórz nawigację' : 'Zamknij nawigację');
    nav?.classList.toggle('is-open', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 30);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('is-active', isCurrent);
        if (isCurrent) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-30% 0px -55%', threshold: [0.05, 0.2, 0.5] });
    sections.forEach((section) => activeObserver.observe(section));
  }
}

function setupWorkflowTabs() {
  const tabs = [...document.querySelectorAll('[data-workflow-tab]')];
  const panels = [...document.querySelectorAll('[data-workflow-panel]')];
  if (!tabs.length || !panels.length) return;

  const activateTab = (tab, moveFocus = false) => {
    const key = tab.dataset.workflowTab;
    tabs.forEach((candidate) => {
      const active = candidate === tab;
      candidate.setAttribute('aria-selected', String(active));
      candidate.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.workflowPanel !== key;
    });
    if (moveFocus) tab.focus();
  };

  const applyWorkflowHash = () => {
    const match = window.location.hash.match(/^#workflow=([^&]+)/);
    if (!match) return;
    const target = tabs.find((tab) => tab.dataset.workflowTab === match[1]);
    if (target) activateTab(target);
  };
  window.addEventListener('hashchange', applyWorkflowHash);

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      activateTab(tab);
      history.replaceState(null, '', `#workflow=${tab.dataset.workflowTab}`);
    });
    tab.addEventListener('keydown', (event) => {
      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      activateTab(tabs[nextIndex], true);
    });
  });
  applyWorkflowHash();
}

function createCronCard(job, index) {
  const article = document.createElement('article');
  article.className = 'cron-card';
  article.dataset.category = job.category;

  const number = document.createElement('span');
  number.className = 'cron-card-index';
  number.textContent = String(index + 1).padStart(2, '0');

  const content = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = job.name;
  const description = document.createElement('p');
  description.textContent = job.description;
  content.append(title, description);

  const meta = document.createElement('div');
  meta.className = 'cron-card-meta';
  const schedule = document.createElement('span');
  schedule.textContent = job.schedule;
  const category = document.createElement('span');
  category.className = `cron-category cron-category-${job.category}`;
  category.textContent = CATEGORY_LABELS[job.category];
  meta.append(schedule, category);

  article.append(number, content, meta);
  return article;
}

function setupCronExplorer() {
  const list = document.querySelector('[data-cron-list]');
  const count = document.querySelector('[data-cron-count]');
  const search = document.querySelector('[data-cron-search]');
  const filters = [...document.querySelectorAll('[data-cron-filter]')];
  if (!list || !count || !search || !filters.length) return;

  let activeCategory = 'all';

  const render = () => {
    const query = search.value.trim().toLocaleLowerCase('pl');
    const filtered = CRON_JOBS.filter((job) => {
      const categoryMatch = activeCategory === 'all' || job.category === activeCategory;
      const haystack = `${job.name} ${job.description} ${job.schedule} ${CATEGORY_LABELS[job.category]}`.toLocaleLowerCase('pl');
      return categoryMatch && (!query || haystack.includes(query));
    });

    list.replaceChildren();
    filtered.forEach((job) => list.append(createCronCard(job, CRON_JOBS.indexOf(job))));
    if (!filtered.length) {
      const empty = document.createElement('p');
      empty.className = 'cron-empty';
      empty.textContent = 'Brak automatyzacji spełniających te kryteria.';
      list.append(empty);
    }
    count.textContent = String(filtered.length);
  };

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.cronFilter;
      filters.forEach((candidate) => {
        const active = candidate === button;
        candidate.classList.toggle('is-active', active);
        candidate.setAttribute('aria-pressed', String(active));
      });
      render();
    });
  });

  search.addEventListener('input', render);
  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const editing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
    if (event.key === '/' && !editing) {
      event.preventDefault();
      search.focus();
    }
  });
  const applyCronHash = () => {
    const match = window.location.hash.match(/^#cron=([^&]+)/);
    if (!match) return;
    const name = match[1].replace(/\+/g, ' ');
    activeCategory = 'all';
    filters.forEach((button) => {
      const active = button.dataset.cronFilter === 'all';
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    search.value = name;
    render();
    document.querySelector('#cron-control')?.scrollIntoView({ behavior: 'auto', block: 'start' });
  };
  window.addEventListener('hashchange', applyCronHash);
  applyCronHash();
  render();
}

function setupEnglishDialog() {
  const dialog = document.querySelector('#english-summary');
  const openButton = document.querySelector('[data-open-english]');
  const closeButton = document.querySelector('[data-close-english]');
  if (!dialog || !openButton || !closeButton) return;

  openButton.addEventListener('click', () => dialog.showModal());
  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });
}

function setupRevealAnimations() {
  const items = [...document.querySelectorAll('[data-reveal]')];
  document.documentElement.classList.add('reveal-ready');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('is-revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -4%', threshold: 0.02 });
  items.forEach((item) => observer.observe(item));
}

function setupMobileEnglishAccess() {
  const nav = document.querySelector('.site-nav');
  const openEnglish = document.querySelector('[data-open-english]');
  if (!nav || !openEnglish || nav.querySelector('[data-mobile-english]')) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.mobileEnglish = '';
  button.textContent = 'English summary';
  button.addEventListener('click', () => {
    document.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    document.body.style.overflow = '';
    openEnglish.click();
  });
  const media = window.matchMedia('(max-width: 760px)');
  const sync = () => {
    if (media.matches && !button.isConnected) nav.append(button);
    else if (!media.matches && button.isConnected) button.remove();
  };
  sync();
  media.addEventListener('change', sync);
}

function bootstrap() {
  setupNavigation();
  setupWorkflowTabs();
  setupCronExplorer();
  setupEnglishDialog();
  setupRevealAnimations();
  setupMobileEnglishAccess();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootstrap);
else bootstrap();
