/**
 * Polls the gas-price Netlify function and drives a FlipTicker
 * (see /ext/flip-ticker/flip-ticker.js) with the current AAA national
 * average price.
 */
(function () {
    "use strict";

    var ENDPOINT = "/.netlify/functions/gas-price";
    var POLL_INTERVAL_MS = 30 * 60 * 1000; // matches the function's Cache-Control

    function fetchPrice(ticker, statusEl) {
        fetch(ENDPOINT)
            .then(function (res) {
                if (!res.ok) throw new Error("bad response " + res.status);
                return res.json();
            })
            .then(function (data) {
                ticker.setValue(Number(data.price).toFixed(2));
                if (statusEl) {
                    statusEl.textContent =
                        "US national average, regular unleaded" +
                        (data.asOf ? " — as of " + data.asOf + " (source: AAA)" : " (source: AAA)");
                }
            })
            .catch(function (err) {
                console.error("Gas ticker: failed to fetch price", err);
                if (statusEl && !ticker.initialised) {
                    statusEl.textContent = "Gas price unavailable right now";
                }
            });
    }

    window.initGasTicker = function (elementId, statusElementId, heading) {
        var ticker = new window.FlipTicker(elementId, heading);
        var statusEl = statusElementId ? document.getElementById(statusElementId) : null;

        fetchPrice(ticker, statusEl);
        setInterval(function () {
            fetchPrice(ticker, statusEl);
        }, POLL_INTERVAL_MS);

        return ticker;
    };
})();
