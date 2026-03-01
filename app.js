const API_URL = "PASTE_YOUR_DEPLOY_URL";
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
// ================= NEW REPORT =================
async function generateReport(){

    const type = document.getElementById("reportType").value;
    const from = document.getElementById("reportFrom").value;
    const to = document.getElementById("reportTo").value;

    if(!type || !from || !to){
        alert("Please select type and date range");
        return;
    }

    const data = await callAPI("getReport");

    let records = data[type];

    // Date filter
    records = records.filter(r=>{
        const d = new Date(r.Date);
        return d >= new Date(from) && d <= new Date(to);
    });

    let thead="";
    let tbody="";
    let total=0;

    if(type==="material"){

        thead = `
        <tr>
        <th>Date</th>
        <th>Item</th>
        <th>Total</th>
        <th>Paid By</th>
        </tr>`;

        records.forEach(r=>{
            total += Number(r.Total);
            tbody+=`
            <tr>
            <td>${formatDate(r.Date)}</td>
            <td>${r.Item}</td>
            <td>${r.Total}</td>
            <td>${r.Paid_By}</td>
            </tr>`;
        });

    }

    if(type==="vendor"){

        thead = `
        <tr>
        <th>Date</th>
        <th>Vendor</th>
        <th>Amount</th>
        <th>Paid By</th>
        </tr>`;

        records.forEach(r=>{
            total += Number(r.Amount);
            tbody+=`
            <tr>
            <td>${formatDate(r.Date)}</td>
            <td>${r.Vendor}</td>
            <td>${r.Amount}</td>
            <td>${r.Paid_By}</td>
            </tr>`;
        });

    }

    if(type==="settlement"){

        thead = `
        <tr>
        <th>Date</th>
        <th>Paid To</th>
        <th>Amount</th>
        <th>Paid By</th>
        </tr>`;

        records.forEach(r=>{
            total += Number(r.Amount);
            tbody+=`
            <tr>
            <td>${formatDate(r.Date)}</td>
            <td>${r.Paid_To}</td>
            <td>${r.Amount}</td>
            <td>${r.Paid_By}</td>
            </tr>`;
        });

    }

    document.getElementById("reportTitle").innerText =
        type.toUpperCase() + " REPORT";

    document.querySelector("#reportTable thead").innerHTML = thead;
    document.querySelector("#reportTable tbody").innerHTML = tbody;
    document.querySelector("#reportTable tfoot").innerHTML =
        `<tr><td colspan="2">Grand Total</td>
         <td>${total}</td><td></td></tr>`;
}
