import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-[family-name:var(--font-geist-sans)] overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="animated-blob w-[500px] h-[500px] left-[-200px] top-[100px]" style={{ animationDelay: "0s" }}></div>
      <div className="animated-blob w-[600px] h-[600px] right-[-250px] top-[300px]" style={{ animationDelay: "2s" }}></div>
      <div className="animated-blob w-[400px] h-[400px] left-[30%] bottom-[-100px]" style={{ animationDelay: "4s" }}></div>

      {/* Header */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
              AutoDraft
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-gray-600 hover:text-gray-900 hover:underline underline-offset-4 transition-all">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 hover:underline underline-offset-4 transition-all">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 hover:underline underline-offset-4 transition-all">
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-indigo-600 hover:text-indigo-800 transition px-4 py-2 rounded-md"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="btn-primary hover-lift"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 md:pt-40 md:pb-24 relative">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient animate-fade-in">
            Power Your Grant Writing With AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
            Craft compelling grant proposals with AI-powered assistance, real-time collaboration, and compliance monitoring.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <Link
              href="/login"
              className="btn-primary"
            >
              Start Writing Now
            </Link>
            <Link
              href="/demo"
              className="btn-secondary"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">Why AutoDraft?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover-scale">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4 animate-pulse-gentle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-indigo-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Assistant</h3>
              <p className="text-gray-600">
                GrantBot analyzes your organization&apos;s data and helps craft compelling proposals aligned with funder objectives.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover-scale" style={{ transitionDelay: "0.1s" }}>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 animate-pulse-gentle" style={{ animationDelay: "0.5s" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-purple-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Collaboration</h3>
              <p className="text-gray-600">
                Work together with your team in real-time with presence awareness and conflict resolution.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover-scale" style={{ transitionDelay: "0.2s" }}>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-pulse-gentle" style={{ animationDelay: "1s" }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-green-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Compliance Monitoring</h3>
              <p className="text-gray-600">
                Stay compliant with funder requirements and guidelines with real-time checks and alignment gauges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-16">What Our Users Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative hover-lift">
              <div className="absolute -top-5 left-8 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mb-4 flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                  <Image src="https://randomuser.me/api/portraits/women/45.jpg" alt="Sarah Johnson" width={48} height={48} />
                </div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-gray-500 text-sm">Grant Manager at Education Forward</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"AutoDraft has revolutionized our grant writing process. We've increased our success rate by 35% and cut writing time in half. The AI suggestions are incredibly helpful for targeting specific funders."</p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100 relative hover-lift">
              <div className="absolute -top-5 left-8 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="mb-4 flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                  <Image src="https://randomuser.me/api/portraits/men/32.jpg" alt="Michael Chen" width={48} height={48} />
                </div>
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <p className="text-gray-500 text-sm">Director at Community Health Initiative</p>
                </div>
              </div>
              <p className="text-gray-600 italic">"The real-time collaboration features are game-changing. Our team can work simultaneously on proposals with full visibility. The compliance monitoring has helped us avoid several critical mistakes before submission."</p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white animate-gradient relative overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4 animate-fade-in">Ready to streamline your grant writing?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Join hundreds of organizations using AutoDraft to win more grants with less effort.
          </p>
          <Link
            href="/register"
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition text-lg font-medium shadow-lg hover-lift animate-slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            Get Started for Free
          </Link>
        </div>
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid)" />
          </svg>
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">AutoDraft</h3>
              <p className="text-gray-400">
                AI-powered grant writing platform for nonprofit organizations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/features" className="text-gray-400 hover:text-white transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-white transition">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/roadmap" className="text-gray-400 hover:text-white transition">
                    Roadmap
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-gray-400 hover:text-white transition">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-gray-400 hover:text-white transition">
                    Guides
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-gray-400 hover:text-white transition">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} AutoDraft. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/terms" className="text-gray-400 hover:text-white transition">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
