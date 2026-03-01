// ================= CONFIG =================
const API_URL = "https://script.google.com/macros/s/AKfycbwo78mV92MKxcGMSB52NziL7bmn0AsEplVo2rhj92O3UGk7EKl9B8OlJt9ZqbmXEE7JiQ/exec";
const MASTER_PASSWORD = "PandR@123";

// ================= LOGIN =================
function login() {
    const pass = document.getElementById("password").value;
    if (pass === MASTER_PASSWORD) {
        sessionStorage.setItem("loggedIn", "true");
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("app").style.display = "flex";
        loadDashboard();
        loadVendor();
        loadMaterial();
        loadSettlement();
        loadLedger();
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
        loadDashboard();
        loadVendor();
        loadMaterial();
        loadSettlement();
        loadLedger();
    }
};

// ================= PAGE NAVIGATION =================
function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(id).style.display = "block";
}

// ================= API CALL =================
async function callAPI(action, data = {}) {
    const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({
            action: action,
            password: MASTER_PASSWORD,
            ...data
        })
    });
    return await res.json();
}

// ================= DASHBOARD =================
async function loadDashboard() {
    const data = await callAPI("getDashboard");
    document.getElementById("totalExpense").innerText = data.totalExpense || 0;
    document.getElementById("totalSettlement").innerText = data.totalSettled || 0;
    document.getElementById("papaExpense").innerText = data.papaExpense || 0;
}

// ================= MATERIAL =================
document.getElementById("matRate")?.addEventListener("input", calcMaterialTotal);
document.getElementById("matQty")?.addEventListener("input", calcMaterialTotal);

function calcMaterialTotal() {
    const qty = parseFloat(document.getElementById("matQty").value) || 0;
    const rate = parseFloat(document.getElementById("matRate").value) || 0;
    document.getElementById("matTotal").value = qty * rate;
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
    clearMaterialForm();
    loadMaterial();
    loadDashboard();
}

function clearMaterialForm() {
    document.querySelectorAll("#material input, #material select").forEach(i => i.value = "");
}

async function loadMaterial() {
    const data = await callAPI("getReport");
    let html = "";
    let total = 0;

    data.material.reverse().forEach(r => {
        total += r.total;
        html += `
            <tr>
                <td>${formatDate(r.date)}</td>
                <td>${r.item}</td>
                <td>${r.qty}</td>
                <td>${r.total}</td>
                <td>${r.paidBy}</td>
                <td><button onclick="editMaterial('${r.id}')">Edit</button></td>
                <td><button onclick="cancelMaterial('${r.id}')">Cancel</button></td>
            </tr>
        `;
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

    alert("Vendor Payment Added");
    document.querySelectorAll("#vendor input").forEach(i => i.value = "");
    loadVendor();
    loadDashboard();
}

async function loadVendor() {
    const data = await callAPI("getReport");
    let html = "";
    let total = 0;

    data.vendor.reverse().forEach(r => {
        total += r.amount;
        html += `
            <tr>
                <td>${formatDate(r.date)}</td>
                <td>${r.vendor}</td>
                <td>${r.amount}</td>
                <td>${r.paidBy}</td>
                <td><button onclick="editVendor('${r.id}')">Edit</button></td>
                <td><button onclick="cancelVendor('${r.id}')">Cancel</button></td>
            </tr>
        `;
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

    alert("Settlement Added");
    document.querySelectorAll("#settlement input").forEach(i => i.value = "");
    loadSettlement();
    loadDashboard();
}

async function loadSettlement() {
    const data = await callAPI("getReport");
    let html = "";
    let total = 0;

    data.settlement.reverse().forEach(r => {
        total += r.amount;
        html += `
            <tr>
                <td>${formatDate(r.date)}</td>
                <td>${r.paidTo}</td>
                <td>${r.amount}</td>
                <td>${r.paidBy}</td>
                <td><button>Edit</button></td>
                <td><button>Cancel</button></td>
            </tr>
        `;
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

// ================= REPORT =================
async function loadReport() {
    const data = await callAPI("getReport");
    document.getElementById("reportContent").innerHTML =
        "<pre>" + JSON.stringify(data, null, 2) + "</pre>";
}

// ================= EXPORT =================
function exportExcel() {
    alert("Excel Export Triggered (Connect Sheet Directly)");
}

function exportPDF() {
    window.print();
}

// ================= HELPERS =================
function formatDate(d) {
    const date = new Date(d);
    return date.toLocaleDateString("en-GB");
}
