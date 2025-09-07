// src/js/app.js

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'consent.html') {
        initConsentPage();
    } else if (currentPage === 'quiz.html') {
        initQuizPage();
    } else if (currentPage === 'questionnaire.html') {
        initQuestionnairePage();
    } else if (currentPage === 'results.html') {
        initResultsPage();
    }
});

function initConsentPage() {
    const consentButton = document.getElementById('consent-button');
    consentButton.addEventListener('click', function() {
        fetch('../data/questions.json')
            .then(response => response.json())
            .then(data => {
                const quizVersions = Object.keys(data.quizzes);
                const randomVersion = quizVersions[Math.floor(Math.random() * quizVersions.length)];
                localStorage.setItem('quizVersion', randomVersion);
                window.location.href = 'quiz.html';
            });
    });
}

function initQuizPage() {
    const version = localStorage.getItem('quizVersion');
    loadQuestions(version);
}

function initQuestionnairePage() {
    // Logic for initializing the questionnaire page
}

function initResultsPage() {
    // Logic for displaying results
}

function loadQuestions(version) {
    fetch('data/questions.json')
        .then(response => response.json())
        .then(data => {
            const questions = data.quizzes[version];
            displayQuestions(questions);
        });
}

function displayQuestions(questions) {
    // Logic to display questions on the quiz page
}