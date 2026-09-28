/**
 * Polls the gas-price Netlify function and drives one or more
 * FlipTickers (see /ext/flip-ticker/flip-ticker.js) with the current
 * AAA national average prices. All tickers on the page share a single
 * fetch per poll; the function returns every fuel grade at once.
 */
(function () {
    "use strict";

    var ENDPOINT = "/.netlify/functions/gas-price";
    var POLL_INTERVAL_MS = 30 * 60 * 1000; // matches the function's Cache-Control

    // Maps a fuel key to the JSON field and the wording used in the
    // plain-text status sentence beneath each flip card.
    var FUELS = {
        regular: { field: "price", label: "regular unleaded" },
        diesel: { field: "diesel", label: "diesel" },
    };

    var tickers = [];
    var polling = false;

    function applyPrices(data) {
        tickers.forEach(function (t) {
            var fuel = FUELS[t.fuel];
            var raw = data[fuel.field];

            if (raw === null || raw === undefined || isNaN(Number(raw))) {
                if (t.statusEl && !t.ticker.initialised) {
                    t.statusEl.textContent = "Price unavailable right now";
                }
                return;
            }

            var price = Number(raw).toFixed(2);
            t.ticker.setValue("$" + price, true);
            if (t.statusEl) {
                t.statusEl.textContent =
                    "Current price: $" + price + " per gallon — US national average, " + fuel.label +
                    (data.asOf ? ", as of " + data.asOf : "") + " (source: AAA).";
            }
        });
    }

    function fetchPrices() {
        fetch(ENDPOINT)
            .then(function (res) {
                if (!res.ok) throw new Error("bad response " + res.status);
                return res.json();
            })
            .then(applyPrices)
            .catch(function (err) {
                console.error("Gas ticker: failed to fetch prices", err);
                tickers.forEach(function (t) {
                    if (t.statusEl && !t.ticker.initialised) {
                        t.statusEl.textContent = "Price unavailable right now";
                    }
                });
            });
    }

    function startPolling() {
        if (polling) return;
        polling = true;
        // Defer the first fetch to the end of the current tick so every
        // ticker registered during page load shares it.
        setTimeout(fetchPrices, 0);
        setInterval(fetchPrices, POLL_INTERVAL_MS);
    }

    // fuel is "regular" (default) or "diesel".
    window.initGasTicker = function (elementId, statusElementId, heading, fuel) {
        var ticker = new window.FlipTicker(elementId, heading);
        var statusEl = statusElementId ? document.getElementById(statusElementId) : null;

        tickers.push({
            ticker: ticker,
            statusEl: statusEl,
            fuel: FUELS[fuel] ? fuel : "regular",
        });
        startPolling();

        return ticker;
    };
})();
