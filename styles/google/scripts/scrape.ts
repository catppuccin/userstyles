// Modified from https://github.com/WalkQuackBack/google-suite-color-theme/blob/main/scripts/dump-stylesheets.ts

import { chromium, devices, type Page } from 'playwright';
import { interceptRequest } from "./utils.ts";

import UserAgent from "user-agents";

import * as path from "@std/path";

// TODO: Define proper type for cssSources.

// TODO: Fix typings
// deno-lint-ignore no-explicit-any
async function getSiteStyles(page: Page, url: URL): Promise<[string[], any]> {
  await page.goto(url.href, { 
    timeout: 20000,
    waitUntil: 'load'
  });

  await page.screenshot({ path: path.join('screenshots', `${url.pathname}-${url.search.replace('?', '=')}.png`) });

  const cssSources = await page.evaluate(() => {
    const styleTags = Array.from(document.querySelectorAll('style')).map(tag => {
      const dataHref = tag.getAttribute('data-href');
      const absoluteHref = dataHref && new URL(dataHref, document.baseURI).href || '';
      return {
        content: tag.textContent,
        href: absoluteHref,
      }
    }
  );

    const linkTags = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(tag => {
      const href = tag.getAttribute('href');
      if (!href) return '';
      const absoluteHref = new URL(href, document.baseURI).href;
      return absoluteHref;
    });

    return { styleTags, linkTags };
  });

  const stylesheetHrefs: (string)[] = [
    ...cssSources.linkTags,
    ...cssSources.styleTags.filter(s => s.href).map(s => s.href)
  ];

  return [ stylesheetHrefs, cssSources ]
}

export async function scrapeStylesheetsAndCombineForSites(urls: URL[]) {
  const userAgent = new UserAgent({
    deviceCategory: 'desktop',
    platform: 'Win32'
  }).toString();
  
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
    ]
  });
  const context = await browser.newContext({
    userAgent: userAgent
  });
  const page = await context.newPage();

  await interceptRequest(context);

  let combinedCss = '';

  console.log('\n')

  console.log('Extracting data from sites...');

  let allHrefsToFetch: string[] = []

  for (const url of urls) {
    const siteStyles = await getSiteStyles(page, url);
    allHrefsToFetch = allHrefsToFetch.concat(siteStyles[0])
    const cssSources = siteStyles[1]
    
    const inlineCss = cssSources.styleTags
      .filter((s: { href: string; }) => !s.href)
      .map((s: { content: string; }) => s.content)
      .join('\n');
      
      combinedCss += `${inlineCss}\n`;
      console.log(`Combined inline styles from ${url}`);
  }

  browser.close()

  for (let i = 0; i < allHrefsToFetch.length; i++) {
    const href = allHrefsToFetch[i];
    const hrefSplit = href.split('/')
    if (hrefSplit.at(-1)?.startsWith('m=')) {
      hrefSplit.pop()
    }
    allHrefsToFetch[i] = hrefSplit.join('/')
  }

  allHrefsToFetch = allHrefsToFetch.filter((element, index) => {
    return allHrefsToFetch.indexOf(element) === index;
  })

  console.log('Deduplicated fetch list:', allHrefsToFetch)

  console.log('Fetching stylesheets from sites...');
  const linkedCssPromises = allHrefsToFetch.map(href =>
    fetch(href).then(res => res.text()).catch(err => {
      console.error(`Failed to fetch CSS from ${href}:`, err);
      return '';
    })
  );

  const linkedCss = (await Promise.all(linkedCssPromises)).join('\n');
  combinedCss += `${linkedCss}\n`

  console.log(`Successfully fetched stylesheets`);

  return combinedCss
}
