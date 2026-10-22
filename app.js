const storageKey = "hesbah-devices-v1";
const companyStorageKey = "hesbah-company-v1";
const usersStorageKey = "hesbah-users-v1";
const activityStorageKey = "hesbah-activity-v1";
const form = document.querySelector("#device-form");
const idField = document.querySelector("#device-id");
const nameField = document.querySelector("#device-name");
const typeField = document.querySelector("#device-type");
const ipField = document.querySelector("#device-ip");
const list = document.querySelector("#device-list");
const template = document.querySelector("#device-row-template");
const table = document.querySelector("#device-table");
const empty = document.querySelector("#empty-state");
const count = document.querySelector("#device-count");
const cancel = document.querySelector("#cancel-edit");
const title = document.querySelector("#form-title");
const search = document.querySelector("#search");
const companyForm = document.querySelector("#company-form");
const companyName = document.querySelector("#company-name");
const brandName = document.querySelector(".brand strong");
const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const userForm = document.querySelector("#user-form");
const userName = document.querySelector("#user-name");
const primaryPhone = document.querySelector("#primary-phone");
const secondaryPhone = document.querySelector("#secondary-phone");
const subscriberPlan = document.querySelector("#subscriber-plan");
const pppoeName = document.querySelector("#pppoe-name");
const routerType = document.querySelector("#router-type");
const subscriberStatus = document.querySelector("#subscriber-status");
const userList = document.querySelector("#user-list");
const usersTable = document.querySelector("#users-table");
const usersEmpty = document.querySelector("#users-empty");
const userCount = document.querySelector("#user-count");
const activityList = document.querySelector("#activity-list");
const activityTable = document.querySelector("#activity-table");
const activityEmpty = document.querySelector("#activity-empty");
const clearActivity = document.querySelector("#clear-activity");
const dashboardDeviceCount = document.querySelector("#dashboard-device-count");
const dashboardUserCount = document.querySelector("#dashboard-user-count");
const dashboardActivityCount = document.querySelector("#dashboard-activity-count");

let devices = JSON.parse(localStorage.getItem(storageKey) || "[]");
let company = localStorage.getItem(companyStorageKey) || "";
let users = JSON.parse(localStorage.getItem(usersStorageKey) || "[]");
let activity = JSON.parse(localStorage.getItem(activityStorageKey) || "[]");
const persist = () => localStorage.setItem(storageKey, JSON.stringify(devices));
const persistUsers = () => localStorage.setItem(usersStorageKey, JSON.stringify(users));
const persistActivity = () => localStorage.setItem(activityStorageKey, JSON.stringify(activity));
const renderCompany = () => { companyName.value = company; brandName.textContent = company || "Hesbah"; };
function logActivity(action, details) { activity.unshift({ id: crypto.randomUUID(), action, details, at: new Date().toLocaleString("ar-EG") }); activity = activity.slice(0, 100); persistActivity(); renderActivity(); }
const resetForm = () => { form.reset(); idField.value = ""; title.textContent = "إضافة جهاز"; cancel.classList.add("hidden"); };
function updateDashboard() { dashboardDeviceCount.textContent = devices.length; dashboardUserCount.textContent = users.length; dashboardActivityCount.textContent = activity.length; }

