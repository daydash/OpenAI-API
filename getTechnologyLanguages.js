const puppeteer = require("puppeteer");

const getTechnologyLanguages = async (technologyName) => {
	const browser = await puppeteer.launch({
		args: ["--no-sandbox"],
		// executablePath: path.resolve(__dirname, "../../bin/chromium-browser"),
		headless: true,
	});
	const page = await browser.newPage();
	await page.goto("https://www.metasquaretech.com");
	const technology = `${technologyName} Technologies`;
	// Search for text on the page
	const elements = await page.evaluate((technology) => {
		return Array.from(document.querySelectorAll("*"), (element) => {
			if (element.textContent.includes(technology)) {
				return {
					tagName: element.tagName,
					attributes: Array.from(element.attributes, (attribute) => {
						return {
							name: attribute.name,
							value: attribute.value,
						};
					}),
				};
			}
		}).filter(Boolean);
	}, technology);

	// Click on the last element
	if (elements.length > 0) {
		const lastElement = elements.slice(-1)[0];
		let selector = lastElement.tagName.toLowerCase();
		if (lastElement.attributes.length > 0) {
			const attributeSelectors = lastElement.attributes.map(
				(attr) => `[${attr.name}="${attr.value}"]`
			);
			selector += attributeSelectors.join("");
		}
		await page.click(selector);

		// Find all <h6> headings on the page
		const h6Headings = await page.$$eval("h6", (elements) =>
			elements.map((element) => element.textContent.trim())
		);
		h6Headings.pop();
		h6Headings.pop();

		await browser.close();
		// console.log("h6Headings");
		// console.log(h6Headings);
		return h6Headings;
	} else {
		await browser.close();
		console.log("No element found");
		return [];
	}
};

module.exports = { getTechnologyLanguages };
