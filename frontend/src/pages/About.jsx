import { Link } from 'react-router-dom'
import { useEffect } from 'react'

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // const teamMembers = [
  //   {
  //     name: "Ankit Kumar",
  //     role: "Founder & Physics/Chemistry Expert",
  //     education: "Expert in Physics & Chemistry",
  //     contact: "+91 85289 43187",
  //     image: "/api/placeholder/300/300",
  //     description: "Passionate educator with deep expertise in Physics and Chemistry, dedicated to helping students excel in JEE"
  //   },
  //   {
  //     name: "Abhishek Shukla",
  //     role: "Co-Founder & Mathematics Expert",
  //     education: "Expert in Mathematics",
  //     contact: "+91 77528 42084",
  //     image: "/api/placeholder/300/300",
  //     description: "Mathematics specialist with proven track record in helping students master complex mathematical concepts"
  //   }
  // ]

  const achievements = [
    { number: "5000+", label: "Students Trained", icon: "👨‍🎓" },
    { number: "90.5%", label: "Success Rate", icon: "🎯" },
    { number: "1500+", label: "Questions Bank", icon: "📚" },
    { number: "50+", label: "IIT Selections", icon: "🏆" }
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
              Empowering JEE aspirants with expert guidance and cutting-edge technology since 2025
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
              Founded and led by passionate educators who understand the challenges of JEE preparation 
              and are committed to your success
            </p>
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
                  Founded by passionate educators Ankit Kumar and Abhishek Shukla, 
                  Experts15 was born from a vision to revolutionize JEE preparation through technology and expert guidance.
                </p>
                <p>
                  With deep expertise in Physics, Chemistry, and Mathematics, our founders recognized 
                  the need for a comprehensive platform that combines subject mastery with innovative 
                  testing methodologies to help students excel in JEE.
                </p>
                <p>
                  Developed by <a href="https://abhinova.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 font-semibold underline">abhinova.com</a>, our platform leverages cutting-edge technology 
                  to provide personalized learning experiences and realistic exam simulations.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-primary-600 text-white p-3 rounded-full mr-4 mt-1">
                  <span className="font-bold">2025</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Founded Experts15</h4>
                  
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary-600 text-white p-3 rounded-full mr-4 mt-1">
                  <span className="font-bold">2020</span>
                </div>
                <div>
                  
                 
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-primary-600 text-white p-3 rounded-full mr-4 mt-1">
                  <span className="font-bold">2022</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Expert Content Creation</h4>
                  <p className="text-gray-600">Comprehensive question bank by subject experts</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-accent-600 text-white p-3 rounded-full mr-4 mt-1">
                  <span className="font-bold">2024</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Growing Community</h4>
                  <p className="text-gray-600">Helping students achieve their JEE dreams</p>
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