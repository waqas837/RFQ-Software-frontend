import { 
  DocumentTextIcon, 
  UserGroupIcon, 
  ChartBarIcon, 
  CogIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PlayIcon,
  SparklesIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const HomePage = () => {
  const features = [
    {
      icon: DocumentTextIcon,
      title: 'Smart RFQ Creation',
      description: 'Smart templates and intelligent form filling for professional RFQs in minutes.',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      gradient: 'from-gray-500 to-gray-600'
    },
    {
      icon: UserGroupIcon,
      title: 'Supplier Network',
      description: 'Connect with verified suppliers and manage relationships with advanced analytics.',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      gradient: 'from-gray-500 to-gray-600'
    },
    {
      icon: ChartBarIcon,
      title: 'Real-time Analytics',
      description: 'Comprehensive dashboards with actionable insights and performance metrics.',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      gradient: 'from-gray-500 to-gray-600'
    },
    {
      icon: CogIcon,
      title: 'Automated Workflows',
      description: 'Streamline approval processes with intelligent automation and notifications.',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      gradient: 'from-gray-500 to-gray-600'
    }
  ]

  const benefits = [
    'Reduce procurement cycle time by 60%',
    'Save 25-30% on procurement costs',
    'Improve supplier relationships by 40%',
    'Ensure 100% compliance and transparency'
  ]

  const stats = [
    { number: '1,000+', label: 'Companies Trust Us', icon: StarIcon },
    { number: '50,000+', label: 'RFQs Created', icon: DocumentTextIcon },
    { number: '60%', label: 'Time Saved', icon: ClockIcon },
    { number: '$5M+', label: 'Cost Savings', icon: CurrencyDollarIcon }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Procurement Director',
      company: 'TechCorp Inc.',
      content: 'SIMPLY PROCURE transformed our procurement process. We\'ve reduced cycle time by 65% and saved over $2M annually.',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face'
    },
    {
      name: 'Michael Chen',
      role: 'Supply Chain Manager',
      company: 'Global Manufacturing',
      content: 'The supplier management features are incredible. We\'ve improved our supplier relationships significantly.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Operations Lead',
      company: 'Innovation Labs',
      content: 'The analytics dashboard gives us insights we never had before. Highly recommended for any procurement team.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                <StarIcon className="w-4 h-4 mr-2" />
                Trusted by 1000+ companies
              </div>

              {/* Main Heading */}
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-gray-800">SimplyProcure</span>
                  <br />
                  <span className="text-gray-600 text-3xl lg:text-4xl font-medium">
                    Smart Procurement, Simplified
                  </span>
                </h1>
              </div>

              {/* Description */}
              <p className="text-xl text-gray-600 leading-relaxed">
                Smart procurement platform that streamlines procurement processes, saves time and gives you complete control over your spend.
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  <CheckIcon className="w-4 h-4 mr-1 text-gray-600" />
                  Smart
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  <CheckIcon className="w-4 h-4 mr-1 text-gray-600" />
                  Real-time Analytics
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  <CheckIcon className="w-4 h-4 mr-1 text-gray-600" />
                  Enterprise Security
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Get Started →
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300">
                  <PlayIcon className="w-5 h-5 mr-2" />
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right Content */}
            <div className="relative">
              {/* Analytics Dashboard Button */}
              <div className="absolute -top-4 -right-4 z-10">
                <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  Analytics Dashboard
                </button>
              </div>

              {/* Smart RFQ Creation Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 relative">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <DocumentTextIcon className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart RFQ Creation</h3>
                    <p className="text-gray-600 mb-4">Smart templates</p>
                    <ul className="space-y-2">
                      <li className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                        Automated form filling
                      </li>
                      <li className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                        Professional templates
                      </li>
                      <li className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-gray-600 rounded-full mr-3"></div>
                        Real-time collaboration
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Supplier Network Button */}
              <div className="mt-6">
                <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <UserGroupIcon className="w-5 h-5 mr-2" />
                  Supplier Network
                </button>
              </div>

              {/* Trusted By Section */}
              <div className="mt-8">
                <p className="text-gray-600 mb-4">Trusted by leading companies</p>
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-600 text-xs font-medium">Microsoft</div>
                  <div className="w-16 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-600 text-xs font-medium">Google</div>
                  <div className="w-16 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-600 text-xs font-medium">Amazon</div>
                  <div className="w-16 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-600 text-xs font-medium">IBM</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 border border-green-200 mb-6">
              <RocketLaunchIcon className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-700">Powerful Features</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Modern Procurement</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From intelligent RFQ creation to advanced analytics, we provide all the tools you need to streamline your procurement process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 mb-6">
                <CheckIcon className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">Proven Results</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Why Leading Companies
                <span className="bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent"> Choose SIMPLY PROCURE</span>
              </h2>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Join hundreds of companies that have transformed their procurement process and achieved remarkable results with SIMPLY PROCURE.
              </p>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start group">
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                      <CheckIcon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mr-4">
                    <ShieldCheckIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise Security</h3>
                    <p className="text-gray-600 leading-relaxed">Bank-level security with end-to-end encryption and SOC 2 compliance</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
                    <ClockIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">24/7 Expert Support</h3>
                    <p className="text-gray-600 leading-relaxed">Round-the-clock customer support with dedicated account managers</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Proven ROI</h3>
                    <p className="text-gray-600 leading-relaxed">Average 300% ROI with payback in less than 6 months</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 border border-purple-200 mb-6">
              <StarIcon className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-700">Customer Success</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Loved by Procurement Teams
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Worldwide</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              See what our customers have to say about their experience with SIMPLY PROCURE.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    <p className="text-gray-500 text-sm">{testimonial.company}</p>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">"{testimonial.content}"</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <GlobeAltIcon className="h-4 w-4 text-gray-300 mr-2" />
              <span className="text-sm font-medium text-gray-300">Multi-Platform</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Access SIMPLY PROCURE
              <span className="bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent"> Anywhere</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Work seamlessly across desktop, tablet, and mobile devices with our responsive platform.
            </p>
          </div>
          
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-3xl mb-6 group-hover:scale-110 transition-transform">
                <ComputerDesktopIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Desktop</h3>
              <p className="text-gray-300 leading-relaxed">Full-featured web application with advanced analytics and reporting</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-3xl mb-6 group-hover:scale-110 transition-transform">
                <DevicePhoneMobileIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Mobile</h3>
              <p className="text-gray-300 leading-relaxed">Native mobile apps for iOS and Android with offline capabilities</p>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-3xl mb-6 group-hover:scale-110 transition-transform">
                <GlobeAltIcon className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">API</h3>
              <p className="text-gray-300 leading-relaxed">RESTful API for seamless integration with your existing systems</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-50 border border-gray-200 mb-6">
              <RocketLaunchIcon className="h-4 w-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Simple Process</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How SIMPLY PROCURE
              <span className="bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent"> Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get started in minutes with our simple 4-step process
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <DocumentTextIcon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create RFQ</h3>
              <p className="text-gray-600">Use our smart templates to create professional RFQs in minutes</p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <UserGroupIcon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Invite Suppliers</h3>
              <p className="text-gray-600">Send invitations to your supplier network or discover new ones</p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <ChartBarIcon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Compare Bids</h3>
              <p className="text-gray-600">Analyze and compare bids with our advanced comparison tools</p>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                  <CheckIcon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Award & Execute</h3>
              <p className="text-gray-600">Award the best bid and generate purchase orders automatically</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 border border-green-200 mb-6">
              <CurrencyDollarIcon className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-700">Transparent Pricing</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Simple,
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Transparent Pricing</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choose the plan that fits your organization's needs. All plans include our core features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Starter</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$99</div>
                <div className="text-gray-600">per month</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Up to 10 RFQs per month</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Basic analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Email support</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Standard templates</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center block"
              >
                Get Started
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 shadow-2xl border-2 border-blue-200 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold">Most Popular</span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Professional</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">$299</div>
                <div className="text-gray-600">per month</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Unlimited RFQs</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Custom templates</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">API access</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center block"
              >
                Start Free Trial
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
                <div className="text-4xl font-bold text-gray-900 mb-2">Custom</div>
                <div className="text-gray-600">contact sales</div>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Everything in Professional</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Dedicated account manager</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">On-premise deployment</span>
                </li>
                <li className="flex items-center">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-gray-700">SLA guarantees</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center block"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-50 border border-purple-200 mb-6">
              <SparklesIcon className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-700">FAQ</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Questions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about SIMPLY PROCURE
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">How long does it take to set up SIMPLY PROCURE?</h3>
              <p className="text-gray-600">You can get started with SIMPLY PROCURE in under 10 minutes. Simply sign up, verify your email, and you'll be ready to create your first RFQ.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Can I integrate SIMPLY PROCURE with my existing systems?</h3>
              <p className="text-gray-600">Yes! SIMPLY PROCURE offers RESTful APIs and webhooks that allow seamless integration with your ERP, CRM, and other business systems.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">What kind of support do you provide?</h3>
              <p className="text-gray-600">We offer comprehensive support including email, live chat, and phone support. Enterprise customers get dedicated account managers.</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Is my data secure?</h3>
              <p className="text-gray-600">Absolutely. We use bank-level encryption, SOC 2 compliance, and regular security audits to ensure your data is always protected.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Fixed Background */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-white/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your
            <span className="text-blue-100"> Procurement Process?</span>
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of companies that have already streamlined their procurement with SIMPLY PROCURE. 
            Start your free trial today and see the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/register"
              className="group bg-white text-blue-600 px-10 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center"
            >
              Start Free Trial
              <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Sign In
            </Link>
          </div>
          <p className="text-blue-200 mt-8 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      
     </div>
   )
 }

export default HomePage

