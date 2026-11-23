import * as SecureStore from 'expo-secure-store';

// SecureStore guarda no Keychain (iOS) / Keystore (Android). É assíncrono.
export const storage = {
  get: (chave) => SecureStore.getItemAsync(chave),
  set: (chave, valor) => SecureStore.setItemAsync(chave, String(valor)),
  del: (chave) => SecureStore.deleteItemAsync(chave),
};
