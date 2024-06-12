const puppeteer = require('puppeteer');
const fs = require('fs');

const addDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrape() {
    // init
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    // close the popup
    const close_popup = await page.$("div[class='modal is-active dialog-open'] button[class='button is-outlined is-danger']");
    await close_popup.click()

    await addDelay(2000);

    // go to neetcode 150 tab
    const tabLinks = await page.$$("div.tabs.is-centered.is-boxed.is-large ul.tabs-list li a.tab-link")
    await tabLinks[2].click()

    await addDelay(2000);

    // get all the problems
    const problems = await page.$$eval("tr.ng-star-inserted", (rows) => {
        return rows.map((row) => {
            const anchor = row.querySelector("td a.table-text")
            const leetcode_anchor = row.querySelector("td a.has-tooltip-bottom.ng-star-inserted")
            const difficultyElement = row.querySelector("td.diff-col b")
            const container = row.closest(".accordion-container")
            const categoryElement = container
                ? container.querySelector(
                    "button.flex-container-row.accordion.button.is-fullwidth p"
                )
                : null
            const category = categoryElement
                ? categoryElement.textContent.trim()
                : null

            return {
                category: category,
                neetcode_href: anchor ? anchor.href : null,
                leetcode_href: leetcode_anchor ? leetcode_anchor.href : null,
                text: anchor ? anchor.textContent.trim() : null,
                difficulty: difficultyElement
                    ? difficultyElement.textContent.trim()
                    : null,
                solved: false,
            }
        })
    })
    
    fs.writeFileSync('data.json', JSON.stringify(problems));
    console.log("Done");
    
    await browser.close();
}

const url = 'https://neetcode.io/practice';

scrape(url);