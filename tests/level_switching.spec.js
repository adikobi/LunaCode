const { test, expect } = require('@playwright/test');

test.describe('LunaCode Level Switching', () => {

  test('should load Level 1 correctly on startup and then switch to Level 2 without freezing', async ({ page }) => {
    // 1. Navigate to the application
    await page.goto('http://localhost:8000/index.html');

    // 2. Verify Level 1 modal is visible and has the correct title
    await expect(page.locator('#instructions-modal')).toBeVisible();
    await expect(page.locator('#instructions-modal .modal-title')).toHaveText('שלב 1: סדר פעולות');

    // 3. Close the initial modal
    await page.locator('#start-button').click();
    await expect(page.locator('#instructions-modal')).toBeHidden();

    // 4. Click the button to switch to Level 2
    await page.locator('.level-button[data-level="2"]').click();

    // 5. Verify the modal for Level 2 appears with the correct content
    await expect(page.locator('#instructions-modal')).toBeVisible();
    await expect(page.locator('#instructions-modal .modal-title')).toHaveText('שלב 2: כוחה של הלולאה');

    // 6. Close the Level 2 modal
    await page.locator('#start-button').click();
    await expect(page.locator('#instructions-modal')).toBeHidden();

    // 7. Verify the toolbox has been updated for Level 2 by checking for the loop block's text
    const loopBlockText = page.locator('.blocklyFlyout text').filter({ hasText: 'חזור על' });
    await expect(loopBlockText).toBeVisible();

    // 8. Final check to ensure the app is responsive (e.g., run button is clickable)
    await expect(page.locator('#run-button')).toBeEnabled();
  });

});
