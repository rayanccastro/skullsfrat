import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {FORM_SCHEMA} from '../web/form-schema.js';
import {FORM_INTRO,FORM_QUESTIONS,renderQuestion,serializeApplication} from '../web/recruitment.js';
test('the form matches the observed original schema, including full-name fields and yes-no choices',async()=>{
  const reference=JSON.parse(await readFile(new URL('./fixtures/skulls-form-reference.json',import.meta.url),'utf8'));
  assert.deepEqual(FORM_SCHEMA,reference);assert.equal(FORM_SCHEMA.steps,false);
  assert.equal(FORM_QUESTIONS.length,12);assert.equal(FORM_SCHEMA.submitLabel,'Sua culpa foi entregue.');
  assert.equal(FORM_QUESTIONS.filter(q=>q.section==='Informações Gerais').length,7);
  assert.equal(FORM_QUESTIONS.filter(q=>q.section==='Questionário').length,5);
  assert.equal(FORM_QUESTIONS.find(q=>q.key==='previousFraternity').subType,'shorttext');
  assert.equal(FORM_QUESTIONS.find(q=>q.key==='lore').maxLength,0);
  assert.ok(FORM_INTRO.includes('Cada membro traz nos ombros sua própria víbora'));
});
test('every source question renders its matching native input and required state without invented limits',()=>{
  const html=FORM_QUESTIONS.map(renderQuestion).join('');
  assert.equal((html.match(/data-question-key=/g)||[]).length,12);
  assert.equal((html.match(/type="text"/g)||[]).length,11);
  assert.equal((html.match(/<textarea /g)||[]).length,1);
  assert.equal((html.match(/type="radio"/g)||[]).length,4);
  assert.equal((html.match(/value="nao"/g)||[]).length,2);
  assert.ok(!html.includes('maxlength=')&&!html.includes('pattern=')&&!html.includes('type="number"'));
  assert.ok(html.includes('placeholder="Primeiro nome"')&&html.includes('placeholder="Último nome"'));
  assert.ok(html.includes('placeholder="Dc ID"')&&html.includes('placeholder="Usuário do Dc"'));
  assert.equal((html.match(/aria-label="obrigatório"/g)||[]).length,12);
});
test('serialization retains both No answers and all original text, and combines character names',()=>{
  const form=new FormData();form.set('characterFirstName','  Nome ');form.set('characterLastName',' Sobrenome  ');form.set('oath','nao');form.set('university','nao');form.set('ageOff','21 anos');form.set('lore','x'.repeat(12000));
  const data=serializeApplication(form);assert.equal(data.characterName,'Nome Sobrenome');assert.equal(data.oath,false);assert.equal(data.university,'nao');assert.equal(data.ageOff,'21 anos');assert.equal(data.lore.length,12000);assert.equal(data.consent,undefined);
});
test('the page and recruitment experience have no external form link or step wizard',async()=>{
  const sources=await Promise.all(['../web/index.html','../web/recruitment.js','../server/recruitment-handler.js'].map(p=>readFile(new URL(p,import.meta.url),'utf8')));
  sources.forEach(source=>assert.ok(!source.includes('forms.app')));
  assert.ok(!sources[1].includes('Continuar')&&!sources[1].includes('form-back'));
});
