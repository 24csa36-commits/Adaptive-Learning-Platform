import puppeteer from 'puppeteer';

(async () => {
    console.log("Starting browser...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    try {
        console.log("Navigating to Learning Page...");
        await page.goto('http://localhost:5173/learning', { waitUntil: 'networkidle2' });
        
        console.log("Clicking 'Take Quiz' bottom link...");
        // Click the 'Take Quiz' button at the bottom of the page
        await page.waitForSelector('a[href="/quiz"]');
        
        // Let's get the specific Take Quiz link that has the state (the bottom one)
        const quizLinks = await page.$$('a[href="/quiz"]');
        console.log(`Found ${quizLinks.length} quiz links. Clicking the last one (Next button).`);
        await quizLinks[quizLinks.length - 1].click();
        
        console.log("Waiting for Quiz Page to load...");
        await page.waitForSelector('h1', { timeout: 10000 });
        const title = await page.$eval('h1', el => el.textContent);
        console.log("Quiz Page Title: " + title);
        
        // Wait for question to render
        await page.waitForSelector('h2', { timeout: 20000 });
        const q1Text = await page.$eval('h2', el => el.textContent);
        console.log("First Question Rendered: " + q1Text);
        
        // Check if it's the old HashMap question
        if (q1Text.includes("HashMap typically O(1)")) {
            console.error("FAIL: Displayed old hardcoded HashMap question!");
        } else {
            console.log("PASS: Generated dynamic question from lesson content!");
        }
        
        // Click the first option (incorrectAnswer usually, or whatever)
        console.log("Selecting option 1...");
        const options = await page.$$('button'); // wait, there's multiple buttons
        
        // Let's get all option buttons inside the question container
        // Options have specific class or just the first button inside the list
        // Wait for options to render
        await page.waitForFunction(() => {
            return Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('A.'));
        });
        
        let allButtons = await page.$$('button');
        let optionA = null;
        for (let btn of allButtons) {
            let text = await page.evaluate(el => el.textContent, btn);
            if (text.startsWith("A.")) {
                optionA = btn;
                break;
            }
        }
        
        if (optionA) {
            await optionA.click();
            console.log("Option A selected.");
        } else {
            console.log("Could not find Option A button.");
        }
        
        // Click submit
        let submitBtn = null;
        for (let btn of allButtons) {
            let text = await page.evaluate(el => el.textContent, btn);
            if (text.includes("Submit & Get Next")) {
                submitBtn = btn;
                break;
            }
        }
        
        if (submitBtn) {
            console.log("Clicking Submit...");
            await submitBtn.click();
        }
        
        console.log("Waiting for next question to render...");
        await page.waitForFunction(() => {
            const h2 = document.querySelector('h2');
            return h2 && h2.textContent.includes('Q2.');
        }, { timeout: 20000 });
        
        const q2Text = await page.$eval('h2', el => el.textContent);
        console.log("Second Question Rendered: " + q2Text);
        console.log("PASS: Successfully navigated, generated Q1, submitted, and generated Q2!");
        
    } catch (e) {
        console.error("Test failed: ", e);
    } finally {
        await browser.close();
    }
})();
