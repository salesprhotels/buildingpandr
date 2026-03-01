/* ================= CONFIG ================= */

const API_URL = "https://script.google.com/macros/s/AKfycbwo78mV92MKxcGMSB52NziL7bmn0AsEplVo2rhj92O3UGk7EKl9B8OlJt9ZqbmXEE7JiQ/exec";  
const MASTER_PASSWORD = "PandR@123";

let currentData = {
    material: [],
    vendor: [],
    settlement: []
};

/* ================= LOGIN ================= */

function login(){
    const pass = document.getElementById("password").value;
    if(pass === MASTER_PASSWORD){
        localStorage.setItem("erpLogin", "true");
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("app").classList.remove("hidden");
        loadAllData();
    }else{
        document.getElementById("loginError").innerText = "Wrong Password";
    }
}

function logout(){
    localStorage.removeItem("erpLogin");
    location.reload();
}

window.onload = function(){
    if(localStorage.getItem("erpLogin")==="true"){
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("app").classList.remove("hidden");
        loadAllData();
    }
};

/* ================= SECTION NAV ================= */

function showSection(id){
    document.querySelectorAll(".section").forEach(s=>s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

/* ================= API CALL ================= */

async function apiCall(action, data={}){
    const res = await fetch(API_URL,{
        method:"POST",
        body: JSON.stringify({
            action,
            password: MASTER_PASSWORD,
            ...data
        })
    });
    return await res.json();
}

/* ================= LOAD DATA ================= */

async function loadAllData(){
    const report = await apiCall("getReport");
    currentData = report;

    renderMaterial();
    renderVendor();
    renderSettlement();
    renderDashboard();
    renderLedger();
}

/* ================= SUCCESS POPUP ================= */

function showSuccess(msg){
    alert(msg);
}

/* ================= MATERIAL ================= */

function addMaterial(){
    const qty = Number(matQty.value);
    const rate = Number(matRate.value);
    const total = qty * rate;
    matTotal.value = total;

    apiCall("addMaterial",{
        date: matDate.value,
        category: matCategory.value,
        item: matItem.value,
        qty,
        unit: matUnit.value,
        rate,
        vendor: matVendor.value,
        paidBy: matPaidBy.value,
        mode: matMode.value,
        remarks: matRemarks.value
    }).then(()=>{
        showSuccess("Material Added Successfully");
        document.querySelectorAll("#material input").forEach(i=>i.value="");
        loadAllData();
    });
}

function renderMaterial(){
    const tbody = document.querySelector("#materialTable tbody");
    tbody.innerHTML = "";
    currentData.material.forEach(m=>{
        tbody.innerHTML += `
        <tr>
            <td>${formatDate(m.date)}</td>
            <td>${m.item}</td>
            <td>${m.qty}</td>
            <td>${m.total}</td>
            <td>${m.paidBy}</td>
            <td><button onclick="editMaterial('${m.id}')">Edit</button></td>
            <td><button onclick="cancelMaterial('${m.id}')">Cancel</button></td>
        </tr>`;
    });
}

/* ================= VENDOR ================= */

function addVendor(){
    apiCall("addVendor",{
        date: venDate.value,
        vendor: venVendor.value,
        category: venCategory.value,
        paidBy: venPaidBy.value,
        amount: Number(venAmount.value),
        mode: venMode.value,
        remarks: venRemarks.value
    }).then(()=>{
        showSuccess("Vendor Payment Added");
        document.querySelectorAll("#vendor input").forEach(i=>i.value="");
        loadAllData();
    });
}

function renderVendor(){
    const tbody = document.querySelector("#vendorTable tbody");
    tbody.innerHTML = "";
    currentData.vendor.forEach(v=>{
        tbody.innerHTML += `
        <tr>
            <td>${formatDate(v.date)}</td>
            <td>${v.vendor}</td>
            <td>${v.amount}</td>
            <td>${v.paidBy}</td>
            <td><button onclick="editVendor('${v.id}')">Edit</button></td>
            <td><button onclick="cancelVendor('${v.id}')">Cancel</button></td>
        </tr>`;
    });
}

/* ================= SETTLEMENT ================= */

function addSettlement(){
    apiCall("addSettlement",{
        date: setDate.value,
        paidTo: setPaidTo.value,
        paidBy: setPaidBy.value,
        amount: Number(setAmount.value),
        mode: setMode.value,
        remarks: setRemarks.value
    }).then(()=>{
        showSuccess("Settlement Added");
        document.querySelectorAll("#settlement input").forEach(i=>i.value="");
        loadAllData();
    });
}

function renderSettlement(){
    const tbody = document.querySelector("#settlementTable tbody");
    tbody.innerHTML="";
    currentData.settlement.forEach(s=>{
        tbody.innerHTML += `
        <tr>
            <td>${formatDate(s.date)}</td>
            <td>${s.paidTo}</td>
            <td>${s.amount}</td>
            <td>${s.paidBy}</td>
        </tr>`;
    });
}

/* ================= DASHBOARD ================= */

function renderDashboard(){
    let totalExpense = 0;
    let totalSettlement = 0;
    let ledger = {};

    currentData.material.forEach(m=>{
        totalExpense += m.total;
        ledger[m.paidBy] = (ledger[m.paidBy]||0) + m.total;
    });

    currentData.vendor.forEach(v=>{
        totalExpense += v.amount;
        ledger[v.paidBy] = (ledger[v.paidBy]||0) + v.amount;
    });

    currentData.settlement.forEach(s=>{
        totalSettlement += s.amount;
        ledger[s.paidTo] = (ledger[s.paidTo]||0) - s.amount;
        ledger[s.paidBy] = (ledger[s.paidBy]||0) + s.amount;
    });

    totalExpenseEl.innerText = totalExpense;
    totalSettlementEl.innerText = totalSettlement;
    papaExpenseEl.innerText = ledger["Papa"] || 0;
}

/* ================= LEDGER ================= */

function renderLedger(){
    const tbody = document.querySelector("#ledgerTable tbody");
    tbody.innerHTML="";
    let ledger={};

    currentData.material.forEach(m=>{
        ledger[m.paidBy]=(ledger[m.paidBy]||0)+m.total;
    });

    currentData.vendor.forEach(v=>{
        ledger[v.paidBy]=(ledger[v.paidBy]||0)+v.amount;
    });

    currentData.settlement.forEach(s=>{
        ledger[s.paidTo]=(ledger[s.paidTo]||0)-s.amount;
        ledger[s.paidBy]=(ledger[s.paidBy]||0)+s.amount;
    });

    for(let p in ledger){
        tbody.innerHTML += `
        <tr>
            <td>${p}</td>
            <td>${ledger[p]}</td>
        </tr>`;
    }
}

/* ================= REPORT ================= */

function filterReport(){
    const from = new Date(fromDate.value);
    const to = new Date(toDate.value);
    const tbody = document.querySelector("#reportTable tbody");
    tbody.innerHTML="";

    const all = [
        ...currentData.material.map(m=>({...m,type:"Material",amount:m.total,name:m.item})),
        ...currentData.vendor.map(v=>({...v,type:"Vendor",amount:v.amount,name:v.vendor})),
        ...currentData.settlement.map(s=>({...s,type:"Settlement",amount:s.amount,name:s.paidTo}))
    ];

    all.forEach(r=>{
        const d = new Date(r.date);
        if(d>=from && d<=to){
            tbody.innerHTML += `
            <tr>
                <td>${formatDate(r.date)}</td>
                <td>${r.type}</td>
                <td>${r.name}</td>
                <td>${r.amount}</td>
                <td>${r.paidBy}</td>
            </tr>`;
        }
    });
}

/* ================= EXPORT ================= */

function exportExcel(){
    const table = document.getElementById("reportTable");
    const wb = XLSX.utils.table_to_book(table);
    XLSX.writeFile(wb,"Report.xlsx");
}

function exportPDF(){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("PandR ERP Report",10,10);
    doc.save("Report.pdf");
}

/* ================= HELPERS ================= */

function formatDate(d){
    return new Date(d).toLocaleDateString();
}
