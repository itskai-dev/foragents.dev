import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthCallbackPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[#0A0E17] text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <Card className="w-full max-w-lg border-white/10 bg-white/[0.03] shadow-2xl shadow-cyan-900/20">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl text-white">Authentication callback</CardTitle>
            <CardDescription className="text-slate-400">
              You can safely return to sign in while auth wiring is being finalized.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild className="bg-cyan-400 text-[#0A0E17] hover:bg-cyan-300">
              <Link href="/auth/signin">Go to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
