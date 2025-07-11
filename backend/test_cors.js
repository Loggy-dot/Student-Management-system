// Test CORS configuration
const http = require('http');

function testCORS() {
    console.log('🧪 Testing CORS Configuration...\n');

    const options = {
        hostname: 'localhost',
        port: 10000,
        path: '/api/health',
        method: 'OPTIONS',
        headers: {
            'Origin': 'http://localhost:5174',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
        }
    };

    const req = http.request(options, (res) => {
        console.log('Status Code:', res.statusCode);
        console.log('Headers:');
        
        const corsHeaders = {};
        Object.keys(res.headers).forEach(key => {
            if (key.toLowerCase().includes('access-control')) {
                corsHeaders[key] = res.headers[key];
            }
        });
        
        console.log(corsHeaders);
        
        if (res.headers['access-control-allow-origin']) {
            console.log('\n✅ CORS is configured correctly!');
            console.log('✅ Frontend on port 5174 should now work!');
        } else {
            console.log('\n❌ CORS headers not found');
        }
    });

    req.on('error', (err) => {
        console.error('❌ Error:', err.message);
    });

    req.end();
}

testCORS();
