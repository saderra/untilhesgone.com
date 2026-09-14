// AAA doesn't publish a public API for gas prices, so this fetches
// their public national-average page server-side (avoiding CORS and
// keeping the scrape logic out of client JS) and extracts the figure.
// Response is cached at the edge so AAA's page is only re-fetched a
// couple of times an hour no matter how much site traffic there is.
//
// If AAA changes their markup, PRICE_PATTERNS will need updating.

const AAA_URL = "https://gasprices.aaa.com/";
const USER_AGENT =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

const PRICE_PATTERNS = [
    /class="numb">\s*\$([\d.]+)/i,
    /Today.s AAA National Average \$([\d.]+)/i,
];

const DATE_PATTERN = /Price as of[^\d]*([\d/]+)/i;

exports.handler = async function () {
    try {
        const res = await fetch(AAA_URL, {
            headers: { "User-Agent": USER_AGENT },
        });

        if (!res.ok) {
            throw new Error("AAA responded with " + res.status);
        }

        const html = await res.text();

        let price = null;
        for (const pattern of PRICE_PATTERNS) {
            const match = html.match(pattern);
            if (match) {
                price = match[1];
                break;
            }
        }

        if (!price) {
            throw new Error("could not find price in AAA page");
        }

        const dateMatch = html.match(DATE_PATTERN);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=1800, s-maxage=1800",
            },
            body: JSON.stringify({
                price: Number(price).toFixed(4),
                asOf: dateMatch ? dateMatch[1] : null,
                source: "AAA national average, regular unleaded",
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