function render() {
  updateDashboard();
  const term = search.value.trim().toLowerCase();
  const shown = devices.filter(d => [d.name, d.type, d.ip].some(v => v.toLowerCase().includes(term)));
  list.replaceChildren();
  shown.forEach(device => {
    const row = template.content.cloneNode(true);
    row.querySelector(".name").textContent = device.name;
    row.querySelector(".type").textContent = device.type;
    row.querySelector(".ip").textContent = device.ip;
    row.querySelector(".edit").onclick = () => { idField.value = device.id; nameField.value = device.name; typeField.value = device.type; ipField.value = device.ip; title.textContent = "تعديل جهاز"; cancel.classList.remove("hidden"); nameField.focus(); };
    row.querySelector(".delete").onclick = () => { if (confirm(`حذف الجهاز «${device.name}» من السجل؟`)) { devices = devices.filter(d => d.id !== device.id); persist(); logActivity("حذف جهاز", device.name); render(); } };
    list.append(row);
  });
  const suffix = devices.length === 1 ? "جهاز واحد" : `${devices.length} أجهزة`;
  count.textContent = devices.length ? suffix : "لا توجد أجهزة بعد";
  table.classList.toggle("hidden", shown.length === 0);
  empty.classList.toggle("hidden", shown.length !== 0);
  empty.textContent = devices.length && !shown.length ? "لا توجد نتائج مطابقة للبحث." : "أضف أول جهاز ليظهر هنا.";
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const entry = { id: idField.value || crypto.randomUUID(), name: nameField.value.trim(), type: typeField.value.trim(), ip: ipField.value.trim() };
  const duplicate = devices.some(d => d.ip === entry.ip && d.id !== entry.id);
  if (duplicate && !confirm("هذا العنوان مسجل بالفعل. هل تريد المتابعة؟")) return;
  const at = devices.findIndex(d => d.id === entry.id);
  const isNew = at === -1;
  isNew ? devices.unshift(entry) : devices[at] = entry;
  persist(); resetForm(); render();
  logActivity(isNew ? "إضافة جهاز" : "تعديل جهاز", entry.name);
});
cancel.onclick = resetForm;
search.addEventListener("input", render);
companyForm.addEventListener("submit", event => { event.preventDefault(); company = companyName.value.trim(); localStorage.setItem(companyStorageKey, company); renderCompany(); logActivity("تحديث اسم الشركة", company || "Hesbah"); });
function renderUsers() {
  updateDashboard();
  userList.replaceChildren();
  const statusLabels = { online: "متصل", offline: "غير متصل", unknown: "غير معروف" };
  users.forEach(user => { const row = document.createElement("tr"); row.innerHTML = `<td></td><td dir="ltr"></td><td></td><td></td><td dir="ltr"></td><td></td><td class="row-actions"><button class="link router" type="button">إدارة Wi‑Fi</button><button class="link danger delete" type="button">حذف</button></td>`; row.children[0].textContent = user.name; row.children[1].textContent = user.primaryPhone || "—"; row.children[2].textContent = user.plan; const status = user.status || "unknown"; const badge = document.createElement("span"); badge.className = `status ${status}`; badge.textContent = statusLabels[status]; row.children[3].append(badge); row.children[4].textContent = user.pppoe; row.children[5].textContent = user.router; row.querySelector(".router").onclick = () => { logActivity("طلب إدارة Wi‑Fi", `${user.name} — بانتظار الربط الآمن`); alert("إدارة راوتر العميل غير مفعّلة بعد. عند ربط الخادم بأمان، ستتاح طلبات تغيير كلمة Wi‑Fi مع تأكيد وسجل تدقيق."); }; row.querySelector(".delete").onclick = () => { if (confirm(`حذف المشترك «${user.name}»؟`)) { users = users.filter(item => item.id !== user.id); persistUsers(); logActivity("حذف مشترك", user.name); renderUsers(); } }; userList.append(row); });
  userCount.textContent = users.length ? `${users.length} مشتركين` : "لا يوجد مشتركون بعد";
  usersTable.classList.toggle("hidden", users.length === 0); usersEmpty.classList.toggle("hidden", users.length !== 0);
}
function renderActivity() {
  updateDashboard();
  activityList.replaceChildren();
  activity.forEach(item => { const row = document.createElement("tr"); [item.at, item.action, item.details].forEach(value => { const cell = document.createElement("td"); cell.textContent = value; row.append(cell); }); activityList.append(row); });
  activityTable.classList.toggle("hidden", activity.length === 0); activityEmpty.classList.toggle("hidden", activity.length !== 0);
}
userForm.addEventListener("submit", event => { event.preventDefault(); const user = { id: crypto.randomUUID(), name: userName.value.trim(), primaryPhone: primaryPhone.value.trim(), secondaryPhone: secondaryPhone.value.trim(), plan: subscriberPlan.value.trim(), pppoe: pppoeName.value.trim(), router: routerType.value.trim(), status: subscriberStatus.value }; users.unshift(user); persistUsers(); userForm.reset(); logActivity("إضافة مشترك", `${user.name} — ${user.plan}`); renderUsers(); });
clearActivity.onclick = () => { if (confirm("مسح كل سجل العمليات المحلي؟")) { activity = []; persistActivity(); renderActivity(); } };
navItems.forEach(item => item.addEventListener("click", () => { navItems.forEach(button => button.classList.toggle("active", button === item)); views.forEach(view => view.classList.toggle("active", view.id === item.dataset.view + "-view")); window.scrollTo({ top: 0, behavior: "smooth" }); }));
document.querySelectorAll("[data-open-view]").forEach(button => button.addEventListener("click", () => { const target = [...navItems].find(item => item.dataset.view === button.dataset.openView); if (target) target.click(); if (button.dataset.focus) document.getElementById(button.dataset.focus)?.focus(); }));

