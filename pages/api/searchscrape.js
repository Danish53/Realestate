// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   try {
//     const { searchUrl } = req.body;

//     if (!searchUrl) {
//       return res.status(400).json({ error: "searchUrl is required" });
//     }

//     // Step 1: Validate URL format
//     let canonicalUrl = searchUrl;
    
//     // Check if URL needs correction
//     if (!searchUrl.match(/-1-1\.html$/)) {
//       // Extract city and category from URL
//       const urlObj = new URL(searchUrl);
//       const pathParts = urlObj.pathname.split('/').filter(p => p);
      
//       let category = 'Homes';
//       let city = 'Lahore';
      
//       if (pathParts.length > 0) {
//         if (['Homes', 'Plots', 'Commercial'].includes(pathParts[0])) {
//           category = pathParts[0];
//         }
//         if (pathParts.length > 1 && pathParts[1]) {
//           city = pathParts[1];
//         }
//       }
      
//       canonicalUrl = `https://www.zameen.com/${category}/${city}-1-1.html`;
//       console.log("Converted to canonical URL:", canonicalUrl);
//     }

//     // Step 2: Try different actor input formats
//     console.log("Step 1: Running actor with URL:", canonicalUrl);
    
//     // Format 1: With urls array
//     const runResponse = await fetch(
//       `https://api.apify.com/v2/acts/stealth_mode~zameen-property-search-scraper/runs?token=${process.env.APIFY_TOKEN}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           urls: [canonicalUrl],
//           max_items_per_url: 50,
//           proxy: { useApifyProxy: true }
//         }),
//       }
//     );

//     if (!runResponse.ok) {
//       const errorText = await runResponse.text();
//       console.error("Actor run failed:", errorText);
      
//       // Try alternative format
//       console.log("Trying alternative format...");
//       const altRunResponse = await fetch(
//         `https://api.apify.com/v2/acts/stealth_mode~zameen-property-search-scraper/runs?token=${process.env.APIFY_TOKEN}`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             startUrls: [{ url: canonicalUrl }],
//             maxItems: 50,
//             proxyConfiguration: { useApifyProxy: true }
//           }),
//         }
//       );
      
//       if (!altRunResponse.ok) {
//         return res.status(500).json({ error: "Both formats failed" });
//       }
      
//       runResponse = altRunResponse;
//     }

//     const runData = await runResponse.json();
//     const datasetId = runData.data.defaultDatasetId;
//     console.log("Actor started. Dataset ID:", datasetId);

//     // Step 3: Longer wait time
//     console.log("Step 2: Waiting 15 seconds for actor to finish...");
//     await new Promise(resolve => setTimeout(resolve, 15000));

//     // Step 4: Fetch dataset
//     console.log("Step 3: Fetching dataset items...");
//     const datasetResponse = await fetch(
//       `https://api.apify.com/v2/datasets/${datasetId}/items?token=${process.env.APIFY_TOKEN}`
//     );

//     if (!datasetResponse.ok) {
//       const errorText = await datasetResponse.text();
//       console.error("Dataset fetch failed:", errorText);
//       return res.status(500).json({ error: "Dataset fetch failed" });
//     }
    
//     const properties = await datasetResponse.json();
//     console.log(`Fetched ${properties.length} items`);

//     // Step 5: Check actor status to see if it completed successfully
//     const actorRunResponse = await fetch(
//       `https://api.apify.com/v2/actor-runs/${runData.data.id}?token=${process.env.APIFY_TOKEN}`
//     );
//     const actorStatus = await actorRunResponse.json();
//     console.log("Actor run status:", actorStatus.data.status);

//     return res.status(200).json({
//       success: true,
//       count: properties.length,
//       data: properties,
//       debug: {
//         originalUrl: searchUrl,
//         canonicalUrl: canonicalUrl,
//         actorStatus: actorStatus.data.status,
//         datasetId: datasetId,
//         message: properties.length === 0 ? 
//           "No properties found. Please check if URL has valid listings." : 
//           "Data fetched successfully"
//       }
//     });

//   } catch (error) {
//     console.error("Scrape Error:", error);
//     return res.status(500).json({ 
//       error: "Internal Server Error",
//       details: error.message 
//     });
//   }
// }



// import puppeteer from "puppeteer";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   try {
//     const { searchUrl } = req.body;

//     if (!searchUrl) {
//       return res.status(400).json({ error: "searchUrl is required" });
//     }

//     // Validate URL format
//     try {
//       new URL(searchUrl);
//     } catch (e) {
//       return res.status(400).json({ error: "Invalid URL format" });
//     }

//     // Step 1: URL ko canonical form mein convert karein
//     let canonicalUrl = searchUrl;
//     if (!searchUrl.match(/-1-1\.html$/)) {
//       const urlObj = new URL(searchUrl);
//       const pathParts = urlObj.pathname.split('/').filter(p => p);
      
//       let category = 'Homes';
//       let city = 'Lahore';
      
//       if (pathParts.length > 0) {
//         if (['Homes', 'Plots', 'Commercial'].includes(pathParts[0])) {
//           category = pathParts[0];
//         }
//         if (pathParts.length > 1 && pathParts[1]) {
//           city = pathParts[1];
//         }
//       }
      
//       canonicalUrl = `https://www.zameen.com/${category}/${city}-1-1.html`;
//       console.log("Converted to canonical URL:", canonicalUrl);
//     }

//     let properties = [];
//     let usedMethod = '';

