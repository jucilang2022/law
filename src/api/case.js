import axios from 'axios';

// 获取案件列表
export const getCases = async () => {
    try {
        const response = await axios.get('/cases');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 获取单个案件详情
export const getCaseById = async (id) => {
    try {
        const response = await axios.get(`/cases/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 更新案件状态
export const updateCaseStatus = async (id, status) => {
    try {
        const response = await axios.patch(`/cases/${id}`, { status });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 创建新案件
export const createCase = async (caseData) => {
    try {
        const response = await axios.post('/cases', caseData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// 从预约创建案件
export const createCaseFromAppointment = async (appointmentId) => {
    try {
        const response = await axios.post('/cases/from-appointment', { appointmentId });
        return response.data;
    } catch (error) {
        throw error;
    }
}; 