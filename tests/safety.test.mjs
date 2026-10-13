import {test} from 'node:test';
import assert from 'node:assert/strict';
import { rankMessage, csvCell } from '../public/engine.js';
test('abstains when two categories fit equally well',()=>{
  const result=rankMessage([1,0],[{id:'delivery',examples:['x'],vectors:[[1,0]]},{id:'changes',examples:['y'],vectors:[[1,0]]}]);
  assert.equal(result.category,'review'); assert.equal(result.reason,'Two categories are close');
});
test('abstains when neither category is semantically close',()=>{
  const result=rankMessage([0,0,1],[{id:'delivery',examples:['x'],vectors:[[1,0,0]]},{id:'changes',examples:['y'],vectors:[[0,1,0]]}]);
  assert.equal(result.category,'review'); assert.equal(result.reason,'No close example');
});
test('CSV neutralizes spreadsheet formulas and preserves quotation marks',()=>{
  for(const input of ['=HYPERLINK("https://example.com")','  +1','@SUM(1)','-1']) assert.ok(csvCell(input).startsWith('"\''));
  assert.equal(csvCell('he said "hello"'), '"he said ""hello"""');
});
