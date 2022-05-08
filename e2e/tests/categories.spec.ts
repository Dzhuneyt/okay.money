import {test} from '../fixtures/testLoggedInUser';

test.describe('Categories', () => {
    test('should list default categories', async ({page}) => {
        await page.goto('/categories');
        await page.locator('mat-row span', {hasText: 'Food'}).waitFor();
        await page.locator('mat-row span', {hasText: 'Entertainment'}).waitFor();
        await page.locator('mat-row span', {hasText: 'Clothes'}).waitFor();
        await page.locator('mat-row span', {hasText: 'Other'}).waitFor();
    });
});
