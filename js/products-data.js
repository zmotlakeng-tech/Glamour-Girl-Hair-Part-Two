/* ==========================================================================
   Glamour Girl Hair — product data (single source of truth)
   --------------------------------------------------------------------------
   Used by:
     - js/products.js  -> builds the product cards, search, filter and sort
     - js/forms.js     -> fills the enquiry dropdown and works out the
                          estimated cost / availability response
   Keeping the data in one JavaScript file (instead of a separate .json file)
   means the site also works when a page is opened straight from the folder
   (file://), because browsers block fetch() of local files.
   To add or change a product, edit this list only — nothing else needs to change.
   ========================================================================== */
(function (global) {
    'use strict';

    /* stock: "in" = In Stock, "low" = Low Stock (limited quantities) */
    var products = [
        {
            id: 'straight-14',
            name: '14\u2033 Straight Bundle',
            texture: 'straight',
            length: 14,
            price: 1200,
            stock: 'in',
            image: 'images/vietnamese-straight-hair-bundles.webp',
            width: 1023,
            height: 1537,
            alt: 'Three 14 inch Vietnamese straight human hair bundles with pink bands'
        },
        {
            id: 'straight-18',
            name: '18\u2033 Straight Bundle',
            texture: 'straight',
            length: 18,
            price: 1650,
            stock: 'in',
            image: 'images/straight-hair-bundles-with-lace-closure.webp',
            width: 1223,
            height: 1516,
            alt: 'Three 18 inch straight human hair bundles with a matching lace closure'
        },
        {
            id: 'straight-24',
            name: '24\u2033 Straight Bundle',
            texture: 'straight',
            length: 24,
            price: 2400,
            stock: 'low',
            image: 'images/virgin-straight-hair-bundles-double-weft.jpg',
            width: 1000,
            height: 1000,
            alt: 'Three 24 inch virgin straight hair bundles with a reinforced double weft'
        },
        {
            id: 'bodywave-20',
            name: 'Body Wave Bundle',
            texture: 'body wave',
            length: 20,
            price: 1450,
            stock: 'in',
            image: 'images/body-wave-hair-bundles.jpg',
            width: 244,
            height: 350,
            alt: 'Long body wave human hair bundles with soft flowing waves'
        },
        {
            id: 'curly-16',
            name: 'Curly Bundle',
            texture: 'curly',
            length: 16,
            price: 1550,
            stock: 'in',
            image: 'images/curly-hair-bundle-double-weft.jpg',
            width: 500,
            height: 500,
            alt: 'Curly human hair bundle with a tight, tangle-free double weft'
        },
        {
            id: 'deepwave-22',
            name: 'Deep Wave Bulk Hair',
            texture: 'deep wave',
            length: 22,
            price: 1700,
            stock: 'low',
            image: 'images/deep-wave-and-curly-bulk-hair.webp',
            width: 640,
            height: 620,
            alt: 'Deep wave, loose wave and curly bulk human hair side by side'
        }
    ];

    /* Friendly labels shown to visitors */
    var stockLabels = { in: 'In Stock', low: 'Low Stock' };
    var textureLabels = {
        'straight': 'Straight',
        'body wave': 'Body Wave',
        'curly': 'Curly',
        'deep wave': 'Deep Wave'
    };

    /* 1200 -> "R1,200" (same style the site already used) */
    function formatPrice(amount) {
        return 'R' + String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    function findProduct(id) {
        for (var i = 0; i < products.length; i++) {
            if (products[i].id === id) { return products[i]; }
        }
        return null;
    }

    global.GGH = global.GGH || {};
    global.GGH.products = products;
    global.GGH.stockLabels = stockLabels;
    global.GGH.textureLabels = textureLabels;
    global.GGH.formatPrice = formatPrice;
    global.GGH.findProduct = findProduct;
})(window);
