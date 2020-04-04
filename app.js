

// UI controller

let uiController = (function () {
    // 1. Get input values
    let domStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    let formatNumber = function (num, type) {
        let numSplit, dec, int;
        // Le sacamos el signo a num.
        num = Math.abs(num);
        // Seteamos dos decimales fijos (independientemente de si son 0).
        num = num.toFixed(2);
        // Dividimos el numero [0] => antes del decimal, [1] => despues.
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if (int.length > 3) {
            // Utrilizamos la propiedad substr para dividir el string donde queremos. La primera parte hasta la coma y la segunda despues (siendo siempre 3 numeros).
            int = int.substr(0, int.length -3) + ',' + int.substr(int.length -3, 3);
        }

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    let nodeListForEach = function (list, callback) {
        for (let i = 0; i < list.length; i++) {
            // Llamamos al callback que va a tener dos argumentos. current = list[i] e index = i;
            callback(list[i], i);
        }
    };

    // Public: thanks to closure
    return {

        getInputValues: function () {
            return {
                type: document.querySelector(domStrings.inputType).value,
                description: document.querySelector(domStrings.inputDescription).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value)
            }
        },

        addListItem: function (obj, type) {
            let html, element, newHtml;
            // Create dinamic HTML string with placeholder text
            if (type === 'inc') {
                element = domStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if (type === 'exp') {
                element = domStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // Replace the place holder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        // Creamos el metodo y le pasamos el selectorID(itemID) como parametro.
        deleteListItem: function (selectorID) {
            // Buscamos el contenedor
            let element = document.getElementById(selectorID);
            // Removemos el hijo del DOM
            element.parentNode.removeChild(element);
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

        displayBudget: function (obj) {
            // Hacemos un ternario para sacar el type y pasarlo como parametro.
            let type;
            obj.budget > 0 ? type = 'inc' : 'exp';
            document.querySelector(domStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(domStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(domStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(domStrings.percentageLabel).textContent = '--';
            }
        },

        displayPercentages: function (percentages) {
            let fields = document.querySelectorAll(domStrings.expensesPercLabel); // Retorna una node list para recorrerla hacemos nuestro propio forEach.

            nodeListForEach(fields, function(current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }
            });
        },

        displayMonth: function () {
            let now, month, year;

            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            // Mostramos el mes utilizando el objeto date con la propiedad getMonth() como indice (ya que devuelve un numero);
            document.querySelector(domStrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function () {
            let fields = document.querySelectorAll(domStrings.inputType + ',' + domStrings.inputDescription + ',' + domStrings.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });
            document.querySelector(domStrings.inputBtn).classList.toggle('red');
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
            this.value = value,
            this.percentage = -1
    }
   
    // Agregando prototype al constructor para calcular el porcentaje. 
    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome)*100);
        } else {
            this.percentage = -1;
        }
    }

    // Metodo para retornar/obtener el valor.
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    let Income = function (id, description, value) {
        this.id = id,
            this.description = description,
            this.value = value
    }

    let calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(function (cur) {
            // Sumamos el valor del input actual al total
            sum = sum + cur.value;
        });
        // Guardamos la suma en el objeto
        data.totals[type] = sum;
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        // percentage = -1 porque no queremos que calcule el porcentaje sin inputs
        percentage: -1
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

        deleteItem: function (type, ID) {
            let ids, index;
            // Recorremos el array dependiendo del type y retornamos el id.
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            // Buscamos el elemento dentro del array, si existe almacenamos su posicion.
            index = ids.indexOf(ID);
            // Si lo encontramos lo eliminamos mediante el metodo splice(desde, hasta cuando);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            // Total inc and exp
            calculateTotal('exp');
            calculateTotal('inc');
            // Budget
            data.budget = data.totals.inc - data.totals.exp;
            // Calculate percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        // Recorremos sin retornar.
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            })
        },

        // Recorremos los porcentajes almacenados en el constructor Expense y los retornamos ya calculados.
        getPercentages: function () {
            let allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        }, 

        // Return budget function
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
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

        document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(dom.inputType).addEventListener('change', uiCtrl.changedType);
    };

    let updateBudget = function () {

        // 1. Calculate budget 
        budgetCtrl.calculateBudget();

        // 2. Return budget
        let budget = budgetCtrl.getBudget();

        // 3. Display budget
        uiCtrl.displayBudget(budget);
    }

    let updatePercentages = function () {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read % from the budget controller
        let percentages = budgetCtrl.getPercentages();

        // 3. Update UI
        uiCtrl.displayPercentages(percentages);
    }

    let ctrlAddItem = function () {
        // 1. Get input values
        let input = uiCtrl.getInputValues();

        // If para no permitir campos vacíos 
        if (input.description !== "" && !isNaN(input.value)) {
            // 2. Add new item to the budget controller
            let newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            uiCtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            uiCtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6.  Update percentages
            updatePercentages();
        }
    };

    let ctrlDeleteItem = function (event) {
        let itemID, type, ID, splitID;
        // Ubicamos el contenedor padre que nos interesa mediante DOM traversing.
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemID);
        // .id nos devuelve el id del contenedor. Teniendo a disposicion el type y id del contenedor.
        if (itemID) {
            // Podemos usar el itemID como condicion porque no hay otro contenedor con id.
            splitID = itemID.split('-');
            type = splitID[0];
            // Parseamos el ID porque queremos tratarlo como un number. De lo contrario el indexOf daria siempre -1 ya que los elementos almacenados en los arrays de inc y exp son numericos.
            ID = parseInt(splitID[1]);
        }
       
        // 1. Delete from the data structure
        budgetCtrl.deleteItem(type, ID);

        // 2. Delete from the UI
        uiCtrl.deleteListItem(itemID);

        // 3. Update budget
        updateBudget();

        // 4. Update percentages
         updatePercentages();
    }

    return {
        init: function () {
            console.log('APP STARTED');
            uiCtrl.displayMonth();
            // Cuando reiniciamos los valores se igualan a 0.
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });

            setupEventListeners();
        }
    }

})(budgetController, uiController);


controller.init();  