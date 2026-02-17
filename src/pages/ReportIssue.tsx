import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, AlertTriangle, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import SEOHelmet from "@/components/SEOHelmet";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const reportTopics = [
  { value: "fake_profile", label: "Fake Profile / Catfishing", icon: "🎭" },
  { value: "harassment", label: "Harassment / Bullying", icon: "😡" },
  { value: "inappropriate_content", label: "Inappropriate Content", icon: "🚫" },
  { value: "scam", label: "Scam / Fraud", icon: "💰" },
  { value: "underage", label: "Underage User", icon: "👶" },
  { value: "impersonation", label: "Impersonation", icon: "🪞" },
  { value: "spam", label: "Spam / Advertising", icon: "📢" },
  { value: "hate_speech", label: "Hate Speech / Discrimination", icon: "🛑" },
  { value: "threats", label: "Threats / Violence", icon: "⚠️" },
  { value: "privacy", label: "Privacy Violation", icon: "🔒" },
  { value: "bug", label: "App Bug / Technical Issue", icon: "🐛" },
  { value: "other", label: "Other", icon: "📝" },
];

const ReportIssue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedTopic) {
      toast.error("Please select a topic");
      return;
    }
    if (!description.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    setSubmitting(true);
    try {
      if (user) {
        await supabase.from("reports").insert({
          reporter_id: user.id,
          reported_user_id: user.id, // self-report for general issues
          reason: selectedTopic,
          description: description.trim(),
        });
      }
      setSubmitted(true);
      toast.success("Report submitted successfully");
    } catch {
      toast.error("Failed to submit report. Please email Support@Bexmatch.com");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Report Submitted</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for helping keep BexMatch safe. Our team will review your report within 24-48 hours.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
              <Button onClick={() => { setSubmitted(false); setSelectedTopic(""); setDescription(""); }}>
                Submit Another
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEOHelmet
        title="Report an Issue - BexMatch"
        description="Report issues, suspicious behavior, or safety concerns on BexMatch."
      />
      <Navbar />
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-8">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-8 h-8 text-destructive" />
                <h1 className="text-3xl font-bold">Report an Issue</h1>
              </div>
              <p className="text-muted-foreground">
                Help us keep BexMatch safe. Select the category that best describes your concern.
              </p>
            </div>

            {/* Topic Selection */}
            <div className="mb-6">
              <Label className="text-base font-semibold mb-3 block">What would you like to report?</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {reportTopics.map((topic) => (
                  <button
                    key={topic.value}
                    type="button"
                    onClick={() => setSelectedTopic(topic.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left text-sm transition-all ${
                      selectedTopic === topic.value
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-lg">{topic.icon}</span>
                    <span>{topic.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 space-y-2">
              <Label className="text-base font-semibold">Describe the issue</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide as much detail as possible. Include usernames, dates, and any relevant information..."
                className="min-h-[150px] rounded-xl"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">{description.length}/2000</p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !selectedTopic || !description.trim()}
              className="w-full"
              size="lg"
            >
              {submitting ? "Submitting..." : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Submit Report
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              For urgent matters, email us at{" "}
              <a href="mailto:Support@Bexmatch.com" className="text-primary underline">
                Support@Bexmatch.com
              </a>
            </p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ReportIssue;
