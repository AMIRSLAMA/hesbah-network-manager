const storageKey = "hesbah-devices-v1";
const companyStorageKey = "hesbah-company-v1";
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

let devices = JSON.parse(localStorage.getItem(storageKey) || "[]");
let company = localStorage.getItem(companyStorageKey) || "";
const persist = () => localStorage.setItem(storageKey, JSON.stringify(devices));
const renderCompany = () => { companyName.value = company; brandName.textContent = company || "Hesbah"; };
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
    row.querySelector(".delete").onclick = () => { if (confirm(`حذف الجهاز «${device.name}» من السجل؟`)) { devices = devices.filter(d => d.id !== device.id); persist(); render(); } };
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
  at === -1 ? devices.unshift(entry) : devices[at] = entry;
  persist(); resetForm(); render();
});
cancel.onclick = resetForm;
search.addEventListener("input", render);
companyForm.addEventListener("submit", event => { event.preventDefault(); company = companyName.value.trim(); localStorage.setItem(companyStorageKey, company); renderCompany(); });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
renderCompany();
render();
