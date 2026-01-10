// simple auth helper using localStorage with memory fallback
export const TOKEN_KEY = 'bienestar_token'
let tokenCache = null // Memory cache as fallback

export function saveToken(token){
  tokenCache = token
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch(e) {
    console.warn('localStorage not available, using memory cache')
  }
}

export function getToken(){
  // Try localStorage first, fallback to memory cache
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      tokenCache = token
      return token
    }
  } catch(e) {
    console.warn('localStorage read failed')
  }
  return tokenCache
}

export function clearToken(){
  tokenCache = null
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch(e) {
    console.warn('localStorage remove failed')
  }
}
