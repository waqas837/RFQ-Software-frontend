import { Link } from 'react-router-dom'

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About RFQ System</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing procurement with intelligent automation, transparent processes, and seamless supplier management.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                To streamline procurement processes and empower businesses to make data-driven decisions through intelligent automation and transparent bidding systems.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                We believe that procurement should be simple, efficient, and accessible to businesses of all sizes.
              </p>
            </div>
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-gray-800">Streamlined Procurement</h3>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Security</h3>
              <p className="text-gray-700">
                We prioritize the security and privacy of your data with enterprise-grade encryption and compliance standards.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Efficiency</h3>
              <p className="text-gray-700">
                Our platform automates complex processes to save time and reduce manual errors in procurement workflows.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Transparency</h3>
              <p className="text-gray-700">
                We believe in transparent processes that build trust between buyers and suppliers in the marketplace.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl text-white">👨‍💼</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">John Smith</h3>
              <p className="text-gray-600 mb-2">CEO & Founder</p>
              <p className="text-gray-700 text-sm">
                Former procurement executive with 15+ years of experience in supply chain management.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl text-white">👩‍💻</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sarah Johnson</h3>
              <p className="text-gray-600 mb-2">CTO</p>
              <p className="text-gray-700 text-sm">
                Technology leader with expertise in enterprise software and automation systems.
              </p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl text-white">👨‍🔬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Mike Chen</h3>
              <p className="text-gray-600 mb-2">Head of Product</p>
              <p className="text-gray-700 text-sm">
                Product strategist focused on user experience and business process optimization.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-gray-600 to-gray-800 rounded-lg shadow-lg p-8 mb-12 text-white">
          <h2 className="text-3xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <p className="text-gray-200">Active Companies</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$50M+</div>
              <p className="text-gray-200">Procurement Value</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <p className="text-gray-200">RFQs Processed</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <p className="text-gray-200">Uptime</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ready to Transform Your Procurement?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join hundreds of companies already using our platform to streamline their procurement processes.
          </p>
          <div className="space-x-4">
            <Link 
              to="/register" 
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors"
            >
              Get Started Free
            </Link>
            <Link 
              to="/contact" 
              className="inline-flex items-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
