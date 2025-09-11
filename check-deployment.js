const https = require('https');

// Replace with your actual Render URL
const baseUrl = process.argv[2] || 'https://your-app-name.onrender.com';

console.log(`🔍 Checking deployment at: ${baseUrl}`);

// Function to make a GET request
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${baseUrl}${path}`;
    console.log(`📡 Testing: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const statusCode = res.statusCode;
          let parsedData;
          
          try {
            parsedData = JSON.parse(data);
          } catch (e) {
            parsedData = { rawHtml: data.substring(0, 100) + '...' };
          }
          
          resolve({
            path,
            statusCode,
            data: parsedData
          });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Check multiple endpoints
async function checkDeployment() {
  try {
    // Check main health endpoint
    const healthCheck = await makeRequest('/health');
    console.log(`✅ Health Check: ${healthCheck.statusCode === 200 ? 'OK' : 'FAILED'}`);
    console.log(healthCheck.data);
    
    // Check API health
    const apiHealth = await makeRequest('/api/health');
    console.log(`✅ API Health: ${apiHealth.statusCode === 200 ? 'OK' : 'FAILED'}`);
    console.log(apiHealth.data);
    
    // Check frontend (just verify it returns HTML)
    const frontend = await makeRequest('/');
    console.log(`✅ Frontend: ${frontend.statusCode === 200 ? 'OK' : 'FAILED'}`);
    
    console.log('\n🎉 Deployment check complete!');
    
    if (healthCheck.statusCode === 200 && apiHealth.statusCode === 200 && frontend.statusCode === 200) {
      console.log('✅ All checks passed! Your deployment is working correctly.');
    } else {
      console.log('⚠️ Some checks failed. Please review the logs above.');
    }
  } catch (error) {
    console.error('❌ Error checking deployment:', error.message);
  }
}

// Run the checks
checkDeployment();