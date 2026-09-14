/**
 * Drives two FlipTickers (see flip-ticker.js) as a calendar-accurate
 * "months and days elapsed" up-counter from a fixed start date.
 */
(function () {
    "use strict";

    var CHECK_INTERVAL_MS = 60 * 1000;

    function pad2(n) {
        return n < 10 ? "0" + n : String(n);
    }

    // Calendar-accurate months/days elapsed (not just totalDays / 30).
    function monthsAndDaysSince(start, now) {
        var months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());

        var anchor = new Date(start.getTime());
        anchor.setMonth(anchor.getMonth() + months);

        if (anchor > now) {
            months -= 1;
            anchor = new Date(start.getTime());
            anchor.setMonth(anchor.getMonth() + months);
        }

        var days = Math.floor((now.getTime() - anchor.getTime()) / 86400000);
        return { months: Math.max(0, months), days: Math.max(0, days) };
    }

    window.initMonthsDaysSinceTicker = function (monthsElementId, daysElementId, statusElementId, startDate, startDateLabel) {
        var monthsTicker = new window.FlipTicker(monthsElementId, "Months");
        var daysTicker = new window.FlipTicker(daysElementId, "Days");
        var statusEl = statusElementId ? document.getElementById(statusElementId) : null;
        var label = startDateLabel || startDate.toDateString();

        function update() {
            var elapsed = monthsAndDaysSince(startDate, new Date());
            monthsTicker.setValue(pad2(elapsed.months));
            daysTicker.setValue(pad2(elapsed.days));
            if (statusEl) {
                statusEl.textContent =
                    "It has been " + elapsed.months + " months and " + elapsed.days + " days since " + label + ".";
            }
        }

        update();
        setInterval(update, CHECK_INTERVAL_MS);

        return { monthsTicker: monthsTicker, daysTicker: daysTicker };
    };
})();
