/* ==========================================================================
   Glamour Girl Hair — validation rules
   --------------------------------------------------------------------------
   Small, pure functions: each one takes a value and returns an error message
   (a string) or an empty string when the value is fine. They do not touch
   the page, which keeps them easy to test and lets both forms reuse them.
   js/forms.js is the file that connects these rules to the actual forms.
   ========================================================================== */
(function (global) {
    'use strict';

    /* Letters (including accented ones), spaces, hyphens and apostrophes. 2-60 characters. */
    var NAME_PATTERN = /^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF][A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF'\u2019 -]{1,59}$/;

    /* something@something.tld — deliberately simple; the server is the final judge */
    var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    /* South African numbers: 0821234567 or +27821234567 (spaces, dashes and brackets are ignored) */
    var PHONE_PATTERN = /^(?:0|\+27)[1-9]\d{8}$/;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    /* Date -> "YYYY-MM-DD" in the visitor's local time (what <input type="date"> uses) */
    function toDateString(date) {
        return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    }

    function addDays(date, days) {
        var copy = new Date(date.getTime());
        copy.setDate(copy.getDate() + days);
        return copy;
    }

    function cleanPhone(value) {
        return String(value).replace(/[\s\-().]/g, '');
    }

    function validateName(value) {
        var v = String(value).trim();
        if (!v) { return 'Please enter your full name.'; }
        if (v.length < 2) { return 'Your name must be at least 2 characters long.'; }
        if (!NAME_PATTERN.test(v)) {
            return 'Use letters only (spaces, hyphens and apostrophes are fine), up to 60 characters.';
        }
        return '';
    }

    function validateEmail(value) {
        var v = String(value).trim();
        if (!v) { return 'Please enter your email address.'; }
        if (v.length > 100) { return 'Your email address must be 100 characters or fewer.'; }
        if (!EMAIL_PATTERN.test(v)) { return 'Enter a valid email address, for example name@example.com.'; }
        return '';
    }

    /* required = true  -> the field must be filled in
       required = false -> blank is fine, but anything typed must be a valid SA number */
    function validatePhone(value, required) {
        var v = cleanPhone(String(value).trim());
        if (!v) { return required ? 'Please enter a phone number so we can reach you.' : ''; }
        if (!PHONE_PATTERN.test(v)) {
            return 'Enter a South African number, for example 082 123 4567 or +27 82 123 4567.';
        }
        return '';
    }

    function validateSelect(value, message) {
        return String(value).trim() ? '' : message;
    }

    function validateText(value, label, min, max) {
        var v = String(value).trim();
        if (!v) { return 'Please enter ' + label + '.'; }
        if (v.length < min) {
            return 'Please write at least ' + min + ' characters (you have ' + v.length + ').';
        }
        if (v.length > max) {
            return 'Please keep this to ' + max + ' characters or fewer (you have ' + v.length + ').';
        }
        return '';
    }

    function validateQuantity(value) {
        var v = String(value).trim();
        if (!v) { return 'Please enter how many bundles you need.'; }
        if (!/^\d+$/.test(v)) { return 'Enter a whole number, for example 3.'; }
        var n = parseInt(v, 10);
        if (n < 1 || n > 10) { return 'You can enquire about 1 to 10 bundles at a time.'; }
        return '';
    }

    /* Optional date: blank is fine; otherwise it must be a real date from today up to a year ahead.
       "today" is passed in so the function stays predictable. */
    function validateDate(value, today) {
        var v = String(value).trim();
        if (!v) { return ''; }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) { return 'Enter the date as day, month and year.'; }

        var parts = v.split('-');
        var parsed = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        var isRealDate = parsed.getFullYear() === Number(parts[0]) &&
                         parsed.getMonth() === Number(parts[1]) - 1 &&
                         parsed.getDate() === Number(parts[2]);
        if (!isRealDate) { return 'That date does not exist. Please check it.'; }

        var todayString = toDateString(today);
        var lastAllowed = toDateString(addDays(today, 365));
        if (v < todayString) { return 'The date cannot be in the past.'; }
        if (v > lastAllowed) { return 'Please choose a date within the next 12 months.'; }
        return '';
    }

    var api = {
        pad: pad,
        toDateString: toDateString,
        addDays: addDays,
        cleanPhone: cleanPhone,
        validateName: validateName,
        validateEmail: validateEmail,
        validatePhone: validatePhone,
        validateSelect: validateSelect,
        validateText: validateText,
        validateQuantity: validateQuantity,
        validateDate: validateDate
    };

    global.GGH = global.GGH || {};
    global.GGH.validate = api;

    /* lets the rules be tested from Node without a browser */
    if (typeof module !== 'undefined' && module.exports) { module.exports = api; }
})(typeof window !== 'undefined' ? window : globalThis);
