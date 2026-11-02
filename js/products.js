/* ==========================================================================
   Glamour Girl Hair — product listing (products.html)
   --------------------------------------------------------------------------
   Builds the product cards from GGH.products (js/products-data.js) and adds:
     - live search       (name or texture, as the visitor types)
     - texture filter    (straight / body wave / curly / deep wave)
     - "in stock only"   checkbox
     - sorting           (price, length, name)
   Visitors can also arrive with a ready-made filter, e.g.
   products.html?texture=curly  (the home page texture tabs link this way).
   Cards are made with createElement/textContent (never innerHTML), so product
   text can never be interpreted as HTML.
   ========================================================================== */
(function (global) {
    'use strict';

    /* ---------- pure logic: easy to test, no page needed ---------- */
    function filterAndSort(products, state) {
        var query = String(state.query || '').trim().toLowerCase();

        var result = products.filter(function (p) {
            if (state.texture && state.texture !== 'all' && p.texture !== state.texture) { return false; }
            if (state.inStockOnly && p.stock !== 'in') { return false; }
            if (query) {
                var haystack = (p.name + ' ' + p.texture + ' ' + p.length + ' inch').toLowerCase();
                /* every word typed must appear somewhere, so "curly 16" or "wave bundle" both work */
                return query.split(/\s+/).every(function (word) { return haystack.indexOf(word) !== -1; });
            }
            return true;
        });

        var sorters = {
            'price-asc':  function (a, b) { return a.price - b.price; },
            'price-desc': function (a, b) { return b.price - a.price; },
            'length-asc': function (a, b) { return a.length - b.length; },
            'length-desc': function (a, b) { return b.length - a.length; },
            'name':       function (a, b) { return a.name.localeCompare(b.name); }
        };
        if (sorters[state.sort]) { result = result.slice().sort(sorters[state.sort]); }
        return result;
    }

    global.GGH = global.GGH || {};
    global.GGH.filterAndSort = filterAndSort;

    if (typeof document === 'undefined') {
        if (typeof module !== 'undefined' && module.exports) { module.exports = { filterAndSort: filterAndSort }; }
        return;
    }

    /* ---------- page wiring ---------- */
    var grid = document.getElementById('product-grid');
    if (!grid || !global.GGH.products) { return; }

    var searchInput = document.getElementById('product-search');
    var textureSelect = document.getElementById('texture-filter');
    var sortSelect = document.getElementById('product-sort');
    var stockCheckbox = document.getElementById('in-stock-only');
    var resetButton = document.getElementById('reset-filters');
    var countEl = document.getElementById('result-count');
    var emptyEl = document.getElementById('no-results');
    var emptyResetButton = document.getElementById('empty-reset');

    function element(tag, className, text) {
        var el = document.createElement(tag);
        if (className) { el.className = className; }
        if (text !== undefined) { el.textContent = text; }
        return el;
    }

    function buildCard(p) {
        var card = element('article', 'product-card');

        /* the picture is a link to the full-size image; lightbox.js opens it in a modal */
        var imageLink = element('a', 'product-image-link');
        imageLink.href = p.image;
        imageLink.setAttribute('data-lightbox', 'products');
        imageLink.setAttribute('data-caption', p.name + ' \u2014 ' + global.GGH.formatPrice(p.price));
        imageLink.setAttribute('aria-label', 'View larger image: ' + p.name);

        var img = document.createElement('img');
        img.src = p.image;
        img.alt = p.alt;
        img.width = p.width;
        img.height = p.height;
        img.loading = 'lazy';
        imageLink.appendChild(img);
        imageLink.appendChild(element('span', 'zoom-hint', 'View larger'));

        var body = element('div', 'product-body');
        body.appendChild(element('h3', 'product-name', p.name));
        body.appendChild(element('p', 'product-meta',
            global.GGH.textureLabels[p.texture] + ' \u00B7 ' + p.length + '\u2033'));
        body.appendChild(element('p', 'price', global.GGH.formatPrice(p.price)));
        body.appendChild(element('p', 'stock stock-' + p.stock, global.GGH.stockLabels[p.stock]));

        var enquire = element('a', 'btn btn-outline btn-small', 'Enquire about this bundle');
        enquire.href = 'enquiry.html?product=' + encodeURIComponent(p.id);
        body.appendChild(enquire);

        card.appendChild(imageLink);
        card.appendChild(body);
        return card;
    }

    function currentState() {
        return {
            query: searchInput ? searchInput.value : '',
            texture: textureSelect ? textureSelect.value : 'all',
            sort: sortSelect ? sortSelect.value : 'featured',
            inStockOnly: stockCheckbox ? stockCheckbox.checked : false
        };
    }

    function render() {
        var all = global.GGH.products;
        var shown = filterAndSort(all, currentState());

        grid.textContent = '';                                   /* clear the old cards */
        shown.forEach(function (p) { grid.appendChild(buildCard(p)); });

        countEl.textContent = shown.length === 0
            ? 'No bundles match your search.'
            : 'Showing ' + shown.length + ' of ' + all.length + ' bundle' + (all.length === 1 ? '' : 's') + '.';
        emptyEl.hidden = shown.length !== 0;
        grid.hidden = shown.length === 0;
    }

    function reset() {
        searchInput.value = '';
        textureSelect.value = 'all';
        sortSelect.value = 'featured';
        stockCheckbox.checked = false;
        render();
        searchInput.focus();
    }

    /* Pre-fill from the address, e.g. ?texture=curly or ?q=24 */
    function applyQueryString() {
        var params = new URLSearchParams(global.location.search);
        var texture = params.get('texture');
        var q = params.get('q');
        if (texture && textureSelect) {
            var known = Array.prototype.some.call(textureSelect.options, function (o) { return o.value === texture; });
            if (known) { textureSelect.value = texture; }
        }
        if (q && searchInput) { searchInput.value = q.slice(0, 40); }
    }

    [searchInput, textureSelect, sortSelect, stockCheckbox].forEach(function (control) {
        if (!control) { return; }
        control.addEventListener(control === searchInput ? 'input' : 'change', render);
    });
    if (resetButton) { resetButton.addEventListener('click', reset); }
    if (emptyResetButton) { emptyResetButton.addEventListener('click', reset); }

    /* pressing Enter inside the search box should not reload the page */
    var form = document.getElementById('product-filters');
    if (form) { form.addEventListener('submit', function (e) { e.preventDefault(); }); }

    applyQueryString();
    render();
})(typeof window !== 'undefined' ? window : globalThis);
