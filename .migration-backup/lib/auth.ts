export type AuthOptions = {
  pages?: {
    signIn?: string;
  };
  session?: {
    strategy?: "jwt" | "database";
  };
  providers: unknown[];
};

export const authOptions: AuthOptions = {
  pages: {
    signIn: "/auth/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
};
