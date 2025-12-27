// Fetch assessment data and render the report
document.addEventListener('DOMContentLoaded', () => {
  fetchAssessmentData();
  setGeneratedDate();
});

function setGeneratedDate() {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('generatedDate').textContent = new Date().toLocaleDateString('en-US', options);
}

async function fetchAssessmentData() {
  try {
    const response = await fetch('/api/assessment');
    if (!response.ok) {
      throw new Error('Failed to fetch assessment data');
    }
    const data = await response.json();
    renderReport(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    showError('Failed to load assessment data. Please try again later.');
  }
}

function renderReport(data) {
  // Update student info
  document.getElementById('studentName').textContent = data.student.name;
  document.getElementById('testDate').textContent = formatDate(data.student.testDate);
  document.getElementById('testType').textContent = data.student.testType;

  // Update overall score
  const overallScore = data.scores.overall;
  document.getElementById('overallScore').textContent = overallScore;

  // Update overall ring progress
  updateRingProgress('overallRingProgress', overallScore, data.maxScore, 54, data.scoreBand.color);

  // Update overall band
  const overallBand = document.getElementById('overallBand');
  overallBand.textContent = data.scoreBand.band;
  overallBand.style.background = data.scoreBand.color;

  // Update CEFR level
  document.getElementById('cefrLevel').textContent = data.cefrLevel.level;
  document.getElementById('cefrName').textContent = data.cefrLevel.name;
  document.getElementById('cefrDesc').textContent = data.cefrLevel.description;

  // Update skill scores with circular progress
  updateSkillRing('pronunciation', data.scores.pronunciation, data.maxScore, data.skillBands.pronunciation);
  updateSkillRing('fluency', data.scores.fluency, data.maxScore, data.skillBands.fluency);
  updateSkillRing('vocabulary', data.scores.vocabulary, data.maxScore, data.skillBands.vocabulary);
  updateSkillRing('grammar', data.scores.grammar, data.maxScore, data.skillBands.grammar);

  // Update feedback section
  updateFeedback('overall', data.feedback.overall, data.scoreBand, overallScore);
  updateSkillFeedback('pronunciation', data.feedback.pronunciation, data.skillBands.pronunciation, data.scores.pronunciation);
  updateSkillFeedback('fluency', data.feedback.fluency, data.skillBands.fluency, data.scores.fluency);
  updateSkillFeedback('vocabulary', data.feedback.vocabulary, data.skillBands.vocabulary, data.scores.vocabulary);
  updateSkillFeedback('grammar', data.feedback.grammar, data.skillBands.grammar, data.scores.grammar);

  // Render radar chart
  renderRadarChart(data.scores, data.maxScore);
}

function updateRingProgress(elementId, score, maxScore, radius, color) {
  const circumference = 2 * Math.PI * radius;
  const progress = (score / maxScore) * circumference;
  const offset = circumference - progress;

  const ring = document.getElementById(elementId);
  ring.style.strokeDasharray = circumference;

  // Animate the ring
  setTimeout(() => {
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = color;
  }, 100);
}

function updateSkillRing(skillName, score, maxScore, bandData) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / maxScore) * circumference;
  const offset = circumference - progress;

  // Update score number
  document.getElementById(`${skillName}Score`).textContent = score;

  // Update ring progress
  const ring = document.getElementById(`${skillName}Ring`);
  ring.style.strokeDasharray = circumference;

  setTimeout(() => {
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = bandData.color;
  }, 100);

  // Update band label
  const bandElement = document.getElementById(`${skillName}Band`);
  bandElement.textContent = bandData.band;
}

function updateFeedback(type, feedbackText, bandData, score) {
  document.getElementById(`${type}FeedbackText`).textContent = feedbackText;

  const badge = document.getElementById(`${type}FeedbackBadge`);
  badge.textContent = `${score} / 9`;
  badge.style.background = bandData.color;
}

function updateSkillFeedback(skillName, feedbackText, bandData, score) {
  document.getElementById(`${skillName}Feedback`).textContent = feedbackText;

  const scoreElement = document.getElementById(`${skillName}FeedbackScore`);
  scoreElement.textContent = score;
  scoreElement.style.background = bandData.color;
}

function renderRadarChart(scores, maxScore) {
  const ctx = document.getElementById('skillsChart').getContext('2d');

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Pronunciation', 'Fluency', 'Vocabulary', 'Grammar'],
      datasets: [{
        label: 'Score',
        data: [
          scores.pronunciation,
          scores.fluency,
          scores.vocabulary,
          scores.grammar
        ],
        backgroundColor: 'rgba(102, 126, 234, 0.15)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(102, 126, 234, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(102, 126, 234, 1)',
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          beginAtZero: true,
          max: maxScore,
          min: 0,
          ticks: {
            stepSize: 1,
            font: {
              size: 10
            },
            backdropColor: 'transparent'
          },
          pointLabels: {
            font: {
              size: 11,
              weight: '600'
            },
            color: '#4a5568'
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.08)'
          },
          angleLines: {
            color: 'rgba(0, 0, 0, 0.08)'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(26, 32, 44, 0.9)',
          titleFont: {
            size: 12,
            weight: '600'
          },
          bodyFont: {
            size: 11
          },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              return `Score: ${context.raw} / ${maxScore}`;
            }
          }
        }
      },
      animation: {
        duration: 1500,
        easing: 'easeOutQuart'
      }
    }
  });
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function showError(message) {
  const container = document.querySelector('.main-content');
  container.innerHTML = `
    <div style="padding: 60px 20px; text-align: center; color: #718096;">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 16px;">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; color: #4a5568;">Error Loading Report</h2>
      <p style="font-size: 14px;">${message}</p>
    </div>
  `;
}
