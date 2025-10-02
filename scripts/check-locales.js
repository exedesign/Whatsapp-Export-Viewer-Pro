#!/usr/bin/env node
/**
 * Advanced locale consistency checker.
 * - Uses English (en) as reference
 * - Reports missing / extra / empty values per locale
 * - Exits with non‑zero code if any missing keys found
 */
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');
const reference = 'en';

function readJSON(p){
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const refPath = path.join(localesDir, reference, 'common.json');
if(!fs.existsSync(refPath)){
  console.error('Reference locale not found:', refPath);
  process.exit(1);
}
const refData = readJSON(refPath);
const refKeys = Object.keys(refData).sort();

const localeDirs = fs.readdirSync(localesDir).filter(d => fs.statSync(path.join(localesDir,d)).isDirectory());
let hasIssue = false;

for(const loc of localeDirs){
  const file = path.join(localesDir, loc, 'common.json');
  if(!fs.existsSync(file)) { console.log(`Locale ${loc}: MISSING common.json`); hasIssue = true; continue; }
  const data = readJSON(file);
  const keys = Object.keys(data).sort();
  const missing = refKeys.filter(k=>!keys.includes(k));
  const extra = keys.filter(k=>!refKeys.includes(k));
  const empty = keys.filter(k=> data[k] === '' || data[k] === null);
  if(missing.length || empty.length || extra.length){
    if(missing.length || empty.length) hasIssue = true;
    console.log(`Locale: ${loc}`);
    if(missing.length) console.log('  Missing:', missing.join(', '));
    if(empty.length) console.log('  Empty  :', empty.join(', '));
    if(extra.length) console.log('  Extra  :', extra.join(', '));
  }
}

if(!hasIssue){
  console.log('All locale files consistent with reference.');
}
