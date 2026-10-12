const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync('index.html', 'utf8');
const code = html.slice(html.indexOf('    function cleanOfferText'), html.indexOf('    function md2html'));
const context = {};
vm.createContext(context);
vm.runInContext(code, context);
const cases = [
  ['السعر 15 د.أ', '', 'السعر 15 د.أ'],
  ['خصم 25%', '', 'خصم 25%'],
  ['خصم 10 دنانير', '', 'خصم 10 دنانير'],
  ['وفر 5 دنانير', '', 'وفر 5 دنانير'],
  ['بسعر 20 JD', '', 'بسعر 20 JD'],
  ['15 دينار بدل 25 دينار', '', '15 دينار بدل 25 دينار'],
  ['خصم ٢٥٪', '', 'خصم ٢٥٪'],
  ['السعر ١٥٫٥٠ د.أ', '', 'السعر ١٥٫٥٠ د.أ'],
  ['', 'جولة في المعرض. متوفر لجميع أنواع السيارات. أفضل الأسعار وأسعار منافسة وعروض مميزة وأقل الأسعار بالسوق وخصومات مذهلة ويوجد خصم كبير', ''],
  ['', 'اتصل 0791234567 أو +962791234567', ''],
  ['', 'موديل 2025 قدرة 200 واط ومحرك 2000 سي سي وكفاءة 95% مع خصم كبير', ''],
  ['نص وصفي عادي', '', ''],
  ['', 'نرحب بكم في المعرض، السعر 15 د.أ لجميع الزبائن', 'السعر 15 د.أ'],
  ['نص عادي', 'بسعر 20 JOD', 'بسعر 20 JOD'],
  ['السعر 0791234567', '', ''],
  ['السعر 200 واط', '', ''],
  ['خصم كبير وكفاءة 25%', '', ''],
  ['السعر 15', '', 'السعر 15'],
  ['', '', ''],
];
cases.forEach(([explicit, transcript, expected]) => assert.equal(context.detectPriceOrOffer(explicit, transcript), expected, explicit || transcript));
// Exercise the actual Markdown parser and its offer value passed to rendering.
context.window = context;
context.renderReport = () => {};
vm.runInContext(html.slice(html.indexOf('    window.parseMDAndRender ='), html.indexOf('    function renderReport')), context);
context.parseMDAndRender('### المنافس: اختبار\n**السعر أو العرض المستخرج:**\n**محتوى الفيديو (تفريغ صوتي):**\nالسعر 15 د.أ\n**ملخص الفيديو:**\nوصف');
assert.equal(context.reportData[0].offer, 'السعر 15 د.أ');
assert.match(html, /item\.offer \? `<div class="offer-btn">/);
console.log(`${cases.length} detection cases + Markdown/render condition passed`);
