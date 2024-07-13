// Constants
const MAX_DIGITS = 20;
const OPERATORS = ["+", "-", "*", "/", "^"];
const FUNCTIONS = ["sqrt", "sin", "cos", "tan", "log"]; // Add more functions as needed
const SIMPLE_FRACTIONS = [
  { value: 1 / 3, string: "0.3333333333" },
  { value: 2 / 3, string: "0.6666666667" },
  { value: 1 / 6, string: "0.1666666667" },
  { value: 5 / 6, string: "0.8333333333" },
  { value: 1 / 9, string: "0.1111111111" },
  { value: 2 / 9, string: "0.2222222222" },
  { value: 4 / 9, string: "0.4444444444" },
  { value: 5 / 9, string: "0.5555555556" },
  { value: 7 / 9, string: "0.7777777778" },
  { value: 8 / 9, string: "0.8888888889" },
];

// DOM Elements
const btns = document.querySelectorAll("button");
const ansBlock = document.querySelector(".ans-block");
const placeholder = document.querySelector(".placeholder");
const previous = document.querySelector(".previous");
const ac = document.querySelector("#ac");

// State
let expression = "";
let lastInput = "";
let result;

// Event Listeners
btns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const value = e.target.value || e.target.parentElement.value;

    if (isOperatorInvalid(value)) {
      return;
    }

    if (OPERATORS.includes(lastInput) && OPERATORS.includes(value)) {
      updateExpression(value, value, true);
    } else {
      handleInput(value);
    }
  });
});

// Main Functions
function handleInput(value) {
  const actions = {
    "=": evaluate,
    ac: clear,
    del: deleteLast,
    "%": applyPercent,
    ".": addDecimal,
    "√": addSquareRoot,
    "x!": addFactorial,
    "^": addPower,
  };

  if (actions[value]) {
    actions[value]();
  } else {
    addToExpression(value);
  }
}

function isOperatorInvalid(value) {
  const invalidFirstOperators = ["*", "/", "^", "!", ")"];
  return (expression === "" || lastInput === "" || isLastInputFunction()) && invalidFirstOperators.includes(value);
}

function isLastInputFunction() {
  return FUNCTIONS.some(func => expression.endsWith(func + "("));
}

function evaluate() {
  if (expression.length <= 1 || OPERATORS.includes(lastInput)) {
    return;
  }
  try {
    const balancedExpression = balanceParentheses(expression);
    const parsedExpr = math.parse(balancedExpression).toString({ parenthesis: 'all' });
    let decimalResult = Decimal(math.evaluate(parsedExpr));
    
    result = simplifyFraction(decimalResult);
    
    pushAnsUp(result);
    updateExpression(result, result, false, true);
  } catch (error) {
    ansBlock.innerHTML = `Error`;
    expression = "";
  }
}

function updateExpression(expressionValue, displayValue, replace = false, isResult = false) {
  if (replace) {
    expression = expression.slice(0, -1) + expressionValue;
    ansBlock.innerHTML = ansBlock.innerHTML.slice(0, -1) + displayValue;
  } else if (isResult) {
    expression = expressionValue;
    ansBlock.innerHTML = displayValue;
  } else {
    expression += expressionValue;
    ansBlock.innerHTML += displayValue;
  }
  lastInput = expressionValue[expressionValue.length - 1] || "";
  placeholder.classList.add("hide");
  ac.innerHTML = "C";
}

function pushAnsUp(result) {
  const answered = document.createElement("div");
  answered.classList.add("ans-block", "answered");
  answered.innerHTML = `${ansBlock.innerHTML}=${result}`;
  previous.classList.remove("hide");
  previous.appendChild(answered);
  previous.scrollTop = previous.scrollHeight;
}

function simplifyFraction(decimalResult) {
  const tolerance = 1e-10;
  for (let fraction of SIMPLE_FRACTIONS) {
    if (Math.abs(decimalResult.toNumber() - fraction.value) < tolerance) {
      return fraction.string;
    }
  }
  return decimalResult.toFixed(15).replace(/\.?0+$/, "");
}

function balanceParentheses(expr) {
  const openCount = (expr.match(/\(/g) || []).length;
  const closeCount = (expr.match(/\)/g) || []).length;
  return expr + ")".repeat(openCount - closeCount);
}

function clear() {
  if (ac.innerHTML === "AC") {
    previous.innerHTML = "";
    previous.classList.add("hide");
  }
  lastInput = "";
  expression = "";
  ansBlock.innerHTML = "";
  placeholder.classList.remove("hide");
  ac.innerHTML = "AC";
}

function deleteLast() {
  if (ansBlock.innerHTML.length === 1) {
    placeholder.classList.remove("hide");
  }
  ansBlock.innerHTML = ansBlock.innerHTML.slice(0, -1);
  expression = expression.slice(0, -1);
  lastInput = expression[expression.length - 1] || "";
}

function addDecimal() {
  if (
    lastInput === "" ||
    OPERATORS.includes(lastInput) ||
    !getLastNumber(expression).includes(".")
  ) {
    updateExpression(".", ".");
  }
}

function applyPercent() {
  if (!OPERATORS.includes(lastInput) && expression !== "" && !isLastInputFunction()) {
    result = Decimal(math.evaluate(expression)).div(100).toString();
    updateExpression(result, result,true);
  }
}

function addSquareRoot() {
  updateExpression("sqrt(", "√(");
}

function addFactorial() {
  if (!OPERATORS.includes(lastInput) && expression !== "" && !isLastInputFunction()) {
    updateExpression("!", "!");
  }
}

function addPower() {
  if (!OPERATORS.includes(lastInput) && expression !== "" && !isLastInputFunction()) {
    updateExpression("^", "^");
  }
}

function addToExpression(value) {
  if (
    value >= "0" &&
    value <= "9" &&
    getLastNumber(expression).length >= MAX_DIGITS
  ) {
    return;
  }
  updateExpression(value, value);
}

function getLastNumber(expression) {
  const numbers = expression.split(/[-+*/^]/);
  return numbers[numbers.length - 1];
}

// Custom factorial function for math.js
math.import(
  {
    "!": function factorial(n) {
      if (n < 0) return NaN;
      if (n === 0 || n === 1) return 1;
      if (n > 170) throw new Error("Factorial too large to compute");
      let result = 1;
      for (let i = 2; i <= n; i++) {
        result *= i;
      }
      return result;
    },
  },
  { override: true }
);