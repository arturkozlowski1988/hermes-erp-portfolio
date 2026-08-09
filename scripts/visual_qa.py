from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parents[1] / ".qa"
OUT.mkdir(exist_ok=True)
CASES = [
    ("desktop-hero", 1440, 1000, "#hero"),
    ("desktop-workflows", 1440, 1000, "#workflows"),
    ("desktop-mini-apps", 1440, 1100, "#mini-apps"),
    ("desktop-cron", 1440, 1100, "#cron-control"),
    ("mobile-hero", 390, 844, "#hero"),
    ("mobile-workflows", 390, 844, "#workflows"),
    ("mobile-mini-apps", 390, 844, "#mini-apps"),
    ("mobile-cron", 390, 844, "#cron-control"),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-sandbox"])
    for name, width, height, selector in CASES:
        page = browser.new_page(viewport={"width": width, "height": height})
        messages = []
        page.on("console", lambda msg: messages.append(f"{msg.type}: {msg.text}") if msg.type in ("error", "warning") else None)
        page.on("pageerror", lambda exc: messages.append(f"pageerror: {exc}"))
        page.goto("http://127.0.0.1:4173/", wait_until="networkidle")
        page.evaluate(
            """selector => {
                document.documentElement.style.scrollBehavior = 'auto';
                const target = document.querySelector(selector);
                window.scrollTo(0, Math.max(0, target.offsetTop - 72));
            }""",
            selector,
        )
        page.wait_for_timeout(250)
        page.screenshot(path=str(OUT / f"{name}.png"), full_page=False)
        overflow = page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        print(f"{name}: overflow={overflow}, console={len(messages)}")
        for message in messages:
            print(f"  {message}")
        if overflow or messages:
            raise SystemExit(f"QA failure in {name}: overflow={overflow}, messages={messages}")
        page.close()

    # Functional smoke test — controls must change actual page state.
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.goto("http://127.0.0.1:4173/", wait_until="networkidle")
    page.locator("#tab-worker").click()
    assert page.locator("#panel-worker").is_visible()
    assert page.locator("#tab-worker").get_attribute("aria-selected") == "true"

    page.locator("[data-cron-filter='tech']").click()
    assert page.locator("[data-cron-list] .cron-card").count() == 4
    assert page.locator("[data-cron-count]").inner_text().strip() == "4"

    page.locator("[data-cron-filter='all']").click()
    page.locator("[data-cron-search]").fill("backup")
    assert page.locator("[data-cron-list] .cron-card").count() >= 2

    page.locator("[data-open-english]").click()
    assert page.locator("#english-summary").is_visible()
    page.locator("[data-close-english]").click()
    assert not page.locator("#english-summary").is_visible()
    page.close()

    mobile = browser.new_page(viewport={"width": 390, "height": 844})
    mobile.goto("http://127.0.0.1:4173/", wait_until="networkidle")
    mobile.locator(".nav-toggle").click()
    assert "is-open" in (mobile.locator("#site-nav").get_attribute("class") or "")
    mobile.locator("[data-mobile-english]").click()
    assert mobile.locator("#english-summary").is_visible()
    assert "is-open" not in (mobile.locator("#site-nav").get_attribute("class") or "")
    mobile.close()
    print("interactions: workflow=ok, cron=ok, dialog=ok, mobile-nav=ok")

    # Progressive enhancement: public content must remain readable without JS.
    no_js_context = browser.new_context(
        java_script_enabled=False,
        viewport={"width": 1280, "height": 900},
    )
    no_js = no_js_context.new_page()
    no_js.goto("http://127.0.0.1:4173/", wait_until="load")
    assert no_js.locator("#hero h1").is_visible()
    assert no_js.locator("#mini-apps h2").is_visible()
    assert no_js.locator("[data-reveal]").first.evaluate(
        "element => getComputedStyle(element).opacity"
    ) == "1"
    assert no_js.locator(".noscript-note").is_visible()
    no_js.screenshot(path=str(OUT / "no-js-fallback.png"), full_page=False)
    no_js_context.close()
    print("progressive-enhancement: no-js=ok")

    axe_page = browser.new_page(viewport={"width": 1440, "height": 1000})
    axe_page.goto("http://127.0.0.1:4173/", wait_until="networkidle")
    # Finish all reveal animations before evaluating contrast (below-fold
    # elements start at opacity 0 and axe must measure final colors).
    axe_page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    axe_page.wait_for_timeout(1200)
    axe_page.evaluate("window.scrollTo(0, 0)")
    axe_page.wait_for_timeout(900)
    axe_page.add_script_tag(url="https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js")
    axe_result = axe_page.evaluate(
        """async () => await axe.run(document, {
            runOnly: {
                type: 'tag',
                values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
            }
        })"""
    )
    violations = axe_result["violations"]
    print(f"axe-wcag-aa: violations={len(violations)}")
    for violation in violations:
        print(f"  {violation['impact']} {violation['id']}: {violation['help']} ({len(violation['nodes'])} nodes)")
        for node in violation["nodes"]:
            print(f"    target={node['target']} :: {node['failureSummary']}")
    if violations:
        raise SystemExit("WCAG AA violations detected")
    axe_page.close()
    browser.close()
