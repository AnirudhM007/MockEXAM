import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-cyber-dark)] bg-cyber-grid flex flex-col font-sans text-gray-200">
      {/* Navbar/Header */}
      <header className="bg-[var(--color-cyber-gray)] border-b border-[var(--color-cyber-highlight)] sticky top-0 z-10 shadow-lg backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Logo */}
            <div className="w-8 h-8 bg-[var(--color-cyber-blue)] rounded flex items-center justify-center text-black font-bold text-xl shadow-[var(--shadow-neon-blue)]">
              C
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Cyber<span className="text-[var(--color-cyber-blue)] text-glow">Exam</span></span>
          </div>

          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search protocols, exploits..."
                className="w-full pl-10 pr-4 py-2 border border-[var(--color-cyber-highlight)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-cyber-blue)] bg-[var(--color-cyber-highlight)] text-white placeholder-gray-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-500">🔍</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-400 hover:text-white">Login</Button>
            <Button className="bg-[var(--color-cyber-blue)] text-black hover:bg-white hover:shadow-[var(--shadow-neon-blue)] font-bold border-none">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero / Categories */}
      <div className="border-b border-[var(--color-cyber-highlight)] py-4 bg-[var(--color-cyber-dark)]">
        <div className="max-w-7xl mx-auto px-4 flex space-x-6 overflow-x-auto text-sm font-medium text-gray-400 scrollbar-hide">
          <span className="text-[var(--color-cyber-blue)] border-b-2 border-[var(--color-cyber-blue)] pb-4 px-2 cursor-pointer text-glow">All Exams</span>
          <span className="hover:text-[var(--color-cyber-blue)] pb-4 px-2 cursor-pointer transition-colors">Ethical Hacking</span>
          <span className="hover:text-[var(--color-cyber-blue)] pb-4 px-2 cursor-pointer transition-colors">Cyber Defense</span>
          <span className="hover:text-[var(--color-cyber-blue)] pb-4 px-2 cursor-pointer transition-colors">Cloud Security</span>
          <span className="hover:text-[var(--color-cyber-blue)] pb-4 px-2 cursor-pointer transition-colors">Management</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Recommended Series */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="w-2 h-8 bg-[var(--color-cyber-blue)] mr-3 rounded-sm shadow-[var(--shadow-neon-blue)]"></span>
            Popular Test Series
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* CEH Card */}
            <Link href="/select-mode?exam=CEH" className="group">
              <Card className="h-full hover:scale-[1.02] transition-transform border border-[var(--color-cyber-highlight)] bg-[var(--color-cyber-gray)] p-0 overflow-hidden flex flex-col group-hover:border-[var(--color-cyber-blue)] group-hover:shadow-[var(--shadow-neon-blue)]">
                <div className="h-1 bg-[var(--color-cyber-blue)] w-full shadow-[var(--shadow-neon-blue)]" />
                <div className="p-6 flex-1 flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white group-hover:text-[var(--color-cyber-blue)] transition-colors">CEH v12</h3>
                    <span className="bg-[var(--color-cyber-green)]/10 text-[var(--color-cyber-green)] border border-[var(--color-cyber-green)]/20 text-xs px-2 py-1 rounded font-medium">Updated</span>
                  </div>
                  <p className="text-gray-400 text-sm">Certified Ethical Hacker - Master the art of ethical hacking with real-world scenarios.</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📚 20 Modules</span>
                    <span>📝 500+ Questions</span>
                  </div>

                  <div className="pt-4 mt-auto">
                    <Button className="w-full bg-[var(--color-cyber-highlight)] text-[var(--color-cyber-blue)] hover:bg-[var(--color-cyber-blue)] hover:text-black border border-[var(--color-cyber-highlight)] font-semibold" variant="secondary">
                      Initialize Sequence
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>

            {/* ISC2 CC Card */}
            <Link href="/select-mode?exam=ISC2_CC" className="group">
              <Card className="h-full hover:scale-[1.02] transition-transform border border-[var(--color-cyber-highlight)] bg-[var(--color-cyber-gray)] p-0 overflow-hidden flex flex-col group-hover:border-[var(--color-cyber-green)] group-hover:shadow-[var(--shadow-neon-green)]">
                <div className="h-1 bg-[var(--color-cyber-green)] w-full shadow-[var(--shadow-neon-green)]" />
                <div className="p-6 flex-1 flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white group-hover:text-[var(--color-cyber-green)] transition-colors">ISC2 CC</h3>
                    <span className="bg-gray-800 text-gray-400 border border-gray-700 text-xs px-2 py-1 rounded font-medium">Beginner</span>
                  </div>
                  <p className="text-gray-400 text-sm">Certified in Cybersecurity - Start your journey with fundamental security principles.</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>📚 5 Domains</span>
                    <span>📝 300+ Questions</span>
                  </div>

                  <div className="pt-4 mt-auto">
                    <Button className="w-full bg-[var(--color-cyber-highlight)] text-[var(--color-cyber-green)] hover:bg-[var(--color-cyber-green)] hover:text-black border border-[var(--color-cyber-highlight)] font-semibold" variant="secondary">
                      Initialize Sequence
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>

          </div>
        </section>

        {/* Features / Upsell */}
        <section className="bg-gradient-to-r from-[var(--color-cyber-blue)]/20 to-[var(--color-cyber-green)]/20 border border-[var(--color-cyber-blue)]/30 rounded-2xl p-8 text-white relative overflow-hidden backdrop-blur-sm">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-3xl font-bold text-glow">Unlock Your Cybersecurity Career</h2>
              <p className="text-gray-300 text-lg">Detailed analytics, real-time ranking, and comprehensive explanations for every question.</p>
              <Button className="bg-[var(--color-cyber-blue)] text-black hover:bg-white border-none px-8 py-3 text-lg font-bold shadow-[var(--shadow-neon-blue)]">Start Practicing Now</Button>
            </div>
            <div className="hidden md:block text-9xl opacity-20 filter grayscale">🛡️</div>
          </div>
        </section>
      </main>
    </div>
  );
}
