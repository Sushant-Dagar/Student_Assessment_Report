const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CEFR Level mapping based on score
function getCEFRLevel(score) {
  if (score >= 8.5) return { level: 'C2', name: 'Proficient', description: 'Mastery or Proficiency' };
  if (score >= 7.5) return { level: 'C1', name: 'Advanced', description: 'Effective Operational Proficiency' };
  if (score >= 6.5) return { level: 'B2', name: 'Upper Intermediate', description: 'Vantage or Upper Intermediate' };
  if (score >= 5) return { level: 'B1', name: 'Intermediate', description: 'Threshold or Intermediate' };
  if (score >= 4) return { level: 'A2', name: 'Elementary', description: 'Waystage or Elementary' };
  return { level: 'A1', name: 'Beginner', description: 'Breakthrough or Beginner' };
}

// Score band description
function getScoreBand(score) {
  if (score >= 8.5) return { band: 'Expert', color: '#00c853' };
  if (score >= 7.5) return { band: 'Very Good', color: '#2196f3' };
  if (score >= 6.5) return { band: 'Good', color: '#667eea' };
  if (score >= 5.5) return { band: 'Competent', color: '#ff9800' };
  if (score >= 4.5) return { band: 'Modest', color: '#ff5722' };
  return { band: 'Limited', color: '#f44336' };
}

// Detailed feedback logic based on score ranges
function getFeedback(score, skillName) {
  const feedbackMap = {
    pronunciation: {
      expert: "Demonstrates native-like pronunciation with excellent articulation, natural intonation, and stress patterns. Speech is effortlessly understood.",
      veryGood: "Pronunciation is clear and accurate with only rare minor errors. Natural rhythm and intonation are well-maintained throughout.",
      good: "Generally clear pronunciation with occasional minor errors in complex words. Does not impede communication.",
      competent: "Pronunciation is understandable but shows noticeable L1 influence. Some sounds may be mispronounced.",
      modest: "Frequent pronunciation errors that sometimes cause listener strain. Basic words are usually clear.",
      limited: "Pronunciation difficulties significantly affect intelligibility. Requires frequent repetition."
    },
    fluency: {
      expert: "Speaks fluently and spontaneously with natural flow. Can express ideas effortlessly without noticeable searching for words.",
      veryGood: "Speaks with ease and fluency. Only occasional hesitation when searching for precise expressions.",
      good: "Maintains flow of speech with some hesitation. Can link ideas coherently with minor pauses.",
      competent: "Can keep going but pauses frequently to plan and correct. Speech may be slow but remains coherent.",
      modest: "Noticeable hesitation and frequent pauses. May lose coherence in longer responses.",
      limited: "Very slow, fragmented speech with long pauses. Difficult to follow extended responses."
    },
    vocabulary: {
      expert: "Uses a wide range of vocabulary naturally and precisely. Employs idiomatic expressions and collocations effortlessly.",
      veryGood: "Good command of broad vocabulary. Can vary formulation and use less common words appropriately.",
      good: "Adequate vocabulary for most topics. Occasional circumlocution when lacking specific words.",
      competent: "Sufficient vocabulary for familiar topics but limitations evident in complex discussions.",
      modest: "Basic vocabulary adequate for simple communication. Struggles with abstract or specialized topics.",
      limited: "Very limited vocabulary restricts communication to basic needs and familiar situations."
    },
    grammar: {
      expert: "Maintains consistent grammatical control of complex language. Errors are rare and difficult to spot.",
      veryGood: "Good grammatical control. Errors are infrequent and do not cause misunderstanding.",
      good: "Generally accurate use of grammar. Some errors in complex structures but meaning remains clear.",
      competent: "Reasonable accuracy in familiar contexts. Errors occur but basic meaning is usually conveyed.",
      modest: "Limited range of structures. Frequent errors in complex sentences but simple structures are usually correct.",
      limited: "Basic grammatical patterns only. Frequent errors may impede communication."
    },
    overall: {
      expert: "Exceptional communicative competence. Can express ideas fluently, accurately, and with sophistication appropriate for any context.",
      veryGood: "Strong communicative ability. Can handle complex language tasks with confidence and accuracy.",
      good: "Effective communication skills for most situations. Minor limitations in complex or unfamiliar contexts.",
      competent: "Adequate communication for familiar topics. Can handle routine tasks but may struggle with complexity.",
      modest: "Basic communication possible in predictable situations. Limited ability to elaborate or handle unexpected topics.",
      limited: "Communication limited to very basic exchanges. Significant support may be needed."
    }
  };

  const skill = skillName.toLowerCase();
  const feedback = feedbackMap[skill] || feedbackMap.overall;

  if (score >= 8.5) return feedback.expert;
  if (score >= 7.5) return feedback.veryGood;
  if (score >= 6.5) return feedback.good;
  if (score >= 5.5) return feedback.competent;
  if (score >= 4.5) return feedback.modest;
  return feedback.limited;
}

// Get performance level
function getPerformanceLevel(score) {
  if (score >= 8.5) return 'expert';
  if (score >= 7.5) return 'veryGood';
  if (score >= 6.5) return 'good';
  if (score >= 5.5) return 'competent';
  if (score >= 4.5) return 'modest';
  return 'limited';
}

// API endpoint to get student assessment data
app.get('/api/assessment', (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'studentData.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(rawData);

    // Calculate CEFR level and score band
    const cefrLevel = getCEFRLevel(data.scores.overall);
    const scoreBand = getScoreBand(data.scores.overall);

    // Add feedback for each skill
    const response = {
      ...data,
      cefrLevel,
      scoreBand,
      skillBands: {
        pronunciation: getScoreBand(data.scores.pronunciation),
        fluency: getScoreBand(data.scores.fluency),
        vocabulary: getScoreBand(data.scores.vocabulary),
        grammar: getScoreBand(data.scores.grammar)
      },
      performanceLevels: {
        overall: getPerformanceLevel(data.scores.overall),
        pronunciation: getPerformanceLevel(data.scores.pronunciation),
        fluency: getPerformanceLevel(data.scores.fluency),
        vocabulary: getPerformanceLevel(data.scores.vocabulary),
        grammar: getPerformanceLevel(data.scores.grammar)
      },
      feedback: {
        overall: getFeedback(data.scores.overall, 'overall'),
        pronunciation: getFeedback(data.scores.pronunciation, 'pronunciation'),
        fluency: getFeedback(data.scores.fluency, 'fluency'),
        vocabulary: getFeedback(data.scores.vocabulary, 'vocabulary'),
        grammar: getFeedback(data.scores.grammar, 'grammar')
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error reading assessment data:', error);
    res.status(500).json({ error: 'Failed to load assessment data' });
  }
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
