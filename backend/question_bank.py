# Complete question bank by role/category

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
            }
        ]
    }
}

def get_questions_by_role(role):
    """Get questions for a specific role"""
    if role in QUESTION_BANK:
        return QUESTION_BANK[role]['questions']
    return QUESTION_BANK['general']['questions']

def get_all_roles():
    """Get all available roles"""
    return {key: {'name': value['name'], 'icon': value['icon']} for key, value in QUESTION_BANK.items()}

def analyze_answer_simple(question_data, user_answer):
    """Simple keyword-based answer analysis without OpenAI"""
    expected_keywords = question_data.get('expected_keywords', [])
    user_answer_lower = user_answer.lower()
    
    # Count keyword matches
    matched_keywords = []
    for keyword in expected_keywords:
        if keyword.lower() in user_answer_lower:
            matched_keywords.append(keyword)
    
    keyword_score = len(matched_keywords) / len(expected_keywords) if expected_keywords else 0.5
    
    # Length-based score (minimum 20 words, max 200)
    word_count = len(user_answer.split())
    length_score = min(1.0, word_count / 100)
    if word_count < 20:
        length_score = word_count / 20 * 0.5  # Penalty for very short answers
    
    # Calculate confidence based on answer length and keyword matches
    confidence_score = (keyword_score * 0.6 + length_score * 0.4)
    
    # Generate feedback based on score
    if keyword_score > 0.7:
        feedback = f"Excellent answer! You covered key concepts including: {', '.join(matched_keywords[:3])}. Great job!"
    elif keyword_score > 0.4:
        missing = [k for k in expected_keywords if k not in matched_keywords][:3]
        feedback = f"Good answer. You mentioned {len(matched_keywords)} out of {len(expected_keywords)} key points. Consider discussing: {', '.join(missing)}."
    else:
        feedback = f"Your answer could be improved. Key topics to cover: {', '.join(expected_keywords[:4])}. Try to be more specific and detailed."
    
    if word_count < 20:
        feedback += " Also, try to provide more detailed answers (aim for 50-100 words)."
    
    final_score = (keyword_score * 0.5 + length_score * 0.3 + confidence_score * 0.2)
    
    return {
        'score': round(final_score, 2),
        'feedback': feedback,
        'matched_keywords': matched_keywords,
        'keyword_score': round(keyword_score, 2),
        'confidence_score': round(confidence_score, 2),
        'clarity_score': round(min(1.0, length_score + 0.2), 2)
    }