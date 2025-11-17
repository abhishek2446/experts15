const pdfParse = require('pdf-parse');
const fs = require('fs');

const parseQuestionPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    const text = data.text;
    const questions = extractQuestions(text);
    
    return {
      success: true,
      questions,
      rawText: text
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const extractQuestions = (text) => {
  const questions = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let currentQuestion = null;
  let questionNumber = 0;
  let currentSubject = 'Physics';
  
  console.log('PDF Text Preview:', text.substring(0, 500));
  console.log('Total lines:', lines.length);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for subject headers
    const subjectMatch = line.match(/^(PHYSICS|CHEMISTRY|MATHEMATICS|MATH|MATHS|SECTION\s*[A-C])/i);
    if (subjectMatch) {
      const subject = subjectMatch[1].toLowerCase();
      if (subject === 'physics' || subject === 'section a') currentSubject = 'Physics';
      else if (subject === 'chemistry' || subject === 'section b') currentSubject = 'Chemistry';
      else if (subject.includes('math') || subject === 'section c') currentSubject = 'Mathematics';
      console.log('Found subject:', currentSubject);
      continue;
    }
    
    // Enhanced question pattern matching
    const questionMatch = line.match(/^(?:Q\.?\s*)?(\d{1,3})[\.\)]\s*(.+)/) || 
                         line.match(/^Question\s+(\d{1,3})[\.:]?\s*(.+)/i) ||
                         line.match(/^(\d{1,3})[\.\)]\s+(.+)/) ||
                         line.match(/^(\d{1,3})\s*[-–]\s*(.+)/);
    
    if (questionMatch) {
      if (currentQuestion) {
        if (!currentQuestion.subject) {
          const questionsPerSubject = Math.ceil(75 / 3);
          if (currentQuestion.qno <= questionsPerSubject) {
            currentQuestion.subject = 'Physics';
          } else if (currentQuestion.qno <= questionsPerSubject * 2) {
            currentQuestion.subject = 'Chemistry';
          } else {
            currentQuestion.subject = 'Mathematics';
          }
        }
        questions.push(currentQuestion);
      }
      
      questionNumber = parseInt(questionMatch[1]);
      currentQuestion = {
        qno: questionNumber,
        subject: currentSubject,
        text: questionMatch[2],
        options: [],
        marks: 4,
        negativeMarks: -1,
        questionType: 'MCQ',
        difficulty: 'Medium'
      };
      console.log(`Found question ${questionNumber}`);
      continue;
    }
    
    // Enhanced option pattern matching
    const optionMatch = line.match(/^[(\[]?([A-Da-d])[)\]\.]\s*(.+)/) ||
                       line.match(/^\(?([A-Da-d])\)?\s*[\-\.]?\s*(.+)/) ||
                       line.match(/^([A-Da-d])\s*[\)\.]\s*(.+)/) ||
                       line.match(/^([A-Da-d])\s+(.+)/);
    
    if (optionMatch && currentQuestion) {
      currentQuestion.options.push(optionMatch[2]);
      continue;
    }
    
    // Check for integer type questions
    if (currentQuestion && currentQuestion.options.length === 0 && 
        (line.match(/answer|result|value|integer/i) || line.match(/\d+/))) {
      currentQuestion.questionType = 'Integer';
    }
    
    // Continuation of question text
    if (currentQuestion && !optionMatch && 
        !line.match(/^[A-Da-d][)\]\.]/) && 
        !line.match(/^\d+[\.\)]/) &&
        line.length > 5 && line.length < 200) {
      currentQuestion.text += ' ' + line;
    }
  }
  
  if (currentQuestion) {
    if (!currentQuestion.subject) {
      currentQuestion.subject = currentSubject;
    }
    questions.push(currentQuestion);
  }
  
  const processedQuestions = questions.map(q => ({
    ...q,
    text: q.text.replace(/\s+/g, ' ').trim(),
    options: q.options.map(opt => opt.replace(/\s+/g, ' ').trim()),
    questionType: q.options.length === 0 ? 'Integer' : 'MCQ'
  })).filter(q => q.text.length > 10);
  
  console.log(`Extracted ${processedQuestions.length} questions`);
  return processedQuestions;
};

const parseAnswerKeyPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    const answers = extractAnswers(data.text);
    
    return {
      success: true,
      answers
    };
  } catch (error) {
    console.error('Answer key parsing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const extractAnswers = (text) => {
  const answers = {};
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  console.log('Answer key text preview:', text.substring(0, 500));
  
  for (const line of lines) {
    // Enhanced answer pattern matching
    const answerMatch = line.match(/(\d{1,3})[\.\):\s]+([A-Da-d]|\d+)/i) ||
                       line.match(/Q\.?\s*(\d{1,3})[\.:\s]+([A-Da-d]|\d+)/i) ||
                       line.match(/Question\s+(\d{1,3})[\.:\s]+([A-Da-d]|\d+)/i) ||
                       line.match(/(\d{1,3})\s*[-–]\s*([A-Da-d]|\d+)/i) ||
                       line.match(/(\d{1,3})\s+([A-Da-d]|\d+)/i);
    
    if (answerMatch) {
      const questionNum = parseInt(answerMatch[1]);
      const answer = answerMatch[2].toUpperCase();
      
      if (answer.match(/[A-D]/)) {
        const optionIndex = answer.charCodeAt(0) - 65;
        answers[questionNum] = optionIndex;
        console.log(`Answer ${questionNum}: ${answer} (index: ${optionIndex})`);
      } else if (answer.match(/\d+/)) {
        answers[questionNum] = parseInt(answer);
        console.log(`Answer ${questionNum}: ${answer} (integer)`);
      }
    }
  }
  
  console.log(`Extracted ${Object.keys(answers).length} answers`);
  return answers;
};

const enhanceQuestions = (questions) => {
  return questions.map(q => {
    if (q.options.length === 0 || q.text.includes('integer') || q.text.includes('numerical')) {
      q.questionType = 'Integer';
    } else if (q.text.includes('select all') || q.text.includes('multiple correct')) {
      q.questionType = 'MSQ';
    } else {
      q.questionType = 'MCQ';
    }
    
    if (q.text.includes('basic') || q.text.includes('simple') || q.text.includes('easy')) {
      q.difficulty = 'Easy';
    } else if (q.text.includes('complex') || q.text.includes('advanced') || q.text.includes('difficult')) {
      q.difficulty = 'Hard';
    } else {
      q.difficulty = 'Medium';
    }
    
    return q;
  });
};

module.exports = {
  parseQuestionPDF,
  parseAnswerKeyPDF,
  enhanceQuestions
};