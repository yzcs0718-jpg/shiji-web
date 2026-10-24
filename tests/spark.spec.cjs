const { test, expect } = require('@playwright/test');
const url='http://127.0.0.1:8765/spark/';
test.beforeEach(async ({page})=>{await page.goto(url);await expect(page.locator('#welcome')).toBeVisible();await page.locator('#welcomeStart').click()});
test('first visit dialog and reopen',async({page})=>{await expect(page.locator('#welcome')).toBeHidden();await page.locator('#showGuide').click();await expect(page.locator('#welcome')).toBeVisible();await page.locator('#welcomeClose').click();await page.reload();await expect(page.locator('#welcome')).toBeHidden()});
test('empty input guard',async({page})=>{await page.locator('#make').click();await expect(page.locator('#status')).toContainText('先粘贴')});
test('create category and reload persistence',async({page})=>{await page.locator('#idea').fill('周末尝试做一杯燕麦奶咖啡');await page.locator('#newPriority').selectOption('high');await page.locator('#make').click();await expect(page.locator('#cards .entry')).toHaveCount(1);await expect(page.locator('#cards .entry')).toContainText('美食料理');await page.reload();await expect(page.locator('#cards .entry')).toHaveCount(1)});
test('search and filters',async({page})=>{await page.locator('#idea').fill('周末咖啡食谱');await page.locator('#make').click();await page.locator('#search').fill('不存在的词');await expect(page.locator('#cards .entry')).toHaveCount(0);await page.locator('#search').fill('咖啡');await expect(page.locator('#cards .entry')).toHaveCount(1);await page.locator('#priority').selectOption('high');await expect(page.locator('#cards .entry')).toHaveCount(0)});
test('status done and statistics',async({page})=>{await page.locator('#idea').fill('学习英语');await page.locator('#make').click();await page.locator('#cards [data-state]').selectOption('done');await expect(page.locator('#stats')).toContainText('已完成 1');await page.locator('#view').selectOption('done');await expect(page.locator('#cards .entry')).toHaveCount(1)});
test('seven day challenge and saved checkmarks',async({page})=>{await page.locator('#idea').fill('学剪辑');await page.locator('#make').click();await page.locator('#cards [data-start]').click();await expect(page.locator('#cards [data-day]')).toHaveCount(7);await page.locator('#cards [data-day]').first().check();await expect(page.locator('#cards')).toContainText('1/7天已完成');await page.reload();await expect(page.locator('#cards [data-day]').first()).toBeChecked()});
test('daily recommendation',async({page})=>{await page.locator('#idea').fill('学习摄影');await page.locator('#make').click();await page.locator('#review').click();await expect(page.locator('#extras')).toContainText('今天先做这一件')});
test('edit and delete',async({page})=>{await page.locator('#idea').fill('学习摄影');await page.locator('#make').click();page.on('dialog',async d=>{if(d.type()==='prompt')await d.accept('摄影练习');else await d.accept()});await page.locator('#cards [data-edit]').click();await expect(page.locator('#cards')).toContainText('摄影练习');await page.locator('#cards [data-remove]').click();await expect(page.locator('#cards .entry')).toHaveCount(0)});
test('export backup downloads valid JSON',async({page})=>{await page.locator('#idea').fill('想做一份食谱');await page.locator('#make').click();const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#export').click()]);expect(download.suggestedFilename()).toContain('.json')});
test('mobile layout usable',async({page})=>{await page.setViewportSize({width:375,height:812});await expect(page.locator('#make')).toBeVisible();await page.locator('#idea').fill('旅行攻略');await page.locator('#make').click();await expect(page.locator('#cards .entry')).toHaveCount(1)});

test('completed challenge and reflection survive reload',async({page})=>{
 await page.locator('#idea').fill('准备做一份旅行攻略');await page.locator('#make').click();
 await page.locator('#cards [data-start]').click();await page.locator('#cards [data-day]').first().check();
 page.once('dialog',d=>d.accept('最终完成了规划'));await page.locator('#cards [data-reflect]').click();
 await page.reload();await expect(page.locator('#cards')).toContainText('最终完成了规划');
 await expect(page.locator('#cards [data-day]').first()).toBeChecked();
});
test('creating then editing refreshes featured action card',async({page})=>{
 await page.locator('#idea').fill('学习绘画');await page.locator('#make').click();
 const vals=['绘画练习','创作设计',''];page.on('dialog',d=>d.accept(vals.shift()??''));
 await page.locator('#cards [data-edit]').click();
 await expect(page.locator('#result')).toContainText('绘画练习');
});
test('backup import restores task with independent challenge and progress',async({page})=>{
 await page.locator('#idea').fill('学习摄影');await page.locator('#make').click();
 await page.locator('#cards [data-start]').click();await page.locator('#cards [data-day]').first().check();
 const backup=await page.evaluate(()=>localStorage.getItem('shiji_spark_v1'));
 await page.evaluate(()=>localStorage.removeItem('shiji_spark_v1'));await page.reload();
 await expect(page.locator('#cards .entry')).toHaveCount(0);
 await page.locator('#upload').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(backup)});
 await expect(page.locator('#cards .entry')).toHaveCount(1);
 await expect(page.locator('#cards [data-day]').first()).toBeChecked();
});
test('html and script strings are safely escaped in cards',async({page})=>{
 await page.locator('#idea').fill('<img src=x onerror=alert(1)> 旅行灵感');
 await page.locator('#make').click();
 await expect(page.locator('#cards img')).toHaveCount(0);
 await expect(page.locator('#cards')).toContainText('<img src=x');
});
test('input over 8000 characters is rejected',async({page})=>{
 await page.locator('#idea').fill('A'.repeat(8001));await page.locator('#make').click();
 await expect(page.locator('#status')).toContainText('最多 8000');
 await expect(page.locator('#cards .entry')).toHaveCount(0);
});
