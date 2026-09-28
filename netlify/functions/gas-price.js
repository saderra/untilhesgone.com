// AAA doesn't publish a public API for gas prices, so this fetches
// their public national-average page server-side (avoiding CORS and
// keeping the scrape logic out of client JS) and extracts the figures.
// Response is cached at the edge so AAA's page is only re-fetched a
// couple of times an hour no matter how much site traffic there is.
//
// If AAA changes their markup, the patterns below will need updating.

const AAA_URL = "https://gasprices.aaa.com/";
const USER_AGENT =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

// Headline regular-unleaded figure at the top of the page.
const PRICE_PATTERNS = [
    /class="numb">\s*\$([\d.]+)/i,
    /Today.s AAA National Average \$([\d.]+)/i,
];

const DATE_PATTERN = /Price as of[^\d]*([\d/]+)/i;

// The "Current Avg." row of the national table, which has one column
// per fuel grade (Regular, Mid-Grade, Premium, Diesel, E85, ...).
const TABLE_HEAD_PATTERN = /<thead>([\s\S]*?)<\/thead>/i;
const CURRENT_ROW_PATTERN = /<td>\s*Current Avg\.?\s*<\/td>([\s\S]*?)<\/tr>/i;
const TH_PATTERN = /<th[^>]*>([\s\S]*?)<\/th>/gi;
const TD_PRICE_PATTERN = /<td[^>]*>\s*\$?([\d.]+)\s*<\/td>/gi;

function firstMatch(html, patterns) {
    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Returns a map like { regular: "4.4768", diesel: "6.4531", ... } by
// pairing the table's header labels with the "Current Avg." cells.
function parseCurrentAverages(html) {
    const head = html.match(TABLE_HEAD_PATTERN);
    const row = html.match(CURRENT_ROW_PATTERN);
    if (!head || !row) return {};

    const labels = [];
    let m;
    while ((m = TH_PATTERN.exec(head[1])) !== null) {
        const label = m[1].replace(/<[^>]*>/g, "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
        if (label) labels.push(label);
    }

    const values = [];
    while ((m = TD_PRICE_PATTERN.exec(row[1])) !== null) {
        values.push(m[1]);
    }

    const out = {};
    labels.forEach(function (label, i) {
        if (values[i]) out[label] = values[i];
    });
    return out;
}

exports.handler = async function () {
    try {
        const res = await fetch(AAA_URL, {
            headers: { "User-Agent": USER_AGENT },
        });

        if (!res.ok) {
            throw new Error("AAA responded with " + res.status);
        }

        const html = await res.text();
        const averages = parseCurrentAverages(html);

        const price = firstMatch(html, PRICE_PATTERNS) || averages.regular || null;
        if (!price) {
            throw new Error("could not find price in AAA page");
        }

        const diesel = averages.diesel || null;
        const dateMatch = html.match(DATE_PATTERN);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=1800, s-maxage=1800",
            },
            body: JSON.stringify({
                price: Number(price).toFixed(4),
                diesel: diesel ? Number(diesel).toFixed(4) : null,
                asOf: dateMatch ? dateMatch[1] : null,
                source: "AAA national average (price: regular unleaded, diesel: diesel)",
                fetchedAt: new Date().toISOString(),
            }),
        };
    } catch (err) {
        return {
            statusCode: 502,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: err.message }),
        };
    }
};
