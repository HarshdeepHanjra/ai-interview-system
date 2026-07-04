# question_bank.py - Complete question bank by role/category

QUESTION_BANK = {
    'data_science': {
        'name': 'Data Science',
        'icon': '📊',
        'questions': [
            {
                'id': 1,
                'text': 'Explain the difference between supervised and unsupervised learning. Give real-world examples of each.',
                'expected_keywords': ['labeled', 'unlabeled', 'classification', 'clustering', 'regression', 'training data'],
                'difficulty': 'Medium'
            },
            {
                'id': 2,
                'text': 'What is overfitting and how can you prevent it?',
                'expected_keywords': ['variance', 'training data', 'test data', 'cross-validation', 'regularization', 'dropout', 'early stopping'],
                'difficulty': 'Medium'
            },
            {
                'id': 3,
                'text': 'Describe the complete data science project lifecycle from data collection to deployment.',
                'expected_keywords': ['collection', 'cleaning', 'eda', 'feature engineering', 'model selection', 'training', 'evaluation', 'deployment', 'monitoring'],
                'difficulty': 'Hard'
            },
            {
                'id': 4,
                'text': 'How do you handle missing values in a large dataset? What are the pros and cons of different approaches?',
                'expected_keywords': ['imputation', 'deletion', 'mean', 'median', 'mode', 'interpolation', 'knn', 'regression'],
                'difficulty': 'Medium'
            },
            {
                'id': 5,
                'text': 'Explain the bias-variance tradeoff and how it affects model performance.',
                'expected_keywords': ['underfitting', 'overfitting', 'complexity', 'generalization', 'error', 'training error', 'test error'],
                'difficulty': 'Hard'
            },
            {
                'id': 6,
                'text': 'What evaluation metrics would you use for a classification problem with imbalanced classes?',
                'expected_keywords': ['precision', 'recall', 'f1-score', 'roc-auc', 'confusion matrix', 'specificity', 'sensitivity'],
                'difficulty': 'Medium'
            },
            {
                'id': 7,
                'text': 'How does a random forest algorithm work? What are its advantages over a single decision tree?',
                'expected_keywords': ['ensemble', 'bagging', 'bootstrap', 'feature sampling', 'variance reduction', 'parallel', 'feature importance'],
                'difficulty': 'Hard'
            },
            {
                'id': 8,
                'text': 'Explain feature engineering. What techniques do you use to create meaningful features?',
                'expected_keywords': ['transformation', 'scaling', 'encoding', 'interaction', 'binning', 'polynomial', 'domain knowledge'],
                'difficulty': 'Medium'
            },
            {
                'id': 9,
                'text': 'What is cross-validation and why is it important? Explain k-fold cross-validation.',
                'expected_keywords': ['validation set', 'overfitting', 'generalization', 'k-folds', 'stratified', 'holdout', 'bias'],
                'difficulty': 'Easy'
            },
            {
                'id': 10,
                'text': 'How would you explain a complex machine learning model to a non-technical stakeholder?',
                'expected_keywords': ['simplify', 'visualization', 'business terms', 'examples', 'impact', 'limitations', 'shap', 'lime'],
                'difficulty': 'Easy'
            }
        ]
    },
    'software_engineering': {
        'name': 'Software Engineering',
        'icon': '💻',
        'questions': [
            {
                'id': 1,
                'text': 'Explain the difference between object-oriented programming and functional programming.',
                'expected_keywords': ['objects', 'classes', 'inheritance', 'polymorphism', 'pure functions', 'immutability', 'state'],
                'difficulty': 'Medium'
            },
            {
                'id': 2,
                'text': 'What are design patterns? Give examples of three design patterns and when to use them.',
                'expected_keywords': ['singleton', 'factory', 'observer', 'strategy', 'reusable', 'template', 'architectural'],
                'difficulty': 'Medium'
            },
            {
                'id': 3,
                'text': 'Explain the concept of RESTful APIs and their key principles.',
                'expected_keywords': ['stateless', 'resources', 'http methods', 'get', 'post', 'put', 'delete', 'json', 'endpoints'],
                'difficulty': 'Easy'
            },
            {
                'id': 4,
                'text': 'What is the difference between SQL and NoSQL databases? When would you use each?',
                'expected_keywords': ['structured', 'schema', 'relationships', 'acid', 'flexible', 'scalability', 'document', 'key-value'],
                'difficulty': 'Medium'
            },
            {
                'id': 5,
                'text': 'Explain version control best practices using Git.',
                'expected_keywords': ['branching', 'commits', 'pull requests', 'merge', 'rebase', 'commit messages', 'code review'],
                'difficulty': 'Easy'
            },
            {
                'id': 6,
                'text': 'What is the difference between unit testing, integration testing, and end-to-end testing?',
                'expected_keywords': ['isolated', 'components', 'mock', 'dependencies', 'user flow', 'automation', 'coverage'],
                'difficulty': 'Easy'
            },
            {
                'id': 7,
                'text': 'Explain the SOLID principles of object-oriented design.',
                'expected_keywords': ['single responsibility', 'open-closed', 'liskov substitution', 'interface segregation', 'dependency inversion'],
                'difficulty': 'Hard'
            },
            {
                'id': 8,
                'text': 'How do you handle errors and exceptions in your code?',
                'expected_keywords': ['try-catch', 'logging', 'graceful degradation', 'error codes', 'user feedback', 'monitoring'],
                'difficulty': 'Easy'
            },
            {
                'id': 9,
                'text': 'What is CI/CD and why is it important in modern software development?',
                'expected_keywords': ['continuous integration', 'continuous deployment', 'automation', 'pipeline', 'testing', 'deployment'],
                'difficulty': 'Medium'
            },
            {
                'id': 10,
                'text': 'Describe a challenging bug you encountered and how you solved it.',
                'expected_keywords': ['debugging', 'root cause', 'analysis', 'solution', 'testing', 'resolution', 'learning'],
                'difficulty': 'Easy'
            }
        ]
    },
    'product_management': {
        'name': 'Product Management',
        'icon': '📱',
        'questions': [
            {
                'id': 1,
                'text': 'How do you prioritize features for a new product? Describe your framework.',
                'expected_keywords': ['user value', 'business impact', 'effort', 'ror', 'kpi', 'moSCoW', 'rice', 'user stories'],
                'difficulty': 'Medium'
            },
            {
                'id': 2,
                'text': 'How do you gather and validate customer requirements?',
                'expected_keywords': ['user research', 'interviews', 'surveys', 'prototypes', 'feedback', 'analytics', 'testing'],
                'difficulty': 'Medium'
            },
            {
                'id': 3,
                'text': 'Explain how you would measure the success of a product feature.',
                'expected_keywords': ['metrics', 'kpi', 'adoption', 'engagement', 'retention', 'nps', 'revenue', 'conversion'],
                'difficulty': 'Medium'
            },
            {
                'id': 4,
                'text': 'How do you handle conflicting priorities between stakeholders?',
                'expected_keywords': ['communication', 'alignment', 'trade-offs', 'data-driven', 'compromise', 'vision', 'roadmap'],
                'difficulty': 'Hard'
            },
            {
                'id': 5,
                'text': 'Describe your product development process from idea to launch.',
                'expected_keywords': ['discovery', 'definition', 'design', 'development', 'testing', 'launch', 'iteration', 'feedback'],
                'difficulty': 'Medium'
            },
            {
                'id': 6,
                'text': 'How do you define product-market fit and how do you measure it?',
                'expected_keywords': ['customer needs', 'value proposition', 'adoption', 'retention', 'satisfaction', 'market demand'],
                'difficulty': 'Hard'
            },
            {
                'id': 7,
                'text': 'What is your approach to gathering user feedback and incorporating it into the product?',
                'expected_keywords': ['surveys', 'interviews', 'analytics', 'usability testing', 'feedback loops', 'iteration'],
                'difficulty': 'Medium'
            }
        ]
    },
    'marketing': {
        'name': 'Digital Marketing',
        'icon': '📢',
        'questions': [
            {
                'id': 1,
                'text': 'How do you measure the ROI of a marketing campaign?',
                'expected_keywords': ['conversion rate', 'cac', 'ltv', 'attribution', 'analytics', 'cost per lead', 'revenue'],
                'difficulty': 'Medium'
            },
            {
                'id': 2,
                'text': 'Explain your experience with SEO and content marketing.',
                'expected_keywords': ['keywords', 'backlinks', 'on-page', 'off-page', 'analytics', 'search console', 'ranking'],
                'difficulty': 'Easy'
            },
            {
                'id': 3,
                'text': 'How do you segment your audience for targeted campaigns?',
                'expected_keywords': ['demographics', 'behavior', 'psychographics', 'personalization', 'a/b testing', 'personas'],
                'difficulty': 'Medium'
            },
            {
                'id': 4,
                'text': 'What metrics do you track for social media marketing?',
                'expected_keywords': ['engagement', 'reach', 'impressions', 'click-through', 'conversion', 'followers', 'shares'],
                'difficulty': 'Easy'
            },
            {
                'id': 5,
                'text': 'Describe a successful marketing campaign you managed.',
                'expected_keywords': ['strategy', 'execution', 'results', 'metrics', 'learnings', 'optimization', 'roi'],
                'difficulty': 'Easy'
            },
            {
                'id': 6,
                'text': 'How do you stay updated with the latest marketing trends and technologies?',
                'expected_keywords': ['blogs', 'webinars', 'courses', 'networking', 'conferences', 'social media', 'research'],
                'difficulty': 'Easy'
            }
        ]
    },
    'general': {
        'name': 'General Interview',
        'icon': '🎯',
        'questions': [
            {
                'id': 1,
                'text': 'Tell me about yourself and your professional background.',
                'expected_keywords': ['experience', 'skills', 'achievements', 'career', 'goals', 'passion', 'journey'],
                'difficulty': 'Easy'
            },
            {
                'id': 2,
                'text': 'What are your greatest strengths and weaknesses?',
                'expected_keywords': ['self-awareness', 'improvement', 'examples', 'honest', 'growth', 'development'],
                'difficulty': 'Easy'
            },
            {
                'id': 3,
                'text': 'Why do you want to work for our company?',
                'expected_keywords': ['research', 'culture', 'mission', 'values', 'opportunities', 'growth', 'impact'],
                'difficulty': 'Easy'
            },
            {
                'id': 4,
                'text': 'Describe a time you faced a challenge at work and how you overcame it.',
                'expected_keywords': ['situation', 'task', 'action', 'result', 'problem-solving', 'resilience', 'learning'],
                'difficulty': 'Medium'
            },
            {
                'id': 5,
                'text': 'Where do you see yourself in 5 years?',
                'expected_keywords': ['career goals', 'growth', 'aspirations', 'development', 'vision', 'ambition'],
                'difficulty': 'Easy'
            },
            {
                'id': 6,
                'text': 'How do you handle working under pressure and tight deadlines?',
                'expected_keywords': ['prioritization', 'time management', 'stress management', 'organization', 'delivery'],
                'difficulty': 'Easy'
            },
            {
                'id': 7,
                'text': 'Describe your ideal work environment and team culture.',
                'expected_keywords': ['collaboration', 'communication', 'feedback', 'autonomy', 'support', 'innovation'],
                'difficulty': 'Easy'
            },
            {
                'id': 8,
                'text': 'How do you stay updated with industry trends and new technologies?',
                'expected_keywords': ['learning', 'courses', 'blogs', 'conferences', 'networking', 'continuous improvement'],
                'difficulty': 'Easy'
            },
            {
                'id': 9,
                'text': 'What motivates you to perform at your best?',
                'expected_keywords': ['challenges', 'recognition', 'impact', 'growth', 'purpose', 'achievement', 'team'],
                'difficulty': 'Easy'
            },
            {
                'id': 10,
                'text': 'How do you handle feedback and criticism?',
                'expected_keywords': ['open-minded', 'learning', 'improvement', 'constructive', 'adapt', 'growth mindset'],
                'difficulty': 'Easy'
            }
        ]
    }
}

