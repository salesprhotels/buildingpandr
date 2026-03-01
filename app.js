const API_URL = "https://script.google.com/macros/s/AKfycbyz75olpNFGF4oBiJ2bjhnxBiJts521x2qv7DC8PQHf2S4p1Ckro8uhbAgS_X6YwDdfpQ/exec";
const MASTER_PASSWORD = "PandR@123";

function login(){
const pass=password.value;
if(pass===MASTER_PASSWORD){
sessionStorage.setItem("login","1");
loginPage.style.display="none";
app.style.display="flex";
init();
}else alert("Wrong Password");
}

function logout(){
sessionStorage.clear();
location.reload();
}

window.onload=function(){
if(sessionStorage.getItem("login")==="1"){
loginPage.style.display="none";
app.style.display="flex";
init();
}
};

function init(){
showPage("dashboard");
loadAll();
}

function showPage(id){
document.querySelectorAll(".page").forEach(p=>p.style.display="none");
document.getElementById(id).style.display="block";
}

async function api(action,data={}){
const r=await fetch(API_URL,{
method:"POST",
headers:{"Content-Type":"text/plain;charset=utf-8"},
body:JSON.stringify({action,password:MASTER_PASSWORD,...data})
});
return await r.json();
}

async function loadAll(){
loadDashboard();
loadVendor();
loadMaterial();
loadSettlement();
loadLedger();
}

function calcMaterialTotal(){
matTotal.value=(matQty.value*matRate.value)||0;
}

matQty.oninput=calcMaterialTotal;
matRate.oninput=calcMaterialTotal;

async function addVendor(){
await api("addVendor",{date:venDate.value,vendor:venVendor.value,category:venCategory.value,paidBy:venPaidBy.value,amount:venAmount.value,mode:venMode.value,remarks:venRemarks.value});
alert("Saved");
loadAll();
}

async function addMaterial(){
await api("addMaterial",{date:matDate.value,category:matCategory.value,item:matItem.value,qty:matQty.value,unit:matUnit.value,rate:matRate.value,vendor:matVendor.value,paidBy:matPaidBy.value,mode:matMode.value,remarks:matRemarks.value});
alert("Saved");
loadAll();
}

async function addSettlement(){
await api("addSettlement",{date:setDate.value,paidTo:setPaidTo.value,paidBy:setPaidBy.value,amount:setAmount.value,mode:setMode.value,remarks:setRemarks.value});
alert("Saved");
loadAll();
}

async function loadDashboard(){
const d=await api("getDashboard");
totalExpense.innerText=d.totalExpense||0;
totalSettlement.innerText=d.totalSettled||0;
papaExpense.innerText=d.papaExpense||0;
}

async function loadVendor(){
const d=await api("getReport");
let t=0,html="";
d.vendor.forEach(r=>{
t+=Number(r.Amount);
html+=`<tr>
<td>${new Date(r.Date).toLocaleDateString()}</td>
<td>${r.Vendor}</td>
<td>${r.Amount}</td>
<td>${r.Paid_By}</td>
<td><button onclick="cancel('Vendor_Payments','${r.ID}')">X</button></td>
</tr>`;
});
vendorTable.querySelector("tbody").innerHTML=html;
vendorGrandTotal.innerText=t;
}

async function loadMaterial(){
const d=await api("getReport");
let t=0,html="";
d.material.forEach(r=>{
t+=Number(r.Total);
html+=`<tr>
<td>${new Date(r.Date).toLocaleDateString()}</td>
<td>${r.Item}</td>
<td>${r.Total}</td>
<td>${r.Paid_By}</td>
<td><button onclick="cancel('Materials','${r.ID}')">X</button></td>
</tr>`;
});
materialTable.querySelector("tbody").innerHTML=html;
materialGrandTotal.innerText=t;
}

async function loadSettlement(){
const d=await api("getReport");
let t=0,html="";
d.settlement.forEach(r=>{
t+=Number(r.Amount);
html+=`<tr>
<td>${new Date(r.Date).toLocaleDateString()}</td>
<td>${r.Paid_To}</td>
<td>${r.Amount}</td>
<td>${r.Paid_By}</td>
<td><button onclick="cancel('Internal_Settlement','${r.ID}')">X</button></td>
</tr>`;
});
settlementTable.querySelector("tbody").innerHTML=html;
settlementGrandTotal.innerText=t;
}

async function loadLedger(){
const d=await api("getLedger");
let html="";
for(let p in d){
html+=`<tr><td>${p}</td><td>${d[p]}</td></tr>`;
}
ledgerTable.querySelector("tbody").innerHTML=html;
}

async function cancel(sheet,id){
await api("cancelEntry",{sheet,id});
loadAll();
}
