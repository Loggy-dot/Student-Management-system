const axios = require('axios');

// Debug production deployment
const PROD_URL = 'https://student-management-system-p1sf.onrender.com';

async function debugProduction() {
    console.log('🔍 Debugging Production Deployment...\n');
    
    try {
        // Test health endpoint to get backend info
        console.log('Getting backend status...');
        const healthResponse = await axios.get(`${PROD_URL}/health`);
        console.log('Health Response:', JSON.stringify(healthResponse.data, null, 2));
        console.log('');
        
        // Test API health endpoint
        console.log('Getting API status...');
        const apiHealthResponse = await axios.get(`${PROD_URL}/api/health`);
        console.log('API Health Response:', JSON.stringify(apiHealthResponse.data, null, 2));
        console.log('');
        
        // Test a specific endpoint with more details
        console.log('Testing departments endpoint with detailed error...');
        try {
            const deptResponse = await axios.get(`${PROD_URL}/api/departments`);
            console.log('Departments Response:', JSON.stringify(deptResponse.data, null, 2));
        } catch (error) {
            console.log('Departments Error Details:');
            console.log('- Status:', error.response?.status);
            console.log('- Status Text:', error.response?.statusText);
            console.log('- Headers:', error.response?.headers);
            console.log('- Data:', error.response?.data);
        }
        console.log('');
        
        // Test if the backend is loaded at all
        console.log('Testing backend loading...');
        try {
            const backendTestResponse = await axios.get(`${PROD_URL}/api/nonexistent`);
        } catch (error) {
            console.log('Backend Test Error:');
            console.log('- Status:', error.response?.status);
            console.log('- Data:', error.response?.data);
            
            if (error.response?.data?.error === 'Backend server could not be loaded') {
                console.log('🚨 ISSUE FOUND: Backend module is not loading properly!');
            }
        }
        
    } catch (error) {
        console.error('Error debugging production:', error.message);
    }
}

debugProduction().catch(console.error);