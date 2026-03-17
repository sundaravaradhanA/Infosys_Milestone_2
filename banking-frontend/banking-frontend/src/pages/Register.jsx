import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Sparkles, Check } from "lucide-react";
import bg from "../assets/login-bg.jpg";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          phone: phone,
          kyc_status: "Pending"
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Registration successful! Please login.");
        navigate("/");
      } else {
        alert(data.detail || "Registration failed. Please try again.");
      }

    } catch (err) {
      console.error(err);
      alert("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden py-10"
      style={{ 
        backgroundImage: `url(${bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900/80 via-brand-900/40 to-dark-900/80" />
      
      {/* Floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="shape shape-1 w-96 h-96 bg-brand-500/20 -top-20 -left-20 blur-3xl" />
        <div className="shape shape-2 w-64 h-64 bg-brand-400/20 top-1/3 right-10 blur-3xl" />
        <div className="shape shape-3 w-48 h-48 bg-brand-600/20 bottom-20 left-1/4 blur-3xl" />
      </div>

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
        <div className="glass-card-dark p-8 md:p-10">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30 mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-2">
              Create Account
            </h2>
            <p className="text-dark-400 text-sm">
              Join us and start your digital banking journey
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Name Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Full Name"
                className="input-with-icon bg-dark-800/50 border-dark-600 text-white placeholder-dark-500 focus:ring-brand-500 focus:border-brand-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* Email Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                placeholder="Email address"
                className="input-with-icon bg-dark-800/50 border-dark-600 text-white placeholder-dark-500 focus:ring-brand-500 focus:border-brand-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input-with-icon bg-dark-800/50 border-dark-600 text-white placeholder-dark-500 focus:ring-brand-500 focus:border-brand-500 pr-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Phone Input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Phone Number"
                className="input-with-icon bg-dark-800/50 border-dark-600 text-white placeholder-dark-500 focus:ring-brand-500 focus:border-brand-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2 text-sm">
              <input 
                type="checkbox" 
                className="w-4 h-4 mt-0.5 rounded border-dark-500 bg-dark-700 text-brand-500 focus:ring-brand-500 focus:ring-offset-0"
              />
              <span className="text-dark-400">
                I agree to the{" "}
                <button className="text-brand-400 hover:text-brand-300">Terms of Service</button>
                {" "}and{" "}
                <button className="text-brand-400 hover:text-brand-300">Privacy Policy</button>
              </span>
            </div>

            {/* Register Button */}
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-dark-900 text-dark-500">or</span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-dark-400">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-brand-400 font-semibold hover:text-brand-300 transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-dark-500 text-xs mt-6">
          © 2024 Bank Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Register;

