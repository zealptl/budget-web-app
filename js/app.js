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

    calcBudget: function() {
      //1. Calculate total income and expenses
      caclcTotal("inc");
      caclcTotal("exp");
      //2. Calculate budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;
      //3. Calculate percentage of income spent
      data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
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
    percentageLable: ".budget__expenses--percentage"
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
          '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      } else if (type === "exp") {
        element = DOMstrings.expensesContainer;
        html =
          '<div class="item clearfix" id="expense-%id% "> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }

      //2. Replace the plaeholder text with some actual data
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", obj.value);

      //3. Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
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
      if (obj.budget > 0) {
        document.querySelector(DOMstrings.budgetLable).textContent =
          "+" + obj.budget;
      } else {
        document.querySelector(DOMstrings.budgetLable).textContent = obj.budget;
      }

      document.querySelector(DOMstrings.incomeLable).textContent =
        "+" + obj.totalInc;
      document.querySelector(DOMstrings.expensesLable).textContent =
        "-" + obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLable).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.percentageLable).textContent = "---";
      }
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
  };

  var updateBudget = function() {
    //1. Calculate the budget
    budgetCtrl.calcBudget();
    //2. Return the budget
    var budget = budgetCtrl.getBudget();
    //3. Display the budget on the UI
    UICtrl.displayBudget(budget);
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
    }
  };

  return {
    init: function() {
      setupEventListener();
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
