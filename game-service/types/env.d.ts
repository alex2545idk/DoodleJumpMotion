// types/env.d.ts
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_PARENT_ORIGIN?: string;
      EXPO_PUBLIC_USER_SERVICE?: string;
      EXPO_PUBLIC_SESSION_SERVICE?: string;
      EXPO_PUBLIC_ARENAS_SERVICE?: string;
      EXPO_PUBLIC_MATCHMAKER_SERVICE?: string;
    }
  }
}
export {};
