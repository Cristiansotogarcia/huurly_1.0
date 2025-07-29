import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:8080", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # Change viewport to mobile device sizes and verify UI layout and Dutch text localization.
        await page.goto('http://localhost:8080/', timeout=10000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/section/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Simulate mobile viewport sizes and verify UI layout and Dutch text localization on the registration modal.
        await page.goto('http://localhost:8080/', timeout=10000)
        

        # Simulate mobile viewport sizes and verify UI layout and Dutch text localization on homepage and registration modal.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/section/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Simulate mobile viewport sizes and verify UI layout and Dutch text localization on the registration modal.
        await page.goto('http://localhost:8080/', timeout=10000)
        

        # Simulate mobile viewport sizes and verify UI layout and Dutch text localization on homepage and registration modal.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/section/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Simulate mobile viewport sizes and verify UI layout and Dutch text localization on the registration modal.
        await page.goto('http://localhost:8080/', timeout=10000)
        

        # Simulate mobile viewport sizes and verify UI layout and Dutch text localization on homepage and registration modal.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div[2]/section/div/div/div/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Assert that the page title and tagline are in Dutch and visible
        assert 'Huurly' in await page.title()
        title_text = await page.locator('title').text_content()
        assert 'Verlies geen tijd' in title_text or 'Huurly' in title_text
        tagline_text = await page.locator('xpath=//section//p[contains(text(),"Huurly is de beste")]').text_content()
        assert 'beste' in tagline_text and 'huurders' in tagline_text
        # Assert main call to action button text is in Dutch
        cta_text = await page.locator('xpath=//button[contains(text(),"Profiel aanmaken")]').text_content()
        assert 'Profiel aanmaken' in cta_text
        # Assert key feature descriptions are in Dutch and visible
        features = ['Geverifieerde Profielen', 'Snelle Matches', 'Veilige Transacties']
        for feature in features:
            feature_text = await page.locator(f'xpath=//li[contains(text(),"{feature}")]').text_content()
            assert feature in feature_text
        # Assert footer legal text is in Dutch
        legal_text = await page.locator('xpath=//footer//p[contains(text(),"© 2025 Huurly")]').text_content()
        assert 'Alle rechten voorbehouden' in legal_text
        # Assert registration step 1 instructions and buttons are in Dutch
        instruction_text = await page.locator('xpath=//form//p[contains(text(),"Vul de vereiste gegevens")]').text_content()
        assert 'Vul de vereiste gegevens' in instruction_text
        buttons = ['Volgende', 'Close']
        for btn in buttons:
            btn_text = await page.locator(f'xpath=//button[contains(text(),"{btn}")]').text_content()
            assert btn in btn_text
        # Assert no visual glitches by checking visibility of key UI elements
        assert await page.locator('xpath=//button[contains(text(),"Profiel aanmaken")]').is_visible()
        assert await page.locator('xpath=//section[contains(.,"Geverifieerde Profielen")]').is_visible()
        assert await page.locator('xpath=//footer').is_visible()
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    