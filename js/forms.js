/* ==========================================================================
   Glamour Girl Hair — form handling (enquiry.html and contact.html)
   --------------------------------------------------------------------------
   Both forms share one small validation engine (section 1) and then do
   different jobs once the input is valid:

     ENQUIRY form  -> works out an estimated cost + availability, shows it
                      immediately, and sends the enquiry in the background
                      with AJAX (fetch) so the page never reloads.
     CONTACT form  -> compiles the details into an email and lets the visitor
                      send it to the recipient set in data-recipient (mailto).

   The rules themselves live in js/validation.js. Product data comes from
   js/products-data.js. User text is only ever put on the page with
   textContent, never innerHTML.
   ========================================================================== */
(function (global) {
    'use strict';

    var V = global.GGH && global.GGH.validate;
    if (!V) { return; }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) { node.className = className; }
        if (text !== undefined) { node.textContent = text; }
        return node;
    }

    var INTEREST_LABELS = {
        bundles: 'Bundles',
        wigs: 'Wigs',
        install: 'Professional install',
        other: 'Something else'
    };
    var METHOD_LABELS = { email: 'Email', whatsapp: 'WhatsApp', phone: 'Phone call' };
    var TYPE_LABELS = {
        general: 'General question',
        feedback: 'Feedback or compliment',
        complaint: 'Complaint',
        partnership: 'Collaboration or partnership',
        other: 'Other'
    };

    /* ======================================================================
       1. VALIDATION ENGINE
       Each field sits in a wrapper:  <div data-field="name"> ... </div>
       with an error line:            <p data-error-for="name" hidden></p>
       ====================================================================== */
    function createValidator(form, rules) {
        var touched = {};
        var names = Array.prototype.map.call(form.querySelectorAll('[data-field]'), function (w) {
            return w.getAttribute('data-field');
        }).filter(function (name) { return typeof rules[name] === 'function'; });

        function wrapper(name) { return form.querySelector('[data-field="' + name + '"]'); }
        function isActive(name) { var w = wrapper(name); return !!w && !w.hidden; }

        /* current value of a field: radio -> chosen value, checkbox -> 'yes' or '', others -> text */
        function get(name) {
            var w = wrapper(name);
            if (!w) { return ''; }
            if (w.querySelector('input[type="radio"]')) {
                var chosen = w.querySelector('input[type="radio"]:checked');
                return chosen ? chosen.value : '';
            }
            var box = w.querySelector('input[type="checkbox"]');
            if (box) { return box.checked ? 'yes' : ''; }
            var control = w.querySelector('input, select, textarea');
            return control ? control.value : '';
        }

        function show(name, message) {
            var w = wrapper(name);
            var out = form.querySelector('[data-error-for="' + name + '"]');
            if (!w || !out) { return; }
            w.classList.toggle('has-error', !!message);
            Array.prototype.forEach.call(w.querySelectorAll('input, select, textarea'), function (control) {
                if (message) { control.setAttribute('aria-invalid', 'true'); }
                else { control.removeAttribute('aria-invalid'); }
            });
            out.textContent = message;     /* the line keeps its height when empty, so the form never jumps while someone is clicking */
        }

        function check(name) {
            if (!isActive(name)) { show(name, ''); return ''; }      /* hidden conditional fields are skipped */
            var message = rules[name](get);
            show(name, message);
            return message;
        }

        function checkAll() {
            var errors = [];
            names.forEach(function (name) {
                var message = check(name);
                if (message) { errors.push({ name: name, message: message }); }
            });
            return errors;
        }

        function firstControl(name) {
            var w = wrapper(name);
            return w ? w.querySelector('input, select, textarea') : null;
        }

        function labelFor(name) {
            var w = wrapper(name);
            var label = w && w.querySelector('label, legend');
            return label ? label.textContent.replace(/\*/g, '').replace(/\(optional\)/i, '').trim() : name;
        }

        /* the red box at the top of the form that lists what needs fixing */
        function showSummary(errors) {
            var box = form.querySelector('.form-summary');
            if (!box) { return; }
            box.textContent = '';
            box.appendChild(el('p', 'form-summary-title',
                errors.length === 1 ? 'Please fix 1 problem before sending:' : 'Please fix ' + errors.length + ' problems before sending:'));
            var list = el('ul');
            errors.forEach(function (err) {
                var item = el('li');
                var link = el('a', '', labelFor(err.name) + ': ' + err.message);
                var control = firstControl(err.name);
                link.href = '#' + (control && control.id ? control.id : '');
                link.addEventListener('click', function (event) {
                    event.preventDefault();
                    if (control) { control.focus(); }
                });
                item.appendChild(link);
                list.appendChild(item);
            });
            box.appendChild(list);
            box.hidden = false;
            box.focus();
        }

        function hideSummary() {
            var box = form.querySelector('.form-summary');
            if (box) { box.hidden = true; box.textContent = ''; }
        }

        /* validate a field as the visitor leaves it, then keep it up to date while they fix it */
        form.addEventListener('focusout', function (event) {
            var w = event.target.closest && event.target.closest('[data-field]');
            if (!w) { return; }
            var type = event.target.type;
            if (type === 'radio' || type === 'checkbox') { return; }    /* these validate on change */
            var name = w.getAttribute('data-field');
            if (typeof rules[name] !== 'function') { return; }
            touched[name] = true;
            check(name);
        });

        function onChange(event) {
            var w = event.target.closest && event.target.closest('[data-field]');
            if (w) {
                var changed = w.getAttribute('data-field');
                var type = event.target.type;
                if (type === 'radio' || type === 'checkbox' || event.target.tagName === 'SELECT') {
                    touched[changed] = true;
                }
            }
            /* re-check every field the visitor has already been to (one answer can affect another,
               e.g. choosing "Phone call" makes the phone number required) */
            names.forEach(function (name) { if (touched[name]) { check(name); } });
        }
        form.addEventListener('input', onChange);
        form.addEventListener('change', onChange);

        function reset() {
            touched = {};
            names.forEach(function (name) { show(name, ''); });
            hideSummary();
        }

        return {
            get: get,
            check: check,
            checkAll: checkAll,
            showSummary: showSummary,
            hideSummary: hideSummary,
            focusField: function (name) { var c = firstControl(name); if (c) { c.focus(); } },
            reset: reset
        };
    }

    /* "0 / 500" counters under text areas */
    function initCounters(form) {
        Array.prototype.forEach.call(form.querySelectorAll('[data-count-for]'), function (counter) {
            var control = document.getElementById(counter.getAttribute('data-count-for'));
            if (!control) { return; }
            var max = control.maxLength > 0 ? control.maxLength : 0;
            function update() {
                var length = control.value.length;
                counter.textContent = length + (max ? ' / ' + max : '') + ' characters';
                counter.classList.toggle('is-near-limit', max > 0 && length >= max * 0.9);
            }
            control.addEventListener('input', update);
            update();
        });
    }

    /* show or hide a block of fields; disabled controls are skipped by validation AND by the submitted data */
    function setConditional(wrapperEl, visible) {
        wrapperEl.hidden = !visible;
        Array.prototype.forEach.call(wrapperEl.querySelectorAll('input, select, textarea'), function (c) {
            c.disabled = !visible;
        });
    }

    /* ======================================================================
       2. ENQUIRY RESPONSE (pure: takes the answers, returns what to show)
       ====================================================================== */
    function buildEnquiryResponse(values, products) {
        var lines = [];
        var notes = [];
        lines.push({ label: 'Interested in', value: INTEREST_LABELS[values.interest] || values.interest });

        if (values.interest === 'bundles') {
            var product = null;
            for (var i = 0; i < products.length; i++) {
                if (products[i].id === values.product) { product = products[i]; }
            }
            var qty = parseInt(values.quantity, 10);
            if (product && qty) {
                var total = product.price * qty;
                lines.push({ label: 'Bundle', value: product.name });
                lines.push({ label: 'Quantity', value: String(qty) });
                lines.push({ label: 'Price each', value: global.GGH.formatPrice(product.price) });
                lines.push({ label: 'Estimated total', value: global.GGH.formatPrice(total), highlight: true });

                var availability;
                if (product.stock === 'in') {
                    availability = 'In stock. We will confirm availability for your quantity when we reply.';
                } else if (qty >= 2) {
                    availability = 'Low stock. We will check that all ' + qty + ' bundles are still available and confirm when we reply.';
                } else {
                    availability = 'Low stock. Only limited bundles remain, so get in touch soon to secure yours.';
                }
                lines.push({ label: 'Availability', value: availability, status: product.stock });
                notes.push('This is an estimate based on our listed prices. We confirm the final amount when we reply.');
            }
        } else if (values.interest === 'wigs') {
            lines.push({ label: 'Pricing', value: 'Wigs are quoted individually, depending on the texture, length and style you want.' });
            notes.push('We will reply with a quote and availability.');
        } else if (values.interest === 'install') {
            lines.push({ label: 'Pricing', value: 'Professional installs are quoted once we know your hair type and the style you want.' });
            notes.push('We will reply with a price and the dates we have available.');
        } else {
            lines.push({ label: 'Next step', value: 'We will read your message and reply with the right information.' });
        }

        if (values.neededBy) { lines.push({ label: 'Needed by', value: values.neededBy }); }
        lines.push({ label: 'We will reply by', value: METHOD_LABELS[values.contactMethod] || values.contactMethod });

        return { lines: lines, notes: notes };
    }

    /* ======================================================================
       3. CONTACT EMAIL (pure: takes the answers, returns the compiled email)
       ====================================================================== */
    function buildEmail(values, recipient) {
        var subject = '[' + (TYPE_LABELS[values.messageType] || 'Message') + '] ' + values.subject.trim();
        var body = [
            'Hello Glamour Girl Hair team,',
            '',
            values.message.trim(),
            '',
            'Kind regards,',
            values.name.trim(),
            '',
            'Email: ' + values.email.trim()
        ];
        if (values.phone && values.phone.trim()) { body.push('Phone: ' + values.phone.trim()); }
        body.push('Preferred reply method: ' + (METHOD_LABELS[values.contactMethod] || values.contactMethod));
        body.push('Message type: ' + (TYPE_LABELS[values.messageType] || values.messageType));

        var text = body.join('\r\n');
        return {
            to: recipient,
            subject: subject,
            body: text,
            href: 'mailto:' + recipient + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text)
        };
    }

    global.GGH.buildEnquiryResponse = buildEnquiryResponse;
    global.GGH.buildEmail = buildEmail;

    if (typeof document === 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = { buildEnquiryResponse: buildEnquiryResponse, buildEmail: buildEmail };
        }
        return;
    }

    /* ======================================================================
       4. ENQUIRY PAGE
       ====================================================================== */
    function initEnquiry(form) {
        var products = global.GGH.products || [];
        var productSelect = form.querySelector('#product');
        var interestSelect = form.querySelector('#interest');
        var quantityInput = form.querySelector('#quantity');
        var estimateEl = form.querySelector('#live-estimate');
        var dateInput = form.querySelector('#neededBy');
        var productGroup = form.querySelector('[data-field="product"]');
        var quantityGroup = form.querySelector('[data-field="quantity"]');
        var responsePanel = document.getElementById('enquiry-response');
        var statusEl = document.getElementById('send-status');
        var submitButton = form.querySelector('button[type="submit"]');

        form.noValidate = true;     /* our own friendly messages replace the browser's pop-ups */

        /* fill the bundle dropdown from the product data */
        products.forEach(function (p) {
            var option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.name + ' \u2014 ' + global.GGH.formatPrice(p.price) + ' (' + global.GGH.stockLabels[p.stock] + ')';
            productSelect.appendChild(option);
        });

        /* the date picker only offers today up to a year from now */
        var today = new Date();
        dateInput.min = V.toDateString(today);
        dateInput.max = V.toDateString(V.addDays(today, 365));

        var validator = createValidator(form, {
            name: function (get) { return V.validateName(get('name')); },
            email: function (get) { return V.validateEmail(get('email')); },
            contactMethod: function (get) { return get('contactMethod') ? '' : 'Please choose how you would like us to reply.'; },
            phone: function (get) {
                var needsPhone = get('contactMethod') === 'whatsapp' || get('contactMethod') === 'phone';
                return V.validatePhone(get('phone'), needsPhone);
            },
            interest: function (get) { return V.validateSelect(get('interest'), 'Please choose what you are interested in.'); },
            product: function (get) { return V.validateSelect(get('product'), 'Please choose a bundle.'); },
            quantity: function (get) { return V.validateQuantity(get('quantity')); },
            neededBy: function (get) { return V.validateDate(get('neededBy'), new Date()); },
            message: function (get) { return V.validateText(get('message'), 'your message', 10, 500); },
            consent: function (get) { return get('consent') ? '' : 'Please tick the box so we can contact you about this enquiry.'; }
        });

        /* bundle questions only appear when "Bundles" is chosen */
        function syncConditionalFields() {
            var showBundles = interestSelect.value === 'bundles';
            setConditional(productGroup, showBundles);
            setConditional(quantityGroup, showBundles);
            updateEstimate();
        }

        /* live "Estimated total" line under the quantity box */
        function updateEstimate() {
            var product = global.GGH.findProduct(productSelect.value);
            var qty = parseInt(quantityInput.value, 10);
            if (interestSelect.value === 'bundles' && product && qty >= 1 && qty <= 10) {
                estimateEl.textContent = 'Estimated total: ' + global.GGH.formatPrice(product.price * qty);
            } else {
                estimateEl.textContent = '';
            }
        }
        interestSelect.addEventListener('change', syncConditionalFields);
        productSelect.addEventListener('change', updateEstimate);
        quantityInput.addEventListener('input', updateEstimate);

        /* arriving from a product card: enquiry.html?product=curly-16 */
        var wanted = new URLSearchParams(global.location.search).get('product');
        if (wanted && global.GGH.findProduct(wanted)) {
            interestSelect.value = 'bundles';
            productSelect.value = wanted;
        }
        syncConditionalFields();
        initCounters(form);

        function currentValues() {
            return {
                name: validator.get('name').trim(),
                email: validator.get('email').trim(),
                contactMethod: validator.get('contactMethod'),
                interest: validator.get('interest'),
                product: validator.get('product'),
                quantity: validator.get('quantity'),
                neededBy: validator.get('neededBy')
            };
        }

        function showResponse(values, result) {
            responsePanel.textContent = '';
            responsePanel.appendChild(el('h2', 'response-title', 'Thank you, ' + values.name.split(' ')[0] + '!'));
            responsePanel.appendChild(el('p', 'response-intro', 'Here is what we have worked out from your enquiry:'));

            var list = el('dl', 'response-list');
            result.lines.forEach(function (line) {
                var row = el('div', 'response-row' + (line.highlight ? ' is-highlight' : ''));
                row.appendChild(el('dt', '', line.label));
                var dd = el('dd', line.status ? 'availability availability-' + line.status : '', line.value);
                row.appendChild(dd);
                list.appendChild(row);
            });
            responsePanel.appendChild(list);
            result.notes.forEach(function (note) { responsePanel.appendChild(el('p', 'response-note', note)); });

            var send = el('p', 'send-status', '');
            send.id = 'send-status';
            send.setAttribute('role', 'status');
            responsePanel.appendChild(send);

            var actions = el('div', 'response-actions');
            var whatsappNumber = form.getAttribute('data-whatsapp') || '';
            var summaryText = 'Hi Glamour Girl Hair, I just sent an enquiry. ' +
                result.lines.map(function (l) { return l.label + ': ' + l.value; }).join('. ');
            var wa = el('a', 'btn btn-primary', 'Continue on WhatsApp');
            wa.href = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent(summaryText);
            wa.target = '_blank';
            wa.rel = 'noopener noreferrer';
            var edit = el('button', 'btn btn-outline', 'Edit my enquiry');
            edit.type = 'button';
            edit.addEventListener('click', function () {
                responsePanel.hidden = true;
                form.hidden = false;
                validator.focusField('name');
            });
            var fresh = el('button', 'btn btn-outline', 'Start a new enquiry');
            fresh.type = 'button';
            fresh.addEventListener('click', function () {
                form.reset();
                validator.reset();
                syncConditionalFields();
                form.querySelector('#message').dispatchEvent(new Event('input', { bubbles: true }));   /* refresh the character counter */
                responsePanel.hidden = true;
                form.hidden = false;
                validator.focusField('name');
            });
            actions.appendChild(wa);
            actions.appendChild(edit);
            actions.appendChild(fresh);
            responsePanel.appendChild(actions);

            form.hidden = true;
            responsePanel.hidden = false;
            responsePanel.setAttribute('tabindex', '-1');
            responsePanel.focus();
            statusEl = send;
        }

        function setStatus(state) {
            if (!statusEl) { return; }
            var messages = {
                sending: 'Sending your enquiry to our team\u2026',
                sent: '\u2713 Your enquiry has been sent to our team. We will reply soon.',
                failed: 'We could not send your enquiry automatically (you may be offline). Please tap \u201CContinue on WhatsApp\u201D so it still reaches us.'
            };
            statusEl.textContent = messages[state] || '';
            statusEl.className = 'send-status send-' + state;
        }

        /* AJAX: send the form in the background with fetch, no page reload */
        function sendInBackground(estimateText) {
            var endpoint = form.getAttribute('data-ajax-endpoint');
            if (!endpoint || typeof fetch !== 'function') { setStatus('failed'); return; }

            var data = new FormData(form);
            if (estimateText) { data.append('estimate', estimateText); }

            var controller = typeof AbortController === 'function' ? new AbortController() : null;
            var timer = controller ? setTimeout(function () { controller.abort(); }, 12000) : null;
            setStatus('sending');
            submitButton.disabled = true;

            fetch(endpoint, {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' },
                signal: controller ? controller.signal : undefined
            }).then(function (response) {
                return response.json().catch(function () { return {}; }).then(function (json) {
                    if (!response.ok || json.success === false || json.success === 'false') { throw new Error('rejected'); }
                    setStatus('sent');
                });
            }).catch(function () {
                setStatus('failed');
            }).then(function () {
                if (timer) { clearTimeout(timer); }
                submitButton.disabled = false;
            });
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();

            /* hidden spam-trap field: real visitors never fill it in */
            var trap = form.querySelector('[name="_honey"]');
            if (trap && trap.value) { return; }

            var errors = validator.checkAll();
            if (errors.length) {
                validator.showSummary(errors);
                return;
            }
            validator.hideSummary();

            var values = currentValues();
            var result = buildEnquiryResponse(values, products);
            var totalLine = result.lines.filter(function (l) { return l.highlight; })[0];
            showResponse(values, result);          /* instant answer first ... */
            sendInBackground(totalLine ? totalLine.value : '');   /* ... then send it in the background */
        });
    }

    /* ======================================================================
       5. CONTACT PAGE
       ====================================================================== */
    function initContact(form) {
        var recipient = form.getAttribute('data-recipient');
        var previewPanel = document.getElementById('email-preview');

        form.noValidate = true;
        initCounters(form);

        var validator = createValidator(form, {
            name: function (get) { return V.validateName(get('name')); },
            email: function (get) { return V.validateEmail(get('email')); },
            contactMethod: function (get) { return get('contactMethod') ? '' : 'Please choose how you would like us to reply.'; },
            phone: function (get) {
                var needsPhone = get('contactMethod') === 'whatsapp' || get('contactMethod') === 'phone';
                return V.validatePhone(get('phone'), needsPhone);
            },
            messageType: function (get) { return V.validateSelect(get('messageType'), 'Please choose the type of message.'); },
            subject: function (get) { return V.validateText(get('subject'), 'a subject', 3, 80); },
            message: function (get) { return V.validateText(get('message'), 'your message', 20, 1000); },
            consent: function (get) { return get('consent') ? '' : 'Please tick the box to confirm we may reply to you.'; }
        });

        function showPreview(email) {
            previewPanel.textContent = '';
            previewPanel.appendChild(el('h2', 'response-title', 'Your email is ready'));
            previewPanel.appendChild(el('p', 'response-intro',
                'We have put your details into an email. It has not been sent yet \u2014 press the button below to send it from your email app.'));

            var meta = el('dl', 'response-list');
            [['To', email.to], ['Subject', email.subject]].forEach(function (pair) {
                var row = el('div', 'response-row');
                row.appendChild(el('dt', '', pair[0]));
                row.appendChild(el('dd', '', pair[1]));
                meta.appendChild(row);
            });
            previewPanel.appendChild(meta);
            previewPanel.appendChild(el('pre', 'email-body', email.body));

            var actions = el('div', 'response-actions');
            var send = el('a', 'btn btn-primary', 'Send email to Glamour Girl Hair');
            send.href = email.href;
            var copy = el('button', 'btn btn-outline', 'Copy email text');
            copy.type = 'button';
            var edit = el('button', 'btn btn-outline', 'Edit my message');
            edit.type = 'button';
            var note = el('p', 'send-status', '');
            note.setAttribute('role', 'status');

            copy.addEventListener('click', function () {
                var text = 'To: ' + email.to + '\r\nSubject: ' + email.subject + '\r\n\r\n' + email.body;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(function () {
                        note.textContent = '\u2713 Email text copied.';
                    }, function () {
                        note.textContent = 'Could not copy automatically. Please select the text above and copy it.';
                    });
                } else {
                    note.textContent = 'Copying is not supported here. Please select the text above and copy it.';
                }
            });
            edit.addEventListener('click', function () {
                previewPanel.hidden = true;
                form.hidden = false;
                validator.focusField('message');
            });

            actions.appendChild(send);
            actions.appendChild(copy);
            actions.appendChild(edit);
            previewPanel.appendChild(actions);
            previewPanel.appendChild(note);

            form.hidden = true;
            previewPanel.hidden = false;
            previewPanel.setAttribute('tabindex', '-1');
            previewPanel.focus();
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var trap = form.querySelector('[name="_honey"]');
            if (trap && trap.value) { return; }

            var errors = validator.checkAll();
            if (errors.length) { validator.showSummary(errors); return; }
            validator.hideSummary();

            var email = buildEmail({
                name: validator.get('name'),
                email: validator.get('email'),
                phone: validator.get('phone'),
                contactMethod: validator.get('contactMethod'),
                messageType: validator.get('messageType'),
                subject: validator.get('subject'),
                message: validator.get('message')
            }, recipient);
            showPreview(email);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var enquiry = document.getElementById('enquiry-form');
        var contact = document.getElementById('contact-form');
        if (enquiry) { initEnquiry(enquiry); }
        if (contact) { initContact(contact); }
    });
})(typeof window !== 'undefined' ? window : globalThis);
