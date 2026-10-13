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

function render() {
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
  userList.replaceChildren();
  const statusLabels = { online: "متصل", offline: "غير متصل", unknown: "غير معروف" };
  users.forEach(user => { const row = document.createElement("tr"); row.innerHTML = `<td></td><td></td><td></td><td dir="ltr"></td><td></td><td><button class="link danger" type="button">حذف</button></td>`; row.children[0].textContent = user.name; row.children[1].textContent = user.plan; const status = user.status || "unknown"; const badge = document.createElement("span"); badge.className = `status ${status}`; badge.textContent = statusLabels[status]; row.children[2].append(badge); row.children[3].textContent = user.pppoe; row.children[4].textContent = user.router; row.querySelector("button").onclick = () => { if (confirm(`حذف المشترك «${user.name}»؟`)) { users = users.filter(item => item.id !== user.id); persistUsers(); logActivity("حذف مشترك", user.name); renderUsers(); } }; userList.append(row); });
  userCount.textContent = users.length ? `${users.length} مشتركين` : "لا يوجد مشتركون بعد";
  usersTable.classList.toggle("hidden", users.length === 0); usersEmpty.classList.toggle("hidden", users.length !== 0);
}
function renderActivity() {
  activityList.replaceChildren();
  activity.forEach(item => { const row = document.createElement("tr"); [item.at, item.action, item.details].forEach(value => { const cell = document.createElement("td"); cell.textContent = value; row.append(cell); }); activityList.append(row); });
  activityTable.classList.toggle("hidden", activity.length === 0); activityEmpty.classList.toggle("hidden", activity.length !== 0);
}
userForm.addEventListener("submit", event => { event.preventDefault(); const user = { id: crypto.randomUUID(), name: userName.value.trim(), plan: subscriberPlan.value.trim(), pppoe: pppoeName.value.trim(), router: routerType.value.trim(), status: subscriberStatus.value }; users.unshift(user); persistUsers(); userForm.reset(); logActivity("إضافة مشترك", `${user.name} — ${user.plan}`); renderUsers(); });
clearActivity.onclick = () => { if (confirm("مسح كل سجل العمليات المحلي؟")) { activity = []; persistActivity(); renderActivity(); } };
navItems.forEach(item => item.addEventListener("click", () => { navItems.forEach(button => button.classList.toggle("active", button === item)); views.forEach(view => view.classList.toggle("active", view.id === `${item.dataset.view}-view`)); window.scrollTo({ top: 0, behavior: "smooth" }); }));
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
renderCompany();
render();
renderUsers();
renderActivity();