/* Additional menu modules: browser-local records only; no router/network commands. */
const routersKey = "hesbah-routers-v1", plansKey = "hesbah-plans-v1", paymentsKey = "hesbah-payments-v1", networkSettingsKey = "hesbah-network-settings-v1";
let routers = JSON.parse(localStorage.getItem(routersKey) || "[]");
let plans = JSON.parse(localStorage.getItem(plansKey) || "[]");
let payments = JSON.parse(localStorage.getItem(paymentsKey) || "[]");
const saveRouters = () => localStorage.setItem(routersKey, JSON.stringify(routers));
const savePlans = () => localStorage.setItem(plansKey, JSON.stringify(plans));
const savePayments = () => localStorage.setItem(paymentsKey, JSON.stringify(payments));
function buildRow(values, onDelete, confirmText) {
  const row = document.createElement("tr");
  values.forEach(value => { const cell = document.createElement("td"); cell.textContent = value == null || value === "" ? "—" : String(value); row.append(cell); });
  if (onDelete) { const cell = document.createElement("td"); const button = document.createElement("button"); button.type = "button"; button.className = "link danger"; button.textContent = "حذف"; button.onclick = () => { if (confirm(confirmText)) onDelete(); }; cell.append(button); row.append(cell); }
  return row;
}
function renderRouters() {
  const body = document.querySelector("#router-list"); body.replaceChildren();
  routers.forEach(item => body.append(buildRow([item.name,item.model,item.ip,item.location], () => { routers=routers.filter(x=>x.id!==item.id); saveRouters(); logActivity("حذف راوتر",item.name); renderRouters(); }, `حذف الراوتر «${item.name}» من السجل؟`)));
  document.querySelector("#router-count").textContent = routers.length ? `${routers.length} راوترات مسجلة` : "لا توجد راوترات بعد";
  document.querySelector("#router-table").classList.toggle("hidden",!routers.length); document.querySelector("#router-empty").classList.toggle("hidden",!!routers.length);
}
document.querySelector("#router-form").addEventListener("submit",e=>{e.preventDefault();const item={id:crypto.randomUUID(),name:document.querySelector("#router-name").value.trim(),model:document.querySelector("#router-model").value.trim(),ip:document.querySelector("#router-ip").value.trim(),location:document.querySelector("#router-location").value.trim()};routers.unshift(item);saveRouters();e.target.reset();renderRouters();logActivity("إضافة راوتر",item.name);});
function renderPlans() {
  const body=document.querySelector("#plan-list");body.replaceChildren();
  plans.forEach(item=>body.append(buildRow([item.name,`${item.speed} Mbps`,`${Number(item.price).toLocaleString("ar-EG")} جنيه`],()=>{plans=plans.filter(x=>x.id!==item.id);savePlans();logActivity("حذف باقة",item.name);renderPlans();},`حذف الباقة «${item.name}»؟`)));
  document.querySelector("#plan-count").textContent=plans.length?`${plans.length} باقات مسجلة`:"لا توجد باقات بعد";
  document.querySelector("#plan-table").classList.toggle("hidden",!plans.length);document.querySelector("#plan-empty").classList.toggle("hidden",!!plans.length);
}
document.querySelector("#plan-form").addEventListener("submit",e=>{e.preventDefault();const item={id:crypto.randomUUID(),name:document.querySelector("#plan-name").value.trim(),speed:Number(document.querySelector("#plan-speed").value),price:Number(document.querySelector("#plan-price").value)};plans.unshift(item);savePlans();e.target.reset();renderPlans();logActivity("إضافة باقة",item.name);});
function renderPayments() {
  const body=document.querySelector("#payment-list");body.replaceChildren();
  payments.forEach(item=>body.append(buildRow([item.date,item.subscriber,`${Number(item.amount).toLocaleString("ar-EG")} جنيه`,item.method])));
  const total=payments.reduce((sum,item)=>sum+Number(item.amount||0),0);
  document.querySelector("#payment-total").textContent=`إجمالي المحصل: ${total.toLocaleString("ar-EG")} جنيه`;
  document.querySelector("#payment-table").classList.toggle("hidden",!payments.length);document.querySelector("#payment-empty").classList.toggle("hidden",!!payments.length);
  document.querySelector("#report-payments").textContent=`${total.toLocaleString("ar-EG")} جنيه`;
}
document.querySelector("#payment-date").value=new Date().toISOString().slice(0,10);
document.querySelector("#payment-form").addEventListener("submit",e=>{e.preventDefault();const item={id:crypto.randomUUID(),subscriber:document.querySelector("#payment-subscriber").value.trim(),amount:Number(document.querySelector("#payment-amount").value),date:document.querySelector("#payment-date").value,method:document.querySelector("#payment-method").value};payments.unshift(item);savePayments();e.target.reset();document.querySelector("#payment-date").value=new Date().toISOString().slice(0,10);renderPayments();logActivity("تسجيل تحصيل",`${item.subscriber} — ${item.amount} جنيه`);});
const networkSettingsForm=document.querySelector("#network-settings-form");
const savedNetworkSettings=JSON.parse(localStorage.getItem(networkSettingsKey)||"{}");
["management-channel","gateway-ip","lan-subnet","network-notes"].forEach(id=>{const field=document.getElementById(id);if(savedNetworkSettings[id]!==undefined)field.value=savedNetworkSettings[id];});
networkSettingsForm.addEventListener("submit",e=>{e.preventDefault();const settings={};["management-channel","gateway-ip","lan-subnet","network-notes"].forEach(id=>settings[id]=document.getElementById(id).value.trim());localStorage.setItem(networkSettingsKey,JSON.stringify(settings));logActivity("حفظ إعدادات الشبكة المحلية","تم حفظ ملاحظات الإعدادات في هذا المتصفح");alert("تم حفظ الإعدادات المحلية. لم يتم تغيير أي إعداد على الراوتر.");});
function renderReports(){document.querySelector("#report-devices").textContent=devices.length;document.querySelector("#report-users").textContent=users.length;renderPayments();}
const originalUpdateDashboard=updateDashboard;
updateDashboard=function(){originalUpdateDashboard();const reportDevices=document.querySelector("#report-devices");if(reportDevices)reportDevices.textContent=devices.length;const reportUsers=document.querySelector("#report-users");if(reportUsers)reportUsers.textContent=users.length;};
renderRouters();renderPlans();renderPayments();renderReports();


