import { expect } from '@playwright/test';
import { test } from './fixture';

test.beforeEach(async ({ page }) => {
  page.setViewportSize({ width: 400, height: 905 });
  await page.goto('https://www.ebay.com');
  await page.waitForLoadState('networkidle');
});

test('search headphone on ebay', async ({
  ai,
  aiQuery,
  aiAssert,
  aiInput,
  aiTap,
  aiScroll,
  aiWaitFor,
}) => {
  // Use aiInput to enter search keyword
  await aiInput('Headphones', 'search box');

  // Use aiTap to click search button
  await aiTap('search button');

  // Wait for search results to load
  await aiWaitFor('search results list loaded', { timeoutMs: 5000 });

  // Use aiScroll to scroll to bottom
  await aiScroll(
    {
      direction: 'down',
      scrollType: 'untilBottom',
    },
    'search results list',
  );

  // Use aiQuery to get product information
  const items = await aiQuery<Array<{ title: string; price: number }>>(
    'get product titles and prices from search results',
  );

  console.log('headphones in stock', items);
  expect(items?.length).toBeGreaterThan(0);

  // Use aiAssert to verify filter functionality
  await aiAssert('category filter exists on the left side');
});