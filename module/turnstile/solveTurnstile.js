const fs = require('fs')

async function solveTurnstile(url, sitekey) {

    const context = await global.browser.createBrowserContext()
        .catch(() => null)

    if (!context) {
        throw new Error('Failed to create browser context')
    }
	const { RequestInterceptionManager } = await import('puppeteer-intercept-and-modify-requests')
	
    const timeoutMs = global.timeOut || 60000
	
	
    const solverPromise = (async () => {
        const page = await context.newPage()
        const client = await page.target().createCDPSession()
        const interceptManager = new RequestInterceptionManager(client)

        // request interception
        await page.setRequestInterception(true)

        page.on('request', (request) => {
            try {
                // block real page load
                if ([url, url + '/'].includes(request.url()))
                    return request.abort()

                request.continue()
            } catch {}
        })

        // inject fake page
        await interceptManager.intercept({
            urlPattern: url,
            resourceType: 'Document',
            modifyResponse() {
                return {
                    body: String(
                        fs.readFileSync('./module/turnstile/fakePage.html')
                    ).replace(/<site-key>/g, sitekey),
                    status: 200
                }
            },
        })

        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: timeoutMs
        })

        await page.evaluate(() => {
            document.body.style.zoom = '0.55'
        })

        await page.waitForSelector('[name="cf-response"]', {
            timeout: timeoutMs
        })

        const token = await page.evaluate(() => {
            const el = document.querySelector('[name="cf-response"]')
            return el ? el.value : null
        })

        if (!token || token.length < 10) {
            throw new Error('Failed to get token')
        }

        return token
    })()

    // HARD TIMEOUT
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(async () => {
            await context.close().catch(()=>{})
            reject(new Error('Timeout Error'))
        }, timeoutMs)
    })

    try {
        return await Promise.race([
            solverPromise,
            timeoutPromise
        ])
    } finally {
        await context.close().catch(()=>{})
    }
}

module.exports = solveTurnstile