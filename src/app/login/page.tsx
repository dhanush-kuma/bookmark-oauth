"use client"

import Image from "next/image"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}`
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-sm">

        <h1 className="text-2xl font-semibold text-center mb-6">
          Welcome Back
        </h1>

        <button
          onClick={loginWithGoogle}
          className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-lg py-3 hover:shadow-md transition cursor-pointer bg-white"
        >
          <Image
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google logo"
            width={20}
            height={20}
          />

          <span className="text-gray-700 font-medium">
            Sign in with Google
          </span>
        </button>

      </div>

    </div>
  )
}
