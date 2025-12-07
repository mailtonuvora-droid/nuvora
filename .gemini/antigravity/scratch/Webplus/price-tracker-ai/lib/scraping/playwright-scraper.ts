import { chromium } from 'playwright';
// Global E-commerce Scraper - Supports worldwide stores
// Updated: 2025-12-06

export interface ScrapedProduct {
    title: string;
    price: number;
    currency: string;
    imageUrl: string;
    isAvailable: boolean;
}

// Currency detection by domain
const CURRENCY_MAP: Record<string, string> = {
    'amazon.com': 'USD', 'amazon.co.uk': 'GBP', 'amazon.de': 'EUR', 'amazon.fr': 'EUR',
    'amazon.in': 'INR', 'amazon.ca': 'CAD', 'amazon.com.au': 'AUD', 'amazon.co.jp': 'JPY',
    'walmart.com': 'USD', 'target.com': 'USD', 'bestbuy.com': 'USD',
    'flipkart.com': 'INR', 'myntra.com': 'INR',
    'ebay.com': 'USD', 'ebay.co.uk': 'GBP', 'ebay.de': 'EUR',
    'aliexpress.com': 'USD',
    'etsy.com': 'USD',
    'newegg.com': 'USD',
    'zalando.de': 'EUR', 'zalando.co.uk': 'GBP',
    'asos.com': 'GBP',
    'shopee.sg': 'SGD', 'shopee.com.my': 'MYR',
    'lazada.sg': 'SGD', 'lazada.com.my': 'MYR',
};

function getCurrencyFromUrl(url: string): string {
    try {
        const hostname = new URL(url).hostname.replace('www.', '');
        for (const [domain, currency] of Object.entries(CURRENCY_MAP)) {
            if (hostname.includes(domain)) return currency;
        }
    } catch (e) { }
    return 'USD'; // Default
}

function detectStore(url: string): string {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('amazon')) return 'amazon';
    if (hostname.includes('flipkart')) return 'flipkart';
    if (hostname.includes('walmart')) return 'walmart';
    if (hostname.includes('ebay')) return 'ebay';
    if (hostname.includes('aliexpress')) return 'aliexpress';
    if (hostname.includes('etsy')) return 'etsy';
    if (hostname.includes('target')) return 'target';
    if (hostname.includes('bestbuy')) return 'bestbuy';
    if (hostname.includes('newegg')) return 'newegg';
    if (hostname.includes('shopee')) return 'shopee';
    if (hostname.includes('lazada')) return 'lazada';
    if (hostname.includes('zalando')) return 'zalando';
    if (hostname.includes('asos')) return 'asos';
    if (hostname.includes('myntra')) return 'myntra';
    return 'generic';
}

