const fs = require('fs')

function sleep(ms){
    return new Promise(r => setTimeout(r, ms))
}

async function solveRecaptchaV3(url, sitekey) {

    const context = await global.browser.createBrowserContext()
    const page = await context.newPage()

    await page.setBypassCSP(true)

    // debug console dari fake page
    page.on('console', msg => {
        console.log('[PAGE]', msg.text())
    })

    // debug resource recaptcha
    page.on('requestfinished', r => {
        if (r.url().includes('recaptcha'))
            console.log('[LOADED]', r.url())
    })

    const { RequestInterceptionManager } =
        await import('puppeteer-intercept-and-modify-requests')

    const client = await page.target().createCDPSession()
    const interceptManager = new RequestInterceptionManager(client)

    // inject fake page
    await interceptManager.intercept({
        urlPattern: url,
        resourceType: 'Document',
        modifyResponse() {
            console.log('[INTERCEPT] injecting fake page')

            return {
                body: fs.readFileSync(
                    './module/recaptchav3/fakePage.html',
                    'utf8'
                ).replace(/<site-key>/g, sitekey),
                status: 200
            }
        },
    })

    // buka halaman
    await page.goto(url, {
        waitUntil: 'load',
        timeout: 60000
    })

    // optional — kasih sedikit natural delay
    await sleep(2000)

    console.log('[WAIT] token field...')

    await page.waitForSelector('[name="g-recaptcha-response"]', {
        timeout: 60000
    })

    const token = await page.evaluate(() => {
        const el = document.querySelector('[name="g-recaptcha-response"]')
        return el ? el.value : null
    })

    console.log('[TOKEN]', token)

    await context.close()

    if (!token || token.length < 10)
        throw new Error('Failed to get token')

    return token
}

module.exports = solveRecaptchaV3
