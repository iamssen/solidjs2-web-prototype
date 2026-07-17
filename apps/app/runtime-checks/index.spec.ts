import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/runtime-checks');
});

test('passes the array handler value to the event handler', async ({
  page,
}) => {
  const button = page.getByTestId('array-handler-button');

  await expect(button).toHaveText('1');
  await button.click();
  await expect(button).toHaveText('3');
  await button.click();
  await expect(button).toHaveText('5');
});

test('batches setter reads until the next microtask unless flush is called', async ({
  page,
}) => {
  await page.getByTestId('batch-update-button').click();

  await expect(page.getByTestId('batch-immediate-result')).toHaveText('0');
  await expect(page.getByTestId('batch-microtask-result')).toHaveText('1');

  await page.getByTestId('batch-flush-button').click();
  await expect(page.getByTestId('batch-flush-result')).toHaveText('2');
});

test('runs direct and array handlers for native custom events', async ({
  page,
}) => {
  const directButton = page.getByTestId('custom-event-direct-button');
  const arrayButton = page.getByTestId('custom-event-array-button');

  await expect(directButton).toHaveText('일반 handler: 0');
  await expect(arrayButton).toHaveText('배열 handler: 0');
  await directButton.click();
  await arrayButton.click();
  await expect(directButton).toHaveText('일반 handler: 1');
  await expect(arrayButton).toHaveText('배열 handler: 2');
});

test('renders on* values as HTML attributes', async ({ page }) => {
  const target = page.getByTestId('on-attributes-target');

  await expect(target).toHaveAttribute('data-control', 'enabled');
  await expect(target).toHaveAttribute('oncustomattribute', 'attribute-value');
  await expect(target).toHaveAttribute('oncustomnumber', '1');
  await expect(target).toHaveAttribute('oncustomboolean', '');

  await page.getByTestId('on-attributes-inspect-button').click();
  await expect(page.getByTestId('on-attributes-result')).toHaveText(
    '기대값과 일치',
  );
});

test('runs an event handler passed through a JSX spread', async ({ page }) => {
  const button = page.getByTestId('spread-event-handler-button');

  await expect(button).toHaveText('spread handler: 0');
  await button.click();
  await expect(button).toHaveText('spread handler: 1');
  await button.click();
  await expect(button).toHaveText('spread handler: 2');
});

test('runs onSettled after mount and its returned cleanup on unmount', async ({
  page,
}) => {
  const events = page.getByTestId('on-settled-events');

  await expect(events).toHaveText('settled');
  await page.getByTestId('on-settled-unmount-button').click();
  await expect(events).toHaveText('settled,cleanup');
});

test('separates createEffect compute and apply phases', async ({ page }) => {
  await expect(page.getByTestId('effects-apply-result')).toHaveText(
    'undefined->0',
  );
  await expect(page.getByTestId('effects-defer-result')).toHaveText('not run');
  await expect(page.getByTestId('effects-memo-result')).toHaveText('0');

  await page.getByTestId('effects-increment-button').click();
  await expect(page.getByTestId('effects-apply-result')).toHaveText('0->1');
  await expect(page.getByTestId('effects-defer-result')).toHaveText('1');
  await expect(page.getByTestId('effects-memo-result')).toHaveText('2');
});

test('renders an undefined For each value as an empty list', async ({
  page,
}) => {
  await expect(page.getByTestId('for-default-list').locator('li')).toHaveCount(
    0,
  );
});

test('passes an item value and index accessor to the default For child', async ({
  page,
}) => {
  await page.getByTestId('for-load-items-button').click();

  await expect(page.getByTestId('for-default-item-first')).toHaveText(
    '첫 번째:0',
  );
  await expect(page.getByTestId('for-default-item-second')).toHaveText(
    '두 번째:1',
  );
});

test('passes an item accessor and numeric index to For keyed=false', async ({
  page,
}) => {
  const firstSlot = page.getByTestId('for-keyed-false-slot-0');
  const mountId = await firstSlot.getAttribute('data-mount-id');

  await expect(firstSlot).toHaveText('0:첫 번째 슬롯');
  await page.getByTestId('for-replace-first-slot-button').click();
  await expect(firstSlot).toHaveText('0:교체된 첫 번째 슬롯');
  await expect(firstSlot).toHaveAttribute('data-mount-id', mountId ?? '');
});

test('merge lets undefined override a default and omit excludes selected keys', async ({
  page,
}) => {
  await expect(page.getByTestId('merge-label-result')).toHaveText('provided');
  await expect(page.getByTestId('omit-retained-result')).toHaveText('yes');
  await expect(page.getByTestId('omit-all-label-result')).toHaveText(
    'provided',
  );

  await page.getByTestId('merge-set-undefined-button').click();
  await expect(page.getByTestId('merge-label-result')).toHaveText('undefined');
  await expect(page.getByTestId('omit-all-label-result')).toHaveText(
    'undefined',
  );
});

test('updates a Solid 2 store through its draft setter', async ({ page }) => {
  await expect(page.getByTestId('store-draft-result')).toHaveText('0:first');

  await page.getByTestId('store-draft-increment-button').click();
  await expect(page.getByTestId('store-draft-result')).toHaveText('1:updated');
});