/* Customer subscriptions and staff directory: local preparation only. */
const subscriptionsKey="hesbah-customer-subscriptions-v1", staffKey="hesbah-staff-v1";
let customerSubscriptions=JSON.parse(localStorage.getItem(subscriptionsKey)||"[]");
let staffMembers=JSON.parse(localStorage.getItem(staffKey)||"[]");
const saveCustomerSubscriptions=()=>localStorage.setItem(subscriptionsKey,JSON.stringify(customerSubscriptions));
const saveStaff=()=>localStorage.setItem(staffKey,JSON.stringify(staffMembers));
const subLabels={active:"نشط",pending:"بانتظار التفعيل",suspended:"موقوف يدويًا"};
const staffRoleLabels={admin:"مدير النظام",network:"مسؤول الشبكة",collections:"مسؤول التحصيلات",support:"خدمة العملاء",viewer:"مشاهدة فقط"};
function renderSubscriptions(){
 const body=document.querySelector("#sub-list");body.replaceChildren();
 customerSubscriptions.forEach(item=>body.append(buildRow([item.customer,item.plan,item.start,item.due,subLabels[item.status]||item.status],()=>{customerSubscriptions=customerSubscriptions.filter(x=>x.id!==item.id);saveCustomerSubscriptions();logActivity("حذف اشتراك عميل",item.customer);renderSubscriptions();},`حذف اشتراك «${item.customer}» من السجل؟`)));
 document.querySelector("#sub-count").textContent=customerSubscriptions.length?`${customerSubscriptions.length} اشتراكات مسجلة`:"لا توجد اشتراكات بعد";
 document.querySelector("#sub-table").classList.toggle("hidden",!customerSubscriptions.length);document.querySelector("#sub-empty").classList.toggle("hidden",!!customerSubscriptions.length);
}
document.querySelector("#sub-start").value=new Date().toISOString().slice(0,10);
document.querySelector("#sub-due").value=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
document.querySelector("#subscription-form").addEventListener("submit",e=>{e.preventDefault();const item={id:crypto.randomUUID(),customer:document.querySelector("#sub-customer").value.trim(),plan:document.querySelector("#sub-plan").value.trim(),start:document.querySelector("#sub-start").value,due:document.querySelector("#sub-due").value,status:document.querySelector("#sub-status").value};if(item.due<item.start){alert("تاريخ الاستحقاق يجب أن يكون في نفس يوم البداية أو بعده.");return;}customerSubscriptions.unshift(item);saveCustomerSubscriptions();e.target.reset();document.querySelector("#sub-start").value=new Date().toISOString().slice(0,10);document.querySelector("#sub-due").value=new Date(Date.now()+30*86400000).toISOString().slice(0,10);renderSubscriptions();logActivity("إضافة اشتراك عميل",`${item.customer} — ${item.plan}`);});
function renderStaff(){
 const body=document.querySelector("#staff-list");body.replaceChildren();
 staffMembers.forEach(item=>body.append(buildRow([item.name,staffRoleLabels[item.role]||item.role,item.phone],()=>{staffMembers=staffMembers.filter(x=>x.id!==item.id);saveStaff();logActivity("حذف عضو فريق",item.name);renderStaff();},`حذف عضو الفريق «${item.name}» من السجل؟`)));
 document.querySelector("#staff-count").textContent=staffMembers.length?`${staffMembers.length} أعضاء مسجلون`:"لا يوجد أعضاء بعد";
 document.querySelector("#staff-table").classList.toggle("hidden",!staffMembers.length);document.querySelector("#staff-empty").classList.toggle("hidden",!!staffMembers.length);
}
document.querySelector("#staff-form").addEventListener("submit",e=>{e.preventDefault();const item={id:crypto.randomUUID(),name:document.querySelector("#staff-name").value.trim(),role:document.querySelector("#staff-role").value,phone:document.querySelector("#staff-phone").value.trim()};staffMembers.unshift(item);saveStaff();e.target.reset();renderStaff();logActivity("إضافة عضو فريق",`${item.name} — ${staffRoleLabels[item.role]}`);});
renderSubscriptions();renderStaff();

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
renderCompany();
render();
renderUsers();
renderActivity();


