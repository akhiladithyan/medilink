export async function POST(request) {
  try {
    const { prompt, image, type } = await request.json()
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY

    let systemPrompt = ''

    if (type === 'snakebite') {
      systemPrompt = `You are OnDoc, an emergency AI medical assistant specializing in snake bites in India.
When given a description of a snake bite:
1. Identify the snake species from symptoms (Common Indian snakes: Cobra, Krait, Russell's Viper, Saw-scaled Viper, King Cobra)
2. Always start with "EMERGENCY:"
3. Format exactly like this:
EMERGENCY:
🐍 Suspected Snake: [snake name]
💉 Antidote Needed: [specific antivenom name]
🏥 Tell hospital: "[exact message]"
⚡ First Aid:
- [step 1]
- [step 2]  
- [step 3]
⚠️ DO NOT: [what not to do]
Keep under 150 words.`
    } else if (type === 'image') {
      systemPrompt = `You are OnDoc, an AI medical assistant analyzing a medical image.
- Describe what you see clearly
- Rate severity: mild, moderate, or severe
- If snake bite: identify species and start with "EMERGENCY:", add antivenom info
- If severe wound or emergency: start with "EMERGENCY:"
- Give clear first aid steps
- Keep under 150 words`
    } else {
      systemPrompt = `You are OnDoc, a friendly and caring AI health assistant for Indian patients. You work inside a healthcare app called MediLink.

      Behavior rules:
-If the user greets you (hi, hello, hey, good morning etc), respond warmly and friendly like "Hi there! 👋 I'm OnDoc, your personal health assistant. How are you feeling today? Tell me your symptoms and I'll help you right away!"
- If they say they are fine or good, respond positively and ask if they need any health advice
- For mild symptoms (fever, headache, cold, cough, stomach ache): give simple home remedies kindly
- For serious symptoms (chest pain, breathing difficulty, snake bite, severe bleeding, unconscious, fainted): start response with "EMERGENCY:"
- For snake bites: always start with "EMERGENCY:" and identify the snake
- Always be warm, friendly and conversational
- Keep responses under 120 words
- For emergencies mention ambulance 108
- Never be robotic, always sound human and caring`

    }

    let messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 400
      })
    })

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || 'Sorry, I could not process that.'
    return Response.json({ text })

  } catch (err) {
    console.error('Error:', err)
    return Response.json({ text: 'Error: ' + err.message })
  }
}