/**
 * Playwright-based form submission for citation directories.
 * Navigates to each directory's add-business URL, fills NAP fields, submits.
 * On CAPTCHA or verification wall → returns needsManual = true.
 */

export interface FormSubmissionResult {
  success: boolean;
  listingUrl?: string;
  needsManual?: boolean;
  error?: string;
}

export interface BusinessNAP {
  name: string;
  phone: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  category: string;
}

// Per-directory add-business URLs. Playwright navigates here before filling the form.
const DIRECTORY_FORM_URLS: Record<string, string> = {
  "yellow pages": "https://www.yellowpages.com/add-listing",
  "yp.com": "https://www.yellowpages.com/add-listing",
  "hotfrog": "https://www.hotfrog.com/AddBusiness.aspx",
  "ezlocal": "https://ezlocal.com/add/",
  "brownbook": "https://www.brownbook.net/add-business/",
  "2findlocal": "https://www.2findlocal.com/set/business/add",
  "merchant circle": "https://www.merchantcircle.com/signup",
  "merchantcircle": "https://www.merchantcircle.com/signup",
  "manta": "https://www.manta.com/claim",
  "superpages": "https://www.superpages.com/yellowpages/c-basic-listing",
  "whitepages": "https://www.whitepages.com/business/add",
  "mapquest": "https://developer.mapquest.com/user/me/apps",
  "alignable": "https://www.alignable.com/register",
  "citysearch": "https://www.citysearch.com",
  "n49": "https://n49.com/biz/add",
  "chamberofcommerce.com": "https://www.chamberofcommerce.com/add-business",
  "cylex": "https://www.cylex.us.com/addFirm.html",
  "fyple": "https://www.fyple.com/add-business/",
  "getfave": "https://www.getfave.com/business/add",
  "golocal247": "https://www.golocal247.com/biz/add/",
  "iglobal": "https://www.iglobal.co/united-states/add-business",
  "infobel": "https://www.infobel.com/en/world/add_company",
  "insiderpages": "https://www.insiderpages.com/add_business",
  "localdatabase": "https://www.localdatabase.com/add-business.html",
  "mojopages": "https://www.mojopages.com/biz/add",
  "myhuckleberry": "https://www.myhuckleberry.com/home/add_business",
  "opendi": "https://www.opendi.us/add-business.html",
  "showmelocal": "https://www.showmelocal.com/AddBusiness.aspx",
  "surecraft": "https://www.surecritic.com/register",
  "tuugo": "https://www.tuugo.us/AddCompanyFit",
  "uscity.net": "https://www.uscity.net/add_listing.cfm",
  "whereto": "https://www.whereto.com",
  "yellowmoxie": "https://www.yellowmoxie.com/add-listing",
  "yellowbot": "https://www.yellowbot.com/add-business",
  "zipleaf": "https://zipleaf.us/AddBusiness.aspx",
  "localstack": "https://www.localstack.com",
};

// Field selectors to try for each NAP field (in priority order)
const FIELD_SELECTORS: Record<keyof BusinessNAP, string[]> = {
  name: [
    "input[name='business_name']",
    "input[name='company']",
    "input[name='name']",
    "input[name='BusinessName']",
    "input[id='business_name']",
    "input[id='company']",
    "input[placeholder*='business name' i]",
    "input[placeholder*='company name' i]",
    "input[placeholder*='business' i]",
  ],
  phone: [
    "input[name='phone']",
    "input[name='telephone']",
    "input[name='phone_number']",
    "input[id='phone']",
    "input[type='tel']",
    "input[placeholder*='phone' i]",
    "input[placeholder*='telephone' i]",
  ],
  website: [
    "input[name='website']",
    "input[name='url']",
    "input[name='web']",
    "input[name='website_url']",
    "input[id='website']",
    "input[placeholder*='website' i]",
    "input[placeholder*='url' i]",
    "input[type='url']",
  ],
  address: [
    "input[name='address']",
    "input[name='street']",
    "input[name='address1']",
    "input[name='address_line1']",
    "input[id='address']",
    "input[placeholder*='street address' i]",
    "input[placeholder*='address' i]",
  ],
  city: [
    "input[name='city']",
    "input[id='city']",
    "input[placeholder*='city' i]",
  ],
  state: [
    "select[name='state']",
    "input[name='state']",
    "select[id='state']",
    "input[id='state']",
    "select[name='province']",
    "input[placeholder*='state' i]",
  ],
  zip: [
    "input[name='zip']",
    "input[name='postal_code']",
    "input[name='zipcode']",
    "input[name='postcode']",
    "input[id='zip']",
    "input[placeholder*='zip' i]",
    "input[placeholder*='postal' i]",
  ],
  category: [
    "select[name='category']",
    "input[name='category']",
    "select[name='type']",
    "select[name='business_type']",
    "select[id='category']",
  ],
};

