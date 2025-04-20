import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                AutoDraft
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-gray-900">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                AI-Powered Grant Writing & Management
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Streamline your grant application process with AI assistance. Create, manage, and submit grant proposals with ease.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/signup"
                  className="bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors text-center"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/demo"
                  className="border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors text-center"
                >
                  Book a Demo
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-lg shadow-xl p-6">
                <img
                  src="/assets/dashboard-preview.svg"
                  alt="Dashboard Preview"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-white"></div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Grant Writers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              AutoDraft combines AI technology with intuitive design to help you create compelling grant proposals faster than ever.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="AI-Powered Content Generation"
              description="Generate high-quality grant content with our advanced AI models. Save time while maintaining your unique voice."
              icon="🤖"
            />
            <FeatureCard
              title="Smart Section Management"
              description="Organize your grant proposal with our intuitive section manager. Drag, drop, and reorder sections with ease."
              icon="📋"
            />
            <FeatureCard
              title="Real-Time Collaboration"
              description="Work together with your team in real-time. See changes as they happen and maintain version history."
              icon="👥"
            />
            <FeatureCard
              title="Compliance Checking"
              description="Ensure your grant meets all requirements with our automated compliance checker. Avoid costly mistakes."
              icon="✓"
            />
            <FeatureCard
              title="Mission Alignment Scoring"
              description="Get instant feedback on how well your grant aligns with the funder's mission and priorities."
              icon="🎯"
            />
            <FeatureCard
              title="Export & Submission"
              description="Export your grant in multiple formats or submit directly to funders through our platform."
              icon="📤"
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How AutoDraft Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform simplifies the grant writing process from start to finish.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Create Your Project"
              description="Start a new grant project and define your objectives, timeline, and budget requirements."
            />
            <StepCard
              number="2"
              title="Generate & Edit Content"
              description="Use our AI to generate initial content, then customize it to match your organization's voice and needs."
            />
            <StepCard
              number="3"
              title="Review & Submit"
              description="Get feedback on compliance and mission alignment, make final adjustments, and submit your grant."
            />
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Grant Writers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our users have to say about AutoDraft.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              quote="AutoDraft has transformed how we approach grant writing. The AI suggestions are incredibly helpful and save us hours of work."
              author="Sarah Johnson"
              role="Grant Director, Community Foundation"
            />
            <TestimonialCard
              quote="The compliance checking feature has prevented us from making costly mistakes. It's like having an expert reviewer on your team."
              author="Michael Chen"
              role="Nonprofit Executive Director"
            />
            <TestimonialCard
              quote="We've increased our grant success rate by 40% since using AutoDraft. The mission alignment scoring is a game-changer."
              author="Lisa Rodriguez"
              role="Development Manager, Arts Organization"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Grant Writing?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of grant writers who are saving time and increasing their success rate with AutoDraft.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-blue-600 px-8 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              to="/demo"
              className="border border-white text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">AutoDraft</h3>
              <p className="text-gray-400">
                AI-powered grant writing and management platform.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-gray-400 hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
                <li><Link to="/demo" className="text-gray-400 hover:text-white">Demo</Link></li>
                <li><Link to="/roadmap" className="text-gray-400 hover:text-white">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link to="/guides" className="text-gray-400 hover:text-white">Guides</Link></li>
                <li><Link to="/webinars" className="text-gray-400 hover:text-white">Webinars</Link></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white">About</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} AutoDraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

const StepCard: React.FC<StepCardProps> = ({ number, title, description }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="text-blue-600 text-4xl mb-4">"</div>
      <p className="text-gray-700 mb-4">{quote}</p>
      <div>
        <p className="font-semibold text-gray-900">{author}</p>
        <p className="text-gray-600 text-sm">{role}</p>
      </div>
    </div>
  );
};

export default Landing; 