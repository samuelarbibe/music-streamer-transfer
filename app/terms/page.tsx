'use client'

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function Terms() {
  return (
    <div className="container mx-auto min-h-screen max-w-xl flex flex-col items-start justify-center gap-4 p-5">
      <Link href='/' className="mb-5"><Button><ArrowLeft /> Back</Button></Link>
      <h1 className="text-2xl font-semibold">Terms and Conditions</h1>

      <p><strong>Effective Date:</strong> [Insert Date]</p>

      <p>{"Welcome to Music Streamer Transfer (\"we\", \"our\", or \"us\"). These Terms and Conditions (\"Terms\") govern your use of our service that facilitates the transfer of playlists and music libraries between music streaming platforms (\"Service\")."}</p>

      <p>By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>

      <h2 className="text-xl font-semibold mt-6">1. Use of Service</h2>
      <p>You may use the Service solely for personal, non-commercial purposes.</p>

      <h2 className="text-xl font-semibold mt-6">2. Third-Party Services</h2>
      <p>Our Service interacts with third-party music streaming services via their official APIs.</p>

      <h2 className="text-xl font-semibold mt-6">3. Intellectual Property</h2>
      <p>All trademarks, logos, and content from third-party platforms remain the property of their respective owners.</p>

      <h2 className="text-xl font-semibold mt-6">4. Limitations and Prohibited Use</h2>
      <p>You agree not to: use the Service for commercial gain without permission.</p>

      <h2 className="text-xl font-semibold mt-6">5. Privacy</h2>
      <p>
        We do not collect, store, or track any personal data or usage analytics.

        All authentication credentials (such as access tokens from music streaming services) are stored locally on your device and never transmitted to our servers. We do not have access to your playlists, account details, or any other user data beyond what is temporarily authorized during session-based interactions with third-party APIs.
      </p>

      <h2 className="text-xl font-semibold mt-6">6. Disclaimers</h2>
      <p>{"The Service is provided \"as is\" and \"as available\"."}</p>

      <h2 className="text-xl font-semibold mt-6">7. Limitation of Liability</h2>
      <p>To the maximum extent permitted by law, we will not be liable for any indirect, incidental, or consequential damages.</p>

      <h2 className="text-xl font-semibold mt-6">8. Changes to Terms</h2>
      <p>We may update these Terms at any time.</p>

      <h2 className="text-xl font-semibold mt-6">10. Contact Us</h2>
      <p>If you have any questions about these Terms, contact us at [support@example.com].</p>
      <Link href='/' className="mt-5"><Button><ArrowLeft /> Back</Button></Link>
    </div>
  )
}