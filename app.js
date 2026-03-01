const API_URL = "https://script.google.com/macros/s/AKfycbyz75olpNFGF4oBiJ2bjhnxBiJts521x2qv7DC8PQHf2S4p1Ckro8uhbAgS_X6YwDdfpQ/exec";
const MASTER_PASSWORD = "PandR@123";

/* ================= LOGIN ================= */

function login() {
    const pass = password.value;
    if (pass === MASTER_PASSWORD) {
        sessionStorage.setItem("loggedIn", "true");
        loginPage.style.display = "none";
        app.style.display = "flex";
        init();
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
        loginPage.style.display = "none";
        app.style.display = "flex";
        init();
    }
};

function init() {
    showPage("dashboard");
    loadDashboard();
    loadVendor();
    loadMaterial();
    loadSettlement();
    loadLedger();
}

/* ================= NAV ================= */

function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.style.display = "none");
    document.getElementById(id).style.display = "block";
}

/* ================= API ================= */

async function callAPI(action, data = {}) {
    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action,
            password: MASTER_PASSWORD,
            ...data
        })
    });
    return await res.json();
}

/* ================= DASHBOARD ================= */

async function loadDashboard() {
    const data = await callAPI("getDashboard");
    totalExpense.innerText = data.totalExpense || 0;
    totalSettlement.innerText = data.totalSettled || 0;
    papaExpense.innerText = data.papaExpense || 0;
}

/* ================= MATERIAL ================= */

matRate?.addEventListener("input", calcMaterialTotal);
matQty?.addEventListener("input", calcMaterialTotal);

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

    clearMaterialForm();
    init();
}

function clearMaterialForm() {
    document.querySelectorAll("#material input, #material select")
        .forEach(i => i.value = "");
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
            <td>-</td>
            <td>-</td>
        </tr>`;
    });

    materialTable.querySelector("tbody").innerHTML = html;
    materialGrandTotal.innerText = total;
}

/* ================= VENDOR ================= */

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

    document.querySelectorAll("#vendor input").forEach(i => i.value = "");
    init();
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
            <td>-</td>
            <td>-</td>
        </tr>`;
    });

    vendorTable.querySelector("tbody").innerHTML = html;
    vendorGrandTotal.innerText = total;
}

/* ================= SETTLEMENT ================= */

async function addSettlement() {
    await callAPI("addSettlement", {
        date: setDate.value,
        paidTo: setPaidTo.value,
        paidBy: setPaidBy.value,
        amount: setAmount.value,
        mode: setMode.value,
        remarks: setRemarks.value
    });

    document.querySelectorAll("#settlement input").forEach(i => i.value = "");
    init();
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
            <td>-</td>
            <td>-</td>
        </tr>`;
    });

    settlementTable.querySelector("tbody").innerHTML = html;
    settlementGrandTotal.innerText = total;
}

/* ================= LEDGER ================= */

async function loadLedger() {
    const data = await callAPI("getLedger");
    let html = "";

    for (let person in data) {
        html += `<tr>
                    <td>${person}</td>
                    <td>${data[person]}</td>
                 </tr>`;
    }

    ledgerTable.querySelector("tbody").innerHTML = html;
}

/* ================= HELPERS ================= */

function formatDate(d) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-GB");
}