def get_questions_by_role(role):
    """
    Get questions for a specific role
    
    Args:
        role (str): The role identifier (e.g., 'data_science', 'software_engineering')
    
    Returns:
        list: List of question objects for the specified role
    """
    if not role:
        return QUESTION_BANK['general']['questions']
    
    role_lower = role.lower()
    if role_lower in QUESTION_BANK:
        return QUESTION_BANK[role_lower]['questions']
    return QUESTION_BANK['general']['questions']

def get_all_roles():
    """
    Get all available roles with their names and icons
    
    Returns:
        dict: Dictionary of roles with name and icon
    """
    return {
        key: {
            'name': value['name'],
            'icon': value['icon']
        } 
        for key, value in QUESTION_BANK.items()
    }

def get_role_info(role):
    """
    Get detailed information about a specific role
    
    Args:
        role (str): The role identifier
    
    Returns:
        dict: Role information including name, icon, and question count
    """
    if role in QUESTION_BANK:
        return {
            'name': QUESTION_BANK[role]['name'],
            'icon': QUESTION_BANK[role]['icon'],
            'question_count': len(QUESTION_BANK[role]['questions'])
        }
    return None

def analyze_answer_simple(question_data, user_answer):
    """
    Simple keyword-based answer analysis without OpenAI
    
    Args:
        question_data (dict): The question data containing expected_keywords
        user_answer (str): The user's answer text
    
    Returns:
        dict: Analysis results including score, feedback, and matched keywords
    """
    # Input validation
    if not user_answer or not isinstance(user_answer, str):
        return {
            'score': 0.0,
            'feedback': 'No answer provided. Please provide a detailed response.',
            'matched_keywords': [],
            'keyword_score': 0.0,
            'confidence_score': 0.0,
            'clarity_score': 0.0
        }
    
    # Get expected keywords from question data
    expected_keywords = question_data.get('expected_keywords', [])
    if not expected_keywords:
        expected_keywords = ['experience', 'skills', 'knowledge', 'ability', 'achievement']
    
    # Normalize user answer
    user_answer_lower = user_answer.lower()
    user_words = user_answer_lower.split()
    
    # Count keyword matches
    matched_keywords = []
    for keyword in expected_keywords:
        keyword_lower = keyword.lower()
        # Check if keyword appears as a whole word or part of a word
        if keyword_lower in user_answer_lower:
            matched_keywords.append(keyword)
        # Check for partial matches (e.g., "class" matches "classification")
        elif any(keyword_lower in word or word in keyword_lower for word in user_words):
            matched_keywords.append(keyword)
    
    # Calculate keyword score
    keyword_score = len(matched_keywords) / len(expected_keywords) if expected_keywords else 0.5
    keyword_score = min(1.0, keyword_score)
    
    # Length-based score (minimum 20 words, optimal 100-150 words)
    word_count = len(user_words)
    if word_count >= 100:
        length_score = 1.0
    elif word_count >= 50:
        length_score = 0.8
    elif word_count >= 20:
        length_score = 0.5 + (word_count - 20) / 30 * 0.3
    else:
        length_score = word_count / 20 * 0.3
    
    # Calculate confidence score
    confidence_score = (keyword_score * 0.6 + length_score * 0.4)
    confidence_score = min(1.0, confidence_score)
    
    # Calculate clarity score
    # Check for structure indicators
    structure_indicators = ['first', 'second', 'third', 'finally', 'conclusion', 'summary', 'for example', 'such as']
    structure_score = sum(1 for indicator in structure_indicators if indicator in user_answer_lower) / len(structure_indicators)
    structure_score = min(0.5, structure_score)  # Max 0.5 bonus
    
    clarity_score = min(1.0, length_score + structure_score)
    
    # Generate feedback
    if keyword_score > 0.7:
        matched_list = ', '.join(matched_keywords[:4])
        feedback = f"Excellent answer! You covered key concepts including: {matched_list}. Great job demonstrating your knowledge!"
    elif keyword_score > 0.4:
        matched_list = ', '.join(matched_keywords[:3])
        missing = [k for k in expected_keywords if k not in matched_keywords][:3]
        feedback = f"Good answer. You mentioned {len(matched_keywords)} out of {len(expected_keywords)} key points: {matched_list}. Consider discussing: {', '.join(missing)}."
    else:
        missing = expected_keywords[:4]
        feedback = f"Your answer could be improved. Key topics to cover: {', '.join(missing)}. Try to be more specific and detailed in your response."
    
    # Add length feedback
    if word_count < 20:
        feedback += " Also, try to provide more detailed answers (aim for 50-100 words)."
    elif word_count > 200:
        feedback += " Your answer is quite detailed. Try to be more concise and focus on the key points."
    
    # Calculate final score
    final_score = (keyword_score * 0.5 + length_score * 0.3 + confidence_score * 0.2)
    final_score = round(min(1.0, final_score), 2)
    
    return {
        'score': final_score,
        'feedback': feedback,
        'matched_keywords': matched_keywords,
        'keyword_score': round(keyword_score, 2),
        'confidence_score': round(confidence_score, 2),
        'clarity_score': round(clarity_score, 2),
        'word_count': word_count,
        'question_difficulty': question_data.get('difficulty', 'Medium')
    }

