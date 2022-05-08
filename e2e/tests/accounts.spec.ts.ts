import {test} from '../fixtures/testLoggedInUser';
import {Page} from "@playwright/test";

async function createAccount(page: Page, title: string) {
    await page.goto('/accounts');
    // Open account creation dialog
    await page.locator('button', {hasText: 'Create account'}).click();

    // Fill account name
    await page.locator('input[formcontrolname=title]').fill(title);

    // Store account
    await page.locator('button', {hasText: 'Save'}).click();

    // Wait for the new account to appear in the table
    await page.locator('mat-row span', {hasText: title}).waitFor();
}

test.describe('Accounts', () => {
    test('should list default accounts', async ({page}) => {
        await page.goto('/accounts');
        await page.locator('mat-row span', {hasText: 'Cash'}).waitFor();
        await page.locator('mat-row span', {hasText: 'Bank account'}).waitFor();
    });

    test('should create new account', async ({page}) => {
        const title = 'Dummy account';
        await createAccount(page, title);
    });

    test('should be able to edit an account', async ({page}) => {
        const title = 'Cool account';
        const changedTitle = 'Changed cool account';

        await createAccount(page, title);

        // Now click on the Edit icon
        await page.locator(`mat-row:has-text("${title}") mat-icon`, {hasText: 'edit'}).click();

        // Change account title to something else
        await page.locator('input[formcontrolname=title]').fill(changedTitle);
        // Save new title
        await page.locator('button', {hasText: 'Save'}).click();

        // Wait for the new title to appear in the table
        await page.locator('mat-row span', {hasText: changedTitle}).waitFor();
    });

    test('should be able to delete an account', async ({page}) => {
        const title = 'to be deleted';

        await createAccount(page, title);

        // Now click on the delete icon
        await page.locator(`mat-row:has-text("${title}") mat-icon`, {hasText: 'delete'}).click();

        // Confirm deletion
        await page.locator(`h2`, {hasText: 'Are you sure you want to delete this account? All transactions inside will be deleted permanently.'}).waitFor();
        await page.locator(`mat-dialog-actions span`, {hasText: 'Yes'}).click();

        // Wait for the snackbar to show confirmation of deletion
        await page.locator(`span`, {hasText: 'Deleted'}).click();
    })
});
