import fs from 'fs';
fetch('http://127.0.0.1:3000/api/gemini/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ transcript: 'Navigate to the product page please.' })
}).then(res => res.json()).then(data => console.log(data)).catch(console.error);
