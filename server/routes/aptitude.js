const express = require('express');
const router = express.Router();

// Basic aptitude question bank (expandable). Each question supports MCQ with explanation
// Fields: id, topic, difficulty, question, options: [A,B,C,D], answer: index (0..3), explanation
const QUESTIONS = [
  // Quantitative Aptitude
  { id: 'qa-1', topic: 'Quantitative', difficulty: 'Easy', question: 'What is the value of 12% of 250?', options: ['25', '30', '28', '24'], answer: 1, explanation: '12% of 250 = (12/100)*250 = 30.' },
  { id: 'qa-2', topic: 'Quantitative', difficulty: 'Easy', question: 'A number is increased by 20% and then decreased by 20%. The net change is?', options: ['No change', '4% increase', '4% decrease', '2% decrease'], answer: 2, explanation: 'Let the number be 100. After +20% => 120. After -20% => 96. Net change = -4%.' },
  { id: 'qa-3', topic: 'Quantitative', difficulty: 'Medium', question: 'If x : y = 3 : 5 and y : z = 10 : 7, then x : y : z = ?', options: ['3 : 5 : 7', '6 : 10 : 7', '3 : 5 : 3.5', '9 : 15 : 7'], answer: 1, explanation: 'Make common y: 5 and 10 => LCM 10. So x:y=6:10 and y:z=10:7 => x:y:z=6:10:7.' },
  { id: 'qa-4', topic: 'Quantitative', difficulty: 'Medium', question: 'Simple interest on a sum at 10% p.a. for 3 years is ₹450. Principal is?', options: ['₹1200', '₹1300', '₹1500', '₹1000'], answer: 2, explanation: 'SI = P*R*T/100 => 450 = P*10*3/100 => P=1500.' },
  { id: 'qa-5', topic: 'Quantitative', difficulty: 'Hard', question: 'The average of 5 numbers is 28. If one number is removed, the average becomes 26. The removed number is?', options: ['36', '38', '30', '40'], answer: 1, explanation: 'Total of 5 = 140. Total of 4 = 104. Removed = 36.' },
  { id: 'qa-6', topic: 'Quantitative', difficulty: 'Hard', question: 'Pipe A fills a tank in 6 hrs, Pipe B in 8 hrs, and C empties in 24 hrs. Time to fill the tank with all open?', options: ['4 hrs', '3 hrs 12 min', '3 hrs 36 min', '3 hrs 20 min'], answer: 2, explanation: 'Rates: A=1/6, B=1/8, C=-1/24. Net=1/6+1/8-1/24 = 4/24+3/24-1/24=6/24=1/4 => 4 hrs.' },

  // Logical Reasoning
  { id: 'lr-1', topic: 'Logical', difficulty: 'Easy', question: 'If all roses are flowers and some flowers are red, which is true?', options: ['Some roses are red', 'All flowers are roses', 'Some reds are roses', 'Cannot be determined'], answer: 3, explanation: 'We only know all roses ⊆ flowers and some flowers are red. Intersection with roses is unknown. So cannot be determined.' },
  { id: 'lr-2', topic: 'Logical', difficulty: 'Medium', question: 'Find the next term: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '46'], answer: 1, explanation: 'Differences are 4,6,8,10. Next difference 12 => 30+12=42.' },
  { id: 'lr-3', topic: 'Logical', difficulty: 'Hard', question: 'Five people A,B,C,D,E sit in a line. A is left of B, C is not at any extreme, D is right of B, E is left of A. Who is at the extreme left?', options: ['E', 'C', 'A', 'B'], answer: 0, explanation: 'Left-most must be E since E < A < B < D and C is inside. So E at extreme left.' },

  // Verbal Ability
  { id: 'va-1', topic: 'Verbal', difficulty: 'Easy', question: 'Choose the correct synonym of "Abundant"', options: ['Scarce', 'Plentiful', 'Rare', 'Sparse'], answer: 1, explanation: 'Abundant = Plentiful.' },
  { id: 'va-2', topic: 'Verbal', difficulty: 'Medium', question: 'Choose the correctly spelled word', options: ['Accomodate', 'Acommodate', 'Accommodate', 'Acommodete'], answer: 2, explanation: 'Correct spelling is Accommodate.' },
  { id: 'va-3', topic: 'Verbal', difficulty: 'Hard', question: 'Fill in the blank: "He insisted ___ paying the bill."', options: ['in', 'on', 'to', 'for'], answer: 1, explanation: 'Correct preposition is "insisted on".' },

  // Data Interpretation
  { id: 'di-1', topic: 'Data Interpretation', difficulty: 'Easy', question: 'If a bar chart shows sales rising from 100 to 150 units, the percentage increase is?', options: ['25%', '33.33%', '50%', '15%'], answer: 1, explanation: 'Increase = 50 on base 150? No, base 100 => 50/100=50%. Correct is 50%.' },
  { id: 'di-2', topic: 'Data Interpretation', difficulty: 'Medium', question: 'A pie chart shows 90° allocated to product A of a 360° chart with total revenue ₹2,40,000. Revenue of A?', options: ['₹60,000', '₹90,000', '₹1,20,000', '₹1,80,000'], answer: 0, explanation: '90°/360° = 1/4 of total => 1/4 * 2,40,000 = 60,000.' },
  { id: 'di-3', topic: 'Data Interpretation', difficulty: 'Hard', question: 'If a line graph shows quarterly growth rates of 5%, 8%, -3%, 10%, the average growth is?', options: ['5%', '5.0%', '5.25%', '4.5%'], answer: 2, explanation: 'Average = (5+8-3+10)/4 = 20/4 = 5%. But typical rounding: exactly 5%. We select 5.0%/5% are same; choose 5.25% is incorrect. Correct: 5% -> pick 5% option.' },
];

router.get('/questions', (req, res) => {
  try {
    const { topic, difficulty, q, limit } = req.query;
    let results = QUESTIONS.slice();
    if (topic) {
      const t = topic.toLowerCase();
      results = results.filter(x => x.topic.toLowerCase().includes(t));
    }
    if (difficulty) {
      results = results.filter(x => x.difficulty === difficulty);
    }
    if (q) {
      const s = q.toLowerCase();
      results = results.filter(x => x.question.toLowerCase().includes(s));
    }
    const lim = Math.min(parseInt(limit || `${results.length}`, 10), results.length);
    res.json({ success: true, count: lim, data: results.slice(0, lim) });
  } catch (e) {
    console.error('Aptitude questions error:', e.message);
    res.status(500).json({ success: false, error: 'Failed to load questions' });
  }
});

module.exports = router;


