process.env.PUPPETEER_EXECUTABLE_PATH = '/opt/chrome-arm64/chrome'
process.env.DISPLAY = ':1'

const { connect } = require("puppeteer-real-browser")

async function createBrowser() {
    try {
        if (global.finished == true) return
        global.browser = null

        const { browser } = await connect({
            headless: false,
            turnstile: true,
            disableXvfb: false,
            connectOption: {
                executablePath: '/opt/chrome-arm64/chrome',   // ← Chrome ARM64 asli
                defaultViewport: null,
                args: [
                    '--window-size=1280,720'
                ]
            }
        })

        global.browser = browser
        console.log('Browser launched:', browser.wsEndpoint?.())

        browser.on('disconnected', async () => {
            if (global.finished == true) return
            console.log('Browser disconnected')
            await new Promise(r => setTimeout(r, 3000))
            await createBrowser()
        })
    } catch (e) {
        console.log('FULL ERROR:', e)
        if (global.finished == true) return
        await new Promise(r => setTimeout(r, 3000))
        await createBrowser()
    }
}
createBrowser()
