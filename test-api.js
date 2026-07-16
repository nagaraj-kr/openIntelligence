const http = require('http');

http.get('http://localhost:3000/api/admin/data', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode === 500) {
      // Print the first 500 chars of HTML to see the Next.js error
      console.log(data.substring(0, 1000));
      
      // Match the error message in Next.js development HTML response
      const match = data.match(/<title>([^<]+)<\/title>/i);
      if (match) console.log("Extracted Title Error:", match[1]);
    } else {
      console.log("Response:", data.substring(0, 200));
    }
  });
}).on('error', (err) => console.log('Request error:', err.message));
