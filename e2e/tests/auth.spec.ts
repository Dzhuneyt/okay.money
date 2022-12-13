import {test} from "../util/test";

test.describe('Auth', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('/');
    });

    test('should login', async ({page, createTestUser}) => {
        const testUser = await createTestUser();

        await page.locator('input[name="username"]').fill(testUser.email);
        await page.locator('input[name="password"]').fill(testUser.password);
        await page.locator('button:has-text("Login")').click();
        await page.pause();
        console.log(testUser);
    });
});