//     // Step 2: Pehle Apify try karein (agar token ho)
//     if (process.env.APIFY_TOKEN) {
//       try {
//         console.log("Trying Apify with URL:", canonicalUrl);
        
//         // Format 1: With urls array
//         let runResponse = await fetch(
//           `https://api.apify.com/v2/acts/stealth_mode~zameen-property-search-scraper/runs?token=${process.env.APIFY_TOKEN}`,
//           {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               urls: [canonicalUrl],
//               max_items_per_url: 50,
//               proxy: { useApifyProxy: true }
//             }),
//           }
//         );

//         // Agar fail ho to alternative format try karein
//         if (!runResponse.ok) {
//           console.log("First format failed, trying alternative...");
//           const altRunResponse = await fetch(
//             `https://api.apify.com/v2/acts/stealth_mode~zameen-property-search-scraper/runs?token=${process.env.APIFY_TOKEN}`,
//             {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 startUrls: [{ url: canonicalUrl }],
//                 maxItems: 50,
//                 proxyConfiguration: { useApifyProxy: true }
//               }),
//             }
//           );
          
//           if (altRunResponse.ok) {
//             runResponse = altRunResponse;
//           }
//         }

//         if (runResponse.ok) {
//           const runData = await runResponse.json();
//           const datasetId = runData.data.defaultDatasetId;
          
//           // Wait for actor to finish
//           await new Promise(resolve => setTimeout(resolve, 15000));
          
//           // Fetch dataset
//           const datasetResponse = await fetch(
//             `https://api.apify.com/v2/datasets/${datasetId}/items?token=${process.env.APIFY_TOKEN}`
//           );
          
//           if (datasetResponse.ok) {
//             properties = await datasetResponse.json();
//             usedMethod = 'apify';
//             console.log(`Apify fetched ${properties.length} properties`);
//           }
//         }
//       } catch (apifyError) {
//         console.log("Apify failed, falling back to puppeteer:", apifyError.message);
//       }
//     }

//     // Step 3: Agar Apify se koi data nahi mila to puppeteer use karein
//     if (properties.length === 0) {
//       console.log("Using puppeteer fallback...");
//       usedMethod = 'puppeteer';
      
//       let browser;
//       try {
//         browser = await puppeteer.launch({
//           headless: true,
//           args: [
//             "--no-sandbox", 
//             "--disable-setuid-sandbox",
//             "--disable-dev-shm-usage",
//             "--disable-gpu",
//             "--single-process"
//           ],
//         });

//         const page = await browser.newPage();
        
//         await page.setUserAgent(
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
//         );
        
//         await page.setViewport({ width: 1366, height: 768 });

//         await page.goto(canonicalUrl, {
//           waitUntil: "networkidle2",
//           timeout: 60000,
//         });

//         // Wait for content
//         await new Promise(resolve => setTimeout(resolve, 5000));

//         // Scroll to load lazy content
//         await page.evaluate(async () => {
//           await new Promise((resolve) => {
//             let totalHeight = 0;
//             const distance = 100;
//             const timer = setInterval(() => {
//               const scrollHeight = document.body.scrollHeight;
//               window.scrollBy(0, distance);
//               totalHeight += distance;

//               if (totalHeight >= scrollHeight) {
//                 clearInterval(timer);
//                 resolve();
//               }
//             }, 200);
//           });
//         });

//         await new Promise(resolve => setTimeout(resolve, 3000));

//         // Extract data
//         properties = await page.evaluate(() => {
//           const cards = document.querySelectorAll("article");

//           return Array.from(cards).map((card, index) => {
//             // Extract title
//             const title = card.querySelector("h2, h3")?.innerText?.trim() || null;

//             // Extract price
//             const priceText = card.innerText;
//             let price = null;
//             const priceMatch = priceText.match(/PKR\s*([0-9,]+(?:\.[0-9]+)?)?/);
//             if (priceMatch) {
//               price = priceMatch[0].trim();
//             }

//             // Extract images (with watermarks)
//             const images = Array.from(card.querySelectorAll("img"))
//               .map(img => img.src || img.dataset?.src)
//               .filter(src => src && src.includes('zameen.com'))
//               .map(src => src.startsWith('http') ? src : `https:${src}`)
//               .slice(0, 3);

//             // Extract URL
//             const link = card.querySelector("a[href*='/Property/'], a[href*='/new-projects/']");
//             let url = link?.href || null;
//             if (url && url.startsWith('/')) {
//               url = `https://www.zameen.com${url}`;
//             }

//             // Extract location
//             const location = card.querySelector('[class*="location"]')?.innerText?.trim() || null;
            
//             // Extract area
//             const area = card.innerText.match(/(\d+)\s*(Marla|Kanal|Square)/i)?.[0] || null;

//             return {
//               id: `${index}-${Date.now()}`,
//               title,
//               price,
//               images: images.map(img => ({
//                 url: img,
//                 attribution: "Source: Zameen.com",
//                 watermarkPresent: true,
//                 note: "Original watermark - do not remove"
//               })),
//               url,
//               location,
//               area,
//               source: "Zameen.com"
//             };
//           }).filter(p => p.title || p.price);
//         });

//         await browser.close();
//         console.log(`Puppeteer fetched ${properties.length} properties`);

//       } catch (puppeteerError) {
//         if (browser) await browser.close();
//         throw new Error(`Both Apify and Puppeteer failed: ${puppeteerError.message}`);
//       }
//     }

//     // Remove duplicates
//     const uniqueProperties = properties.filter((prop, index, self) => 
//       prop.url && index === self.findIndex(p => p.url === prop.url)
//     );

