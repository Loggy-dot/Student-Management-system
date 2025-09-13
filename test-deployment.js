const axios = require('axios');

// Test deployment endpoints
const API_BASE_URL = 'https://student-management-system-p1sf.onrender.com';

async function testDeployment() {
    console.log('🧪 Testing Student Management System Deployment...\n');
    
    const tests = [
        {
            name: 'Health Check',
            url: `${API_BASE_URL}/health`,
            method: 'GET'
        },
        {
            name: 'API Health Check',
            url: `${API_BASE_URL}/api/health`,
            method: 'GET'
        },
        {
            name: 'Get Departments',
            url: `${API_BASE_URL}/api/departments`,
            method: 'GET'
        },
        {
            name: 'Get Students (Enhanced)',
            url: `${API_BASE_URL}/api/students/enhanced`,
            method: 'GET'
        },
        {
            name: 'Get Students (Reports)',
            url: `${API_BASE_URL}/api/students-report`,
            method: 'GET'
        },
        {
            name: 'Get Teachers',
            url: `${API_BASE_URL}/api/teachers`,
            method: 'GET'
        }
    ];

    for (const test of tests) {
        try {
            console.log(`Testing: ${test.name}...`);
            const response = await axios({
                method: test.method,
                url: test.url,
                timeout: 10000
            });
            
            console.log(`✅ ${test.name}: Status ${response.status}`);
            if (Array.isArray(response.data)) {
                console.log(`   📊 Returned ${response.data.length} items`);
            } else if (response.data.message) {
                console.log(`   💬 Message: ${response.data.message}`);
            }
            console.log('');
            
        } catch (error) {
            console.log(`❌ ${test.name}: Failed`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Error: ${error.response.data?.error || error.response.statusText}`);
            } else if (error.code === 'ECONNABORTED') {
                console.log('   Error: Request timeout');
            } else {
                console.log(`   Error: ${error.message}`);
            }
            console.log('');
        }
    }

    // Test login
    try {
        console.log('Testing: Admin Login...');
        const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        
        console.log('✅ Admin Login: Success');
        console.log(`   Token received: ${loginResponse.data.token ? 'Yes' : 'No'}`);
        console.log(`   User role: ${loginResponse.data.user?.role}`);
        console.log('');
        
    } catch (error) {
        console.log('❌ Admin Login: Failed');
        console.log(`   Error: ${error.response?.data?.error || error.message}`);
        console.log('');
    }

    console.log('🏁 Deployment test completed!');
}

testDeployment().catch(console.error);