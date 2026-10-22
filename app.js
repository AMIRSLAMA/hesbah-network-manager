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
