/**
 * Drives a FlipTicker (see flip-ticker.js) as a whole-days-elapsed
 * up-counter from a fixed start date, e.g. "days since X".
 */
(function () {
    "use strict";

    var CHECK_INTERVAL_MS = 60 * 1000;

    window.initDaysSinceTicker = function (elementId, statusElementId, startDate, heading) {
        var ticker = new window.FlipTicker(elementId, heading);
        var statusEl = statusElementId ? document.getElementById(statusElementId) : null;
        var startMs = startDate.getTime();

        function update() {
            var days = Math.max(0, Math.floor((Date.now() - startMs) / 86400000));
            ticker.setValue(String(days));
        }

        update();
        setInterval(update, CHECK_INTERVAL_MS);

        return ticker;
    };
})();
