// Serviço de login Google (Google Identity Services).
// LGPD: o ID token e o perfil ficam APENAS em memória — nada de email/perfil
// em localStorage. O backend re-valida o token e nunca armazena o email.

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

export interface GoogleProfile {
  name: string;
  picture: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

let idToken: string | null = null;
let profile: GoogleProfile | null = null;
let onLoginCb: ((profile: GoogleProfile) => void) | null = null;

// Decodifica o payload do JWT só para exibir nome/foto (NÃO é usado para
// segurança — a validação real acontece no backend).
function decodeJwt(token: string): any {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return {};
  }
}

function handleCredential(response: { credential: string }) {
  idToken = response.credential;
  const claims = decodeJwt(idToken);
  profile = { name: claims.name || 'Jogador', picture: claims.picture || '' };
  if (onLoginCb) onLoginCb(profile);
}

let initialized = false;

export function initGoogleAuth(onLogin: (profile: GoogleProfile) => void): boolean {
  onLoginCb = onLogin;
  if (!window.google || !CLIENT_ID) return false;
  if (!initialized) {
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredential,
      auto_select: false,
    });
    initialized = true;
  }
  return true;
}

// Renderiza o botão oficial "Entrar com Google" dentro de um elemento.
export function renderGoogleButton(el: HTMLElement) {
  if (!window.google || !CLIENT_ID) return;
  window.google.accounts.id.renderButton(el, {
    theme: 'filled_black',
    size: 'large',
    shape: 'pill',
    text: 'signin_with',
    locale: 'pt-BR',
  });
}

export function getIdToken(): string | null {
  return idToken;
}

export function getProfile(): GoogleProfile | null {
  return profile;
}

export function isConfigured(): boolean {
  return Boolean(CLIENT_ID);
}

export function signOut() {
  idToken = null;
  profile = null;
  try {
    window.google?.accounts.id.disableAutoSelect();
  } catch {
    /* noop */
  }
}