const SUBMIT_SELECTORS = [
  "button[type='submit']",
  "input[type='submit']",
  "button:text('Submit')",
  "button:text('Add Business')",
  "button:text('List My Business')",
  "button:text('Register')",
  "button:text('Get Listed')",
  "button:text('Add Listing')",
  "button:text('Save')",
  "[type='submit']",
];

const CAPTCHA_INDICATORS = [
  "iframe[src*='recaptcha']",
  "iframe[src*='hcaptcha']",
  ".g-recaptcha",
  ".h-captcha",
  "iframe[title*='reCAPTCHA']",
];

export async function submitCitationForm(
  directoryName: string,
  formUrl: string | null,
  business: BusinessNAP
): Promise<FormSubmissionResult> {
  // Resolve the form URL: use the provided one or look up by directory name
  const resolvedUrl =
    formUrl ?? DIRECTORY_FORM_URLS[directoryName.toLowerCase()] ?? null;

  if (!resolvedUrl) {
    return {
      success: false,
      needsManual: true,
      error: `No form URL known for ${directoryName}`,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let browser: any;

  try {
    // Dynamic import — keeps Playwright out of Next.js module graph
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { chromium } = await import("playwright");
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page: any = await context.newPage();

    await page.goto(resolvedUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });

    // Check for CAPTCHA before attempting to fill
    for (const sel of CAPTCHA_INDICATORS) {
      if (await page.$(sel)) {
        return {
          success: false,
          needsManual: true,
          error: "CAPTCHA detected — routing to manual ops",
        };
      }
    }

    let fieldsFilledCount = 0;

    for (const [field, selectors] of Object.entries(FIELD_SELECTORS)) {
      const value = business[field as keyof BusinessNAP];
      if (!value) continue;

      for (const sel of selectors) {
        try {
          const el = await page.$(sel);
          if (!el) continue;

          const tag = await el.evaluate((e: Element) => e.tagName.toLowerCase());

          if (tag === "select") {
            const options: string[] = await el.evaluate((e: Element) =>
              Array.from((e as HTMLSelectElement).options).map((o: HTMLOptionElement) => o.text)
            );
            const match = options.find(
              (o: string) => o.toLowerCase().includes(value.toLowerCase().slice(0, 5))
            );
            if (match) {
              await el.selectOption({ label: match });
              fieldsFilledCount++;
            }
          } else {
            await el.fill(value);
            fieldsFilledCount++;
          }
          break; // Found + filled this field, move to next
        } catch {
          continue;
        }
      }
    }

    // Need at least business name + phone + one location field to be worth submitting
    if (fieldsFilledCount < 3) {
      return {
        success: false,
        needsManual: true,
        error: `Only ${fieldsFilledCount} fields filled for ${directoryName} — site structure unknown`,
      };
    }

    // Find and click submit button
    let submitted = false;
    for (const sel of SUBMIT_SELECTORS) {
      try {
        const btn = await page.$(sel);
        if (btn) {
          await btn.click();
          submitted = true;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!submitted) {
      return {
        success: false,
        needsManual: true,
        error: "Could not locate submit button",
      };
    }

    // Wait for navigation or success page
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});

    // Check for CAPTCHA on resulting page
    for (const sel of CAPTCHA_INDICATORS) {
      if (await page.$(sel)) {
        return {
          success: false,
          needsManual: true,
          error: "CAPTCHA on post-submit page — human required",
        };
      }
    }

    // Check for obvious error messages
    const pageText = (await page.textContent("body")) ?? "";
    const hasError = /error|invalid|failed|incorrect/i.test(pageText.slice(0, 500));
    if (hasError) {
      return {
        success: false,
        needsManual: true,
        error: "Error message detected on submit page",
      };
    }

    const finalUrl = page.url();
    return { success: true, listingUrl: finalUrl !== resolvedUrl ? finalUrl : undefined };
  } catch (err) {
    return { success: false, needsManual: true, error: String(err) };
  } finally {
    await browser?.close();
  }
}
