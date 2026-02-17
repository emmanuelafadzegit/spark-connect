import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, ArrowRight, ArrowLeft, Loader2, Calendar, MapPin, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createProfile, getInterests, updateProfileInterests, uploadProfilePhoto, addProfilePhoto, lifestyleLabels, feetInchesToCm } from "@/lib/api";
import type { GenderType, RelationshipIntent, SmokingStatus, DrinkingStatus, WorkoutStatus, DietType, PetType, ChildrenStatus, ZodiacSign } from "@/lib/api";
import { toast } from "sonner";
import BexMatchLogo from "@/components/BexMatchLogo";

const genderOptions: { value: GenderType; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
];

const relationshipIntentOptions: { value: RelationshipIntent; label: string; icon: string }[] = [
  { value: 'long_term', label: 'Long-term relationship', icon: '💍' },
  { value: 'short_term', label: 'Short-term dating', icon: '📅' },
  { value: 'casual', label: 'Casual', icon: '😎' },
  { value: 'friends', label: 'New friends', icon: '👋' },
  { value: 'figuring_out', label: 'Still figuring it out', icon: '🤔' },
];

const Onboarding = () => {
  const { user, hasProfile, loading: authLoading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [interests, setInterests] = useState<Array<{ id: string; name: string; emoji: string | null; category: string | null }>>([]);
  const [redirectChecked, setRedirectChecked] = useState(false);
  
  // Basic info
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<GenderType | "">("");
  const [lookingFor, setLookingFor] = useState<GenderType[]>(['male', 'female']);
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  
  // Physical
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(8);
  
  // Work & Education
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  
  // Relationship
  const [relationshipIntent, setRelationshipIntent] = useState<RelationshipIntent[]>([]);
  
  // Lifestyle
  const [smoking, setSmoking] = useState<SmokingStatus | "">("");
  const [drinking, setDrinking] = useState<DrinkingStatus | "">("");
  const [workout, setWorkout] = useState<WorkoutStatus | "">("");
  const [diet, setDiet] = useState<DietType | "">("");
  const [pets, setPets] = useState<PetType | "">("");
  const [children, setChildren] = useState<ChildrenStatus | "">("");
  const [zodiac, setZodiac] = useState<ZodiacSign | "">("");
  
  // Interests & Photos
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Redirect logic - run once after auth loading completes
  useEffect(() => {
    if (authLoading || redirectChecked) return;
    
    setRedirectChecked(true);
    
    // If user not logged in, redirect to signup
    if (!user) {
      navigate("/signin?redirect=/onboarding", { replace: true });
      return;
    }

    // If user already has a complete profile, redirect to app
    if (hasProfile) {
      toast.success("Welcome back!");
      navigate("/app", { replace: true });
      return;
    }

    // User is logged in but doesn't have a profile - load onboarding data
    const savedName = localStorage.getItem('onboarding_name');
    if (savedName) {
      setDisplayName(savedName);
      localStorage.removeItem('onboarding_name');
    }

    getInterests().then(({ data }) => {
      setInterests(data);
    });
  }, [authLoading, user, hasProfile, navigate, redirectChecked]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photoFiles.length > 6) {
      toast.error("Maximum 6 photos allowed");
      return;
    }
    
    const newFiles = [...photoFiles, ...files].slice(0, 6);
    setPhotoFiles(newFiles);
    setPhotoPreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : prev.length < 10 ? [...prev, id] : prev
    );
  };

  const toggleLookingFor = (genderValue: GenderType) => {
    setLookingFor(prev => 
      prev.includes(genderValue)
        ? prev.filter(g => g !== genderValue)
        : [...prev, genderValue]
    );
  };

  const toggleRelationshipIntent = (intent: RelationshipIntent) => {
    setRelationshipIntent(prev => 
      prev.includes(intent)
        ? prev.filter(i => i !== intent)
        : [...prev, intent]
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

  const handleNext = () => {
    if (step === 1) {
      if (!displayName || !dateOfBirth || !gender) {
        toast.error("Please fill in all required fields");
        return;
      }
      if (calculateAge(dateOfBirth) < 18) {
        toast.error("You must be at least 18 years old");
        return;
      }
    } else if (step === 4) {
      if (selectedInterests.length < 3) {
        toast.error("Please select at least 3 interests");
        return;
      }
    } else if (step === 5) {
      if (photoFiles.length === 0) {
        toast.error("Please upload at least one photo");
        return;
      }
      handleComplete();
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleComplete = async () => {
    if (!gender) return;
    
    setLoading(true);

    try {
      const profileData: any = {
        display_name: displayName,
        date_of_birth: dateOfBirth,
        gender: gender,
        looking_for: lookingFor,
        bio,
        city,
        height_cm: feetInchesToCm(heightFeet, heightInches),
        job_title: jobTitle || null,
        company: company || null,
        relationship_intent: relationshipIntent.length > 0 ? relationshipIntent : null,
        smoking: smoking || null,
        drinking: drinking || null,
        workout: workout || null,
        diet: diet || null,
        pets: pets || null,
        children: children || null,
        zodiac: zodiac || null,
        is_profile_complete: true,
      };

      const { data: createdProfile, error: profileError } = await createProfile(profileData);
      if (profileError) throw profileError;

      const profileId = createdProfile?.id;

      // Upload photos
      for (let i = 0; i < photoFiles.length; i++) {
        const { url, error: uploadError } = await uploadProfilePhoto(photoFiles[i]);
        if (uploadError) throw uploadError;
        if (url) {
          await addProfilePhoto(url, i === 0);
        }
      }

      // Save interests using the profile ID directly
      if (selectedInterests.length > 0 && profileId) {
        await updateProfileInterests(selectedInterests, profileId);
      }

      await refreshProfile();
      toast.success("Profile created! Start swiping!");
      navigate("/app", { replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading || !redirectChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/50">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <BexMatchLogo size="lg" showText={false} />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render onboarding if user has profile (will redirect)
  if (hasProfile) {
    return null;
  }

  const totalSteps = 5;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Basic Info</h2>
              <p className="text-muted-foreground mt-1">Let's start with the essentials</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Display Name *</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we call you?"
                  className="h-12 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Date of Birth *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="pl-10 h-12 rounded-xl"
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>I am *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {genderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGender(option.value)}
                      className={`p-3 rounded-xl border-2 text-sm transition-all ${
                        gender === option.value
                          ? 'border-primary bg-primary/10 text-primary font-medium'
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
                <div className="grid grid-cols-2 gap-2">
                  {genderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleLookingFor(option.value)}
                      className={`p-3 rounded-xl border-2 text-sm transition-all ${
                        lookingFor.includes(option.value)
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Your city"
                      className="pl-9 h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Height</Label>
                  <div className="flex gap-2">
                    <select
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(Number(e.target.value))}
                      className="flex-1 h-12 rounded-xl border border-input bg-background px-3"
                    >
                      {[4, 5, 6, 7].map(f => (
                        <option key={f} value={f}>{f}'</option>
                      ))}
                    </select>
                    <select
                      value={heightInches}
                      onChange={(e) => setHeightInches(Number(e.target.value))}
                      className="flex-1 h-12 rounded-xl border border-input bg-background px-3"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i} value={i}>{i}"</option>
                      ))}
                    </select>
                  </div>
                </div>
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
            className="space-y-5"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">About You</h2>
              <p className="text-muted-foreground mt-1">Tell potential matches about yourself</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="rounded-xl resize-none min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="What do you do?"
                      className="pl-9 h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Where?"
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>What are you looking for?</Label>
                <div className="flex flex-wrap gap-2">
                  {relationshipIntentOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleRelationshipIntent(option.value)}
                      className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                        relationshipIntent.includes(option.value)
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {option.icon} {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Lifestyle</h2>
              <p className="text-muted-foreground mt-1">Help us find compatible matches</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Smoking</Label>
                <div className="flex flex-wrap gap-2">
                  {(['non_smoker', 'social_smoker', 'smoker'] as SmokingStatus[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSmoking(option)}
                      className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                        smoking === option
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {lifestyleLabels.smoking[option].icon} {lifestyleLabels.smoking[option].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Drinking</Label>
                <div className="flex flex-wrap gap-2">
                  {(['never', 'socially', 'often'] as DrinkingStatus[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDrinking(option)}
                      className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                        drinking === option
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {lifestyleLabels.drinking[option].icon} {lifestyleLabels.drinking[option].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Workout</Label>
                <div className="flex flex-wrap gap-2">
                  {(['never', 'sometimes', 'often'] as WorkoutStatus[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setWorkout(option)}
                      className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                        workout === option
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {lifestyleLabels.workout[option].icon} {lifestyleLabels.workout[option].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pets</Label>
                <div className="flex flex-wrap gap-2">
                  {(['dog', 'cat', 'both', 'other', 'none'] as PetType[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPets(option)}
                      className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                        pets === option
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {lifestyleLabels.pets[option].icon} {lifestyleLabels.pets[option].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Children</Label>
                <div className="flex flex-wrap gap-2">
                  {(['have_kids', 'want_kids', 'dont_want_kids', 'open_to_kids'] as ChildrenStatus[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setChildren(option)}
                      className={`px-4 py-2 rounded-full border-2 text-sm transition-all ${
                        children === option
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {lifestyleLabels.children[option].icon} {lifestyleLabels.children[option].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        const groupedInterests = interests.reduce((acc, interest) => {
          const cat = interest.category || 'Other';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(interest);
          return acc;
        }, {} as Record<string, typeof interests>);

        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Your Interests</h2>
              <p className="text-muted-foreground mt-1">Select 3-10 things you love</p>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {Object.entries(groupedInterests).map(([category, categoryInterests]) => (
                <div key={category} className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {categoryInterests.map((interest) => (
                      <button
                        key={interest.id}
                        type="button"
                        onClick={() => toggleInterest(interest.id)}
                        className={`px-3 py-1.5 rounded-full border-2 text-sm transition-all ${
                          selectedInterests.includes(interest.id)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        {interest.emoji} {interest.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {selectedInterests.length}/10 selected
            </p>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Add Photos</h2>
              <p className="text-muted-foreground mt-1">Show your best self! (Max 6 photos)</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="aspect-square relative">
                  {photoPreviews[index] ? (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                      <img
                        src={photoPreviews[index]}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70"
                      >
                        ✕
                      </button>
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                          Main
                        </div>
                      )}
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-full rounded-2xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
                      <div className="text-center">
                        <Camera className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Add</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              First photo will be your main profile picture
            </p>
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
        <div className="bg-card rounded-3xl shadow-card p-6">
          {/* Progress */}
          <div className="flex items-center gap-1.5 mb-6">
            {[...Array(totalSteps)].map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  i < step ? 'bg-gradient-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>

          {/* Logo */}
          <div className="flex justify-center mb-4">
            <BexMatchLogo size="md" showText={false} />
          </div>

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
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
              ) : step === totalSteps ? (
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
