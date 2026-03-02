// ================= CONFIG =================
const API_URL = "https://script.google.com/macros/s/AKfycbyz75olpNFGF4oBiJ2bjhnxBiJts521x2qv7DC8PQHf2S4p1Ckro8uhbAgS_X6YwDdfpQ/exec";
const MASTER_PASSWORD = "PandR@123";

// ================= LOGIN =================
function login() {
    const pass = document.getElementById("password").value;
    if (pass === MASTER_PASSWORD) {
        sessionStorage.setItem("loggedIn", "true");
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("app").style.display = "flex";
        initApp();
    } else {
        alert("Wrong Password");
    }
}

function logout() {
    sessionStorage.clear();
    location.reload();
}

window.onload = function () {
    if (sessionStorage.getItem("loggedIn") === "true") {
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("app").style.display = "flex";
        initApp();
    }
};

function initApp(){
    showPage("dashboard");
    loadDashboard();
    loadVendor();
    loadMaterial();
    loadSettlement();
    loadLedger();
}

// ================= NAVIGATION =================
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(id).style.display = "block";
}

// ================= API CALL =================
async function callAPI(action, data = {}) {
    const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            action,
            password: MASTER_PASSWORD,
            ...data
        })
    });
    return await res.json();
}

// ================= DASHBOARD =================
async function loadDashboard() {
    const data = await callAPI("getDashboard");
    totalExpense.innerText = data.totalExpense || 0;
    totalSettlement.innerText = data.totalSettled || 0;
    papaExpense.innerText = data.papaExpense || 0;
}

// ================= MATERIAL =================
matQty?.addEventListener("input", calcMaterialTotal);
matRate?.addEventListener("input", calcMaterialTotal);

function calcMaterialTotal() {
    const qty = parseFloat(matQty.value) || 0;
    const rate = parseFloat(matRate.value) || 0;
    matTotal.value = qty * rate;
}

async function addMaterial() {
    await callAPI("addMaterial", {
        date: matDate.value,
        category: matCategory.value,
        item: matItem.value,
        qty: matQty.value,
        unit: matUnit.value,
        rate: matRate.value,
        vendor: matVendor.value,
        paidBy: matPaidBy.value,
        mode: matMode.value,
        remarks: matRemarks.value
    });

    alert("Material Added Successfully");
    loadMaterial();
    loadDashboard();
}

async function loadMaterial() {
    const data = await callAPI("getReport");
    let html = "";
    let total = 0;

    data.material.forEach(r => {
        total += Number(r.Total);
        html += `
        <tr>
            <td>${formatDate(r.Date)}</td>
            <td>${r.Item}</td>
            <td>${r.Total}</td>
            <td>${r.Paid_By}</td>
            <td><button onclick="cancelEntry('Materials','${r.ID}')">Cancel</button></td>
        </tr>`;
    });

    materialTable.querySelector("tbody").innerHTML = html;
    materialGrandTotal.innerText = total;
}

// ================= VENDOR =================
async function addVendor() {
    await callAPI("addVendor", {
        date: venDate.value,
        vendor: venVendor.value,
        category: venCategory.value,
        paidBy: venPaidBy.value,
        amount: venAmount.value,
        mode: venMode.value,
        remarks: venRemarks.value
    });

    alert("Vendor Payment Added");
    loadVendor();
    loadDashboard();
}

async function loadVendor() {
    const data = await callAPI("getReport");
    let html = "";
    let total = 0;

    data.vendor.forEach(r => {
        total += Number(r.Amount);
        html += `
        <tr>
            <td>${formatDate(r.Date)}</td>
            <td>${r.Vendor}</td>
            <td>${r.Amount}</td>
            <td>${r.Paid_By}</td>
            <td><button onclick="cancelEntry('Vendor_Payments','${r.ID}')">Cancel</button></td>
        </tr>`;
    });

    vendorTable.querySelector("tbody").innerHTML = html;
    vendorGrandTotal.innerText = total;
}