/* Maintenance tickets: local tracking only; no network actions. */
const ticketsKey="hesbah-maintenance-tickets-v1";
let maintenanceTickets=JSON.parse(localStorage.getItem(ticketsKey)||"[]");
const ticketLabels={low:"منخفضة",normal:"عادية",high:"عالية",urgent:"عاجلة"};
const ticketStatusLabels={open:"مفتوحة",working:"قيد العمل",waiting:"بانتظار",closed:"مغلقة"};
const saveTickets=()=>localStorage.setItem(ticketsKey,JSON.stringify(maintenanceTickets));
function renderTickets(){
 const body=document.querySelector("#ticket-list"), term=document.querySelector("#ticket-search").value.trim().toLowerCase();
 body.replaceChildren();
 const shown=maintenanceTickets.filter(x=>[x.number,x.title,x.customer,x.device,x.notes,ticketLabels[x.priority],ticketStatusLabels[x.status]].some(v=>String(v||"").toLowerCase().includes(term)));
 shown.forEach(item=>{
  const row=buildRow([item.number,item.title,item.customer,item.priority?ticketLabels[item.priority]: "عادية",ticketStatusLabels[item.status]||item.status,item.createdAt,item.notes||"—"],()=>{
   maintenanceTickets=maintenanceTickets.filter(x=>x.id!==item.id);saveTickets();logActivity("حذف تيكت صيانة",item.number+" — "+item.title);renderTickets();
  },"حذف تيكت الصيانة؟");
  body.append(row);
 });
 document.querySelector("#ticket-count").textContent=maintenanceTickets.length?maintenanceTickets.length+" تيكت صيانة":"لا توجد تيكتات بعد";
 document.querySelector("#ticket-table").classList.toggle("hidden",shown.length===0);
 document.querySelector("#ticket-empty").classList.toggle("hidden",shown.length!==0);
 document.querySelector("#ticket-empty").textContent=maintenanceTickets.length&&!shown.length?"لا توجد نتائج مطابقة للبحث.":"افتح أول تيكت صيانة ليظهر هنا.";
}
document.querySelector("#ticket-form").addEventListener("submit",e=>{
 e.preventDefault();
 const item={id:crypto.randomUUID(),number:"MT-"+Date.now().toString().slice(-8),title:document.querySelector("#ticket-title").value.trim(),customer:document.querySelector("#ticket-customer").value.trim(),device:document.querySelector("#ticket-device").value.trim(),priority:document.querySelector("#ticket-priority").value,status:document.querySelector("#ticket-status").value,notes:document.querySelector("#ticket-notes").value.trim(),createdAt:new Date().toLocaleDateString("ar-EG")};
 maintenanceTickets.unshift(item);saveTickets();e.target.reset();renderTickets();logActivity("فتح تيكت صيانة",item.number+" — "+item.title);
});
document.querySelector("#ticket-search").addEventListener("input",renderTickets);
renderTickets();

