export async function POST(request) {
  try {
    const { prompt, image, type, language } = await request.json()
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY

    let systemPrompt = ''
    const langInstructions = language ? `\nCRITICAL INSTRUCTION: You MUST reply entirely in the ${language} language, regardless of the prompt's language.` : ''

    if (type === 'snakebite') {
      systemPrompt = `You are OnDoc, an emergency AI medical assistant specializing in snake bites in India.
Identify the snake species from symptoms or image.
Always start with "EMERGENCY:".
Format:
EMERGENCY:
🐍 Suspected Snake: [name]
💉 Antidote Needed: [name]
🏥 Tell hospital: "[message]"
⚡ First Aid: [steps]
⚠️ DO NOT: [what not to do]
If serious, add: "BOOK_SPECIALIST: General Physician"${langInstructions}`
    } else if (type === 'image' || image) {
      systemPrompt = `You are OnDoc, an AI medical assistant analyzing a medical image.
- Identify: Rashes, Wounds, Deep Cuts, Snake Bites, or normal skin.
- Severity: mild, moderate, or severe.
- If Rash: suggest "BOOK_SPECIALIST: Dermatologist"
- If Deep Cut/Severe Wound: suggest "BOOK_SPECIALIST: Surgeon"
- If Snake Bite: start "EMERGENCY:", identify species, suggest "BOOK_SPECIALIST: General Physician"
- If Stroke symptoms (description): start "EMERGENCY: STROKE ALERT", suggest "BOOK_SPECIALIST: Neurologist"
- For emergencies, start with "EMERGENCY:".
- Give clear first aid steps.
- Keep under 150 words.${langInstructions}`
    } else {
      systemPrompt = `You are OnDoc, a friendly AI health assistant.
- greeting? respond warmly.
- mild symptoms? give remedies.
- serious (chest pain, stroke, snake, etc)? start "EMERGENCY:".
- If specific condition detected, add: "BOOK_SPECIALIST: [Specialist Name]" (e.g. Dermatologist for rashes, Surgeon for deep cuts, etc).
- Keep under 120 words.${langInstructions}`
    }

    let chatMessages = [
      { role: 'system', content: systemPrompt }
    ]

    if (image) {
      chatMessages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt || 'Identify this medical condition and advise.' },
          { type: 'image_url', image_url: { url: image.startsWith('http') ? image : `data:image/jpeg;base64,${image}` } }
        ]
      })
    } else {
      chatMessages.push({ role: 'user', content: prompt })
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: image ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile',
        messages: chatMessages,
        max_tokens: 400
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Groq API Error Detail:', JSON.stringify(errorData, null, 2))
      return Response.json({ text: `Groq Error (${response.status}): ${errorData.error?.message || 'Unknown error'}` })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || 'Sorry, I could not process that.'
    return Response.json({ text })

  } catch (err) {
    console.error('Error:', err)
    return Response.json({ text: 'Error: ' + err.message })
  }
}