import { Link } from 'react-router-dom'

const About = () => {
  const teamMembers = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Founder & CEO",
      education: "IIT Delhi, PhD Physics",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
      description: "15+ years in JEE coaching with 95% success rate"
    },
    {
      name: "Prof. Anita Sharma",
      role: "Head of Mathematics",
      education: "IIT Bombay, M.Tech",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face",
      description: "Expert in advanced mathematics and problem solving"
    },
    {
      name: "Dr. Vikram Singh",
      role: "Chemistry Expert",
      education: "IIT Kanpur, PhD Chemistry",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face",
      description: "Specialized in organic and physical chemistry"
    }
  ]

  const achievements = [
    { number: "50,000+", label: "Students Trained", icon: "👨‍🎓" },
    { number: "98.5%", label: "Success Rate", icon: "🎯" },
    { number: "15,000+", label: "Questions Bank", icon: "📚" },
    { number: "500+", label: "IIT Selections", icon: "🏆" }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-bg text-white section-padding pt-20">
        <div className="container-custom text-center">
          <div className="bg-black/30 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black mb-6 animate-fade-in text-shadow-strong">
              About Experts15
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto animate-slide-up font-semibold text-shadow">
              Empowering JEE aspirants with expert guidance and cutting-edge technology since 2019
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="section-padding education-bg">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To democratize quality JEE preparation and make it accessible to every student, 
                regardless of their location or background. We believe that with the right guidance 
                and resources, every student can achieve their dream of getting into top engineering colleges.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-lg mr-4 mt-1">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Quality Education for All</h4>
                    <p className="text-gray-600">Making premium JEE coaching accessible to students everywhere</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-lg mr-4 mt-1">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Technology-Driven Learning</h4>
                    <p className="text-gray-600">Leveraging AI and analytics for personalized learning experiences</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-primary-100 p-2 rounded-lg mr-4 mt-1">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Expert Guidance</h4>
                    <p className="text-gray-600">Learn from IIT alumni and experienced JEE mentors</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 p-8 rounded-3xl animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Vision</h3>
              <p className="text-gray-600 mb-6">
                To become India's most trusted and effective JEE preparation platform, 
                helping students not just crack the exam but excel in their engineering careers.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className="text-center p-4 bg-white rounded-xl shadow-md">
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <div className="text-2xl font-bold text-primary-600 mb-1">{achievement.number}</div>
                    <div className="text-sm text-gray-600">{achievement.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="section-padding professional-bg">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Expert Team</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our team consists of IIT alumni, experienced educators, and industry experts 
              dedicated to your JEE success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="card p-6 text-center hover:scale-105 transition-transform duration-300">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-primary-600 font-semibold mb-2">{member.role}</p>
                <p className="text-sm text-gray-500 mb-3">{member.education}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="section-padding education-bg">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-accent-50 to-orange-50 p-8 rounded-3xl">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h3>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2019 by a group of IIT alumni who were passionate about education, 
                  Experts15 started with a simple idea: make quality JEE preparation accessible to everyone.
                </p>
                <p>
                  We noticed that many talented students from smaller cities and towns lacked access 
                  to quality coaching institutes. This inspired us to create a platform that could 
                  deliver the same level of education that students in metro cities receive.
                </p>
                <p>
                  Today, we're proud to have helped over 50,000 students in their JEE journey, 
                  with many of them securing seats in top IITs and NITs across India.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-primary-600 text-white p-3 rounded-full mr-4 mt-1">
                  <span className="font-bold">2019</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Founded Experts15</h4>
                  <p className="text-gray-600">Started with 5 expert teachers and 100 students</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary-600 text-white p-3 rounded-full mr-4 mt-1">
                  <span className="font-bold">2020</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Launched Online Platform</h4>
                  <p className="text-gray-600">Developed our comprehensive mock test system</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary-600 text-white p-3 rounded-full mr-4 mt-1">
                  <span className="font-bold">2022</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">AI-Powered Analytics</h4>
                  <p className="text-gray-600">Introduced personalized learning and rank prediction</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-accent-600 text-white p-3 rounded-full mr-4 mt-1">
                  <span className="font-bold">2024</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">50,000+ Students</h4>
                  <p className="text-gray-600">Reached milestone of helping 50,000+ JEE aspirants</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="section-padding hero-bg text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Join Our Success Story?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Start your JEE preparation journey with India's most trusted mock test platform
          </p>
          <Link to="/signup" className="btn-accent text-lg px-8 py-4">
            Start Your Journey Today
          </Link>
        </div>
      </div>
    </div>
  )
}

export default About