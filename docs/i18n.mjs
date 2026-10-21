import {messages} from './messages.mjs?v=i18n-1';
export function chooseLanguage(query,stored){return ['en','zh'].includes(query)?query:['en','zh'].includes(stored)?stored:'en';}
export function translate(key,language,params={}){
 const template=messages[key]?.[language]??messages[key]?.en;
 if(template===undefined)throw new Error(`Missing translation: ${key}`);
 return template.replace(/\{(\w+)\}/g,(_,name)=>String(params[name]??`{${name}}`));
}
let language='en';
const dynamic=new Map();
export function getLanguage(){return language;}
export function t(key,params={}){return translate(key,language,params);}
export function setMessage(element,key,params={}){
 dynamic.set(element,{key,params});
 element.textContent=t(key,typeof params==='function'?params():params);
}
function render(){
 document.documentElement.lang=language==='zh'?'zh-CN':'en';
 for(const el of document.querySelectorAll('[data-i18n]'))el.textContent=t(el.dataset.i18n);
 for(const attribute of ['aria-label','alt','content'])for(const el of document.querySelectorAll(`[data-i18n-${attribute}]`))el.setAttribute(attribute,t(el.getAttribute(`data-i18n-${attribute}`)));
 for(const [el,{key,params}]of dynamic)el.textContent=t(key,typeof params==='function'?params():params);
 for(const button of document.querySelectorAll('[data-language]'))button.setAttribute('aria-pressed',String(button.dataset.language===language));
}
export function setLanguage(next,{persist=true}={}){
 if(!['en','zh'].includes(next))return;
 language=next;render();
 if(persist){try{localStorage.setItem('topicmotion.language',next);}catch{/* Storage may be disabled. */}
  const url=new URL(location.href);url.searchParams.set('lang',next);history.replaceState(null,'',url);
 }
 document.dispatchEvent(new CustomEvent('topicmotion:languagechange',{detail:{language}}));
}
if(typeof document!=='undefined'){
 let stored;try{stored=localStorage.getItem('topicmotion.language');}catch{/* Default to English. */}
 language=chooseLanguage(new URL(location.href).searchParams.get('lang'),stored);
 render();
 for(const button of document.querySelectorAll('[data-language]'))button.addEventListener('click',()=>setLanguage(button.dataset.language));
}
