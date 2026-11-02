/* ==========================================================================
   Glamour Girl Hair — site-wide interactions (loaded on every page)
   --------------------------------------------------------------------------
   1. Tabs        ([data-tabs])        — texture explorer on the home page
   2. Accordion   ([data-accordion])   — FAQ on the About page
   3. Scroll reveal (.reveal)          — sections fade in as they scroll into view
   Everything is progressive enhancement: with JavaScript off, all content is
   still visible (see the ".js" rules in css/style.css).
   ========================================================================== */
(function () {
    'use strict';

    /* ---------- 1. TABS (WAI-ARIA tabs pattern, arrow-key navigation) ---------- */
    function initTabs(root) {
        var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
        var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));
        if (!tabs.length || tabs.length !== panels.length) { return; }

        function select(index, moveFocus) {
            tabs.forEach(function (tab, i) {
                var active = i === index;
                tab.setAttribute('aria-selected', active ? 'true' : 'false');
                tab.tabIndex = active ? 0 : -1;          /* only the active tab is in the Tab order */
                panels[i].hidden = !active;
                if (active) { panels[i].classList.add('is-active'); } else { panels[i].classList.remove('is-active'); }
            });
            if (moveFocus) { tabs[index].focus(); }
        }

        tabs.forEach(function (tab, i) {
            tab.addEventListener('click', function () { select(i, false); });
            tab.addEventListener('keydown', function (event) {
                var next = null;
                if (event.key === 'ArrowRight') { next = (i + 1) % tabs.length; }
                if (event.key === 'ArrowLeft') { next = (i - 1 + tabs.length) % tabs.length; }
                if (event.key === 'Home') { next = 0; }
                if (event.key === 'End') { next = tabs.length - 1; }
                if (next !== null) { event.preventDefault(); select(next, true); }
            });
        });

        select(0, false);
    }

    /* ---------- 2. ACCORDION (buttons + aria-expanded, one open at a time) ---------- */
    function initAccordion(root) {
        var triggers = Array.prototype.slice.call(root.querySelectorAll('.accordion-trigger'));

        function setOpen(trigger, open) {
            var panel = document.getElementById(trigger.getAttribute('aria-controls'));
            trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (panel) { panel.classList.toggle('is-open', open); }
        }

        triggers.forEach(function (trigger) {
            setOpen(trigger, false);
            trigger.addEventListener('click', function () {
                var willOpen = trigger.getAttribute('aria-expanded') !== 'true';
                triggers.forEach(function (other) { setOpen(other, false); });   /* close the others */
                setOpen(trigger, willOpen);
            });
        });
    }

    /* ---------- 3. SCROLL REVEAL ---------- */
    function initReveal() {
        var items = document.querySelectorAll('.reveal');
        if (!items.length) { return; }

        /* Old browsers without IntersectionObserver: just show everything */
        if (!('IntersectionObserver' in window)) {
            items.forEach(function (item) { item.classList.add('is-visible'); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);       /* animate once, then stop watching */
                }
            });
        }, { threshold: 0.12 });

        items.forEach(function (item) { observer.observe(item); });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('[data-tabs]').forEach(initTabs);
        document.querySelectorAll('[data-accordion]').forEach(initAccordion);
        initReveal();
    });
})();
