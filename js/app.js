//BUDGET CONTROLLER
var budgetController = (function() {
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var caclcTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(curr) {
      sum += curr.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      inc: [],
      exp: []
    },
    totals: {
      inc: 0,
      exp: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === "inc") {
        newItem = new Income(ID, des, val);
      } else if (type === "exp") {
        newItem = new Expense(ID, des, val);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(curr) {
        return curr.id;
      });
      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      //1. Calculate total income and expenses
      caclcTotal("inc");
      caclcTotal("exp");
      //2. Calculate budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      //3. Calculate percentage of income spent
      data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(curr) {
        curr.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPercentages = data.allItems.exp.map(function(curr) {
        return curr.getPercentage();
      });
      return allPercentages;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    displayData: function() {
      console.log(data);
    }
  };
})();

//UI CONTROLLER
var UIController = (function() {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLable: ".budget__value",
    incomeLable: ".budget__income--value",
    expensesLable: ".budget__expenses--value",
    percentageLable: ".budget__expenses--percentage",
    container: ".container",
    expPercentageLable: ".item__percentage",
    dateLable: ".budget__title--month"
  };

  var formatNumber = function(num, type) {
    /*
      + or - before number
      exactly 2 decimal points
      comma separating the thousands
    */
    var numSplit, int, decimal, sign;
    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    decimal = numSplit[1];

    return (type === "inc" ? "+" : "-") + " " + int + "." + decimal;
  };
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      };
    },

    addListItem: function(obj, type) {
      //1. Create HTML string with placeholder text
      var html, newHtml, element;

      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id% "> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }

      //2. Replace the plaeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      //3. Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArray;
      fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );

      fieldsArray = Array.prototype.slice.call(fields);
      fieldsArray.forEach(function(curr, i, arr) {
        curr.value = "";
      });
      fieldsArray[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(DOMstrings.budgetLable).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLable).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLable
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLable).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLable).textContent = "---";
      }
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMstrings.expPercentageLable);
      var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };
      nodeListForEach(fields, function(curr, index) {
        if (percentages[index] > 0) {
          curr.textContent = percentages[index] + "%";
        } else {
          curr.textContent = "---";
        }
      });
    },

    displayMonth: function() {
      var now, year, month, months;
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "November",
        "December"
      ];
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      document.querySelector(DOMstrings.dateLable).textContent =
        months[month] + " " + year;
    },

    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();

//APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
  var setupEventListener = function() {
    var DOMstrings = UICtrl.getDOMstrings();

    document
      .querySelector(DOMstrings.inputBtn)
      .addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });
    document
      .querySelector(DOMstrings.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  var updateBudget = function() {
    //1. Calculate the budget
    budgetCtrl.calculateBudget();
    //2. Return the budget
    var budget = budgetCtrl.getBudget();
    //3. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    //1. Calculate percentages
    budgetCtrl.calculatePercentages();
    //2. Read percentages from the budget contrller
    var percentages = budgetCtrl.getPercentages();
    //3. Update UI with the percentage
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function() {
    var input, newItem;
    //1. Get input data
    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      //2. Add item to budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      //3. Add item to UI
      UICtrl.addListItem(newItem, input.type);

      //4. Clear fields
      UICtrl.clearFields();

      //5. Calculate and update budget
      updateBudget();

      //6. Calculate and update percentages
      updatePercentages();
    }
  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //1. Delete the item from the data structure
      budgetCtrl.deleteItem(type, ID);
      //2. Delete the item from UI
      UICtrl.deleteListItem(itemID);
      //3. Update and show the new budget
      updateBudget();
    }
  };

  return {
    init: function() {
      setupEventListener();
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
    }
  };
})(budgetController, UIController);

controller.init();
