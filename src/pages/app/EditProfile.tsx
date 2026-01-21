import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Loader2, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { updateProfile, uploadProfilePhoto, addProfilePhoto, deleteProfilePhoto, setPrimaryPhoto, getInterests, updateProfileInterests } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const lifestyleOptions = {
  smoking: [
    { value: "non_smoker", label: "Non-smoker" },
    { value: "social_smoker", label: "Social smoker" },
    { value: "smoker", label: "Smoker" },
  ],
  drinking: [
    { value: "never", label: "Never" },
    { value: "socially", label: "Socially" },
    { value: "often", label: "Often" },
  ],
  workout: [
    { value: "never", label: "Never" },
    { value: "sometimes", label: "Sometimes" },
    { value: "often", label: "Often" },
  ],
  diet: [
    { value: "omnivore", label: "Omnivore" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "vegan", label: "Vegan" },
    { value: "pescatarian", label: "Pescatarian" },
    { value: "other", label: "Other" },
  ],
  children: [
    { value: "have_kids", label: "Have kids" },
    { value: "want_kids", label: "Want kids" },
    { value: "dont_want_kids", label: "Don't want kids" },
    { value: "open_to_kids", label: "Open to kids" },
  ],
  education: [
    { value: "high_school", label: "High School" },
    { value: "some_college", label: "Some College" },
    { value: "bachelors", label: "Bachelor's" },
    { value: "masters", label: "Master's" },
    { value: "doctorate", label: "Doctorate" },
    { value: "trade_school", label: "Trade School" },
    { value: "other", label: "Other" },
  ],
};

const EditProfile = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [interests, setInterests] = useState<any[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    city: "",
    job_title: "",
    company: "",
    school: "",
    height_cm: "",
    smoking: "",
    drinking: "",
    workout: "",
    diet: "",
    children: "",
    education: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        display_name: profile.display_name || "",
        bio: profile.bio || "",
        city: profile.city || "",
        job_title: profile.job_title || "",
        company: profile.company || "",
        school: profile.school || "",
        height_cm: profile.height_cm?.toString() || "",
        smoking: profile.smoking || "",
        drinking: profile.drinking || "",
        workout: profile.workout || "",
        diet: profile.diet || "",
        children: profile.children || "",
        education: profile.education || "",
      });
      setSelectedInterests(profile.profile_interests?.map(pi => pi.interest_id) || []);
    }
    loadInterests();
  }, [profile]);

  const loadInterests = async () => {
    const { data } = await getInterests();
    setInterests(data || []);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates: any = {
        display_name: form.display_name,
        bio: form.bio || null,
        city: form.city || null,
        job_title: form.job_title || null,
        company: form.company || null,
        school: form.school || null,
        height_cm: form.height_cm ? parseInt(form.height_cm) : null,
        smoking: form.smoking || null,
        drinking: form.drinking || null,
        workout: form.workout || null,
        diet: form.diet || null,
        children: form.children || null,
        education: form.education || null,
      };

      const { error } = await updateProfile(updates);
      if (error) throw error;

      await updateProfileInterests(selectedInterests);
      await refreshProfile();
      toast.success("Profile updated!");
      navigate("/app/profile");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url, error } = await uploadProfilePhoto(file);
      if (error) throw error;
      if (url) {
        await addProfilePhoto(url, !profile?.profile_photos?.length);
        await refreshProfile();
        toast.success("Photo added!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deleteProfilePhoto(photoId);
      await refreshProfile();
      toast.success("Photo deleted");
    } catch (error: any) {
      toast.error("Failed to delete photo");
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      await setPrimaryPhoto(photoId);
      await refreshProfile();
      toast.success("Primary photo updated");
    } catch (error: any) {
      toast.error("Failed to update primary photo");
    }
  };

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  if (!profile) return null;

  const photos = profile.profile_photos || [];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-lg hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Edit Profile</h1>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg space-y-8">
        {/* Photos */}
        <section>
          <Label className="text-lg font-semibold mb-4 block">Photos</Label>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((photo) => (
              <div key={photo.id} className="relative aspect-[3/4] rounded-xl overflow-hidden group">
                <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!photo.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(photo.id)}
                      className="p-2 bg-white rounded-full text-primary hover:scale-110 transition-transform"
                      title="Set as primary"
                    >
                      ⭐
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="p-2 bg-white rounded-full text-destructive hover:scale-110 transition-transform"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {photo.is_primary && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full">
                    Main
                  </div>
                )}
              </div>
            ))}
            {photos.length < 6 && (
              <label className="aspect-[3/4] rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                ) : (
                  <>
                    <Plus className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Add</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>
        </section>

        {/* Basic Info */}
        <section className="space-y-4">
          <Label className="text-lg font-semibold">Basic Info</Label>
          
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Write something about yourself..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Where do you live?"
            />
          </div>
        </section>

        {/* Work & Education */}
        <section className="space-y-4">
          <Label className="text-lg font-semibold">Work & Education</Label>
          
          <div className="space-y-2">
            <Label htmlFor="job">Job Title</Label>
            <Input
              id="job"
              value={form.job_title}
              onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              placeholder="What do you do?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="Where do you work?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">School</Label>
            <Input
              id="school"
              value={form.school}
              onChange={(e) => setForm({ ...form, school: e.target.value })}
              placeholder="Where did you study?"
            />
          </div>

          <div className="space-y-2">
            <Label>Education Level</Label>
            <Select value={form.education} onValueChange={(v) => setForm({ ...form, education: v })}>
              <SelectTrigger><SelectValue placeholder="Select education" /></SelectTrigger>
              <SelectContent>
                {lifestyleOptions.education.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Lifestyle */}
        <section className="space-y-4">
          <Label className="text-lg font-semibold">Lifestyle</Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Smoking</Label>
              <Select value={form.smoking} onValueChange={(v) => setForm({ ...form, smoking: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {lifestyleOptions.smoking.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Drinking</Label>
              <Select value={form.drinking} onValueChange={(v) => setForm({ ...form, drinking: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {lifestyleOptions.drinking.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Workout</Label>
              <Select value={form.workout} onValueChange={(v) => setForm({ ...form, workout: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {lifestyleOptions.workout.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Diet</Label>
              <Select value={form.diet} onValueChange={(v) => setForm({ ...form, diet: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {lifestyleOptions.diet.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Children</Label>
            <Select value={form.children} onValueChange={(v) => setForm({ ...form, children: v })}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {lifestyleOptions.children.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Height (cm)</Label>
            <Input
              type="number"
              value={form.height_cm}
              onChange={(e) => setForm({ ...form, height_cm: e.target.value })}
              placeholder="170"
            />
          </div>
        </section>

        {/* Interests */}
        <section className="space-y-4">
          <Label className="text-lg font-semibold">Interests</Label>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <button
                key={interest.id}
                onClick={() => toggleInterest(interest.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedInterests.includes(interest.id)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {interest.emoji} {interest.name}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EditProfile;
