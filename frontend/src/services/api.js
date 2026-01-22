const API_URL = "http://localhost:8000/api";

export const generateQuestions = async (file, numQuestions = 5, mode = 'mcq') => {
    const formData = new FormData();
    formData.append('file', file);
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
