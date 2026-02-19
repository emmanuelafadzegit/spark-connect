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

  // Redirect logic
  useEffect(() => {
    if (authLoading || redirectChecked) return;

    setRedirectChecked(true);

    if (!user) {
      navigate("/signin?redirect=/onboarding", { replace: true });
      return;
    }

    if (hasProfile) {
      toast.success("Welcome back!");
      navigate("/app", { replace: true });
      return;
    }

    const savedName = localStorage.getItem('onboarding_name');
    if (savedName) {
      setDisplayName(savedName);
      localStorage.removeItem('onboarding_name');
    }

    getInterests().then(({ data }) => setInterests(data));
  }, [authLoading, user, hasProfile, navigate, redirectChecked]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photoFiles.length > 6) return toast.error("Maximum 6 photos allowed");

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
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 10 ? [...prev, id] : prev
    );
  };

  const toggleLookingFor = (genderValue: GenderType) => {
    setLookingFor(prev =>
      prev.includes(genderValue) ? prev.filter(g => g !== genderValue) : [...prev, genderValue]
    );
  };

  const toggleRelationshipIntent = (intent: RelationshipIntent) => {
    setRelationshipIntent(prev =>
      prev.includes(intent) ? prev.filter(i => i !== intent) : [...prev, intent]
    );
  };

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!displayName || !dateOfBirth || !gender) return toast.error("Please fill in all required fields");
      if (calculateAge(dateOfBirth) < 18) return toast.error("You must be at least 18 years old");
    } else if (step === 4 && selectedInterests.length < 3) return toast.error("Please select at least 3 interests");
    else if (step === 5 && photoFiles.length === 0) return toast.error("Please upload at least one photo");

    if (step === 5) handleComplete();
    else setStep(prev => prev + 1);
  };

  const handleComplete = async () => {
    if (!gender) return;
    setLoading(true);

    try {
      const profileData = {
        display_name: displayName,
        date_of_birth: dateOfBirth,
        gender,
        looking_for: lookingFor,
        bio,
        city,
        height_cm: feetInchesToCm(heightFeet, heightInches),
        job_title: jobTitle || null,
        company: company || null,
        relationship_intent: relationshipIntent.length ? relationshipIntent : null,
        smoking: smoking || null,
        drinking: drinking || null,
        workout: workout || null,
        diet: diet || null,
        pets: pets || null,
        children: children || null,
        zodiac: zodiac || null,
        is_profile_complete: true,
      };

      const { data: createdProfile, error } = await createProfile(profileData);
      if (error) throw error;
      const profileId = createdProfile?.id;

      for (let i = 0; i < photoFiles.length; i++) {
        const { url, error: uploadError } = await uploadProfilePhoto(photoFiles[i]);
        if (uploadError) throw uploadError;
        if (url) await addProfilePhoto(url, i === 0);
      }

      if (selectedInterests.length && profileId) await updateProfileInterests(selectedInterests, profileId);

      await refreshProfile();
      toast.success("Profile created! Start swiping!");
      navigate("/app", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

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

  if (hasProfile) return null;

  const totalSteps = 5;

  // ...renderStep() remains the same as in your code (steps 1–5 UI)
  // Navigation UI remains the same

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/50 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-card rounded-3xl shadow-card p-6">
          <div className="flex items-center gap-1.5 mb-6">
            {[...Array(totalSteps)].map((_, i) => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i < step ? 'bg-gradient-primary' : 'bg-border'}`} />
            ))}
          </div>
          <div className="flex justify-center mb-4"><BexMatchLogo size="md" showText={false} /></div>
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          <div className="flex gap-3 mt-6">
            {step > 1 && <Button variant="outline" size="lg" onClick={() => setStep(step - 1)} className="flex-1" disabled={loading}><ArrowLeft className="w-4 h-4 mr-2"/>Back</Button>}
            <Button variant="hero" size="lg" onClick={handleNext} className="flex-1" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Creating...</> : step === totalSteps ? "Complete Profile" : <>Next<ArrowRight className="w-4 h-4 ml-2"/></>}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
