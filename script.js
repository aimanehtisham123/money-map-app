// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAqACO-OW1t1tKm_FXa3gkGG-C7D-YvP10",
  authDomain: "money-map-11c58.firebaseapp.com",
  databaseURL: "https://money-map-11c58-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "money-map-11c58",
  storageBucket: "money-map-11c58.firebasestorage.app",
  messagingSenderId: "53328250459",
  appId: "1:53328250459:web:1b4eeea8cadf9015fee17e"
};

// INIT FIREBASE (Realtime DB)
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

/* ---------------- UI ---------------- */
const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");
const totalExpense = document.getElementById("totalExpense");
const remaining = document.getElementById("remaining");
const progress = document.getElementById("progress");
const themeToggle = document.getElementById("themeToggle");

let budget = Number(localStorage.getItem("budget")) || 0;
let expenses = [];

/* ---------------- SET BUDGET ---------------- */
function setBudget() {
  budget = Number(document.getElementById("budgetInput").value);

  localStorage.setItem("budget", budget);
  document.getElementById("budgetDisplay").innerText = `Rs. ${budget}`;

  render();
}

/* ---------------- ADD EXPENSE ---------------- */
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const newExpense = {
    title: document.getElementById("title").value,
    amount: Number(document.getElementById("amount").value),
    category: document.getElementById("category").value,
    date: document.getElementById("date").value
  };

  db.ref("expenses").push(newExpense);

  expenseForm.reset();
});

/* ---------------- LOAD DATA (REALTIME) ---------------- */
db.ref("expenses").on("value", (snapshot) => {
  const data = snapshot.val();
  expenses = [];

  for (let id in data) {
    expenses.push({ id, ...data[id] });
  }

  render();
});

/* ---------------- DELETE ---------------- */
function deleteExpense(id) {
  db.ref("expenses/" + id).remove();
}

/* ---------------- RENDER ---------------- */
function render() {
  expenseList.innerHTML = "";

  let total = 0;

  expenses.forEach((e) => {
    total += e.amount;

    expenseList.innerHTML += `
      <tr>
        <td>${e.title}</td>
        <td>Rs. ${e.amount}</td>
        <td>${e.category}</td>
        <td>${e.date}</td>
        <td><button onclick="deleteExpense('${e.id}')">Delete</button></td>
      </tr>
    `;
  });

  totalExpense.innerText = `Rs. ${total}`;
  remaining.innerText = `Rs. ${budget - total}`;

  let percent = budget > 0 ? (total / budget) * 100 : 0;
  progress.style.width = percent + "%";

  updateChart();
}

/* ---------------- DARK MODE ---------------- */
themeToggle.onclick = () => {
  document.body.classList.toggle("dark-mode");
};

/* ---------------- CHART ---------------- */
let chart;

function updateChart() {
  const cat = {};

  expenses.forEach((e) => {
    cat[e.category] = (cat[e.category] || 0) + e.amount;
  });

  const labels = Object.keys(cat);
  const data = Object.values(cat);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("expenseChart"), {
    type: "pie",
    data: {
      labels,
      datasets: [{ data }]
    }
  });
}

/* ---------------- INIT ---------------- */
document.getElementById("budgetDisplay").innerText = `Rs. ${budget}`;