// ================= SETTLEMENT =================
async function addSettlement() {
    await callAPI("addSettlement", {
        date: setDate.value,
        paidTo: setPaidTo.value,
        paidBy: setPaidBy.value,
        amount: setAmount.value,
        mode: setMode.value,
        remarks: setRemarks.value
    });

    alert("Settlement Added");
    loadSettlement();
    loadDashboard();
}

async function loadSettlement() {
    const data = await callAPI("getReport");
    let html = "";
    let total = 0;

    data.settlement.forEach(r => {
        total += Number(r.Amount);
        html += `
        <tr>
            <td>${formatDate(r.Date)}</td>
            <td>${r.Paid_To}</td>
            <td>${r.Amount}</td>
            <td>${r.Paid_By}</td>
            <td><button onclick="cancelEntry('Internal_Settlement','${r.ID}')">Cancel</button></td>
        </tr>`;
    });

    settlementTable.querySelector("tbody").innerHTML = html;
    settlementGrandTotal.innerText = total;
}

// ================= CANCEL =================
async function cancelEntry(sheet,id){
    await callAPI("cancelEntry",{sheet,id});
    loadVendor();
    loadMaterial();
    loadSettlement();
    loadDashboard();
    loadLedger();
}

// ================= LEDGER =================
async function loadLedger() {
    const data = await callAPI("getLedger");
    let html = "";
    for (let person in data) {
        html += `<tr><td>${person}</td><td>${data[person]}</td></tr>`;
    }
    ledgerTable.querySelector("tbody").innerHTML = html;
}

// ================= REPORT (FINAL STRUCTURE) =================
async function generateReport(){

    const type = reportType.value;
    const from = reportFrom.value;
    const to = reportTo.value;

    if(!type || !from || !to){
        alert("Select report type and date range");
        return;
    }

    const data = await callAPI("getReport");
    let records = data[type];

    records = records.filter(r=>{
        const d = new Date(r.Date);
        return d >= new Date(from) && d <= new Date(to);
    });

    let thead="";
    let tbody="";
    let total=0;

    if(type==="material"){
        thead=`<tr><th>Date</th><th>Item</th><th>Total</th><th>Paid By</th></tr>`;
        records.forEach(r=>{
            total+=Number(r.Total);
            tbody+=`<tr>
            <td>${formatDate(r.Date)}</td>
            <td>${r.Item}</td>
            <td>${r.Total}</td>
            <td>${r.Paid_By}</td>
            </tr>`;
        });
    }

    if(type==="vendor"){
        thead=`<tr><th>Date</th><th>Vendor</th><th>Amount</th><th>Paid By</th></tr>`;
        records.forEach(r=>{
            total+=Number(r.Amount);
            tbody+=`<tr>
            <td>${formatDate(r.Date)}</td>
            <td>${r.Vendor}</td>
            <td>${r.Amount}</td>
            <td>${r.Paid_By}</td>
            </tr>`;
        });
    }

    if(type==="settlement"){
        thead=`<tr><th>Date</th><th>Paid To</th><th>Amount</th><th>Paid By</th></tr>`;
        records.forEach(r=>{
            total+=Number(r.Amount);
            tbody+=`<tr>
            <td>${formatDate(r.Date)}</td>
            <td>${r.Paid_To}</td>
            <td>${r.Amount}</td>
            <td>${r.Paid_By}</td>
            </tr>`;
        });
    }

    reportTable.querySelector("thead").innerHTML = thead;
    reportTable.querySelector("tbody").innerHTML = tbody;
    reportTable.querySelector("tfoot").innerHTML =
        `<tr><td colspan="2">Grand Total</td><td>${total}</td><td></td></tr>`;
}

// ================= HELPER =================
function formatDate(d) {
    return new Date(d).toLocaleDateString("en-GB");
}
