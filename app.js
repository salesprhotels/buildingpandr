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
        initSystem();
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
        initSystem();
    }
};

function initSystem() {
    showPage("dashboard");
    loadDashboard();
    loadVendor();
    loadMaterial();
    loadSettlement();
    loadLedger();
}

// ================= PAGE NAVIGATION =================
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(id).style.display = "block";
}

// ================= API CALL =================
async function callAPI(action, data = {}) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify({
            action: action,
            password: MASTER_PASSWORD,
            ...data
        })
    });

    const result = await response.json();
    return result;
}

// ================= DASHBOARD =================
async function loadDashboard() {
    const data = await callAPI("getDashboard");
    document.getElementById("totalExpense").innerText = data.totalExpense || 0;
    document.getElementById("totalSettlement").innerText = data.totalSettled || 0;
    document.getElementById("papaExpense").innerText = data.papaExpense || 0;
}

// ================= MATERIAL =================
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
    document.querySelectorAll("#material input, #material select").forEach(e => e.value = "");
    loadMaterial();
    loadDashboard();
    loadLedger();
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
            <td>${r.Qty}</td>
            <td>${r.Total}</td>
            <td>${r.Paid_By}</td>
            <td><button onclick="editMaterial('${r.ID}')">Edit</button></td>
            <td><button onclick="cancelEntry('Materials','${r.ID}')">Cancel</button></td>
        </tr>`;
    });

    document.querySelector("#materialTable tbody").innerHTML = html;
    document.getElementById("materialGrandTotal").innerText = total;
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

    alert("Vendor Payment Added Successfully");
    document.querySelectorAll("#vendor input").forEach(e => e.value = "");
    loadVendor();
    loadDashboard();
    loadLedger();
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
            <td><button onclick="editVendor('${r.ID}')">Edit</button></td>
            <td><button onclick="cancelEntry('Vendor_Payments','${r.ID}')">Cancel</button></td>
        </tr>`;
    });

    document.querySelector("#vendorTable tbody").innerHTML = html;
    document.getElementById("vendorGrandTotal").innerText = total;
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

    alert("Settlement Added Successfully");
    document.querySelectorAll("#settlement input").forEach(e => e.value = "");
    loadSettlement();
    loadDashboard();
    loadLedger();
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

    document.querySelector("#settlementTable tbody").innerHTML = html;
    document.getElementById("settlementGrandTotal").innerText = total;
}

// ================= LEDGER =================
async function loadLedger() {
    const data = await callAPI("getLedger");
    let html = "";

    for (let person in data) {
        html += `<tr><td>${person}</td><td>${data[person]}</td></tr>`;
    }

    document.querySelector("#ledgerTable tbody").innerHTML = html;
}

// ================= CANCEL =================
async function cancelEntry(sheetName, id) {
    await callAPI("cancelEntry", {
        sheet: sheetName,
        id: id
    });

    alert("Entry Cancelled");
    initSystem();
}

// ================= EDIT =================
function editVendor(id) {
    alert("Edit logic can be extended — entry ID: " + id);
}

function editMaterial(id) {
    alert("Edit logic can be extended — entry ID: " + id);
}

// ================= REPORT =================
async function loadReport() {
    const data = await callAPI("getReport");
    document.getElementById("reportContent").innerHTML =
        "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
}

function exportPDF() {
    window.print();
}

// ================= HELPERS =================
function formatDate(d) {
    const date = new Date(d);
    return date.toLocaleDateString("en-GB");
}
