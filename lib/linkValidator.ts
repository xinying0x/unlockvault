import { Tool } from '../types'

interface LinkValidationResult {
  isValid: boolean
  error?: string
  status?: number
}

export async function validateToolLinks(tool: Tool): Promise<LinkValidationResult> {
  try {
    // Validate each locker link
    for (const [country, url] of Object.entries(tool.lockerLinks)) {
      const result = await validateLink(url)
      if (!result.isValid) {
        return {
          isValid: false,
          error: `Invalid link for ${country}: ${result.error}`,
          status: result.status
        }
      }
    }
    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate links',
      status: 500
    }
  }
}

async function validateLink(url: string): Promise<LinkValidationResult> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UnlockVault/1.0; +https://unlockvault.com)'
      }
    })

    if (!response.ok) {
      return {
        isValid: false,
        error: `Link returned status ${response.status}`,
        status: response.status
      }
    }

    // Check if the response is a redirect
    if (response.redirected) {
      return {
        isValid: false,
        error: 'Link is a redirect',
        status: response.status
      }
    }

    return { isValid: true }
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to reach link',
      status: 500
    }
  }
}

// Schedule periodic link validation
export async function scheduleLinkValidation(tools: Tool[]) {
  const results = await Promise.all(
    tools.map(async (tool) => {
      const validation = await validateToolLinks(tool)
      return {
        toolId: tool.id,
        ...validation
      }
    })
  )

  // Log invalid links
  const invalidLinks = results.filter(result => !result.isValid)
  if (invalidLinks.length > 0) {
    console.error('Invalid links found:', invalidLinks)
    // Here you can add notification logic (email, Slack, etc.)
  }

  return results
} 