//     // Return response
//     return res.status(200).json({
//       success: true,
//       count: uniqueProperties.length,
//       data: uniqueProperties,
//       method: usedMethod,
//       message: uniqueProperties.length === 0 ? 
//         "No properties found. Please check if URL has valid listings." : 
//         "Data fetched successfully",
//       legal: {
//         notice: "All images contain original watermarks from Zameen.com. Do not modify or remove.",
//         source: "Zameen.com",
//         usage: "For personal use only. Commercial use requires permission."
//       },
//       debug: {
//         originalUrl: searchUrl,
//         canonicalUrl: canonicalUrl,
//         usedMethod: usedMethod
//       }
//     });

//   } catch (error) {
//     console.error("Scrape Error:", error);
//     return res.status(500).json({ 
//       error: "Internal Server Error",
//       details: error.message
//     });
//   }
// }




// import puppeteer from "puppeteer";
// import { ApifyClient } from 'apify-client';

// // Initialize Apify client
// const apifyClient = new ApifyClient({
//   token: process.env.APIFY_TOKEN,
// });

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   try {
//     const { 
//       city = 'Lahore',
//       category = 'Homes',
//       filters = {},
//       limit = 50,
//       useApify = true 
//     } = req.body;

//     // Validate input
//     if (!city) {
//       return res.status(400).json({ error: "City is required" });
//     }

//     let properties = [];
//     let usedMethod = '';
//     let totalPagesScraped = 0;

//     // STEP 1: Try Apify first (if enabled and token available)
//     if (useApify && process.env.APIFY_TOKEN) {
//       try {
//         console.log("🔍 Using Apify for comprehensive search...");
        
//         // Prepare Apify input for comprehensive search
//         const apifyInput = {
//           category: category,
//           location: city,
//           results_wanted: limit * 3, // Get more results for filtering
//           max_pages: 5, // Scrape multiple pages
//           scrapeDetails: true,
//           proxyConfiguration: { useApifyProxy: true }
//         };

//         // Add filters to Apify input
//         if (filters.keyword) apifyInput.keyword = filters.keyword;
//         if (filters.price_min || filters.price_max) {
//           apifyInput.price = {
//             min: filters.price_min,
//             max: filters.price_max
//           };
//         }
//         if (filters.area_min || filters.area_max) {
//           apifyInput.area = {
//             min: filters.area_min,
//             max: filters.area_max
//           };
//         }
//         if (filters.bedrooms) apifyInput.bedrooms = filters.bedrooms;
//         if (filters.bathrooms) apifyInput.bathrooms = filters.bathrooms;
//         if (filters.purpose) apifyInput.purpose = filters.purpose;

//         // Run Apify actor
//         const run = await apifyClient.actor("shahidirfan/zameen-com-scraper").call(apifyInput);
        
//         // Get results
//         const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();
        
//         if (items && items.length > 0) {
//           properties = items;
//           usedMethod = 'apify';
//           console.log(`✅ Apify fetched ${properties.length} properties`);
//         }
//       } catch (apifyError) {
//         console.log("⚠️ Apify failed:", apifyError.message);
//       }
//     }

//     // STEP 2: If Apify failed or returned no results, use Puppeteer with multi-page scraping
//     if (properties.length === 0) {
//       console.log("🔍 Using Puppeteer for comprehensive search...");
//       usedMethod = 'puppeteer';
      
//       let browser;
//       try {
//         browser = await puppeteer.launch({
//           headless: true,
//           args: ["--no-sandbox", "--disable-setuid-sandbox"],
//         });

//         const page = await browser.newPage();
//         await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36");

//         // Scrape multiple pages
//         const allProperties = [];
//         const maxPages = 5; // Configurable
//         let currentPage = 1;

//         while (currentPage <= maxPages && allProperties.length < limit * 2) {
//           // Build URL for current page with filters
//           const pageUrl = buildZameenUrl(city, category, currentPage, filters);
//           console.log(`📄 Scraping page ${currentPage}: ${pageUrl}`);

//           try {
//             await page.goto(pageUrl, {
//               waitUntil: "networkidle2",
//               timeout: 60000,
//             });

//             // Wait for content
//             await new Promise(resolve => setTimeout(resolve, 5000));

//             // Scroll to load lazy content
//             await autoScroll(page);

//             // Extract properties from current page
//             const pageProperties = await extractPropertiesFromPage(page);
            
//             if (pageProperties.length === 0) {
//               console.log(`⚠️ No properties found on page ${currentPage}, stopping...`);
//               break;
//             }

//             console.log(`✅ Page ${currentPage}: Found ${pageProperties.length} properties`);
//             allProperties.push(...pageProperties);
            
//             // Check if we have a next page
//             const hasNextPage = await page.evaluate(() => {
//               const nextButton = document.querySelector('a[rel="next"]');
//               return nextButton !== null;
//             });

//             if (!hasNextPage) {
//               console.log("📌 No more pages available");
//               break;
//             }

//             currentPage++;
            
//             // Small delay between pages
//             await new Promise(resolve => setTimeout(resolve, 3000));

//           } catch (pageError) {
//             console.log(`⚠️ Error on page ${currentPage}:`, pageError.message);
//             break;
//           }
//         }

//         properties = allProperties;
//         totalPagesScraped = currentPage;

//         await browser.close();

//       } catch (puppeteerError) {
//         if (browser) await browser.close();
//         throw puppeteerError;
//       }
//     }

//     // STEP 3: Apply filters to the scraped data (double-check filtering)
//     const filteredProperties = applyFilters(properties, filters);
    
//     // STEP 4: Remove duplicates by URL
//     const uniqueProperties = removeDuplicates(filteredProperties);
    
//     // STEP 5: Limit results
//     const finalProperties = uniqueProperties.slice(0, limit);

//     // STEP 6: Format response
//     return res.status(200).json({
//       success: true,
//       count: finalProperties.length,
//       totalScraped: properties.length,
//       totalPagesScraped: totalPagesScraped,
//       data: finalProperties.map(formatProperty),
//       filters: filters,
//       method: usedMethod,
//       message: finalProperties.length === 0 ? 
//         "No properties found matching your filters" : 
//         `Found ${finalProperties.length} properties`,
//       legal: {
//         notice: "All images contain original watermarks from Zameen.com.",
//         source: "Zameen.com"
//       }
//     });

//   } catch (error) {
//     console.error("❌ Scrape Error:", error);
//     return res.status(500).json({ 
//       error: "Internal Server Error",
//       details: error.message 
//     });
//   }
// }

// // ============= HELPER FUNCTIONS =============

// function buildZameenUrl(city, category = 'Homes', page = 1, filters = {}) {
//   let url = `https://www.zameen.com/${category}/${city}-${page}-1.html`;
  
//   const filterParams = new URLSearchParams();
  
//   // Price filters
//   if (filters.price_min) filterParams.append('price_min', filters.price_min);
//   if (filters.price_max) filterParams.append('price_max', filters.price_max);
  
//   // Area filters (convert to sqft if needed)
//   if (filters.area_min) filterParams.append('area_min', filters.area_min);
//   if (filters.area_max) filterParams.append('area_max', filters.area_max);
  
//   // Bedrooms/Bathrooms
//   if (filters.bedrooms) filterParams.append('bedrooms', filters.bedrooms);
//   if (filters.bathrooms) filterParams.append('bathrooms', filters.bathrooms);
  
//   // Purpose
//   if (filters.purpose) filterParams.append('purpose', filters.purpose);
  
//   // Property type
//   if (filters.property_type) filterParams.append('property_type', filters.property_type);
  
//   const filterString = filterParams.toString();
//   if (filterString) {
//     url += '?' + filterString;
//   }
  
//   return url;
// }

// async function autoScroll(page) {
//   await page.evaluate(async () => {
//     await new Promise((resolve) => {
//       let totalHeight = 0;
//       const distance = 100;
//       const timer = setInterval(() => {
//         const scrollHeight = document.body.scrollHeight;
//         window.scrollBy(0, distance);
//         totalHeight += distance;

//         if (totalHeight >= scrollHeight) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 200);
//     });
//   });
// }

// async function extractPropertiesFromPage(page) {
//   return await page.evaluate(() => {
//     const cards = document.querySelectorAll("article");
    
//     return Array.from(cards).map((card, index) => {
//       // Extract title
//       const title = card.querySelector("h2, h3, [class*='title']")?.innerText?.trim() || null;

//       // Extract price
//       const priceText = card.innerText;
//       let price = null;
//       let priceNumeric = null;
      
//       const priceMatch = priceText.match(/PKR\s*([0-9,]+(?:\.[0-9]+)?)?/);
//       if (priceMatch) {
//         price = priceMatch[0].trim();
//         // Extract numeric value for filtering
//         const numericMatch = priceMatch[1]?.replace(/,/g, '');
//         priceNumeric = numericMatch ? parseFloat(numericMatch) : null;
//       }

//       // Extract images
//       const images = Array.from(card.querySelectorAll("img"))
//         .map(img => img.src || img.dataset?.src)
//         .filter(src => src && src.includes('zameen.com'))
//         .map(src => src.startsWith('http') ? src : `https:${src}`)
//         .slice(0, 3);

//       // Extract URL
//       const link = card.querySelector("a[href*='/Property/'], a[href*='/new-projects/']");
//       let url = link?.href || null;
//       if (url && url.startsWith('/')) {
//         url = `https://www.zameen.com${url}`;
//       }

//       // Extract location
//       const location = card.querySelector('[class*="location"], [class*="address"]')?.innerText?.trim() || null;
      
//       // Extract area
//       let area = null;
//       let areaNumeric = null;
//       const areaMatch = card.innerText.match(/(\d+)\s*(Marla|Kanal|Square)/i);
//       if (areaMatch) {
//         area = areaMatch[0];
//         areaNumeric = parseFloat(areaMatch[1]);
//       }

//       // Extract bedrooms/bathrooms
//       let bedrooms = null;
//       const bedMatch = card.innerText.match(/(\d+)\s*(Bed|Bedroom)/i);
//       if (bedMatch) bedrooms = parseInt(bedMatch[1]);

//       return {
//         title,
//         price,
//         priceNumeric,
//         images,
//         url,
//         location,
//         area,
//         areaNumeric,
//         bedrooms,
//         source: "Zameen.com",
//         scrapedAt: new Date().toISOString()
//       };
//     }).filter(p => p.title || p.price);
//   });
// }

// function applyFilters(properties, filters) {
//   return properties.filter(prop => {
//     // Price filter
//     if (filters.price_min && prop.priceNumeric) {
//       if (prop.priceNumeric < filters.price_min) return false;
//     }
//     if (filters.price_max && prop.priceNumeric) {
//       if (prop.priceNumeric > filters.price_max) return false;
//     }

//     // Area filter
//     if (filters.area_min && prop.areaNumeric) {
//       if (prop.areaNumeric < filters.area_min) return false;
//     }
//     if (filters.area_max && prop.areaNumeric) {
//       if (prop.areaNumeric > filters.area_max) return false;
//     }

//     // Bedrooms filter
//     if (filters.bedrooms && prop.bedrooms) {
//       if (prop.bedrooms !== filters.bedrooms) return false;
//     }

//     // Keyword filter (search in title)
//     if (filters.keyword && prop.title) {
//       const keyword = filters.keyword.toLowerCase();
//       if (!prop.title.toLowerCase().includes(keyword)) return false;
//     }

//     // Location filter
//     if (filters.location && prop.location) {
//       const location = filters.location.toLowerCase();
//       if (!prop.location.toLowerCase().includes(location)) return false;
//     }

//     return true;
//   });
// }

// function removeDuplicates(properties) {
//   const seen = new Set();
//   return properties.filter(prop => {
//     if (!prop.url) return true;
//     if (seen.has(prop.url)) return false;
//     seen.add(prop.url);
//     return true;
//   });
// }

// function formatProperty(prop) {
//   return {
//     id: prop.url ? Buffer.from(prop.url).toString('base64').substring(0, 10) : Date.now(),
//     title: prop.title,
//     price: prop.price,
//     images: prop.images.map(img => ({
//       url: img,
//       attribution: "Source: Zameen.com",
//       watermarkPresent: true
//     })),
//     url: prop.url,
//     location: prop.location,
//     area: prop.area,
//     bedrooms: prop.bedrooms,
//     source: prop.source
//   };
// }


// import puppeteer from "puppeteer";

// export default async function handler(req, res) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

//   try {
//     const { 
//       city = 'Lahore',
//       category = 'Homes',
//       filters = {},
//       limit = 40,
//       maxPages = 10  // 👈 Kitne pages scrape karne hain
//     } = req.body;

//     if (!city) {
//       return res.status(400).json({ error: "City is required" });
//     }

//     let browser;
//     let allProperties = [];
//     let currentPage = 1;
//     let usedMethod = 'puppeteer';

//     try {
//       browser = await puppeteer.launch({
//         headless: true,
//         args: ["--no-sandbox", "--disable-setuid-sandbox"],
//       });

//       const page = await browser.newPage();
//       await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120 Safari/537.36");

//       // Multiple pages scrape karein
//       while (currentPage <= maxPages && allProperties.length < limit) {
        
//         // Build URL for current page 
//         const pageUrl = buildZameenUrl(city, category, currentPage, filters);
//         console.log(`📄 Scraping page ${currentPage}/${maxPages}: ${pageUrl}`);

//         try {
//           await page.goto(pageUrl, {
//             waitUntil: "networkidle2",
//             timeout: 60000,
//           });

//           // Wait for content
//           await new Promise(resolve => setTimeout(resolve, 1500));

//           // Scroll to load lazy content
//           // await autoScroll(page);

//           // Extract properties
//           const pageProperties = await extractPropertiesFromPage(page);
          
//           if (pageProperties.length === 0) {
//             console.log(`⚠️ No properties on page ${currentPage}`);
//             break;
//           }

//           console.log(`✅ Page ${currentPage}: Found ${pageProperties.length} properties`);
//           allProperties.push(...pageProperties);
          
//           // Increment page counter - FORCE next page
//           currentPage++;
          
//           // Delay between pages
//           await new Promise(resolve => setTimeout(resolve, 3000));

//         } catch (pageError) {
//           console.log(`⚠️ Error on page ${currentPage}:`, pageError.message);
//           break;
//         }
//       }

//       await browser.close();

//       // Apply filters
//       // Remove duplicates
// const uniqueProperties = removeDuplicates(allProperties);

// // Apply filters properly
// const filteredProperties = applyFilters(uniqueProperties, filters);

// // Apply limit after filtering
// const finalProperties = filteredProperties.slice(0, limit);

//       return res.status(200).json({
//         success: true,
//         count: finalProperties.length,
//         totalScraped: allProperties.length,
//         totalPagesScraped: currentPage - 1, // Actual pages scraped
//         data: finalProperties.map(formatProperty),
//         filters: filters,
//         method: usedMethod,
//         message: finalProperties.length === 0 
//           ? "No properties found matching your filters" 
//           : `Found ${finalProperties.length} properties from ${currentPage-1} pages`,
//         legal: {
//           notice: "All images contain original watermarks from Zameen.com.",
//           source: "Zameen.com"
//         }
//       });

//     } catch (error) {
//       if (browser) await browser.close();
//       throw error;
//     }

//   } catch (error) {
//     console.error("❌ Scrape Error:", error);
//     return res.status(500).json({ 
//       error: "Internal Server Error",
//       details: error.message 
//     });
//   }
// }

// // ============= HELPER FUNCTIONS =============

// function buildZameenUrl(city, category = 'Homes', page = 1, filters = {}) {
//   let url = `https://www.zameen.com/${category}/${city}-${page}-1.html`;
  
//   const filterParams = new URLSearchParams();
  
//   if (filters.price_min) filterParams.append('price_min', filters.price_min);
//   if (filters.price_max) filterParams.append('price_max', filters.price_max);
//   if (filters.area_min) filterParams.append('area_min', filters.area_min);
//   if (filters.area_max) filterParams.append('area_max', filters.area_max);
//   if (filters.bedrooms) filterParams.append('bedrooms', filters.bedrooms);
//   if (filters.bathrooms) filterParams.append('bathrooms', filters.bathrooms);
//   if (filters.purpose) filterParams.append('purpose', filters.purpose);
//   if (filters.property_type) filterParams.append('property_type', filters.property_type);
  
//   const filterString = filterParams.toString();
//   if (filterString) {
//     url += '?' + filterString;
//   }
  
//   return url;
// }

// async function autoScroll(page) {
//   await page.evaluate(async () => {
//     await new Promise((resolve) => {
//       let totalHeight = 0;
//       const distance = 100;
//       const timer = setInterval(() => {
//         const scrollHeight = document.body.scrollHeight;
//         window.scrollBy(0, distance);
//         totalHeight += distance;

//         if (totalHeight >= scrollHeight) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 200);
//     });
//   });
// }

// async function extractPropertiesFromPage(page) {
//   return await page.evaluate(() => {
//     const cards = document.querySelectorAll("article");
    
//     return Array.from(cards).map((card) => {
//       const title = card.querySelector("h2, h3, [class*='title']")?.innerText?.trim() || null;

//       const description =
//         card.querySelector('[class*="description"], p')?.innerText?.trim() || null;

//       const priceText = card.innerText;
//       let price = null;
//       let priceNumeric = null;
      
//       const priceMatch = priceText.match(/PKR\s*([0-9,]+(?:\.[0-9]+)?)?/);
//       if (priceMatch) {
//         price = priceMatch[0].trim();
//         const numericMatch = priceMatch[1]?.replace(/,/g, '');
//         priceNumeric = numericMatch ? parseFloat(numericMatch) : null;
//       }

//       const images = Array.from(card.querySelectorAll("img"))
//         .map(img => img.src || img.dataset?.src)
//         .filter(src => src && src.includes('zameen.com'))
//         .map(src => src.startsWith('http') ? src : `https:${src}`)
//         .slice(0, 3);

//       const link = card.querySelector("a[href*='/Property/'], a[href*='/new-projects/']");
//       let url = link?.href || null;
//       if (url && url.startsWith('/')) {
//         url = `https://www.zameen.com${url}`;
//       }

//       const location = card.querySelector('[class*="location"], [class*="address"]')?.innerText?.trim() || null;
      
//       let area = null;
//       let areaNumeric = null;
//       const areaMatch = card.innerText.match(/(\d+)\s*(Marla|Kanal|Square)/i);
//       if (areaMatch) {
//         area = areaMatch[0];
//         areaNumeric = parseFloat(areaMatch[1]);
//       }

//       let bedrooms = null;
//       const bedMatch = card.innerText.match(/(\d+)\s*(Bed|Bedroom)/i);
//       if (bedMatch) bedrooms = parseInt(bedMatch[1]);

//       return {
//         title,
//         description,
//         price,
//         priceNumeric,
//         images,
//         url,
//         location,
//         area,
//         areaNumeric,
//         bedrooms,
//         source: "Zameen.com"
//       };
//     }).filter(p => p.title || p.price);
//   });
// }

// function applyFilters(properties, filters) {
//   return properties.filter(prop => {
//     if (filters.price_min && prop.priceNumeric && prop.priceNumeric < filters.price_min) return false;
//     if (filters.price_max && prop.priceNumeric && prop.priceNumeric > filters.price_max) return false;
//     if (filters.area_min && prop.areaNumeric && prop.areaNumeric < filters.area_min) return false;
//     if (filters.area_max && prop.areaNumeric && prop.areaNumeric > filters.area_max) return false;
//     if (filters.bedrooms && prop.bedrooms && prop.bedrooms !== filters.bedrooms) return false;
//     if (filters.keyword && prop.title && !prop.title.toLowerCase().includes(filters.keyword.toLowerCase())) return false;
//     return true;
//   });
// }

// function removeDuplicates(properties) {
//   const seen = new Set();
//   return properties.filter(prop => {
//     if (!prop.url) return true;
//     if (seen.has(prop.url)) return false;
//     seen.add(prop.url);
//     return true;
//   });
// }

// function formatProperty(prop) {
//   return {
//     id: prop.url ? Buffer.from(prop.url).toString('base64').substring(0, 10) : Date.now().toString(),
//     title: prop.title,
//     description: prop.description || null,
//     price: prop.price,
//     images: prop.images.map(img => ({
//       url: img,
//       attribution: "Source: Zameen.com",
//       watermarkPresent: true
//     })),
//     url: prop.url,
//     location: prop.location,
//     area: prop.area,
//     bedrooms: prop.bedrooms,
//     source: prop.source
//   };
// }


// pages/api/searchscrape.js
import axios from "axios";
import * as cheerio from "cheerio";
import NodeCache from "node-cache";

const myCache = new NodeCache({ stdTTL: 3600 });
// --------- Zameen URL builder ---------
export function buildZameenUrl({ category = "Residential_Plots", citySlug, areaSlug, page = 1 }) {
  const baseSlug = areaSlug || citySlug;
  if (!baseSlug) throw new Error("citySlug or areaSlug required");
  const clean = baseSlug.replace(/^\//, "");
  return `https://www.zameen.com/${category}/${clean}-${page}.html`;
}

// --------- Pagination se total pages nikalna ---------
function detectTotalPagesFromDom($, targetUrl) {
  let maxPage = 1;
  try {
    const urlObj = new URL(targetUrl);
    const path = urlObj.pathname;
    const basePrefix = path.replace(/-(\d+)\.html$/, "-");

    $("a[href]").each((i, el) => {
      const href = $(el).attr("href");
      if (!href) return;
      let fullHref = href;
      if (!href.startsWith("http")) fullHref = urlObj.origin + href;

      const m = fullHref.match(/-(\d+)\.html$/);
      if (!m) return;
      const pageNum = parseInt(m[1], 10);
      if (Number.isNaN(pageNum)) return;

      const linkPath = new URL(fullHref).pathname;
      if (!linkPath.startsWith(basePrefix)) return;
      if (pageNum > maxPage) maxPage = pageNum;
    });
  } catch (e) {
    console.error("detectTotalPagesFromDom error:", e.message);
  }
  return maxPage;
}

export default async function handler(req, res) {
  const { url, category, citySlug, areaSlug, page = "1" } = req.query;

  let targetUrl;

  if (url) {
    targetUrl = url;
  } else if (category && (citySlug || areaSlug)) {
    targetUrl = buildZameenUrl({
      category,
      citySlug,
      areaSlug,
      page: Number(page) || 1,
    });
  } else {
    return res.status(400).json({
      error:
        "Either ?url=full_zameen_url OR (?category=... & citySlug=... / areaSlug=...) required",
    });
  }

  // --- CACHE CHECK ---
  const cachedData = myCache.get(targetUrl);
  if (cachedData) {
    console.log("Serving from Cache: " + targetUrl);
    return res.status(200).json(cachedData);
  }

  // category se propertyType hint
  let propertyType = null;
  if (category) {
    const c = category.toLowerCase();
    if (c.includes("plot")) propertyType = "plot";
    else if (c === "houses") propertyType = "house";
    else if (c === "flats") propertyType = "flat";
  }

  try {
    const { data: html } = await axios.get("https://api.zenrows.com/v1/", {
      params: {
        url: targetUrl,
        apikey: process.env.ZENROWS_KEY,
        js_render: "false",
        premium_proxy: "false",
        // proxy_country: "pk",
        // wait_for: "li[role='article'][aria-label='Listing']",
      },
    });

    const $ = cheerio.load(html);
    const cards = $("li[role='article'][aria-label='Listing']");
    const totalPages = detectTotalPagesFromDom($, targetUrl);
    const properties = [];

    cards.each((i, el) => {
      const card = $(el);
      const linkEl = card.find('a[aria-label="Listing link"]').first();

      const title =
        linkEl.attr("title")?.trim() ||
        card.find("h4").first().text().trim() ||
        "";

      const relativeHref = linkEl.attr("href") || "";
      let link = relativeHref;
      if (link && !link.startsWith("http")) {
        link = "https://www.zameen.com" + link;
      }

      const price = card
        .find('span[aria-label="Price"]')
        .first()
        .text()
        .trim();

      const location = card
        .find('div[aria-label="Location"]')
        .first()
        .text()
        .trim();

      const area =
        card
          .find('span[aria-label="Area"] span')
          .first()
          .text()
          .trim() || null;

      // const image =
      //   card.find('img[aria-label="Listing photo"]').first().attr("src") ||
      //   null;
      // --- IMAGE: robust extraction ---
let image = null;

// 1) Listing / fallback photo by aria-label
let imgEl = card
  .find(
    'img[aria-label="Listing photo"], img[aria-label="Fallback listing photo"]'
  )
  .first();

// 2) Agar nahi mila to picture ke under img dekh lo (lazy-load cases)
if (!imgEl || !imgEl.length) {
  imgEl = card.find("picture img").first();
}

// 3) Agar phir bhi nahi mila to card ke andar pehla img (last fallback)
if (!imgEl || !imgEl.length) {
  imgEl = card.find("img").first();
}

// 4) src / data-src / data-srcset se URL le lo
if (imgEl && imgEl.length) {
  image =
    imgEl.attr("src") ||
    imgEl.attr("data-src") ||
    (imgEl.attr("data-srcset")
      ? imgEl.attr("data-srcset").split(" ")[0]
      : null) ||
    null;
}


// const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME; // Apna asli name yahan likhen

// if (image) {
//     // Agar image URL "//" se shuru ho raha hai to "https:" add karein
//     const fullImageUrl = image.startsWith('//') ? `https:${image}` : image;

//     // AI Generative Remove URL
//     image = `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/e_gen_remove:prompt_watermark;multiple_true/f_auto,q_auto/${encodeURIComponent(fullImageUrl)}`;
// }
// Next.js (pages/api/searchscrape.js)
// if (image) {
//     const fullImageUrl = image.startsWith('//') ? `https:${image}` : image;
    
//     // Ye line Next.js ko bata rahi hai ke image clean karne ke liye 
//     // localhost:5001 (Python) ke paas jao
//     image = `http://localhost:5001/clean?url=${encodeURIComponent(fullImageUrl)}`;
// }

      const added =
        card
          .find('span[aria-label="Listing creation date"]')
          .first()
          .text()
          .trim() || null;

      // Beds / Baths selectors – agar Zameen me "Bedrooms"/"Bathrooms" ho to yahan change karo
      const bedsText =
        card
          .find('[aria-label="Beds"] span')
          .first()
          .text()
          .trim() ||
        card
          .find('span[aria-label="Beds"]')
          .first()
          .text()
          .trim() ||
        null;

      const bathsText =
        card
          .find('[aria-label="Baths"] span')
          .first()
          .text()
          .trim() ||
        card
          .find('span[aria-label="Baths"]')
          .first()
          .text()
          .trim() ||
        null;

      const beds = bedsText || null;
      const baths = bathsText || null;

      properties.push({
        title,
        price,
        location,
        area,
        link,
        image,
        added,
        beds,
        baths,
        propertyType, // "plot" / "house" / "flat" (based on category)
      });
    });

    const responseData = {
      url: targetUrl,
      page: Number(page) || 1,
      totalPages,
      count: properties.length,
      properties,
    };

    // --- SAVE TO CACHE ---
    myCache.set(targetUrl, responseData);

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Scrape error:", error.message);
    return res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
}



// import puppeteer from "puppeteer";

// export default async function handler(req, res) {
//   const { searchUrl } = req.body;

//   if (!searchUrl) {
//     return res.status(400).json({ error: "searchUrl is required" });
//   }

//   let browser;

//   try {
//     browser = await puppeteer.launch({
//       headless: true,
//       args: ["--no-sandbox", "--disable-setuid-sandbox"],
//     });

//     const page = await browser.newPage();

//     // Set a more realistic user agent
//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//     );

//     // Set viewport to mimic a real device
//     await page.setViewport({
//       width: 1366,
//       height: 768,
//     });

//     await page.goto(searchUrl, {
//       waitUntil: "networkidle2", // Wait for network to be idle
//       timeout: 60000,
//     });

//     // Wait longer for dynamic content to load
//     await new Promise(resolve => setTimeout(resolve, 8000));

//     // Scroll to load lazy-loaded images
//     await page.evaluate(async () => {
//       await new Promise((resolve) => {
//         let totalHeight = 0;
//         const distance = 100;
//         const timer = setInterval(() => {
//           const scrollHeight = document.body.scrollHeight;
//           window.scrollBy(0, distance);
//           totalHeight += distance;

//           if (totalHeight >= scrollHeight) {
//             clearInterval(timer);
//             resolve();
//           }
//         }, 200);
//       });
//     });

//     // Wait a bit more after scrolling
//     await new Promise(resolve => setTimeout(resolve, 3000));

//     // Enhanced data extraction
//     const properties = await page.evaluate(() => {
//       const cards = document.querySelectorAll("article");

//       return Array.from(cards).map(card => {
//         // Extract title
//         const titleElement = card.querySelector("h2, h3, [aria-label*='title'], ._7c6b3a6e");
//         const title = titleElement?.innerText?.trim() || null;

//         // Extract price - handle multiple price formats
//         const priceText = card.innerText;
//         let price = null;
        
//         // Look for PKR prices with numbers
//         const priceMatch = priceText.match(/PKR\s*([0-9,]+(?:\.[0-9]+)?)?/);
//         if (priceMatch) {
//           price = priceMatch[0].trim();
//         } else {
//           // Alternative price patterns
//           const altPriceMatch = priceText.match(/(?:Rs\.?|PKR)\s*([0-9,]+(?:\.[0-9]+)?)/i);
//           if (altPriceMatch) {
//             price = altPriceMatch[0].trim();
//           }
//         }

//         // Extract images - multiple selectors for different structures
//         let images = [];
        
//         // Try different image selectors
//         const imgSelectors = [
//           "img[src*='zameen']",
//           "img._6d4a704c",
//           ".image-gallery img",
//           "picture img",
//           "img[loading='lazy']"
//         ];
        
//         for (const selector of imgSelectors) {
//           const imgElements = card.querySelectorAll(selector);
//           if (imgElements.length > 0) {
//             images = Array.from(imgElements)
//               .map(img => img.src || img.dataset.src)
//               .filter(src => src && src.includes('zameen.com'))
//               .map(src => src.startsWith('http') ? src : `https:${src}`);
//             if (images.length > 0) break;
//           }
//         }

//         // If no images found with specific selectors, try all images
//         if (images.length === 0) {
//           images = Array.from(card.querySelectorAll("img"))
//             .map(img => img.src || img.dataset.src)
//             .filter(src => src && src.includes('zameen.com'))
//             .map(src => src.startsWith('http') ? src : `https:${src}`);
//         }

//         // Extract URL
//         const linkElement = card.querySelector("a[href*='/Property/'], a[href*='/new-projects/']");
//         let url = linkElement?.href || null;
        
//         // Ensure URL is absolute
//         if (url && url.startsWith('/')) {
//           url = `https://www.zameen.com${url}`;
//         }

//         // Extract additional details
//         const location = card.querySelector('[class*="location"], [aria-label*="location"]')?.innerText?.trim() || null;
        
//         const area = card.innerText.match(/(\d+)\s*(Marla|Kanal|Square)/i)?.[0] || null;
        
//         const propertyType = card.innerText.includes('House') ? 'House' : 
//                            card.innerText.includes('Flat') ? 'Flat' : 
//                            card.innerText.includes('Plot') ? 'Plot' : null;

//         return {
//           title,
//           price,
//           images,
//           url,
//           location,
//           area,
//           propertyType,
//           description: title, // Using title as description for now
//           timestamp: new Date().toISOString()
//         };
//       }).filter(property => property.title || property.price); // Filter out empty entries
//     });

//     await browser.close();

//     // Filter out any null/empty entries and remove duplicates by URL
//     const uniqueProperties = properties.filter((prop, index, self) => 
//       prop.url && index === self.findIndex(p => p.url === prop.url)
//     );

//     return res.status(200).json({
//       success: true,
//       count: uniqueProperties.length,
//       data: uniqueProperties,
//       timestamp: new Date().toISOString()
//     });

//   } catch (error) {
//     if (browser) await browser.close();
//     console.error("Scrape Error:", error);
//     return res.status(500).json({ 
//       error: "Scraping failed", 
//       details: error.message 
//     });
//   }
// }