/* MikroTik inventory: metadata only, never stores credentials or sends commands. */
const mikrotikKey="hesbah-mikrotik-devices-v1";
let mikrotikDevices=JSON.parse(localStorage.getItem(mikrotikKey)||"[]");
const mikrotikAccessLabels={tailscale:"Tailscale / VPN",lan:"الشبكة المحلية",other:"أخرى"};
const mikrotikStatusLabels={unknown:"غير مفحوص",online:"متصل (يدوي)",offline:"غير متصل (يدوي)"};
const saveMikrotik=()=>localStorage.setItem(mikrotikKey,JSON.stringify(mikrotikDevices));
function renderMikrotik(){
 const body=document.querySelector("#mikrotik-list"),term=document.querySelector("#mikrotik-search").value.trim().toLowerCase();body.replaceChildren();
 const shown=mikrotikDevices.filter(x=>[x.name,x.model,x.ip,x.location,x.version,mikrotikAccessLabels[x.access],mikrotikStatusLabels[x.status]].some(v=>String(v||"").toLowerCase().includes(term)));
 shown.forEach(item=>body.append(buildRow([item.name,item.model,item.ip,item.location,item.version||"—",mikrotikAccessLabels[item.access],mikrotikStatusLabels[item.status]],()=>{
  mikrotikDevices=mikrotikDevices.filter(x=>x.id!==item.id);saveMikrotik();logActivity("حذف جهاز MikroTik",item.name);renderMikrotik();
 },"حذف جهاز MikroTik؟")));
 document.querySelector("#mikrotik-count").textContent=mikrotikDevices.length?mikrotikDevices.length+" أجهزة مسجلة":"لا توجد أجهزة بعد";
 document.querySelector("#mikrotik-table").classList.toggle("hidden",shown.length===0);
 document.querySelector("#mikrotik-empty").classList.toggle("hidden",shown.length!==0);
 document.querySelector("#mikrotik-empty").textContent=mikrotikDevices.length&&!shown.length?"لا توجد نتائج مطابقة للبحث.":"أضف أول جهاز MikroTik ليظهر هنا.";
}
document.querySelector("#mikrotik-form").addEventListener("submit",e=>{
 e.preventDefault();
 const item={id:crypto.randomUUID(),name:document.querySelector("#mikrotik-name").value.trim(),model:document.querySelector("#mikrotik-model").value.trim(),ip:document.querySelector("#mikrotik-ip").value.trim(),location:document.querySelector("#mikrotik-location").value.trim(),version:document.querySelector("#mikrotik-version").value.trim(),access:document.querySelector("#mikrotik-access").value,status:document.querySelector("#mikrotik-status").value};
 const duplicate=mikrotikDevices.some(x=>x.ip===item.ip);
 if(duplicate&&!confirm("عنوان IP مسجل بالفعل. هل تريد تسجيل جهاز آخر بنفس العنوان؟"))return;
 mikrotikDevices.unshift(item);saveMikrotik();e.target.reset();renderMikrotik();logActivity("إضافة جهاز MikroTik",item.name+" — "+item.ip);
});
document.querySelector("#mikrotik-search").addEventListener("input",renderMikrotik);
renderMikrotik();