export async function scrapeProduct(url: string): Promise<ScrapedProduct | null> {
    let browser;
    try {
        const store = detectStore(url);
        const currency = getCurrencyFromUrl(url);

        console.log(`🛒 Scraping ${store} product, currency: ${currency}`);

        browser = await chromium.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080 },
            locale: 'en-US',
            timezoneId: 'America/New_York',
            extraHTTPHeaders: {
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            }
        });

        const page = await context.newPage();

        // Anti-detection
        await page.addInitScript(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
            // @ts-ignore
            window.chrome = { runtime: {} };
        });

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForTimeout(2000);

        // 1. Try JSON-LD Schema.org (most reliable, works on 60%+ of sites)
        const jsonLdResult = await page.evaluate(() => {
            const scripts = document.querySelectorAll('script[type="application/ld+json"]');
            for (const script of scripts) {
                try {
                    const json = JSON.parse(script.textContent || '{}');

                    // Direct Product type
                    if (json['@type'] === 'Product') return json;

                    // Array of objects
                    if (Array.isArray(json)) {
                        const product = json.find(item => item['@type'] === 'Product');
                        if (product) return product;
                    }

                    // @graph structure (Walmart, some Shopify)
                    if (json['@graph']) {
                        const product = json['@graph'].find((item: any) => item['@type'] === 'Product');
                        if (product) return product;
                    }
                } catch (e) { }
            }
            return null;
        });

        if (jsonLdResult) {
            const offer = Array.isArray(jsonLdResult.offers) ? jsonLdResult.offers[0] : jsonLdResult.offers;
            if (offer?.price) {
                const imageUrl = jsonLdResult.image
                    ? (Array.isArray(jsonLdResult.image) ? jsonLdResult.image[0] : jsonLdResult.image)
                    : '';
                console.log('✅ JSON-LD extraction successful');
                return {
                    title: jsonLdResult.name || 'Unknown Product',
                    price: parseFloat(String(offer.price).replace(/[^0-9.]/g, '')),
                    currency: offer.priceCurrency || currency,
                    imageUrl: typeof imageUrl === 'object' ? imageUrl.url : imageUrl,
                    isAvailable: offer.availability?.includes('InStock') ?? true,
                };
            }
        }

        // 2. Store-specific and generic fallback
        const data = await page.evaluate((storeType) => {
            const getMeta = (name: string) =>
                document.querySelector(`meta[property="${name}"]`)?.getAttribute('content') ||
                document.querySelector(`meta[name="${name}"]`)?.getAttribute('content');

            let title = getMeta('og:title') || document.title || 'Unknown Product';
            let image = getMeta('og:image') || getMeta('twitter:image') || '';
            let priceText = '';
            let isAvailable = true;

            // Store-specific selectors
            const SELECTORS: Record<string, { price: string[], title: string[], image: string[], outOfStock: string[] }> = {
                amazon: {
                    price: ['.a-price-whole', '#priceblock_ourprice', '#priceblock_dealprice', '.a-price .a-offscreen', '#corePrice_feature_div .a-price-whole'],
                    title: ['#productTitle', '#title'],
                    image: ['#landingImage', 'img.a-dynamic-image', '#imgBlkFront'],
                    outOfStock: ['#availability .a-color-price', '#outOfStock']
                },
                flipkart: {
                    price: ['div._30jeq3._16Jk6d', 'div._30jeq3', '._1vC4OE._2rQ-NK'],
                    title: ['span.B_NuCI', 'h1._9E25nV'],
                    image: ['img._396cs4', 'img._2r_T1I'],
                    outOfStock: ['div._16FRp0']
                },
                ebay: {
                    price: ['[data-testid="x-price-primary"]', '.x-price-primary', '#prcIsum', '.vi-price'],
                    title: ['h1.x-item-title__mainTitle', 'h1[itemprop="name"]'],
                    image: ['img#icImg', '.ux-image-magnify__image img'],
                    outOfStock: ['.d-quantity__availability']
                },
                aliexpress: {
                    price: ['.product-price-value', '[class*="Price"]', '.uniform-banner-box-price'],
                    title: ['h1[data-pl="product-title"]', '.product-title-text'],
                    image: ['.magnifier-image img', 'img[class*="product"]'],
                    outOfStock: []
                },
                etsy: {
                    price: ['[data-buy-box-region="price"] p', '.wt-text-title-03'],
                    title: ['h1[data-buy-box-listing-title]', 'h1'],
                    image: ['img[data-listing-card-listing-image]', '.listing-page-image-carousel img'],
                    outOfStock: []
                },
                walmart: {
                    price: ['[itemprop="price"]', '[data-automation="buybox-price"]', '.price-characteristic', 'span[itemprop="price"]'],
                    title: ['h1[itemprop="name"]', '[data-testid="product-title"]'],
                    image: ['[data-testid="hero-image"] img', '.prod-hero-image img'],
                    outOfStock: []
                },
                shopee: {
                    price: ['.pqTWkA', '._3n5NQx'],
                    title: ['._44qnta', '.qaNIZt'],
                    image: ['.jTTPTv img'],
                    outOfStock: []
                },
                generic: {
                    price: ['[itemprop="price"]', '.price', '#price', '.product-price', '.sale-price', '[class*="price"]'],
                    title: ['h1[itemprop="name"]', 'h1.product-title', 'h1'],
                    image: ['img[itemprop="image"]', '.product-image img', '#product-image img'],
                    outOfStock: ['.out-of-stock', '.sold-out']
                }
            };

            const selectors = SELECTORS[storeType] || SELECTORS.generic;

            // Extract title
            for (const sel of selectors.title) {
                const el = document.querySelector(sel);
                if (el?.textContent?.trim()) {
                    title = el.textContent.trim();
                    break;
                }
            }

            // Extract price
            for (const sel of selectors.price) {
                const el = document.querySelector(sel);
                const text = el?.textContent || el?.getAttribute('content');
                if (text) {
                    priceText = text;
                    break;
                }
            }

            // Extract image
            if (!image) {
                for (const sel of selectors.image) {
                    const imgEl = document.querySelector(sel) as HTMLImageElement;
                    if (imgEl?.src?.startsWith('http')) {
                        image = imgEl.src;
                        break;
                    }
                }
            }

            // Check availability
            for (const sel of selectors.outOfStock) {
                const el = document.querySelector(sel);
                if (el?.textContent?.toLowerCase().match(/out of stock|sold out|unavailable/)) {
                    isAvailable = false;
                    break;
                }
            }

            // Parse price - handle various formats
            let price = 0;
            if (priceText) {
                const cleaned = priceText.replace(/[^\d.,]/g, '');
                // Handle European format (1.234,56) vs US format (1,234.56)
                if (cleaned.includes(',') && cleaned.includes('.')) {
                    if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
                        // European: 1.234,56
                        price = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
                    } else {
                        // US: 1,234.56
                        price = parseFloat(cleaned.replace(/,/g, ''));
                    }
                } else if (cleaned.includes(',')) {
                    // Could be 1,234 or 1,23
                    const parts = cleaned.split(',');
                    if (parts[1]?.length === 2) {
                        price = parseFloat(cleaned.replace(',', '.'));
                    } else {
                        price = parseFloat(cleaned.replace(/,/g, ''));
                    }
                } else {
                    price = parseFloat(cleaned);
                }
            }

            return { title, price: price || 0, imageUrl: image, isAvailable };
        }, store);

        // Fix relative URLs
        if (data.imageUrl && !data.imageUrl.startsWith('http')) {
            try {
                data.imageUrl = new URL(data.imageUrl, new URL(url).origin).href;
            } catch (e) { }
        }

        console.log('📦 Scraped:', {
            title: data.title?.substring(0, 40) + '...',
            price: data.price,
            currency,
            hasImage: !!data.imageUrl
        });

        return { ...data, currency };

    } catch (error) {
        console.error('❌ Scraping failed:', error);
        return null;
    } finally {
        if (browser) await browser.close();
    }
}
