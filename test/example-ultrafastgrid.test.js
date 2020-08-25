'use strict';

const {
    VisualGridRunner,
    Eyes,
    Target,
    Configuration,
    RectangleSize,
    BatchInfo,
    BrowserType,
    DeviceName,
    ScreenOrientation
} = require('@applitools/eyes-playwright');
const playwright = require('playwright')
const sleep = require('sleep');

let eyes;

describe('playwright', function () {
    let runner, browser, page

    beforeEach(async () => {
        // Initialize the playwright browser
        browser = await playwright.chromium.launch({ headless: true })

        // Create a runner with concurrency of 1
        runner = new VisualGridRunner(1);

        // Create Eyes object with the runner, meaning it'll be a Visual Grid eyes.
        eyes = new Eyes(runner);

        // Initialize the eyes configuration
        const configuration = new Configuration();

        // You can get your api key from the Applitools dashboard
        configuration.setApiKey('8pVdTA8n6joSM18VHrggfo9OHmhaFjepyAbkdrZ1NcU110')

        // create a new batch info instance and set it to the configuration
        configuration.setBatch(new BatchInfo('Ultrafast Batch'))

        // Add browsers with different viewports
        configuration.addBrowser(800, 600, BrowserType.CHROME);
        configuration.addBrowser(700, 500, BrowserType.FIREFOX);
        configuration.addBrowser(1600, 1200, BrowserType.IE_11);
        configuration.addBrowser(1024, 768, BrowserType.EDGE_CHROMIUM);
        configuration.addBrowser(800, 600, BrowserType.SAFARI);

        // Add mobile emulation devices in Portrait mode
        configuration.addDeviceEmulation(DeviceName.iPhone_X, ScreenOrientation.PORTRAIT);
        configuration.addDeviceEmulation(DeviceName.Pixel_2, ScreenOrientation.PORTRAIT);

        // Set the configuration to eyes
        eyes.setConfiguration(configuration);
    });


    it('ultraFastTest', async () => {

        const context = await browser.newContext( [
            {extraHTTPHeaders: {
                "extraHTTPHeaders": {
                    "akamai": {
                        "dma": "123",
                        "region_code": "123",
                        "zip": "10019"
                    }
                }
            }}
        ]);
        await context.addCookies([
            {
              name: 'my_cookie',
              value: 'my_cookie_value',
              domain: 'my_domain',
              path: '/',
            },
          ]);
        page = await context.newPage();
        page.on('response', checkResponse);

        await eyes.open(page, 'Demo App', 'Ultrafast grid demo', new RectangleSize(800, 600));
    
        await page.goto('https://att.com');
        
        await lazyLoadPage(page);

        await eyes.check('att.com', Target.window().fully());

        // Call Close on eyes to let the server know it should display the results
        await eyes.close();
    });

    afterEach(async () => {
        // Close the browser
        await browser.close()

        // If the test was aborted before eyes.close was called, ends the test as aborted.
        await eyes.abortIfNotClosed();

        // we pass false to this method to suppress the exception that is thrown if we
        // find visual differences
        const results = await runner.getAllTestResults(false);
        console.log(results);
    });

    async function checkResponse(response) {
        if(!response.ok()) {
            console.log("RESPONSE OK          : " + response.ok())
            console.log("RESPONSE STATUS      : " + response.status())
            console.log("RESPONSE URL         : " + response.url())
        }
    }

    async function getPageHeight(page) {
        var clientHeight = await page.evaluate("document.documentElement.clientHeight")
        var bodyClientHeight = await page.evaluate("document.body.clientHeight")
        var scrollHeight = await page.evaluate("document.documentElement.scrollHeight")
        var bodyScrollHeight = await page.evaluate("document.body.scrollHeight")
        var maxDocElementHeight = Math.max(clientHeight, scrollHeight);
        var maxBodyHeight = Math.max(bodyClientHeight, bodyScrollHeight);
        return Math.max(maxDocElementHeight, maxBodyHeight);
    };
    
    async function lazyLoadPage(page) {
        var height =  await page.evaluate("window.innerHeight");
        var pageHeight = await getPageHeight(page);
        sleep.msleep(2000);
        for (var j = 0; j < pageHeight; j += (height - 20)) {
            await page.evaluate("window.scrollTo( 0, " + j + ")")
            sleep.msleep(2000);
            pageHeight = await getPageHeight(page);
        }
        await page.evaluate("window.scrollTo(0, 0)");
        sleep.msleep(2000);
    };
    
});