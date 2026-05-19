const expenseForm = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");
const totalExpense = document.getElementById("totalExpense");
const remaining = document.getElementById("remaining");
const progress = document.getElementById("progress");
const themeToggle = document.getElementById("themeToggle");

// Budget (single source of truth)
let budget = Number(localStorage.getItem("budget")) || 0;

// Expenses from localStorage
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

/* ---------------------------
   SET BUDGET FUNCTION
----------------------------*/
function setBudget() {
  const input = document.getElementById("budgetInput");

  budget = Number(input.value);

  localStorage.setItem("budget", budget);

  // Update UI
  const budgetDisplay = document.getElementById("budgetDisplay");
  if (budgetDisplay) {
    budgetDisplay.innerText = `Rs. ${budget}`;
  }

  displayExpenses();

  input.value = "";
}

/* ---------------------------
   ADD EXPENSE
----------------------------*/
expenseForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const amount = Number(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  const expense = {
    id: Date.now(),
    title,
    amount,
    category,
    date,
  };

  expenses.push(expense);

  localStorage.setItem("expenses", JSON.stringify(expenses));

  displayExpenses();
  expenseForm.reset();
});

/* ---------------------------
   DISPLAY EXPENSES
----------------------------*/
function displayExpenses() {
  expenseList.innerHTML = "";

  let total = 0;

  expenses.forEach((expense) => {
    total += expense.amount;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${expense.title}</td>
      <td>Rs. ${expense.amount}</td>
      <td>${expense.category}</td>
      <td>${expense.date}</td>
      <td>
        <button class="delete-btn" onclick="deleteExpense(${expense.id})">
          Delete
        </button>
      </td>
    `;

    expenseList.appendChild(row);
  });

  // Total
  totalExpense.innerText = `Rs. ${total}`;

  // Remaining (safe)
  remaining.innerText = `Rs. ${budget - total}`;

  // Progress bar (safe division)
  let percentage = 0;
  if (budget > 0) {
    percentage = (total / budget) * 100;
  }
  progress.style.width = `${percentage}%`;

  updateChart();
}

/* ---------------------------
   DELETE EXPENSE
----------------------------*/
function deleteExpense(id) {
  expenses = expenses.filter((expense) => expense.id !== id);

  localStorage.setItem("expenses", JSON.stringify(expenses));

  displayExpenses();
}

/* ---------------------------
   DARK MODE
----------------------------*/
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

/* ---------------------------
   CHART
----------------------------*/
let chart;

function updateChart() {
  const categories = {};

  expenses.forEach((expense) => {
    if (categories[expense.category]) {
      categories[expense.category] += expense.amount;
    } else {
      categories[expense.category] = expense.amount;
    }
  });

  const labels = Object.keys(categories);
  const data = Object.values(categories);

  const ctx = document.getElementById("expenseChart");

  if (!ctx) return;

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
        },
      ],
    },
  });
}

/* ---------------------------
   INIT ON LOAD
----------------------------*/
function init() {
  const budgetDisplay = document.getElementById("budgetDisplay");

  if (budgetDisplay) {
    budgetDisplay.innerText = `Rs. ${budget}`;
  }

  displayExpenses();
}

init();