export async function authedFetch(url: string, options: RequestInit = {}, getToken: () => Promise<string | null>) {
  const token = await getToken()
  const headers = new Headers(options.headers || {})
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(url, { ...options, headers })
}

export type GeneratePayload = {
  topic: string
  style?: string
  outline?: string[]
  targetLength?: number
  language?: string
}

export async function generateDraft(getToken: () => Promise<string | null>, payload: GeneratePayload) {
  const res = await authedFetch('/api/generate-and-publish', {
    method: 'POST',
    body: JSON.stringify({ ...payload, publish: false })
  }, getToken)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function publishPost(
  getToken: () => Promise<string | null>,
  payload: GeneratePayload & { platform: 'wordpress' | 'tistory' }
) {
  const body: any = { ...payload, publish: true, platform: payload.platform }
  if (payload.platform === 'wordpress') body.wpOptions = { status: 'draft' }
  if (payload.platform === 'tistory') body.tistoryOptions = { visibility: 3 }
  const res = await authedFetch('/api/generate-and-publish', {
    method: 'POST',
    body: JSON.stringify(body)
  }, getToken)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}