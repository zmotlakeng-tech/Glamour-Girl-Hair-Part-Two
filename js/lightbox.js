/* ==========================================================================
   Glamour Girl Hair — gallery lightbox
   --------------------------------------------------------------------------
   Any link marked  <a href="big-image.jpg" data-lightbox="group-name">  opens
   its image full-size in a modal. Links that share the same group name can be
   stepped through with Previous / Next (or the arrow keys).
   Uses the native <dialog> element, which gives us Esc-to-close, a dimmed
   backdrop and keyboard focus trapping for free. If a browser has no <dialog>
   support, the link just opens the image normally, so nothing breaks.
   Click handling is delegated to the document, so it also works for product
   cards that JavaScript adds after the page has loaded.
   ========================================================================== */
(function () {
    'use strict';

    if (typeof HTMLDialogElement === 'undefined') { return; }

    var dialog, imageEl, captionEl, counterEl, prevBtn, nextBtn, closeBtn;
    var group = [];      /* the links in the currently open group */
    var index = 0;       /* which one is showing */
    var opener = null;   /* the link that opened the lightbox, so focus can go back to it */

    function build() {
        dialog = document.createElement('dialog');
        dialog.className = 'lightbox';
        dialog.setAttribute('aria-label', 'Image viewer');

        closeBtn = makeButton('lightbox-close', 'Close image viewer', '\u00D7');
        prevBtn = makeButton('lightbox-prev', 'Previous image', '\u2039');
        nextBtn = makeButton('lightbox-next', 'Next image', '\u203A');

        var figure = document.createElement('figure');
        figure.className = 'lightbox-figure';

        imageEl = document.createElement('img');
        imageEl.className = 'lightbox-image';
        imageEl.alt = '';

        var caption = document.createElement('figcaption');
        captionEl = document.createElement('span');
        captionEl.className = 'lightbox-caption';
        counterEl = document.createElement('span');
        counterEl.className = 'lightbox-counter';
        caption.appendChild(captionEl);
        caption.appendChild(counterEl);

        figure.appendChild(imageEl);
        figure.appendChild(caption);
        dialog.appendChild(closeBtn);
        dialog.appendChild(prevBtn);
        dialog.appendChild(figure);
        dialog.appendChild(nextBtn);
        document.body.appendChild(dialog);

        closeBtn.addEventListener('click', function () { dialog.close(); });
        prevBtn.addEventListener('click', function () { show(index - 1); });
        nextBtn.addEventListener('click', function () { show(index + 1); });

        /* clicking the dimmed backdrop (the dialog element itself) closes it */
        dialog.addEventListener('click', function (event) {
            if (event.target === dialog) { dialog.close(); }
        });

        dialog.addEventListener('keydown', function (event) {
            if (event.key === 'ArrowLeft') { show(index - 1); }
            if (event.key === 'ArrowRight') { show(index + 1); }
        });

        /* give focus back to where the visitor was, and let the page scroll again */
        dialog.addEventListener('close', function () {
            document.body.classList.remove('lightbox-open');
            if (opener && document.contains(opener)) { opener.focus(); }
        });
    }

    function makeButton(className, label, symbol) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'lightbox-btn ' + className;
        button.setAttribute('aria-label', label);
        button.textContent = symbol;
        return button;
    }

    function show(newIndex) {
        if (!group.length) { return; }
        index = (newIndex + group.length) % group.length;     /* wrap around at both ends */
        var link = group[index];
        var thumb = link.querySelector('img');

        imageEl.src = link.getAttribute('href');
        imageEl.alt = thumb ? thumb.alt : '';
        captionEl.textContent = link.getAttribute('data-caption') || (thumb ? thumb.alt : '');
        counterEl.textContent = group.length > 1 ? (index + 1) + ' / ' + group.length : '';

        var single = group.length < 2;
        prevBtn.hidden = single;
        nextBtn.hidden = single;
    }

    function open(link) {
        if (!dialog) { build(); }
        var name = link.getAttribute('data-lightbox');
        group = Array.prototype.slice.call(document.querySelectorAll('a[data-lightbox="' + name + '"]'));
        opener = link;
        show(group.indexOf(link));
        document.body.classList.add('lightbox-open');
        dialog.showModal();
        closeBtn.focus();
    }

    document.addEventListener('click', function (event) {
        var link = event.target.closest ? event.target.closest('a[data-lightbox]') : null;
        if (!link) { return; }
        /* let ctrl/cmd/middle-click open the image in a new tab as usual */
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) { return; }
        event.preventDefault();
        open(link);
    });
})();
