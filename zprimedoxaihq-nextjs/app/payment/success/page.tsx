import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-doc-dark flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">
        <CheckCircle className="w-16 h-16 text-doc-green mx-auto mb-6" />

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Payment Successful
        </h1>

        <p className="text-doc-text/70 mb-8">
          Your PrimeDox AI subscription checkout was completed successfully.
          Your account activation will be processed by the payment system.
        </p>

        <Link
          href="/"
          className="inline-flex px-6 py-3 rounded-lg bg-doc-gold text-doc-dark font-bold hover:bg-doc-gold/90 transition"
        >
          Return to PrimeDox AI
        </Link>
      </div>
    </main>
  );
}
