import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chooseLanguage,translate} from '../docs/i18n.mjs';
import {messages} from '../docs/messages.mjs';
test('language selection defaults to English and explicit links override saved preference',()=>{
 assert.equal(chooseLanguage(null,null),'en');
 assert.equal(chooseLanguage(null,'zh'),'zh');
 assert.equal(chooseLanguage('en','zh'),'en');
 assert.equal(chooseLanguage('zh','en'),'zh');
 assert.equal(chooseLanguage('unknown','invalid'),'en');
});
test('all localized page labels have both translations and matching placeholders',async()=>{
 const html=await readFile(new URL('../docs/index.html',import.meta.url),'utf8');
 for(const [,key]of html.matchAll(/data-i18n(?:-aria-label|-alt|-content)?="([^"]+)"/g))assert.ok(messages[key],key);
 for(const [key,pair]of Object.entries(messages)){
  assert.ok(pair.en&&pair.zh,key);
  const tokens=s=>[...s.matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort();
  assert.deepEqual(tokens(pair.en),tokens(pair.zh),key);
 }
 assert.equal(translate('voice.detail','en',{name:'My recording',duration:'5.00',start:'0.0',available:'5.00',tail:'Done'}),'My recording · Recording: 5.00 s · Starts at 0.0 s; plays for up to 5.00 s. Done');
});
