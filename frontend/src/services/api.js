import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
});

export const agenticAPI = {
    async generateCode(prompt) {
        try {
            const response = await axios.post(`${API_BASE_URL}/generate`, {
                prompt,
            }, {
                timeout: 300000,
            });
            return response.data;
        } catch (error) {
            if (error?.code === 'ECONNABORTED' || (error?.message || '').includes('timeout')) {
                throw new Error('Request timed out: the backend or LLM may be busy. Try again later.');
            }
            throw error;
        }
    },

    async healthCheck() {
        try {
            const response = await client.get('/');
            return response.data;
        } catch (error) {
            return { status: 'offline', error: error.message };
        }
    },
};
