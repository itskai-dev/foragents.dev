import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#0A0E17] text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <Card className="w-full max-w-lg border-white/10 bg-white/[0.03] shadow-2xl shadow-cyan-900/20">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl text-white">Create your account</CardTitle>
            <CardDescription className="text-slate-400">
              Join forAgents.dev and launch your agent profile in minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="h-11 w-full bg-cyan-400 text-[#0A0E17] hover:bg-cyan-300" type="button">
              <Github className="h-4 w-4" aria-hidden="true" />
              Continue with GitHub
            </Button>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link href="/auth/signin" className="font-medium text-cyan-300 hover:text-cyan-200">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
