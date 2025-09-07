// This file manages the quiz functionality, including loading questions from the JSON file, displaying them to the user, and collecting answers.

document.addEventListener('DOMContentLoaded', function () {
    const quizContainer = document.getElementById('quiz');
    const resultsContainer = document.getElementById('results');
    const timerDisplay = document.getElementById('time');
    const timerLabel = document.getElementById('timer-label'); // Add a label for the timer
    const version = localStorage.getItem('quizVersion');
    const quizId = 'quiz';
    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let quizResults = [];
    const initialTimeLeft = 25000; // 25 seconds in milliseconds
    let timeLeft = initialTimeLeft;
    let timer;
    let startTime = new Date().getTime(); // Change to getTime for milliseconds precision
    const progressBar = document.getElementById('progress-bar');

    // Set timer label based on version
    if (version === 'ukrainian') {
        timerLabel.textContent = 'Час, що залишився:';
    } else {
        timerLabel.textContent = 'Time remaining:';
    }

    // Generate and store browser ID
    function generateBrowserId() {
        return 'xxxx-xxxx-4xxx-yxxx-xxxx-xxxx-xxxx-xxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    const browserId = localStorage.getItem('browserId') || generateBrowserId();
    localStorage.setItem('browserId', browserId);

    const browserInfo = {
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        operatingSystem: navigator.platform,
        hostname: window.location.hostname // Store hostname
    };

    // Check if there is a completed quiz
    const allQuizzes = JSON.parse(localStorage.getItem('allQuizzes') || '{}');
    if (allQuizzes[quizId] && allQuizzes[quizId].completed) {
        alert("Ви вже пройшли дослідження. Дякуємо! Перенаправлення на головну сторінку тесту.");
        window.location.href = 'index.html';
        return;
    }

    fetch('data/questions.json')
        .then(response => response.json())
        .then(data => {
            if (!data.quizzes || !data.quizzes[version] || !data.quizzes[version].questions) {
                throw new Error('Invalid quiz data or version');
            }
            questions = data.quizzes[version].questions;
            questions = shuffleArray(questions); // Randomize the order of questions
            displayQuestion();
        })
        .catch(error => {
            console.error('Error loading quiz:', error);
            quizContainer.innerHTML = '<p>Error loading quiz. Please try again later.</p>';
        });

    // Function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function displayQuestion() {
        if (!questions || currentQuestionIndex >= questions.length) {
            showResults();
            return;
        }

        // Complete timer reset
        stopTimer();
        timeLeft = initialTimeLeft; // Reset to initial time
        timerDisplay.textContent = Math.ceil(timeLeft / 1000); // Display in whole seconds

        const question = questions[currentQuestionIndex];
        const imageVersion = version;
        const imagePath = `/images/${question.chart}-${imageVersion}.${question.image}`;
        document.getElementById('chart').innerHTML = `<img src="${imagePath}" alt="${question.chart_uk}">`;

        // Update question and options
        document.getElementById('question-text').innerHTML = question.question;
        document.getElementById('options').innerHTML = question.options.map((option, index) => `
            <button class="option-button" data-value="${option}">${option}</button>
        `).join('');

        // Start fresh timer
        startTimer();

        // Add event listeners to option buttons
        document.querySelectorAll('.option-button').forEach(button => {
            button.addEventListener('click', () => submitAnswer(button.dataset.value));
        });

        startTime = new Date().getTime(); // Reset start time for each question
        updateProgressBar();
    }

    function stopTimer() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }

    function startTimer() {
        // Clear any existing timer
        stopTimer();

        // Ensure display shows starting value
        timerDisplay.textContent = Math.ceil(timeLeft / 1000); // Display in whole seconds

        timer = setInterval(() => {
            timeLeft -= 100; // Decrease by 100 milliseconds
            timerDisplay.textContent = Math.ceil(timeLeft / 1000); // Display in whole seconds

            if (timeLeft <= 0) {
                stopTimer();
                alert("Time's up! Moving to the next question.");
                submitAnswer('timeout'); // Pass 'timeout' as the selected answer
            }
        }, 100);
    }

    function storeQuizProgress() {
        const currentProgress = {
            quizId: quizId,
            version: version,
            score: score,
            currentQuestionIndex: currentQuestionIndex,
            totalQuestions: questions.length,
            answers: quizResults,
            lastUpdated: new Date().toISOString(),
            participantData: JSON.parse(localStorage.getItem('participantData') || '{}'),
            startTime: startTime, // Store start time
            browserId: browserId, // Store browser ID
            browserInfo: browserInfo // Store browser info including hostname
        };
        const allQuizzes = JSON.parse(localStorage.getItem('allQuizzes') || '{}');
        allQuizzes[quizId] = currentProgress;
        localStorage.setItem('allQuizzes', JSON.stringify(allQuizzes));
    }

    function submitAnswer(selectedAnswer = null) {
        // Stop the timer first
        stopTimer();

        if (!selectedAnswer) {
            alert('Please select an answer before proceeding.');
            startTimer(); // Restart timer if no answer selected
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.answer;
        if (isCorrect) {
            score++;
        }

        const endTime = new Date().getTime(); // Capture end time
        const timeSpent = endTime - startTime; // Calculate time spent in milliseconds

        // Store the question result
        quizResults.push({
            question: currentQuestion.question,
            selectedAnswer: selectedAnswer,
            correctAnswer: currentQuestion.answer,
            isCorrect: isCorrect,
            questionIndex: currentQuestionIndex,
            ordinalNumber: currentQuestionIndex + 1, // Store the ordinal number of the question
            timestamp: new Date().toISOString(),
            timeSpent: timeSpent, // Use the calculated time spent
            chartType: currentQuestion.chart,
            chartTypeUk: currentQuestion.chart_uk // Include chart_uk type
        });

        // Store progress after each answer
        storeQuizProgress();

        currentQuestionIndex++;
        updateProgressBar();
        // Reset timer state before showing next question
        timeLeft = initialTimeLeft; // Reset to initial time
        displayQuestion();
    }

    function showResults() {
        // Mark quiz as completed
        const allQuizzes = JSON.parse(localStorage.getItem('allQuizzes') || '{}');
        allQuizzes[quizId].completed = true;
        allQuizzes[quizId].completedAt = new Date().toISOString();
        localStorage.setItem('allQuizzes', JSON.stringify(allQuizzes));

        // Redirect to the questionnaire page
        window.location.href = 'questionnaire.html';
    }

    function updateProgressBar() {
        const progress = (currentQuestionIndex / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }
});