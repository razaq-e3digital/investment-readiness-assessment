import { SignIn } from '@clerk/nextjs';

export const metadata = {
  title: 'Sign In — E3 Digital Investor Readiness',
  description: 'Sign in to your account',
};

const SignInPage = () => <SignIn />;

export default SignInPage;
