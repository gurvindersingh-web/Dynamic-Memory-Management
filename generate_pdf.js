const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  const filePath = path.resolve(__dirname, 'flow_diagrams.html');
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for all Mermaid diagrams to render (they produce SVGs)
  await page.waitForFunction(() => {
    const mermaidDivs = document.querySelectorAll('.mermaid');
    return Array.from(mermaidDivs).every(div => div.querySelector('svg'));
  }, { timeout: 15000 });

  // Extra wait for any final rendering
  await new Promise(r => setTimeout(r, 2000));

  const outputPath = path.resolve(__dirname, 'DMMVisualiser_Flow_Diagrams.pdf');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
  });

  console.log(`PDF saved to: ${outputPath}`);
  await browser.close();
})();
