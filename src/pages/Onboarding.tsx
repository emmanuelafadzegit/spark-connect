import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Camera, ArrowRight, ArrowLeft, Loader2, Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createProfile, updateProfile, getInterests, updateProfileInterests, uploadProfilePhoto, addProfilePhoto } from "@/lib/api";
import type { GenderType } from "@/lib/api";
import { toast } from "sonner";

const genderOptions: { value: GenderType; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
];

const Onboarding = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [interests, setInterests] = useState<Array<{ id: string; name: string; emoji: string | null; category: string | null }>>([]);
  
  // Form state
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<GenderType | "">("");
  const [lookingFor, setLookingFor] = useState<GenderType[]>(['male', 'female']);
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/signup");
      return;
    }

    // Load saved name from signup
    const savedName = localStorage.getItem('onboarding_name');
    if (savedName) {
      setDisplayName(savedName);
      localStorage.removeItem('onboarding_name');
    }

    // Load interests
    getInterests().then(({ data }) => {
      setInterests(data);
    });
  }, [user, navigate]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const toggleLookingFor = (genderValue: GenderType) => {
    setLookingFor(prev => 
      prev.includes(genderValue)
        ? prev.filter(g => g !== genderValue)
        : [...prev, genderValue]
    );
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!displayName || !dateOfBirth || !gender) {
        toast.error("Please fill in all fields");
        return;
      }
      if (calculateAge(dateOfBirth) < 18) {
        toast.error("You must be at least 18 years old");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedInterests.length < 3) {
        toast.error("Please select at least 3 interests");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!photoFile) {
        toast.error("Please upload a profile photo");
        return;
      }
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!gender) return;
    
    setLoading(true);

    try {
      // Create profile
      const { error: profileError } = await createProfile({
        display_name: displayName,
        date_of_birth: dateOfBirth,
        gender: gender,
        looking_for: lookingFor,
        bio,
        city,
        is_profile_complete: true,
      });

      if (profileError) throw profileError;

      // Upload photo
      if (photoFile) {
        const { url, error: uploadError } = await uploadProfilePhoto(photoFile);
        if (uploadError) throw uploadError;
        if (url) {
          await addProfilePhoto(url, true);
        }
      }

      // Save interests
      if (selectedInterests.length > 0) {
        await updateProfileInterests(selectedInterests);
      }

      await refreshProfile();
      toast.success("Profile created! Start swiping!");
      navigate("/app");
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Tell us about yourself</h2>
              <p className="text-muted-foreground mt-2">Let's start with the basics</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we call you?"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>I am</Label>
                <div className="grid grid-cols-2 gap-3">
                  {genderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGender(option.value)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        gender === option.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Looking for</Label>
                <div className="grid grid-cols-2 gap-3">
                  {genderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleLookingFor(option.value)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        lookingFor.includes(option.value)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Where are you located?"
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell potential matches about yourself..."
                  className="rounded-xl resize-none"
                  rows={3}
                  maxLength={300}
                />
                <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Your interests</h2>
              <p className="text-muted-foreground mt-2">Select 3-5 things you love</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {interests.map((interest) => (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`px-4 py-2 rounded-full border-2 transition-all ${
                    selectedInterests.includes(interest.id)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="mr-1">{interest.emoji}</span>
                  {interest.name}
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {selectedInterests.length}/5 selected
            </p>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold">Add a photo</h2>
              <p className="text-muted-foreground mt-2">Show your best self!</p>
            </div>

            <div className="flex justify-center">
              <label className="relative cursor-pointer group">
                <div className={`w-48 h-48 rounded-3xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${
                  photoPreview ? 'border-primary' : 'border-border hover:border-primary/50'
                }`}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click to upload</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card rounded-3xl shadow-card p-8">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  s <= step ? 'bg-gradient-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(step - 1)}
                className="flex-1"
                disabled={loading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              variant="hero"
              size="lg"
              onClick={handleNext}
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : step === 3 ? (
                "Complete Profile"
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
