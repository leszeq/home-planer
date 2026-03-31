/**
 * E-Signature Integration Library
 * 
 * Strategy: Using BoldSign for free tier (25 docs/month)
 * Easy API and fast integration.
 */

export interface ESignRequest {
  documentName: string
  signerEmail: string
  signerName: string
  file: File | Blob // File is required now
}

export type ESignStatus = 'PENDING' | 'SIGNED' | 'REJECTED'

export const esignProvider = {
  /**
   * Sends a document to BoldSign for signing.
   * This logic should run ON THE SERVER because it uses the secret API KEY.
   */
  async sendForSignature(request: ESignRequest): Promise<{ providerId: string; signUrl: string }> {
    const apiKey = process.env.BOLDSIGN_API_KEY
    if (!apiKey) {
      console.error('BOLDSIGN_API_KEY is not defined in .env.local')
      throw new Error('Konfiguracja e-podpisu jest niekompletna.')
    }

    console.log('BoldSign: Initiating real signature request with file for', request.documentName)

    try {
      // BoldSign API expects multipart/form-data
      const formData = new FormData()
      formData.append('Title', request.documentName)
      formData.append('Message', `Proszę o podpisanie dokumentu: ${request.documentName}`)
      
      /**
       * Signers must be sent as serialized JSON strings for each signer field
       * BoldSign API v1 Documentation requires lowercase keys for the JSON string
       */
      const signer = {
        name: request.signerName,
        emailAddress: request.signerEmail,
        signerType: 'Signer',
        formFields: [
          {
            fieldType: 'Signature',
            pageNumber: 1,
            bounds: { x: 50, y: 50, width: 200, height: 60 }, // Top position for visibility in MVP
            isRequired: true
          }
        ]
      }
      
      formData.append('Signers', JSON.stringify(signer))
      
      // Attach the file
      formData.append('Files', request.file, request.documentName + '.pdf')

      const response = await fetch('https://api.boldsign.com/v1/document/send', {
        method: 'POST',
        headers: {
          'X-API-KEY': apiKey,
          'accept': 'application/json'
          // Do NOT set Content-Type manually, fetch will set multipart/form-data with actual boundary
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('BoldSign API Error (Parsed):', errorData)
        // Extracting specific error message if available
        const errMsg = errorData?.errors 
          ? Object.values(errorData.errors).flat().join(', ') 
          : errorData?.title || 'Błąd API BoldSign'
        
        throw new Error(errMsg)
      }

      const data = await response.json()
      
      return {
        providerId: data.documentId,
        signUrl: `https://app.boldsign.com/document/properties?documentId=${data.documentId}` 
      }
    } catch (error) {
      console.error('ESign Provider Error:', error)
      throw error
    }
  },

  /**
   * Checks status of the signature.
   */
  async checkStatus(providerId: string): Promise<ESignStatus> {
    const apiKey = process.env.BOLDSIGN_API_KEY
    if (!apiKey) return 'PENDING'

    try {
      const response = await fetch(`https://api.boldsign.com/v1/document/properties?documentId=${providerId}`, {
        headers: {
          'X-API-KEY': apiKey,
          'accept': 'application/json'
        }
      })
      
      if (!response.ok) return 'PENDING'
      
      const data = await response.json()
      // Status mapping
      if (data.status === 'Completed') return 'SIGNED'
      if (data.status === 'Declined') return 'REJECTED'
      return 'PENDING'
    } catch (e) {
      return 'PENDING'
    }
  },

  /**
   * Gets a fresh, authorized signing URL for a signer.
   * This link avoids "Access Denied" and "Busy Indicator" issues.
   */
  async getEmbeddedSignLink(documentId: string, signerEmail: string): Promise<string> {
    const apiKey = process.env.BOLDSIGN_API_KEY
    if (!apiKey) throw new Error('Konfiguracja e-podpisu jest niekompletna.')

    const response = await fetch(`https://api.boldsign.com/v1/document/getEmbeddedSignLink?documentId=${documentId}&signerEmail=${signerEmail}`, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'accept': 'application/json'
      }
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err?.title || 'Nie udało się pobrać linku do podpisu.')
    }

    const data = await response.json()
    return data.signLink
  }
}
