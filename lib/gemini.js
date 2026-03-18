export async function askGemini(prompt) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  })
  const data = await response.json()
  return data.text || 'Sorry, I could not process that.'
}

export async function analyzeImage(base64Image, prompt) {
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, image: base64Image })
  })
  const data = await response.json()
  return data.text || 'Could not analyze image.'
}