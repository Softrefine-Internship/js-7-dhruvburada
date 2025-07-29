// Utility selector function
const select = (selector) => {
  const elem = document.querySelectorAll(selector);
  return elem.length === 1 ? elem[0] : elem;
};

const category = select("#category");
const submit = select(".submit-btn");
const difficulty = select("#difficulty");
const type = select("#type");
const amount = select("#amount");
const optionsSection = select("#screen-options");
const quizSection = select("#screen-quiz");
const resultSection = select("#screen-result");
const questionCount = select("#question-count");
const question = select("#question-text");
const options = select("#options-list");
const nextBtn = select("#next-btn");
const result = select("#final-score");
const playAgainBtn = select("#restart-btn");
const quitBtn = select("#quit-btn");
const progressFill = select("#progress-fill");
const scoreDisplay = select("#score-display");
const loadingSpinner = select("#loading-spinner");

let apiURL;
let totalQue = 0;
let currentQue = 1;
let quizData;
let score = 0;

// Fetch quiz categories from API
const fetchCategories = async () => {
  try {
    const response = await fetch("https://opentdb.com/api_category.php");
    const data = await response.json();
    return data.trivia_categories;
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
};

// Load dropdown options
const loadDropDown = async () => {
  const fields = await fetchCategories();
  fields.forEach((field) => {
    const option = document.createElement("option");
    option.value = field.id;
    option.textContent = field.name;
    category.appendChild(option);
  });
};

const fetchQuizData = async (url) => {
  try {
    let results = await fetch(url);
    let data = await results.json();
    return data.results;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const loadOptions = () => {
  let shuffledOptions = [
    ...quizData[currentQue - 1].incorrect_answers,
    quizData[currentQue - 1].correct_answer,
  ];

  shuffledOptions = shuffledOptions.sort(() => Math.random() - 0.5);

  options.innerHTML = "";

  shuffledOptions.forEach((option, index) => {
    const optionId = `option-${currentQue}-${index}`;

    // Create radio input
    const optionElement = document.createElement("input");
    optionElement.type = "radio";
    optionElement.id = optionId;
    optionElement.name = `question-${currentQue}`;
    optionElement.value = option;

    const labelElement = document.createElement("label");
    labelElement.setAttribute("for", optionId);
    labelElement.innerHTML = option;

    const wrapper = document.createElement("div");
    wrapper.classList.add("option-wrapper");
    wrapper.appendChild(optionElement);
    wrapper.appendChild(labelElement);

    optionElement.addEventListener("change", validateAnswer);

    options.appendChild(wrapper);
  });
};

const validateAnswer = () => {
  const selected = document.querySelector(
    `input[name="question-${currentQue}"]:checked`
  );

  const correct = quizData[currentQue - 1].correct_answer;

  if (!selected) {
    alert("Please select an answer.");
    nextBtn.disabled = true;
    return false;
  }

  const inputs = document.querySelectorAll(
    `input[name="question-${currentQue}"]`
  );

  inputs.forEach((input) => {
    const label = document.querySelector(`label[for="${input.id}"]`);

    if (input.value === correct) {
      label.classList.add("correct");
    }

    if (input.checked && input.value !== correct) {
      label.classList.add("wrong");
    }

    input.disabled = true;
  });

  if (selected.value === correct) {
    score++;
  }

  return true;
};

const loadQuestions = async (url) => {
  quizData = await fetchQuizData(url);
  question.innerHTML = quizData[currentQue - 1].question;
  loadOptions();
};

const saveQuizSettings = (e) => {
  e.preventDefault();
  const selectedCategory = category.value;
  const selectedDifficulty = difficulty.value;
  const selectedType = type.value;
  const selectedAmount = amount.value;
  totalQue = parseInt(selectedAmount);
  apiURL = `https://opentdb.com/api.php?amount=${selectedAmount}&category=${selectedCategory}&type=${selectedType}&difficulty=${selectedDifficulty}`;

  optionsSection.classList.remove("active");
  quizSection.classList.add("active");
  console.log(apiURL);
  loadQuestions(apiURL);
  updateQuestionCount();
};

const updateQuestionCount = () => {
  questionCount.innerHTML = `Question ${currentQue}/${totalQue}`;
};

const updateProgress = () => {
  const progress = ((currentQue - 1) / totalQue) * 100;
  progressFill.style.width = `${progress}%`;
};

const changeQuestion = () => {
  question.innerHTML = quizData[currentQue - 1].question;
  loadOptions();
  updateQuestionCount();
};

const showResult = () => {
  quizSection.classList.remove("active");
  resultSection.classList.add("active");
  result.innerHTML = `Your final score is ${score} out of ${totalQue}`;
  scoreDisplay.innerHTML = `${score}/${totalQue}`;
};

const onNext = () => {
  currentQue++;

  if (currentQue === totalQue) {
    nextBtn.textContent = "Submit Quiz";
  }
  if (currentQue > totalQue) {
    showResult();
  } else {
    changeQuestion();
  }
};

// Load on DOM ready
document.addEventListener("DOMContentLoaded", loadDropDown);

submit.addEventListener("click", (e) => saveQuizSettings(e));

nextBtn.addEventListener("click", onNext);

playAgainBtn.addEventListener("click", () => {
  window.location.reload();
});

quitBtn.addEventListener("click", showResult);
