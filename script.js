// ================================
// ADMIN ACCOUNT MANAGER
// ================================

const STORAGE_KEY = "accountManagerData";

let accounts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let editingId = null;

// ================================
// DOM ELEMENTS
// ================================

const accountForm = document.getElementById("accountForm");
const accountList = document.getElementById("accountList");
const searchInput = document.getElementById("searchInput");

const accountName = document.getElementById("accountName");
const username = document.getElementById("username");
const followers = document.getElementById("followers");
const likes = document.getElementById("likes");
const price = document.getElementById("price");
const status = document.getElementById("status");
const profileImage = document.getElementById("profileImage");

const emailFirstName = document.getElementById("emailFirstName");
const emailLastName = document.getElementById("emailLastName");
const emailUsername = document.getElementById("emailUsername");
const emailDomain = document.getElementById("emailDomain");
const emailResult = document.getElementById("emailResult");

// ================================
// SAVE DATA
// ================================

function saveAccounts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

// ================================
// GENERATE UNIQUE ID
// ================================

function generateId() {
    return Date.now().toString() + Math.random().toString(36).substring(2);
}

// ================================
// DISPLAY ACCOUNTS
// ================================

function renderAccounts(list = accounts) {

    if (!accountList) return;

    accountList.innerHTML = "";

    if (list.length === 0) {
        accountList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📂</div>
                <h3>Tiada akaun</h3>
                <p>Belum ada akaun yang ditambahkan.</p>
            </div>
        `;
        updateStats();
        return;
    }

    list.forEach(account => {

        const card = document.createElement("div");
        card.className = "account-card";

        const image = account.image
            ? `<img src="${account.image}" alt="Profile">`
            : `<div class="default-avatar">👤</div>`;

        card.innerHTML = `
            <div class="account-header">
                <div class="profile-photo">
                    ${image}
                </div>

                <div class="account-info">
                    <h3>${escapeHTML(account.name)}</h3>
                    <p>@${escapeHTML(account.username)}</p>
                </div>

                <span class="status-badge ${account.status.toLowerCase()}">
                    ${escapeHTML(account.status)}
                </span>
            </div>

            <div class="account-stats">
                <div>
                    <strong>${formatNumber(account.followers)}</strong>
                    <span>Followers</span>
                </div>

                <div>
                    <strong>${formatNumber(account.likes)}</strong>
                    <span>Likes</span>
                </div>

                <div>
                    <strong>RM ${formatNumber(account.price)}</strong>
                    <span>Harga</span>
                </div>
            </div>

            <div class="account-actions">
                <button class="edit-btn" onclick="editAccount('${account.id}')">
                    ✏️ Edit
                </button>

                <button class="delete-btn" onclick="deleteAccount('${account.id}')">
                    🗑️ Delete
                </button>
            </div>
        `;

        accountList.appendChild(card);
    });

    updateStats();
}

// ================================
// CREATE / UPDATE ACCOUNT
// ================================

if (accountForm) {

    accountForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const accountData = {
            name: accountName.value.trim(),
            username: username.value.trim(),
            followers: Number(followers.value) || 0,
            likes: Number(likes.value) || 0,
            price: Number(price.value) || 0,
            status: status.value,
            image: ""
        };

        const file = profileImage.files[0];

        if (editingId) {

            const existingAccount = accounts.find(
                account => account.id === editingId
            );

            if (existingAccount) {

                existingAccount.name = accountData.name;
                existingAccount.username = accountData.username;
                existingAccount.followers = accountData.followers;
                existingAccount.likes = accountData.likes;
                existingAccount.price = accountData.price;
                existingAccount.status = accountData.status;

                if (file) {
                    readImage(file, function(imageData) {
                        existingAccount.image = imageData;
                        saveAccounts();
                        renderAccounts();
                    });
                } else {
                    saveAccounts();
                    renderAccounts();
                }
            }

            editingId = null;

        } else {

            accountData.id = generateId();

            if (file) {

                readImage(file, function(imageData) {

                    accountData.image = imageData;

                    accounts.unshift(accountData);

                    saveAccounts();
                    renderAccounts();

                });

            } else {

                accounts.unshift(accountData);

                saveAccounts();
                renderAccounts();

            }
        }

        accountForm.reset();

        const submitButton = accountForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) {
            submitButton.textContent = "Create Account";
        }
    });
}

// ================================
// READ PROFILE IMAGE
// ================================

function readImage(file, callback) {

    const reader = new FileReader();

    reader.onload = function(event) {
        callback(event.target.result);
    };

    reader.readAsDataURL(file);
}

// ================================
// EDIT ACCOUNT
// ================================

function editAccount(id) {

    const account = accounts.find(
        item => item.id === id
    );

    if (!account) return;

    editingId = id;

    accountName.value = account.name;
    username.value = account.username;
    followers.value = account.followers;
    likes.value = account.likes;
    price.value = account.price;
    status.value = account.status;

    const submitButton = accountForm.querySelector(
        'button[type="submit"]'
    );

    if (submitButton) {
        submitButton.textContent = "Update Account";
    }

    accountForm.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// ================================
// DELETE ACCOUNT
// ================================

function deleteAccount(id) {

    const confirmDelete = confirm(
        "Adakah anda pasti mahu memadam akaun ini?"
    );

    if (!confirmDelete) return;

    accounts = accounts.filter(
        account => account.id !== id
    );

    saveAccounts();
    renderAccounts();
}

// ================================
// SEARCH ACCOUNT
// ================================

if (searchInput) {

    searchInput.addEventListener("input", function() {

        const keyword = searchInput.value
            .toLowerCase()
            .trim();

        const filtered = accounts.filter(account =>

            account.name
                .toLowerCase()
                .includes(keyword)

            ||

            account.username
                .toLowerCase()
                .includes(keyword)

            ||

            account.status
                .toLowerCase()
                .includes(keyword)

        );

        renderAccounts(filtered);
    });
}

// ================================
// STATISTICS
// ================================

function updateStats() {

    const totalAccounts = document.getElementById("totalAccounts");
    const availableAccounts = document.getElementById("availableAccounts");
    const soldAccounts = document.getElementById("soldAccounts");

    if (totalAccounts) {
        totalAccounts.textContent = accounts.length;
    }

    if (availableAccounts) {

        availableAccounts.textContent =
            accounts.filter(
                account =>
                    account.status.toLowerCase() === "available"
            ).length;

    }

    if (soldAccounts) {

        soldAccounts.textContent =
            accounts.filter(
                account =>
                    account.status.toLowerCase() === "sold"
            ).length;

    }
}

// ================================
// EMAIL TEMPLATE GENERATOR
// ================================

function generateEmail() {

    if (!emailResult) return;

    const firstName =
        emailFirstName?.value.trim().toLowerCase() || "";

    const lastName =
        emailLastName?.value.trim().toLowerCase() || "";

    const customUsername =
        emailUsername?.value.trim().toLowerCase() || "";

    const domain =
        emailDomain?.value.trim() || "example.com";

    let generatedUsername = customUsername;

    if (!generatedUsername) {

        generatedUsername =
            `${firstName}${lastName}`
                .replace(/\s+/g, "")
                .replace(/[^a-z0-9._-]/g, "");

    }

    if (!generatedUsername) {

        emailResult.textContent =
            "Sila masukkan nama atau username.";

        return;
    }

    const generatedEmail =
        `${generatedUsername}@${domain}`;

    emailResult.textContent =
        generatedEmail;
}

// ================================
// COPY GENERATED EMAIL
// ================================

function copyEmail() {

    if (!emailResult) return;

    const email =
        emailResult.textContent.trim();

    if (
        !email ||
        email === "Sila masukkan nama atau username."
    ) {
        return;
    }

    navigator.clipboard.writeText(email)
        .then(() => {

            alert(
                "Alamat e-mel berjaya disalin!"
            );

        })
        .catch(() => {

            alert(
                "Gagal menyalin alamat e-mel."
            );

        });
}

// ================================
// FORMAT NUMBERS
// ================================

function formatNumber(number) {

    return Number(number).toLocaleString("en-US");
}

// ================================
// SECURITY: ESCAPE HTML
// ================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}

// ================================
// EXPORT ACCOUNTS
// ================================

function exportAccounts() {

    const data =
        JSON.stringify(accounts, null, 2);

    const blob =
        new Blob(
            [data],
            { type: "application/json" }
        );

    const url =
        URL.createObjectURL(blob);

    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "account-data.json";

    link.click();

    URL.revokeObjectURL(url);
}

// ================================
// CLEAR ALL ACCOUNTS
// ================================

function clearAllAccounts() {

    if (accounts.length === 0) {
        alert("Tiada data untuk dipadam.");
        return;
    }

    const confirmClear =
        confirm(
            "Adakah anda pasti mahu memadam SEMUA data akaun?"
        );

    if (!confirmClear) return;

    accounts = [];

    saveAccounts();

    renderAccounts();
}

// ================================
// INITIAL LOAD
// ================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderAccounts();

        updateStats();

    }
);
