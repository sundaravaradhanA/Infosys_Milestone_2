import React, { useState } from "react";
import { 
  FileCheck, 
  Upload, 
  Check, 
  Clock, 
  Shield, 
  AlertCircle,
  ChevronRight,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  Loader2
} from "lucide-react";

function KYC() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    aadhaarNumber: "",
    panNumber: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpload = async () => {
    setIsUploading(true);
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsUploading(false);
    setUploadComplete(true);
    setCurrentStep(3);
  };

  const steps = [
    { id: 1, title: "Personal Details", icon: User, status: currentStep > 1 ? "complete" : "current" },
    { id: 2, title: "Document Upload", icon: CreditCard, status: currentStep === 2 ? "current" : currentStep > 2 ? "complete" : "pending" },
    { id: 3, title: "Verification", icon: Shield, status: currentStep === 3 ? "current" : "pending" }
  ];

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="card-gradient p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <FileCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">KYC Verification</h2>
            <p className="text-brand-100 text-sm">Complete your identity verification to unlock all features</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                  ${step.status === "complete" ? "bg-success-500" : step.status === "current" ? "bg-brand-500" : "bg-dark-200"}
                `}>
                  {step.status === "complete" ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : (
                    <step.icon className={`w-5 h-5 ${step.status === "current" ? "text-white" : "text-dark-400"}`} />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className={`font-medium ${step.status !== "pending" ? "text-dark-800" : "text-dark-400"}`}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="w-16 md:w-24 h-0.5 mx-4 bg-dark-200">
                  <div 
                    className="h-full bg-success-500 transition-all duration-500"
                    style={{ width: step.status === "complete" ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="card p-6">
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-display font-bold text-dark-800 mb-2">Personal Details</h3>
              <p className="text-dark-500 text-sm">Please fill in your personal information as per your documents</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="As per Aadhaar/PAN"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="input-with-icon"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Date of Birth</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="input-with-icon"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-700 mb-2">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-dark-400" />
                  <textarea
                    name="address"
                    placeholder="Full residential address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="input-with-icon pt-4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input-modern"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="input-modern"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  placeholder="6-digit pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="input-modern"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 mb-2">Aadhaar Number</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  placeholder="12-digit Aadhaar"
                  value={formData.aadhaarNumber}
                  onChange={handleInputChange}
                  className="input-modern"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-dark-700 mb-2">PAN Number</label>
                <input
                  type="text"
                  name="panNumber"
                  placeholder="10-character PAN"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  className="input-modern max-w-md"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="btn-primary flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-display font-bold text-dark-800 mb-2">Document Upload</h3>
              <p className="text-dark-500 text-sm">Upload clear images of your identity and address proofs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Aadhaar Card */}
              <div className="border-2 border-dashed border-dark-200 rounded-xl p-6 text-center hover:border-brand-400 transition-colors cursor-pointer">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-brand-500" />
                </div>
                <h4 className="font-semibold text-dark-800 mb-1">Aadhaar Card</h4>
                <p className="text-sm text-dark-500 mb-4">Upload front and back</p>
                <button className="btn-secondary text-sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </button>
              </div>

              {/* PAN Card */}
              <div className="border-2 border-dashed border-dark-200 rounded-xl p-6 text-center hover:border-brand-400 transition-colors cursor-pointer">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-brand-500" />
                </div>
                <h4 className="font-semibold text-dark-800 mb-1">PAN Card</h4>
                <p className="text-sm text-dark-500 mb-4">Upload clear copy</p>
                <button className="btn-secondary text-sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </button>
              </div>
            </div>

            {/* Selfie with Document */}
            <div className="border-2 border-dashed border-dark-200 rounded-xl p-6 text-center hover:border-brand-400 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-50 flex items-center justify-center">
                <User className="w-8 h-8 text-brand-500" />
              </div>
              <h4 className="font-semibold text-dark-800 mb-1">Selfie with Document</h4>
              <p className="text-sm text-dark-500 mb-4">Take a selfie holding your ID proof</p>
              <button className="btn-secondary text-sm">
                <Upload className="w-4 h-4 mr-2" />
                Take Photo
              </button>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-brand-50 rounded-xl">
              <AlertCircle className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-dark-600">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Documents should be clearly readable</li>
                  <li>File size should be less than 5MB</li>
                  <li>Supported formats: JPG, PNG, PDF</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setCurrentStep(1)}
                className="btn-secondary"
              >
                Back
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="btn-primary flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    Submit Documents
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning-100 flex items-center justify-center">
              <Clock className="w-10 h-10 text-warning-600" />
            </div>
            <h3 className="text-2xl font-display font-bold text-dark-800 mb-2">
              Verification in Progress
            </h3>
            <p className="text-dark-500 mb-6 max-w-md mx-auto">
              Your documents have been submitted successfully. Our team will verify your details within 24-48 hours.
            </p>

            <div className="max-w-sm mx-auto bg-dark-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-dark-500">Application ID</span>
                <span className="font-mono font-medium text-dark-800">KYC-2024-12345</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark-500">Status</span>
                <span className="badge-warning">Under Review</span>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button className="btn-secondary">
                Check Status Later
              </button>
              <button className="btn-primary">
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default KYC;

