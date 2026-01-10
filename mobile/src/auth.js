import AsyncStorage from '@react-native-async-storage/async-storage'
const TOKEN_KEY = 'bienestar_token'

export async function saveToken(token){
  await AsyncStorage.setItem(TOKEN_KEY, token)
}
export async function getToken(){
  return await AsyncStorage.getItem(TOKEN_KEY)
}
export async function clearToken(){
  await AsyncStorage.removeItem(TOKEN_KEY)
}
