const axios = require('axios');

// Test local endpoints
const API_BASE_URL = 'http://localhost:10000';

async function testLocal() {
    console.log('🧪 Testing Local Student Management System...\n');
    
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
                timeout: 5000
            });
            
            console.log(`✅ ${test.name}: Status ${response.status}`);
            if (Array.isArray(response.data)) {
                console.log(`   📊 Returned ${response.data.length} items`);
                if (response.data.length > 0) {
                    console.log(`   📝 Sample item keys: ${Object.keys(response.data[0]).join(', ')}`);
                }
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
            } else if (error.code === 'ECONNREFUSED') {
                console.log('   Error: Connection refused - server not running?');
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

    console.log('🏁 Local test completed!');
}

testLocal().catch(console.error);