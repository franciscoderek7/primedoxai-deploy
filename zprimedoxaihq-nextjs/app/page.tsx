import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AppCard from "@/components/AppCard";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

const apps = [
  {
    name: "PrimeDox AI",
    description: "Constitutional cannabis law. Automated. 20+ years of Doc Weedlaw's expertise at your fingertips.",
    icon: "scale",
    color: "bg-blue-500/20 text-blue-400",
    status: "coming" as const,
  },
  {
    name: "VIGILAX",
    description: "Cybersecurity threat intelligence. Protect your empire from digital threats.",
    icon: "shield",
    color: "bg-red-500/20 text-red-400",
    status: "coming" as const,
  },
  {
    name: "OmniaGuard",
    description: "Public safety AI for first responders. Police, EMS, fire — all in one.",
    icon: "ambulance",
    color: "bg-amber-500/20 text-amber-400",
    status: "coming" as const,
  },
  {
    name: "CleanSwarm",
    description: "AI-powered gig work matching. Find work with a click. Built for the new economy.",
    icon: "broom",
    color: "bg-green-500/20 text-green-400",
    status: "coming" as const,
  },
  {
    name: "Weedlaw Edu",
    description: "Cannabis law education and certification. Learn from the master.",
    icon: "graduation",
    color: "bg-purple-500/20 text-purple-400",
    status: "coming" as const,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-doc-dark">
      <Navbar />
      <Hero />

      <section id="apps" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your <span className="text-doc-gold">Empire</span> Arsenal
            </h2>
            <p className="text-doc-text/70 max-w-2xl mx-auto">
              Five specialized AI powers. One unified command center. Every app connects to the zPrimeDox brain.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => <AppCard key={app.name} {...app} />)}
          </div>
        </div>
      </section>

      <Pricing />

      <section id="about" className="py-20 px-4 bg-gradient-to-b from-doc-dark to-doc-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Built by <span className="text-doc-gold">Doc Weedlaw</span>
          </h2>
          <p className="text-lg text-doc-text/80 mb-8">
            20+ Years Constitutional Advocacy. The #1 Cannabis Constitutional Advocate in Ontario, Canada.
            Building generational wealth through litigation, technology, and unshakeable principles.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-doc-card border border-doc-green/20 rounded-xl">
              <div className="text-3xl font-bold text-doc-gold mb-2">45+</div>
              <div className="text-doc-text/60">Companies</div>
            </div>
            <div className="p-6 bg-doc-card border border-doc-green/20 rounded-xl">
              <div className="text-3xl font-bold text-doc-gold mb-2">20+</div>
              <div className="text-doc-text/60">Years Advocacy</div>
            </div>
            <div className="p-6 bg-doc-card border border-doc-green/20 rounded-xl">
              <div className="text-3xl font-bold text-doc-gold mb-2">8</div>
              <div className="text-doc-text/60">World Firsts</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </main>
  );
}
