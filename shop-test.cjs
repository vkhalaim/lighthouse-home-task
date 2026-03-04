/**
 * User Flow
 * Scenario:
 * 1. Open application
 * 2. Open Tables tab
 * 3. Open table product
 * 4. Add to cart
 * 5. Open cart
 * 6. Place order
 * 7. Fill form & submit
 */

// iterations and out folder from command argument
let outputFolder = process.argv[1];
const iterations = parseInt(process.argv[2]) || 3;

const fs = require('fs');
const puppeteer = require('puppeteer');
const lighthouse = require('lighthouse/lighthouse-core/fraggle-rock/api.js');

/**
 * Wait until page is fully rendered (DOM stabilized)
 */
const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  for (let i = 0; i < maxChecks; i++) {
    const html = await page.content();
    const currentHTMLSize = html.length;

    if (lastHTMLSize !== 0 && currentHTMLSize === lastHTMLSize) {
      countStableSizeIterations++;
    } else {
      countStableSizeIterations = 0;
    }

    if (countStableSizeIterations >= minStableSizeIterations) {
      console.log(`Fully Rendered: ${page.url()}`);
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await new Promise(resolve => setTimeout(resolve, checkDurationMsecs));
  }
};

async function captureReport(iteration) {

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--ignore-certificate-errors',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  /**
   * Lighthouse User Flow
   */
  const flow = await lighthouse.startFlow(page, {
    name: 'shop-user-flow',
    configContext: {
      settingsOverrides: {
        throttlingMethod: 'simulate',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        screenEmulation: {
          mobile: false,
          width: 1920,
          height: 1080,
          deviceScaleFactor: 1,
          disabled: false,
        },
        formFactor: 'desktop',
        onlyCategories: ['performance'],
      },
    },
  });

  /**
   * URLs
   */
  const HomePage   = 'http://localhost/';
  const TablesPage = 'http://localhost/tables';
  const CartPage   = 'http://localhost/cart';

  /**
   * SELECTORS
   */
  const tableItemSelector   = '.product-118';
  const addToCartBtn        = '.green-box';
  const placeOrderBtn       = '.to_cart_submit';

  const fullName = 'input[name="cart_name"]';
  const addressInput = 'input[name="cart_address"]';
  const postalInput = 'input[name="cart_postal"]';
  const countryInput = 'select[name="cart_country"]'
  const cityInput = 'input[name="cart_city"]';
  const phoneInput   = 'input[name="cart_phone"]';
  const emailInput   = 'input[name="cart_email"]';
  const submitOrder  = 'input[name="cart_submit"]';

  // ----------------------------------------------------
  // 1. Home Page
  // ----------------------------------------------------
  await flow.navigate(HomePage, { stepName: 'Home Page' });
  console.log('Home Page opened');
  await waitTillHTMLRendered(page);

  // ----------------------------------------------------
  // 2. Open Tables Tab
  // ----------------------------------------------------
  await flow.startTimespan({ stepName: 'Open Tables tab' });
  await page.click(`a[href="${TablesPage}"]`);
  await waitTillHTMLRendered(page);
  await flow.endTimespan();
  console.log('Tables Page opened');

  // ----------------------------------------------------
  // 3. Open Table Product
  // ----------------------------------------------------
  await flow.startTimespan({ stepName: 'Open Table Product' });
  await page.waitForSelector(tableItemSelector);
  await page.click(tableItemSelector);
  await waitTillHTMLRendered(page);
  await flow.endTimespan();
  console.log('Table product opened');

  // ----------------------------------------------------
  // 4. Add to Cart
  // ----------------------------------------------------
  await flow.startTimespan({ stepName: 'Add Table to Cart' });
  await page.waitForSelector(addToCartBtn);
  await page.click(addToCartBtn);
  await new Promise(resolve => setTimeout(resolve, 500));
  await flow.endTimespan();
  console.log('Added to cart');

  // ----------------------------------------------------
  // 5. Open Cart
  // ----------------------------------------------------
  await flow.startTimespan({ stepName: 'Open Cart' });
  await page.click(`a[href="${CartPage}"]`);
  await waitTillHTMLRendered(page);
  await flow.endTimespan();
  console.log('Cart opened');

  // ----------------------------------------------------
  // 6. Place Order
  // ----------------------------------------------------
  await flow.startTimespan({ stepName: 'Open Checkout' });
  await page.waitForSelector(placeOrderBtn);
  await page.click(placeOrderBtn);
  await waitTillHTMLRendered(page);
  await flow.endTimespan();
  console.log('Checkout opened');

  // ----------------------------------------------------
  // 7. Fill form & Submit
  // ----------------------------------------------------
  await flow.startTimespan({ stepName: 'Fill Order Form & Submit' });

  await page.type(fullName, 'Test User');
  await page.type(addressInput, 'Random Street, 34');
  await page.type(cityInput, 'Kyiv');
  await page.type(postalInput, '01234');
  await page.type(emailInput, 'test@example.com');
  await page.type(addressInput, 'Test street 1');
  await page.type(phoneInput, '+380000000000');
  await page.select(countryInput, 'UA');
  await page.click(submitOrder);
  await waitTillHTMLRendered(page);

  await flow.endTimespan();
  console.log('Order submitted');

  // ----------------------------------------------------
  // REPORTS
  // ----------------------------------------------------
    const reportPath = `${outputFolder}/user-flow-${iteration}.report.html`;

    const report = await flow.generateReport();
    fs.writeFileSync(reportPath, report);

    console.log('Lighthouse HTML report generated');


  await browser.close();
}

(async () => {
  for (let i = 1; i <= iterations; i++) {
    console.log(`\n===== ITERATION ${i} =====`);
    await captureReport(i);
  }
})();
