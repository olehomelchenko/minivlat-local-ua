const resultsContainer = document.getElementById('results');
const resultsHeader = document.getElementById('results-header');
const resultsTableBody = document.getElementById('results-table-body');

const allQuizzes = JSON.parse(localStorage.getItem('allQuizzes') || '{}');
const quizData = allQuizzes['quiz'];

function displayResults() {
    const totalQuestions = quizData.totalQuestions;
    const correctAnswers = quizData.score;
    const percentage = ((correctAnswers / totalQuestions) * 100).toFixed(2);

    resultsHeader.textContent = `Результати тесту: ${correctAnswers}/${totalQuestions}, ${percentage}%`;

    let resultsHTML = '';

    quizData.answers.forEach(answer => {
        resultsHTML += `
            <tr>
                <td>${answer.question}</td>
                <td>${answer.chartTypeUk}</td>
                <td>${answer.isCorrect ? '✅' : '❌'}</td>
            </tr>
        `;
    });

    resultsTableBody.innerHTML = resultsHTML;
}

window.onload = displayResults;