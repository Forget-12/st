const express = require('express')
const app = express()

const port = process.env.PORT || 3010

// ==================
// Browser
// ==================
global.browserLength = 0
global.browserLimit = Number(process.env.browserLimit) || 2
if (process.env.SKIP_LAUNCH != 'true') require('./module/createBrowser')

const solveTurnstile = require('./module/turnstile/solveTurnstile')
const solveRecaptchaV3 = require('./module/recaptchav3/solveRecaptchaV3')

// ==================
// MIDDLEWARE
// ==================
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ==================
// ROUTES
// ==================
app.post('/turnstile', async (req, res) => {
	let { url, sitekey } = req.body
	console.log(req.body)
	
    if (!url || !sitekey) {
        return res.status(400).json({
            code: 400,
            message: 'URL/SITEKEY REQUIRED'
        })
    }
	try {
        const parsed = new URL(url)
        if (parsed.protocol === 'http:') {
            parsed.protocol = 'https:'
        }
        url = parsed.toString()
    } catch (e) {
        return res.status(400).json({
            code: 400,
            message: 'INVALID URL FORMAT'
        })
    }
    if (!sitekey.startsWith('0x4A')) {
        return res.status(400).json({
            code: 400,
            message: 'INVALID SITEKEY'
        })
    }
	if (global.browserLength >= global.browserLimit) return res.status(400).json({ code: 400, message: 'RATE LIMIT REQUESTS' })
	if (process.env.SKIP_LAUNCH != 'true' && !global.browser) return res.status(400).json({ code: 400, message: 'PREPARE SCANNER' })
	
	var result = { code: 400 }

    global.browserLength++
	try {
		const token = await solveTurnstile(url, sitekey);
		result = { token, code: 200 };
	} catch (err) {
		result = { code: 400, message: err.message };
	} finally {
		global.browserLength--;
	}

    res.status(result.code ?? 400).send(result)
})
app.post('/recaptchaV3', async (req, res) => {
	let { url, sitekey } = req.body
    if (!url || !sitekey) {
        return res.status(400).json({
            code: 400,
            message: 'URL/SITEKEY REQUIRED'
        })
    }
	try {
        const parsed = new URL(url)
        if (parsed.protocol === 'http:') {
            parsed.protocol = 'https:'
        }
        url = parsed.toString()
    } catch (e) {
        return res.status(400).json({
            code: 400,
            message: 'INVALID URL FORMAT'
        })
    }
    if (!sitekey.startsWith('6L')) {
        return res.status(400).json({
            code: 400,
            message: 'INVALID SITEKEY'
        })
    }
	if (global.browserLength >= global.browserLimit) return res.status(400).json({ code: 400, message: 'RATE LIMIT REQUESTS' })
	if (process.env.SKIP_LAUNCH != 'true' && !global.browser) return res.status(400).json({ code: 400, message: 'PREPARE SCANNER' })
	
	var result = { code: 400 }

    global.browserLength++
	try {
		const token = await solveRecaptchaV3(url, sitekey);
		result = { token, code: 200 };
	} catch (err) {
		result = { code: 400, message: err.message };
	} finally {
		global.browserLength--;
	}

    res.status(result.code ?? 400).send(result)
})
// ==================
// START SERVER
// ==================js
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

// optional timeout
if (global.timeOut) {
    server.timeout = global.timeOut
}
