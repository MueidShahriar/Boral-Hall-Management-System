document.addEventListener("DOMContentLoaded", () => {
  const calendar = document.getElementById("calendar");
  const monthLabel = document.getElementById("monthLabel");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const submitBtn = document.getElementById("submitMeals");
  const totalCostDisplay = document.getElementById("totalCost");

  let currentMonth = new Date();
  let mealsOn = {};

  console.log("Initializing calendar...");
  console.log("Current month:", currentMonth);

  // Generate the calendar for the current month
  function generateCalendar(month) {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    // Update the month label
    monthLabel.textContent = `${firstDay.toLocaleString("default", { month: "long" })} ${month.getFullYear()}`;

    // Clear the calendar
    calendar.innerHTML = "";

    // Add day labels
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    daysOfWeek.forEach((day) => {
      const dayLabel = document.createElement("div");
      dayLabel.className = "day-label";
      dayLabel.textContent = day;
      calendar.appendChild(dayLabel);
    });

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      const emptySlot = document.createElement("div");
      emptySlot.className = "empty-slot";
      calendar.appendChild(emptySlot);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(month.getFullYear(), month.getMonth(), day);
      const dateKey = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD

      // Create a day element
      const dayElement = document.createElement("div");
      dayElement.className = "day";
      dayElement.innerHTML = `
        <span class="day-number">${day}</span>
        <input type="checkbox" id="meal-toggle-${dateKey}" class="meal-toggle" checked />
        <div class="day-cost">৳180</div>
      `;

      // Add event listener for the checkbox
      const checkbox = dayElement.querySelector(`#meal-toggle-${dateKey}`);
      checkbox.addEventListener("change", () => {
        mealsOn[dateKey] = checkbox.checked;
        updateTotalCost();
      });

      // Initialize mealsOn for the day
      mealsOn[dateKey] = true;

      calendar.appendChild(dayElement);
    }

    // Update the total cost
    updateTotalCost();
  }

  // Update the total cost display
  function updateTotalCost() {
    const mealCostPerDay = 180;
    let totalCost = 0;
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, "0");

    for (const date in mealsOn) {
      // Only count days in the current month
      if (date.startsWith(`${year}-${month}`) && mealsOn[date]) {
        totalCost += mealCostPerDay;
      }
    }

    totalCostDisplay.textContent = `৳${totalCost}`;
  }

  // Event listeners for navigation buttons
  prevMonthBtn.addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    generateCalendar(currentMonth);
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    generateCalendar(currentMonth);
  });

  // Submit meal data to Firebase (datewise, with "on" field) in meals collection
  submitBtn.addEventListener("click", () => {
    try {
      const db = firebase.database();
      const updates = {};
      
      for (const date in mealsOn) {
        updates[`meals/${date}`] = { on: mealsOn[date] };
      }
      db.ref().update(updates)
        .then(() => {
          alert("Meal plan submitted successfully!");
        })
        .catch((error) => {
          console.error("Error submitting meal plan:", error);
          alert("There was an error submitting the meal plan.");
        });
    } catch (error) {
      console.error("Error interacting with Firebase:", error);
    }
  });

  // Generate the initial calendar
  generateCalendar(currentMonth);

  // Logout functionality
  document.getElementById("logoutButton").addEventListener("click", () => {
    sessionStorage.clear();
    localStorage.clear();
    window.location.href = "LoginRegister.html";
  });
});
