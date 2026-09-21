declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
}

declare module 'react-hot-toast' {
  const toast: any;
  export default toast;
}

declare module 'next-auth/react' {
  export const signOut: any;
  export const signIn: any;
  export const useSession: any;
}
