import Button from "../components/createinterview.jsx/Button";
import SessionReadyView from "../components/createinterview.jsx/SessionReadyView";
import { FIXED_JOB_ROLE } from "../components/createinterview.jsx/SessionReadyView";
import FormInput from "../components/createinterview.jsx/FormInput";
import ExpectationsList from "../components/createinterview.jsx/ExpectationsList";
import useCreateInterview from "../hooks/createInterview/createInterviewHook";
import {
  User,
  Mail,
  Lock,

  Sparkles,
  Terminal,
} from "lucide-react";

// Fixed position constant as specified

// Simple email validation pattern


export default function App() {
   const {
    formData,
    touched,
    isSubmitting,
    sessionCode,
    fullNameError,
    emailError,
    isFormValid,
    handleChange,
    handleBlur,
    handleSubmit,
    handleEditDetails,
    error
  } = useCreateInterview();
  

  return (
    <div
      className="relative min-h-screen bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-600/15 selection:text-blue-700"
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Load Inter font cleanly */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Whisper-quiet architectural dot pattern & soft top wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "radial-gradient(#CBD5E1 0.85px, transparent 0.85px)",
            backgroundSize: "24px 24px",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 65%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 65%, transparent 100%)",
          }}
        />
        <div className="absolute -top-24 left-1/2 h-[340px] w-[780px] -translate-x-1/2 rounded-full bg-blue-600/[0.04] blur-3xl" />
      </div>

      {/* Centered Content Container (max-w-1100px) */}
      <main className="relative mx-auto max-w-[1100px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12 md:gap-9 lg:gap-16">
          {/* Left Section – Product Introduction */}
          <section className="md:col-span-6 lg:pt-1">
            {/* Subtle Startup Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
              <Sparkles
                className="h-3.5 w-3.5 text-blue-600"
                aria-hidden="true"
              />
              <span>Voice-First Technical Assessment</span>
            </div>

            <h1 className="mt-5 text-[28px] font-semibold leading-[1.18] tracking-tight text-slate-900 sm:text-4xl lg:text-[38px]">
              Your next opportunity starts with a conversation.
            </h1>

            <p className="mt-4 text-[15px] leading-relaxed text-slate-600 sm:text-base">
              Welcome to Voxi. Take part in an AI-powered voice interview
              designed to understand your technical knowledge, problem-solving
              abilities, and professional experience.
            </p>

            {/* Structured "What to expect" Timeline */}
            <ExpectationsList />
          </section>

          {/* Right Section – Elevated SaaS Form Card */}
          <section className="md:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200/95 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_36px_-12px_rgba(15,23,42,0.08)]">
              {/* Subtle top hairline accent */}
              <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500" />

              <div className="p-6 sm:p-8">
                {!sessionCode ? (
                  <>
                    <div className="mb-6 border-b border-slate-100 pb-5">
                      <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                        Create your interview
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Enter your details to set up your interview session.
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-5"
                    >
                      {/* Field 1: Full Name */}
                      <FormInput
                        id="fullName"
                        name="fullName"
                        type="text"
                        label="Full name"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        icon={User}
                        error={touched.fullName ? fullNameError : ""}
                        disabled={isSubmitting}
                        required
                        autoComplete="name"
                      />

                      {/* Field 2: Email Address */}
                      <FormInput
                        id="email"
                        name="email"
                        type="email"
                        label="Email address"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        icon={Mail}
                        error={touched.email ? emailError : ""}
                        disabled={isSubmitting}
                        required
                        autoComplete="email"
                      />

                      {/* Field 3: Fixed Interview Position */}
                      <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-slate-800">
                          Interview position
                        </label>
                        <div
                          className="flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50/80 px-3.5 text-sm text-slate-900"
                          aria-label="Interview position: Python Developer (Fixed role)"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-200/80 bg-white text-slate-600 shadow-[0_1px_1px_rgba(15,23,42,0.03)]">
                              <Terminal
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />
                            </span>
                            <span className="font-medium text-slate-900">
                              {FIXED_JOB_ROLE}
                            </span>
                          </div>

                          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200/90 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 shadow-[0_1px_1px_rgba(15,23,42,0.02)]">
                            <Lock className="h-3 w-3" aria-hidden="true" />
                            Fixed role
                          </span>
                        </div>
                      </div>

                      {error && (
                        <div
                          role="alert"
                          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                          {error}
                        </div>
                      )}
                      {/* Submit Button & Caption */}
                      <div className="pt-2">
                        <Button
                          type="submit"
                          isLoading={isSubmitting}
                          disabled={!isFormValid || isSubmitting}
                        >
                          {isSubmitting ? (
                            <span>Creating interview...</span>
                          ) : (
                            <span>Create Interview</span>
                          )}
                        </Button>

                        <p className="mt-3.5 text-center text-xs text-slate-500">
                          Your interview session will be created securely. You
                          can review the instructions before starting.
                        </p>
                      </div>
                    </form>
                  </>
                ) : (
                  <SessionReadyView
                    formData={formData}
                    sessionCode={sessionCode}
                    onEditDetails={handleEditDetails}
                  />
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
