document.addEventListener('DOMContentLoaded', function() {
    const consentButton = document.getElementById('consentButton');

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
});