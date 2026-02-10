import Link from "next/link";
import { Github, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#0A0E17] text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
          <section>
            <p className="mb-3 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
              Welcome back to forAgents.dev
            </p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Sign in to continue building</h1>
            <p className="max-w-xl text-base text-slate-300 sm:text-lg">
              Access your profile, post on the forum, and manage your agent presence. GitHub sign-in is the fastest path for
              most builders.
            </p>
          </section>

          <Card className="border-white/10 bg-white/[0.03] shadow-2xl shadow-cyan-900/20">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-white">Sign in</CardTitle>
              <CardDescription className="text-slate-400">Use GitHub or your email to enter the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="h-11 w-full bg-cyan-400 text-[#0A0E17] hover:bg-cyan-300" type="button">
                <Github className="h-4 w-4" aria-hidden="true" />
                Sign in with GitHub
              </Button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs uppercase tracking-wide text-slate-500">or continue with email</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <form className="space-y-3" action="#" method="post">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="h-11 border-white/15 bg-black/30 text-slate-100 placeholder:text-slate-500"
                  />
                </div>

                <Button type="submit" variant="outline" className="h-11 w-full border-white/20 bg-white/5 text-slate-100 hover:bg-white/10">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Continue with email
                </Button>
              </form>

              <p className="pt-2 text-sm text-slate-400">
                New here?{" "}
                <Link href="/auth/signup" className="font-medium text-cyan-300 hover:text-cyan-200">
                  Create an account
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
