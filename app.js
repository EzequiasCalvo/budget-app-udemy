

// UI controller

let uiController = (function () {
    // 1. Get input values
    let domStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list'
    }
    // Public: thanks to closure
    return {

        getInputValues: function () {
            return {
                type: document.querySelector(domStrings.inputType).value,
                description: document.querySelector(domStrings.inputDescription).value,
                value: document.querySelector(domStrings.inputValue).value
            }
        },

        addListItem: function (obj, type) {
            let html, element, newHtml;
            // Create dinamic HTML string with placeholder text
            if (type === 'inc') {
                element = domStrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if (type === 'exp') {
                element = domStrings.expensesContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // Replace the place holder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function () {
            let fields, fieldsArr;
            fields = document.querySelectorAll(domStrings.inputDescription + ', ' + domStrings.inputValue);
            
            // Fields retorna una lista, utilizamos un truco para poder usar el metodo slice (ya que no es un array).
            fieldsArr = Array.prototype.slice.call(fields);
            
            // Iteramos el nuevo array con forEach
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            // Una vez presionado enter, el cursor vuelve al primer elemento(description) para completar un nuevo input.
            fieldsArr[0].focus()
        },

        getDomStrings: function () {
            return domStrings;
        }
    };
})();

// Budget Controller

let budgetController = (function () {
    let Expense = function (id, description, value) {
        this.id = id,
            this.description = description,
            this.value = value
    }
    let Income = function (id, description, value) {
        this.id = id,
            this.description = description,
            this.value = value
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }
    }

    return {
        addItem: function (type, des, val) {
            let newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);

            return newItem;
        },

        testing: function () {
            console.log(data);
        }
    };
})();

// Controller 

let controller = (function (budgetCtrl, uiCtrl) {
    let setupEventListeners = function () {

        let dom = uiCtrl.getDomStrings();

        document.querySelector(dom.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        });
    };
    let ctrlAddItem = function () {
        // 1. Get input values
        let input = uiCtrl.getInputValues();

        // 2. Add new item to the budget controller
        let newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // 3. Add the item to the UI
        uiCtrl.addListItem(newItem, input.type);

        // 4. Clear the fields
        uiCtrl.clearFields()
    }

    return {
        init: function () {
            console.log('APP STARTED');
            setupEventListeners();
        }
    }

})(budgetController, uiController);


controller.init();  