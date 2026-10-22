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
 newTabButton.addEventListener("click",event=>{event.preventDefault();try{const before=tabs.length;const tab=createTab();status.textContent="تم فتح "+tab.title+" بنجاح. إجمالي التبويبات: "+tabs.length+".";if(tabs.length<=before)throw new Error("لم تتم إضافة التبويب");}catch(error){status.textContent="تعذر فتح تبويب جديد: "+(error&&error.message?error.message:"خطأ غير معروف");console.error("Hesbah browser new-tab error",error);}});
 back.addEventListener("click",()=>{const tab=active();if(tab&&tab.position>0){tab.position--;tab.url=tab.history[tab.position];tab.frame.src=tab.url;address.value=tab.url;status.textContent="جارٍ الرجوع…";updateControls();}});
 forward.addEventListener("click",()=>{const tab=active();if(tab&&tab.position<tab.history.length-1){tab.position++;tab.url=tab.history[tab.position];tab.frame.src=tab.url;address.value=tab.url;status.textContent="جارٍ التقدم…";updateControls();}});
 reload.addEventListener("click",()=>{const tab=active();if(tab&&tab.url){status.textContent="جارٍ إعادة التحميل…";tab.frame.src=tab.url;}});
 createTab();
})();