/* WhatsApp groups directory: stores invite links locally, never accesses WhatsApp accounts. */
const whatsappKey="hesbah-whatsapp-groups-v1";
let whatsappGroups=JSON.parse(localStorage.getItem(whatsappKey)||"[]");
const whatsappCategories={maintenance:"الصيانة",subscribers:"المشتركين",technicians:"الفنيين",management:"إدارة الشبكة",other:"أخرى"};
const saveWhatsappGroups=()=>localStorage.setItem(whatsappKey,JSON.stringify(whatsappGroups));
/* Reuse one named compact popup for WhatsApp links. The browser may choose a tab instead. */
function openWhatsappMiniWindow(url){
 const features="popup=yes,width=480,height=720,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=yes,status=no";
 const popup=window.open(url,"hesbahWhatsappMini",features);
 if(popup){popup.focus();}else{alert("المتصفح منع النافذة الصغيرة. اسمح بالنوافذ المنبثقة لهذا الموقع ثم جرّب مرة أخرى.");}
}
function renderWhatsappGroups(){
 const body=document.querySelector("#whatsapp-list"),term=document.querySelector("#whatsapp-search").value.trim().toLowerCase();
 body.replaceChildren();
 const shown=whatsappGroups.filter(x=>[x.name,x.description,whatsappCategories[x.category]].some(v=>String(v||"").toLowerCase().includes(term)));
 shown.forEach(item=>{
  const row=document.createElement("tr");
  [item.name,whatsappCategories[item.category]||"أخرى",item.description||"—"].forEach(value=>{const cell=document.createElement("td");cell.textContent=value;row.append(cell);});
  const linkCell=document.createElement("td"),openButton=document.createElement("button");
  openButton.type="button";openButton.className="link whatsapp-open";openButton.textContent="فتح في نافذة صغيرة";
  openButton.addEventListener("click",()=>openWhatsappMiniWindow(item.link));linkCell.append(openButton);row.append(linkCell);
  const dateCell=document.createElement("td");dateCell.textContent=item.createdAt||"—";row.append(dateCell);
  const actions=document.createElement("td");actions.className="row-actions";
  const edit=document.createElement("button");edit.type="button";edit.className="link";edit.textContent="تعديل";
  edit.addEventListener("click",()=>{document.querySelector("#whatsapp-id").value=item.id;document.querySelector("#whatsapp-name").value=item.name;document.querySelector("#whatsapp-link").value=item.link;document.querySelector("#whatsapp-category").value=item.category;document.querySelector("#whatsapp-description").value=item.description||"";document.querySelector("#whatsapp-form-heading").textContent="تعديل جروب واتساب";document.querySelector("#whatsapp-save").textContent="حفظ التعديلات";document.querySelector("#whatsapp-cancel").classList.remove("hidden");document.querySelector("#whatsapp-name").focus();});
  const del=document.createElement("button");del.type="button";del.className="link danger";del.textContent="حذف";
  del.addEventListener("click",()=>{if(!confirm("حذف جروب واتساب «"+item.name+"» من السجل؟"))return;whatsappGroups=whatsappGroups.filter(x=>x.id!==item.id);saveWhatsappGroups();logActivity("حذف جروب واتساب",item.name);renderWhatsappGroups();});
  actions.append(edit,del);row.append(actions);body.append(row);
 });
 document.querySelector("#whatsapp-count").textContent=whatsappGroups.length?whatsappGroups.length+" جروبات مسجلة":"لا توجد جروبات بعد";
 document.querySelector("#whatsapp-table").classList.toggle("hidden",shown.length===0);
 document.querySelector("#whatsapp-empty").classList.toggle("hidden",shown.length!==0);
 document.querySelector("#whatsapp-empty").textContent=whatsappGroups.length&&!shown.length?"لا توجد نتائج مطابقة للبحث.":"أضف أول جروب واتساب ليظهر هنا.";
}
function resetWhatsappForm(){const form=document.querySelector("#whatsapp-form");form.reset();document.querySelector("#whatsapp-id").value="";document.querySelector("#whatsapp-form-heading").textContent="إضافة جروب واتساب";document.querySelector("#whatsapp-save").textContent="حفظ الجروب";document.querySelector("#whatsapp-cancel").classList.add("hidden");}
document.querySelector("#whatsapp-form").addEventListener("submit",e=>{
 e.preventDefault();
 const name=document.querySelector("#whatsapp-name").value.trim(),link=document.querySelector("#whatsapp-link").value.trim();
 let parsed;try{parsed=new URL(link);}catch{return alert("من فضلك أدخل رابطًا صحيحًا للجروب.");}
 if(parsed.protocol!=="https:"||!(parsed.hostname==="chat.whatsapp.com"||parsed.hostname==="wa.me"||parsed.hostname==="www.whatsapp.com"))return alert("استخدم رابط واتساب رسميًا يبدأ بـ https://.");
 const id=document.querySelector("#whatsapp-id").value;
 const duplicate=whatsappGroups.some(x=>x.id!==id&&x.link===link);
 if(duplicate&&!confirm("رابط الجروب مسجل بالفعل. هل تريد حفظه مرة أخرى؟"))return;
 const previous=whatsappGroups.find(x=>x.id===id);
 const item={id:id||crypto.randomUUID(),name,link,category:document.querySelector("#whatsapp-category").value,description:document.querySelector("#whatsapp-description").value.trim(),createdAt:previous?.createdAt||new Date().toLocaleDateString("ar-EG")};
 if(id){whatsappGroups=whatsappGroups.map(x=>x.id===id?item:x);logActivity("تعديل جروب واتساب",name);}else{whatsappGroups.unshift(item);logActivity("إضافة جروب واتساب",name);}
 saveWhatsappGroups();resetWhatsappForm();renderWhatsappGroups();
});
document.querySelector("#whatsapp-cancel").addEventListener("click",resetWhatsappForm);
document.querySelector("#whatsapp-search").addEventListener("input",renderWhatsappGroups);
renderWhatsappGroups();

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
