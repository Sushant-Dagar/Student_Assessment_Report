# Student Speaking Assessment Report Page

A full-stack application that displays a student's speaking assessment report with scores, CEFR level mapping, and descriptive feedback - similar to platforms like SpeechAce / IELTS score reports.

**Live Demo:** https://student-assessment-report-one.vercel.app

## Features

- **Overall Score Display**: Animated circular progress ring showing score out of 9
- **CEFR Level Indicator**: Automatic mapping to CEFR levels (A1-C2)
- **Skill-wise Scores**: Individual circular progress indicators for:
  - Pronunciation
  - Fluency
  - Vocabulary
  - Grammar
- **Score Band System**: Color-coded performance bands (Expert to Limited)
- **Graphical Representation**:
  - Animated circular progress rings
  - Radar chart for skill comparison
- **Dynamic Feedback**: Automatically generated detailed feedback based on score ranges
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js with Express.js
- **Frontend**: HTML, CSS, JavaScript
- **Charts**: Chart.js (Radar Chart)
- **Fonts**: Google Fonts (Inter)
- **Data Storage**: JSON file

## Project Structure

```
GemaEdu/
├── server.js              # Express server with API endpoint & feedback logic
├── package.json           # Project dependencies
├── vercel.json            # Vercel deployment configuration
├── data/
│   └── studentData.json   # Student scores data storage
├── public/
│   ├── index.html         # Main report page
│   ├── styles.css         # Styling with CSS variables
│   └── app.js             # Frontend JavaScript
└── README.md              # Documentation
```

---

## How to Run the Project

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation & Running

1. **Navigate to the project directory**:
   ```bash
   cd GemaEdu
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

The application will load the student assessment report with all scores and feedback.

---

## Where Scores Are Stored

Scores are stored in a **JSON file** located at:

```
data/studentData.json
```

### Data Structure:

```json
{
  "student": {
    "id": "STU001",
    "name": "Sushant",
    "testDate": "2025-12-26",
    "testType": "Speaking Assessment"
  },
  "scores": {
    "overall": 7,
    "pronunciation": 7.5,
    "fluency": 6.5,
    "vocabulary": 7,
    "grammar": 7
  },
  "maxScore": 9
}
```

### Modifying Scores:
1. Open `data/studentData.json` in any text editor
2. Change the score values (range: 0-9)
3. Save the file
4. Refresh the browser - feedback updates automatically

---

## How Feedback Logic Works

The feedback system is implemented in `server.js` and works on **three levels**:

### 1. Score Band Classification

Scores are classified into 6 performance bands:

| Score Range | Band | Color |
|-------------|------|-------|
| 8.5 - 9.0 | Expert | Green (#00c853) |
| 7.5 - 8.4 | Very Good | Blue (#2196f3) |
| 6.5 - 7.4 | Good | Purple (#667eea) |
| 5.5 - 6.4 | Competent | Orange (#ff9800) |
| 4.5 - 5.4 | Modest | Deep Orange (#ff5722) |
| 0.0 - 4.4 | Limited | Red (#f44336) |

### 2. CEFR Level Mapping

Overall scores are mapped to CEFR (Common European Framework of Reference) levels:

| Score | CEFR Level | Description |
|-------|------------|-------------|
| >= 8.5 | C2 | Proficient (Mastery) |
| >= 7.5 | C1 | Advanced (Effective Operational Proficiency) |
| >= 6.5 | B2 | Upper Intermediate (Vantage) |
| >= 5.0 | B1 | Intermediate (Threshold) |
| >= 4.0 | A2 | Elementary (Waystage) |
| < 4.0 | A1 | Beginner (Breakthrough) |

### 3. Skill-Specific Feedback Generation

Each skill (Pronunciation, Fluency, Vocabulary, Grammar) has **6 unique feedback messages** based on performance level:

#### Example - Pronunciation Feedback:

| Level | Feedback |
|-------|----------|
| **Expert** (>=8.5) | "Demonstrates native-like pronunciation with excellent articulation, natural intonation, and stress patterns. Speech is effortlessly understood." |
| **Very Good** (>=7.5) | "Pronunciation is clear and accurate with only rare minor errors. Natural rhythm and intonation are well-maintained throughout." |
| **Good** (>=6.5) | "Generally clear pronunciation with occasional minor errors in complex words. Does not impede communication." |
| **Competent** (>=5.5) | "Pronunciation is understandable but shows noticeable L1 influence. Some sounds may be mispronounced." |
| **Modest** (>=4.5) | "Frequent pronunciation errors that sometimes cause listener strain. Basic words are usually clear." |
| **Limited** (<4.5) | "Pronunciation difficulties significantly affect intelligibility. Requires frequent repetition." |

#### Feedback Logic Code (server.js):

```javascript
function getFeedback(score, skillName) {
  if (score >= 8.5) return feedback.expert;
  if (score >= 7.5) return feedback.veryGood;
  if (score >= 6.5) return feedback.good;
  if (score >= 5.5) return feedback.competent;
  if (score >= 4.5) return feedback.modest;
  return feedback.limited;
}
```

The feedback **automatically updates** when score values change in the JSON file.

---

## API Endpoint

### GET /api/assessment

Returns complete student assessment data with scores, CEFR level, score bands, and generated feedback.

**Response Example:**
```json
{
  "student": {
    "id": "STU001",
    "name": "Sushant",
    "testDate": "2025-12-26",
    "testType": "Speaking Assessment"
  },
  "scores": {
    "overall": 7,
    "pronunciation": 7.5,
    "fluency": 6.5,
    "vocabulary": 7,
    "grammar": 7
  },
  "maxScore": 9,
  "cefrLevel": {
    "level": "B2",
    "name": "Upper Intermediate",
    "description": "Vantage or Upper Intermediate"
  },
  "scoreBand": {
    "band": "Good",
    "color": "#667eea"
  },
  "skillBands": {
    "pronunciation": { "band": "Very Good", "color": "#2196f3" },
    "fluency": { "band": "Good", "color": "#667eea" },
    "vocabulary": { "band": "Good", "color": "#667eea" },
    "grammar": { "band": "Good", "color": "#667eea" }
  },
  "feedback": {
    "overall": "Effective communication skills for most situations...",
    "pronunciation": "Pronunciation is clear and accurate...",
    "fluency": "Maintains flow of speech with some hesitation...",
    "vocabulary": "Adequate vocabulary for most topics...",
    "grammar": "Generally accurate use of grammar..."
  }
}
```

---

## Customization

### Changing Student Data
Edit `data/studentData.json` to update:
- Student name and details
- Test date
- Individual skill scores (0-9 range)
- Overall score

### Modifying Feedback Messages
Edit the `feedbackMap` object in the `getFeedback()` function in `server.js` to customize feedback messages.

### Changing Score Thresholds
Modify the threshold values in `getScoreBand()`, `getCEFRLevel()`, and `getFeedback()` functions in `server.js`.

---

## UI Components

The report page displays:

1. **Header** - Application title with gradient background
2. **Student Info Bar** - Name, test date, test type
3. **Summary of Scores Section**:
   - Overall score with animated circular progress ring
   - CEFR level badge and description
   - Four skill circular progress indicators
   - Radar chart for visual comparison
   - Score scale reference legend
4. **Descriptive Feedback Section**:
   - Overall assessment card
   - Individual skill feedback cards with icons
5. **Footer** - Generation date

---

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

---

## License

This project was created as an assignment for Full Stack Development evaluation.
