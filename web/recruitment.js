import { FORM_SCHEMA } from './form-schema.js';
export const FORM_INTRO=FORM_SCHEMA.intro;
export const FORM_QUESTIONS=FORM_SCHEMA.questions;
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fieldNames={characterName:['characterFirstName','characterLastName'],discord:['discordId','discordUser']};

export function renderQuestion(question){
  const {key,label,type,required}=question;
  const mark=required?'<span class="required" aria-label="obrigatório">*</span>':'';
  if(type==='fullname'){
    return `<fieldset class="source-question source-fullname" data-question-key="${key}"><legend>${esc(label)} ${mark}</legend><div class="source-name-pair">${['firstName','lastName'].map((part,index)=>{
      const name=fieldNames[key][index],caption=question.labels[part];
      return `<div><label for="${name}" class="visually-hidden">${esc(caption)}</label><input id="${name}" name="${name}" type="text" placeholder="${esc(caption)}" ${required?'required':''} autocomplete="off"></div>`;
    }).join('')}</div></fieldset>`;
  }
  if(type==='choice')return `<fieldset class="source-question source-choice" data-question-key="${key}"><legend>${esc(label)} ${mark}</legend><div class="source-options">${question.options.map((option,index)=>`<label><input type="radio" name="${key}" value="${index===0?'sim':'nao'}" ${required?'required':''}><span>${esc(option)}</span></label>`).join('')}</div></fieldset>`;
  const long=question.subType==='longtext';
  return `<div class="source-question" data-question-key="${key}"><label for="${key}" class="source-label">${esc(label)} ${mark}</label>${long?`<textarea id="${key}" name="${key}" rows="7" ${required?'required':''}></textarea>`:`<input id="${key}" name="${key}" type="text" ${required?'required':''} autocomplete="off">`}</div>`;
}

export function serializeApplication(formData){
  const payload=Object.fromEntries(formData);
  payload.characterName=`${String(payload.characterFirstName||'').trim()} ${String(payload.characterLastName||'').trim()}`.trim();
  payload.oath=payload.oath==='sim';
  return payload;
}

export function mountRecruitment(root){
  let enabled=false,sending=false;
  const sections=[...new Set(FORM_QUESTIONS.map(q=>q.section))];
  root.classList.add('source-recruitment');
  root.innerHTML=`<div class="source-welcome"><img src="/assets/crest.png" alt="Skulls" width="1080" height="1080"><p>${esc(FORM_INTRO)}</p><button class="button button-red source-begin" type="button">${esc(FORM_SCHEMA.startLabel)} <span aria-hidden="true">↗</span></button></div><form id="skulls-recruitment" hidden><img class="source-form-logo" src="/assets/wordmark.png" alt="Skulls" width="1080" height="1080"><div class="form-notice source-status" role="status">Verificando o envio de inscrições…</div>${sections.map((section,index)=>`<section class="source-section" aria-labelledby="form-section-${index}"><h3 id="form-section-${index}" ${index===0?'tabindex="-1"':''}>${esc(section)}</h3>${FORM_QUESTIONS.filter(q=>q.section===section).map(renderQuestion).join('')}</section>`).join('')}<div class="honeypot" aria-hidden="true"><label>Site pessoal<input name="website" type="text" tabindex="-1" autocomplete="off"></label></div><p class="source-privacy">Ao enviar, você encaminha os dados desta ficha à equipe dos Skulls para a avaliação do recrutamento. As respostas não são publicadas no site.</p><div class="source-submit"><button type="submit" class="button button-red" disabled>${esc(FORM_SCHEMA.submitLabel)}</button><p class="source-submit-note" role="status">Envio em preparação.</p></div><p class="form-error" role="alert" hidden></p><p class="form-caption">Sair ou atualizar a página apaga o preenchimento. Não informe senhas ou dados de acesso.</p></form>`;
  const welcome=root.querySelector('.source-welcome'),form=root.querySelector('form');
  const submit=form.querySelector('[type=submit]'),error=root.querySelector('.form-error');
  root.querySelector('.source-begin').addEventListener('click',()=>{
    welcome.hidden=true;form.hidden=false;
    root.querySelector('#form-section-0').focus({preventScroll:true});
    root.dispatchEvent(new CustomEvent('skulls:form-step',{bubbles:true,detail:{step:1}}));
  });
  function updateAvailability(){
    submit.disabled=!enabled||sending;
    root.querySelector('.source-status').textContent=enabled?'Campos marcados com * são obrigatórios.':'O envio das inscrições ainda não foi ativado. A ficha está completa e pode ser preenchida; o envio será liberado após a configuração do recrutamento.';
    root.querySelector('.source-submit-note').textContent=enabled?'': 'Envio em preparação.';
  }
  fetch('/api/config').then(response=>{if(!response.ok)throw new Error();return response.json();}).then(config=>{enabled=config.recruitmentEnabled===true;}).catch(()=>{enabled=false;}).finally(updateAvailability);
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(sending||!enabled||!form.reportValidity())return;
    const empty=[...form.querySelectorAll('input[type=text][required],textarea[required]')].find(input=>!input.value.trim());
    if(empty){empty.setCustomValidity('Preencha este campo.');empty.reportValidity();empty.addEventListener('input',()=>empty.setCustomValidity(''),{once:true});return;}
    const data=serializeApplication(new FormData(form));
    sending=true;submit.disabled=true;submit.textContent='Enviando…';error.hidden=true;
    try{
      const response=await fetch('/api/recruitment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'Não foi possível entregar a ficha. Tente novamente.');
      root.innerHTML='<div class="form-success" role="status"><h3>Sua culpa foi entregue.</h3><p>Sua solicitação chegou à equipe dos Skulls. Aguarde o contato pelo Discord informado na ficha.</p></div>';
    }catch(caught){error.textContent=caught.message==='Failed to fetch'?'Não foi possível conectar. Suas respostas continuam aqui; tente novamente.':caught.message;error.hidden=false;}
    finally{sending=false;if(submit.isConnected){submit.textContent=FORM_SCHEMA.submitLabel;updateAvailability();}}
  });
}