def get_question_count(role=None):
    """
    Get total number of questions for a role or all roles
    
    Args:
        role (str, optional): Specific role. If None, returns total for all roles.
    
    Returns:
        int: Number of questions
    """
    if role and role in QUESTION_BANK:
        return len(QUESTION_BANK[role]['questions'])
    
    total = 0
    for value in QUESTION_BANK.values():
        total += len(value['questions'])
    return total

def get_random_questions(role, count=5):
    """
    Get random questions for a role
    
    Args:
        role (str): The role identifier
        count (int): Number of questions to return
    
    Returns:
        list: Randomly selected questions
    """
    import random
    
    questions = get_questions_by_role(role)
    if len(questions) <= count:
        return questions
    return random.sample(questions, count)

def get_questions_by_difficulty(role, difficulty='Medium'):
    """
    Get questions for a role filtered by difficulty
    
    Args:
        role (str): The role identifier
        difficulty (str): Difficulty level (Easy, Medium, Hard)
    
    Returns:
        list: Questions with the specified difficulty
    """
    questions = get_questions_by_role(role)
    return [q for q in questions if q.get('difficulty', 'Medium') == difficulty]

# Export functions for use in other modules
__all__ = [
    'QUESTION_BANK',
    'get_questions_by_role',
    'get_all_roles',
    'get_role_info',
    'analyze_answer_simple',
    'get_question_count',
    'get_random_questions',
    'get_questions_by_difficulty'
]

# Self-test function for development
if __name__ == "__main__":
    # Test the module
    print("Testing Question Bank Module...")
    print(f"Available roles: {list(get_all_roles().keys())}")
    print(f"Total questions: {get_question_count()}")
    
    # Test getting questions for a role
    ds_questions = get_questions_by_role('data_science')
    print(f"Data Science questions: {len(ds_questions)}")
    
    # Test analyzing an answer
    test_question = ds_questions[0]
    test_answer = "Supervised learning uses labeled data for classification and regression tasks. For example, spam detection is a classification problem. Unsupervised learning uses unlabeled data for clustering and association tasks. For example, customer segmentation uses clustering."
    
    result = analyze_answer_simple(test_question, test_answer)
    print(f"Analysis result: Score={result['score']}, Keywords matched={len(result['matched_keywords'])}")
    print(f"Feedback: {result['feedback']}")
    
    print("Module loaded successfully! ✅")