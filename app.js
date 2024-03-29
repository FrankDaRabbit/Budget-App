//BUDGET CONTROLLER
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }

    }
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, des, val) {
            var newItem, ID;
            //create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //Create new item based on exp or inc
            if (type === "exp") {
                newItem = new Expense(ID, des, val);
            } else if (type === "inc") {
                newItem = new Income(ID, des, val);
            }
            // push that new item in storage var data
            data.allItems[type].push(newItem);
            //return that item
            return newItem;
        },
        deleteItem: function (type, id) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        calculateBudget: function () {
            //calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");

            //calculate budget inc -exp
            data.budget = data.totals.inc - data.totals.exp;

            //calculate percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }


        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            })
        },
        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },


        getBudget: function () {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        },
        testing: function () {
            console.log(data);
        }
    }
})();


//UI CONTROLLER
var UIController = (function () {
    var DOMstrings = {
        inputType: ".add__type",
        inputDesciption: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        monthLabel: ".budget__title--month"
    }
    var formatNumber = function (num, type) {
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split(".");
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === "exp" ? "-" : "+") + int + "." + dec;

    };
    var nodeListForEach = function (list, callback) {
        for (i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be exp or inc
                description: document.querySelector(DOMstrings.inputDesciption).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }

        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            //create html string with placeholder text
            if (type === "exp") {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            } else if (type === "inc") {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

            }
            //replace the placeholder with some actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));


            //insert html into the dom
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },
        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            document.getElementById(selectorID).parentNode.removeChild(el);
        },
        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDesciption + ", " + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = "inc" : type = "exp";
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "----";
            }

        },
        displayPercentages: function (percentages) {
            var fields;
            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "----";
                }

            })

        },
        displayMonth: function () {
            var now, year, months;
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ["January", "February", "March", "June", "July", "August", "September", "October", "November", "December"];
            document.querySelector(DOMstrings.monthLabel).textContent = months[month] + ' ' + year;
        },
        changedType: function () {
            var fields = document.querySelectorAll(DOMstrings.inputType + "," + DOMstrings.inputDesciption + "," + DOMstrings.inputValue);
            nodeListForEach(fields, function (cur) {
                cur.classList.toggle("red-focus");
            })
            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        },
        getDOMstrings: function () {
            return DOMstrings;
        }
    }


})();


//APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);

    };
    var updateBudget = function () {
        //1 calculate budget
        budgetCtrl.calculateBudget();
        //2return budget
        var budget = budgetCtrl.getBudget();
        //3 update UI
        UICtrl.displayBudget(budget);
    }
    var updatePercentages = function () {
        //1 calculate perc
        budgetCtrl.calculatePercentages();
        //2 return perc
        var percentages = budgetCtrl.getPercentages();
        //3 update perc
        UICtrl.displayPercentages(percentages);

    }

    var ctrlAddItem = function () {


        //1. get input  field data 
        var input = UICtrl.getInput();
        console.log(input);//console.log(input);//delete later

        if (input.description !== "" && input.value > 0 && !isNaN(input.value)) {
            //2. add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            //3. add the iteam to the ui
            UICtrl.addListItem(newItem, input.type);
            //4.clear fields
            UICtrl.clearFields();
            //4.call budget function
            updateBudget();
            //5 calculate and update percentges
            updatePercentages();
        }

    };
    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //delete item from data strucute
            budgetCtrl.deleteItem(type, ID);


            //delete item from UI
            UICtrl.deleteListItem(itemID);
            //update and show new budget
            updateBudget();
            //5 calculate and update percentges
            updatePercentages();
        }


    }



    return {
        init: function () {
            console.log("Application started!");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalInc: 0,
                totalExp: 0
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();
