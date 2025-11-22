// Groq AI Integration for Studio Assistant
// Real conversational AI like ChatGPT but for audio production

interface GroqResponse {
    response: string
    actions: AudioAction[]
}

interface AudioAction {
    type: 'volume' | 'eq' | 'effect' | 'pan' | 'suggestion'
    trackId?: string
    params: any
    description: string
}

class GroqAI {
    private apiKey: string
    private baseUrl = 'https://api.groq.com/openai/v1/chat/completions'
    private model = 'llama3-8b-8192' // Fast Groq model

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    async chat(message: string, tracks: any[]): Promise<GroqResponse> {
        try {
            const systemPrompt = `You are an expert audio engineer and producer AI assistant. You have a friendly, conversational personality and deep knowledge of audio production.

Current studio setup:
${tracks.map(t => `- ${t.name}: Volume ${Math.round(t.volume * 100)}%, ${t.muted ? 'MUTED' : 'ACTIVE'}, ${t.solo ? 'SOLO' : 'normal'}`).join('\n')}

Your job is to:
1. Have natural conversations about audio production
2. Provide helpful mixing advice
3. When users want to make changes, suggest specific technical actions
4. Explain your reasoning in simple terms
5. Be encouraging and supportive

When suggesting technical changes, format them as JSON at the end of your response:
ACTIONS: [{"type": "volume", "trackId": "track_name", "params": {"volume": 0.8}, "description": "Increased vocals volume"}]

Available action types:
- volume: Change track volume (0.0 to 1.0)
- eq: EQ adjustments {frequency: Hz, gain: dB, type: "boost"/"cut"}
- effect: Add effects {type: "reverb"/"delay"/"compression", amount: 0.0-1.0}
- pan: Stereo positioning (-1.0 left to 1.0 right)

Be conversational and helpful like a real audio engineer would be!`

            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                    stream: false
                })
            })

            if (!response.ok) {
                throw new Error(`Groq API error: ${response.status}`)
            }

            const data = await response.json()
            const aiResponse = data.choices[0].message.content

            // Extract actions from AI response
            const actions = this.extractActions(aiResponse, tracks)
            
            // Clean response (remove action JSON)
            const cleanResponse = aiResponse.replace(/ACTIONS:\s*\[[\s\S]*?\]/, '').trim()

            return {
                response: cleanResponse,
                actions: actions
            }

        } catch (error) {
            console.error('Groq AI error:', error)
            
            // Fallback response
            return {
                response: "I'm having trouble connecting to the AI service right now. But I can still help! Try asking me to 'make vocals louder' or 'add bass to drums'.",
                actions: []
            }
        }
    }

    private extractActions(response: string, tracks: any[]): AudioAction[] {
        try {
            // Look for ACTIONS: [...] in the response
            const actionMatch = response.match(/ACTIONS:\s*(\[[\s\S]*?\])/)
            if (actionMatch) {
                const actionsJson = JSON.parse(actionMatch[1])
                return actionsJson.map((action: any) => ({
                    ...action,
                    trackId: this.findTrackId(action.trackId, tracks)
                }))
            }
        } catch (e) {
            console.log('Could not parse AI actions')
        }

        // Fallback: try to extract actions from natural language
        return this.extractFromNaturalLanguage(response, tracks)
    }

    private findTrackId(trackReference: string, tracks: any[]): string {
        if (!trackReference) return tracks[0]?.id || ''
        
        // Find by exact name match
        let track = tracks.find(t => t.name.toLowerCase() === trackReference.toLowerCase())
        if (track) return track.id

        // Find by partial name match
        track = tracks.find(t => 
            t.name.toLowerCase().includes(trackReference.toLowerCase()) ||
            trackReference.toLowerCase().includes(t.name.toLowerCase())
        )
        
        return track?.id || tracks[0]?.id || ''
    }

    private extractFromNaturalLanguage(response: string, tracks: any[]): AudioAction[] {
        const actions: AudioAction[] = []
        const lowerResponse = response.toLowerCase()

        // Simple pattern matching for common requests
        if (lowerResponse.includes('louder') || lowerResponse.includes('increase volume')) {
            const trackName = this.extractTrackFromText(lowerResponse, tracks)
            if (trackName) {
                actions.push({
                    type: 'volume',
                    trackId: trackName.id,
                    params: { volume: Math.min(1, trackName.volume + 0.2) },
                    description: `AI suggested: Increase ${trackName.name} volume`
                })
            }
        }

        if (lowerResponse.includes('add reverb') || lowerResponse.includes('more reverb')) {
            const trackName = this.extractTrackFromText(lowerResponse, tracks)
            if (trackName) {
                actions.push({
                    type: 'effect',
                    trackId: trackName.id,
                    params: { type: 'reverb', amount: 0.3 },
                    description: `AI suggested: Add reverb to ${trackName.name}`
                })
            }
        }

        return actions
    }

    private extractTrackFromText(text: string, tracks: any[]): any {
        for (const track of tracks) {
            if (text.includes(track.name.toLowerCase())) {
                return track
            }
        }
        return tracks[0] // Default to first track
    }
}

// Export singleton instance
let groqInstance: GroqAI | null = null

export const initGroqAI = (apiKey: string) => {
    groqInstance = new GroqAI(apiKey)
}

export const getGroqAI = (): GroqAI | null => {
    return groqInstance
}

export const isGroqAvailable = (): boolean => {
    return groqInstance !== null
}