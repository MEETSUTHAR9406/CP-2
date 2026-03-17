const API_URL = "http://localhost:8000/api";

export const generateQuestions = async (file, numQuestions = 5, mode = 'mcq', youtubeUrl = null) => {
    const formData = new FormData();
    if (file) {
        formData.append('file', file);
    }
    if (youtubeUrl) {
        formData.append('youtube_url', youtubeUrl);
    }
    formData.append('num_questions', numQuestions);
    formData.append('mode', mode);

    const response = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate questions');
    }

    return response.json();
};

export const generateSummary = async (payload) => {
    // Payload can be FormData or { text: string }

    let body;
    let headers = {};

    if (payload instanceof FormData) {
        body = payload;
        // Content-Type header not needed, browser sets it with boundary for FormData
    } else {
        const formData = new FormData();
        if (payload.text) formData.append('text', payload.text);
        body = formData;
    }

    const response = await fetch(`${API_URL}/summarize`, {
        method: 'POST',
        body: body,
        headers: headers
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate summary');
    }

    return response.json();
};

export const getTutorHint = async (payload) => {
    const response = await fetch(`${API_URL}/tutor/hint`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to get tutor hint');
    }

    return response.json();
};

export const getKnowledgeMap = async () => {
    const response = await fetch(`${API_URL}/knowledge-map`, {
        method: 'GET',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to fetch knowledge map data');
    }

    return response.json();
};

export const getQuestions = async (type = null) => {
    let url = `${API_URL}/questions`;
    if (type) {
        url += `?type=${type}`;
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
};

export const getExams = async () => {
    const response = await fetch(`${API_URL}/exams`);
    if (!response.ok) throw new Error('Failed to fetch exams');
    return response.json();
};

export const getExam = async (id) => {
    const response = await fetch(`${API_URL}/exams/${id}`);
    if (!response.ok) throw new Error('Failed to fetch exam');
    return response.json();
};

export const createExam = async (examData) => {
    const response = await fetch(`${API_URL}/exams`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData)
    });
    if (!response.ok) throw new Error('Failed to create exam');
    return response.json();
};

export const generateSlides = async (payload) => {
    let body;
    let headers = {};

    if (payload instanceof FormData) {
        body = payload;
    } else {
        const formData = new FormData();
        if (payload.text) formData.append('text', payload.text);
        body = formData;
    }

    const response = await fetch(`${API_URL}/slides/generate`, {
        method: 'POST',
        body: body,
        headers: headers
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate slides');
    }

    return response.json();
};
