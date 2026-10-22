/* Internal browser trial: embedded browsing only; sites may refuse framing. */
(() => {
 const form=document.querySelector("#internal-browser-form");
 const address=document.querySelector("#internal-browser-address");
 const frame=document.querySelector("#internal-browser-frame");
 const empty=document.querySelector("#internal-browser-empty");
 const status=document.querySelector("#internal-browser-status");
 const back=document.querySelector("#internal-browser-back");
 const forward=document.querySelector("#internal-browser-forward");
 const reload=document.querySelector("#internal-browser-reload");
 let history=[],position=-1;
 function updateControls(){back.disabled=position<=0;forward.disabled=position<0||position>=history.length-1;reload.disabled=position<0;}
 function normalizeAddress(value){
  let raw=value.trim();
  if(!raw)return null;
  if(!/^[a-zA-Z][a-zA-Z\\d+.-]*:/.test(raw)){
   const host=raw.split(/[/?#]/)[0];
   raw=/^(?:\\d{1,3}\\.){3}\\d{1,3}(?::\\d+)?$/.test(host)||/^(?:localhost|\\[[0-9a-f:]+\\])(?::\\d+)?$/i.test(host)?"http://"+raw:"https://"+raw;
  }
  let url;try{url=new URL(raw);}catch{return null;}
  if(!["http:","https:"].includes(url.protocol))return null;
  return url.href;
 }
 function navigate(value,add=true){
  const url=normalizeAddress(value);
  if(!url){status.textContent="العنوان غير صحيح. استخدم عنوان HTTP أو HTTPS.";return;}
  if(add){history=history.slice(0,position+1);history.push(url);position=history.length-1;}
  address.value=url;empty.classList.add("hidden");status.textContent="جارٍ محاولة عرض الموقع داخل الصفحة…";
  frame.src=url;updateControls();
 }
 form.addEventListener("submit",event=>{event.preventDefault();navigate(address.value);});
 document.querySelectorAll("[data-browser-url]").forEach(button=>button.addEventListener("click",()=>navigate(button.dataset.browserUrl)));
 back.addEventListener("click",()=>{if(position>0){position--;navigate(history[position],false);}});
 forward.addEventListener("click",()=>{if(position<history.length-1){position++;navigate(history[position],false);}});
 reload.addEventListener("click",()=>{if(position>=0){status.textContent="جارٍ إعادة التحميل…";frame.src=history[position];}});
 frame.addEventListener("load",()=>{if(position>=0)status.textContent="تم تحميل إطار العرض؛ إذا كان المحتوى فارغًا فقد يكون الموقع منع التضمين.";});
})();
/* Internal browser trial with multiple independent tab views. */
(() => {
 const form=document.querySelector("#internal-browser-form");
 const address=document.querySelector("#internal-browser-address");
 const panes=document.querySelector("#internal-browser-panes");
 const tabsHost=document.querySelector("#internal-browser-tabs");
 const empty=document.querySelector("#internal-browser-empty");
 const status=document.querySelector("#internal-browser-status");
 const back=document.querySelector("#internal-browser-back");
 const forward=document.querySelector("#internal-browser-forward");
 const reload=document.querySelector("#internal-browser-reload");
 const newTabButton=document.querySelector("#internal-browser-new-tab");
 let tabs=[],activeId=null,nextId=1;
 const active=()=>tabs.find(tab=>tab.id===activeId)||null;
 function normalizeAddress(value){
  let raw=value.trim();
  if(!raw)return null;
  if(!raw.includes("://")){
   const host=raw.split(/[/?#]/)[0];
   const isIPv4=host.split(".").length===4&&host.split(".").every(part=>part!==""&&!Number.isNaN(Number(part))&&Number(part)>=0&&Number(part)<=255);
   const isLocal=host==="localhost"||host.startsWith("[");
   raw=(isIPv4||isLocal?"http://":"https://")+raw;
  }
  let url;try{url=new URL(raw);}catch{return null;}
  if(!["http:","https:"].includes(url.protocol))return null;
  return url.href;
 }
 function updateControls(){
  const tab=active();
  back.disabled=!tab||tab.position<=0;
  forward.disabled=!tab||tab.position>=tab.history.length-1;
  reload.disabled=!tab||!tab.url;
 }
 function renderTabs(){
  tabsHost.replaceChildren();
  tabs.forEach(tab=>{
   const item=document.createElement("div");item.className="internal-browser-tab"+(tab.id===activeId?" active":"");
   const select=document.createElement("button");select.type="button";select.className="internal-browser-tab-select";select.setAttribute("role","tab");select.setAttribute("aria-selected",String(tab.id===activeId));select.textContent=tab.title;select.title=tab.url||tab.title;select.addEventListener("click",()=>activateTab(tab.id));
   const close=document.createElement("button");close.type="button";close.className="internal-browser-tab-close";close.textContent="×";close.setAttribute("aria-label","إغلاق "+tab.title);close.title="إغلاق التبويب";close.addEventListener("click",()=>closeTab(tab.id));
   item.append(select,close);tabsHost.append(item);
  });
 }
 function activateTab(id){
  const tab=tabs.find(item=>item.id===id);if(!tab)return;
  activeId=id;
  tabs.forEach(item=>item.pane.classList.toggle("active",item.id===id));
  empty.classList.toggle("hidden",Boolean(tab.url));
  address.value=tab.url||"";
  status.textContent=tab.url?"التبويب جاهز؛ إذا ظهر فارغًا فقد يكون الموقع منع التضمين.":"اكتب عنوان موقع لهذا التبويب أو اختر اختصارًا.";
  renderTabs();updateControls();
 }
 function createTab(url="",title){
  const id=nextId++;
  const pane=document.createElement("div");pane.className="internal-browser-pane";
  const frame=document.createElement("iframe");frame.title="المتصفح الداخلي - تبويب "+id;frame.referrerPolicy="strict-origin-when-cross-origin";frame.allow="clipboard-read; clipboard-write";
  pane.append(frame);panes.append(pane);
  const tab={id,title:title||"تبويب "+id,url:"",history:[],position:-1,pane,frame,whatsapp:false,whatsappNumber:0};
  tabs.push(tab);
  frame.addEventListener("load",()=>{if(activeId===tab.id&&tab.url)status.textContent="تم تحميل إطار العرض؛ قد يمنع الموقع عرضه داخل الصفحة.";});
  activateTab(id);
  if(url)navigate(url,true);
  return tab;
 }
 function navigate(value,add=true){
  const tab=active();if(!tab)return;
  const url=normalizeAddress(value);
  if(!url){status.textContent="العنوان غير صحيح. استخدم عنوان HTTP أو HTTPS.";return;}
  if(add){tab.history=tab.history.slice(0,tab.position+1);tab.history.push(url);tab.position=tab.history.length-1;}
  tab.url=url;
  if(!tab.whatsapp)tab.title=tab.title.startsWith("تبويب ")?new URL(url).hostname:tab.title;
  address.value=url;empty.classList.add("hidden");status.textContent="جارٍ محاولة عرض الموقع داخل التبويب…";
  tab.frame.src=url;renderTabs();updateControls();
 }
 function openWhatsApp(){
  const number=tabs.filter(item=>item.whatsapp).length+1;
  const tab=createTab("","واتساب "+number);
  tab.whatsapp=true;tab.whatsappNumber=number;tab.title="واتساب "+number;
  renderTabs();navigate("https://web.whatsapp.com/");
 }
 function closeTab(id){
  const index=tabs.findIndex(tab=>tab.id===id);if(index<0)return;
  const wasActive=id===activeId;tabs[index].frame.src="about:blank";tabs[index].pane.remove();tabs.splice(index,1);
  if(!tabs.length){createTab();return;}
  if(wasActive)activateTab(tabs[Math.max(0,index-1)].id);else{renderTabs();updateControls();}
 }
 form.addEventListener("submit",event=>{event.preventDefault();navigate(address.value);});
 document.querySelectorAll("[data-browser-url]").forEach(button=>button.addEventListener("click",()=>{
  if(button.dataset.browserUrl.includes("web.whatsapp.com"))openWhatsApp();
  else navigate(button.dataset.browserUrl);
 }));
 newTabButton.addEventListener("click",()=>createTab());
 back.addEventListener("click",()=>{const tab=active();if(tab&&tab.position>0){tab.position--;tab.url=tab.history[tab.position];tab.frame.src=tab.url;address.value=tab.url;status.textContent="جارٍ الرجوع…";updateControls();}});
 forward.addEventListener("click",()=>{const tab=active();if(tab&&tab.position<tab.history.length-1){tab.position++;tab.url=tab.history[tab.position];tab.frame.src=tab.url;address.value=tab.url;status.textContent="جارٍ التقدم…";updateControls();}});
 reload.addEventListener("click",()=>{const tab=active();if(tab&&tab.url){status.textContent="جارٍ إعادة التحميل…";tab.frame.src=tab.url;}});
 createTab();
})();
