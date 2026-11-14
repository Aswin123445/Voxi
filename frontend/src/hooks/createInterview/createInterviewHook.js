import { useState } from "react";
import { useNavigate } from "react-router-dom";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
import { createInterview } from "../../api/interviewApi";

export default function useCreateInterview() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
  });
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionCode, setSessionCode] = useState("");
  const validateFullName = (value) => {
    if (!value.trim()) {
      return "Full name is required.";
    }
    return "";
  };
  const validateEmail = (value) => {
    if (!value.trim()) {
      return "Email address is required.";
    }
    if (!EMAIL_REGEX.test(value.trim())) {
      return "Please enter a valid email address.";
    }
    return "";
  };
  const fullNameError = validateFullName(formData.fullName);
  const emailError = validateEmail(formData.email);
  const isFormValid = !fullNameError && !emailError;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setTouched({
    fullName: true,
    email: true,
  });

  if (!isFormValid || isSubmitting) {
    return;
  }

  try {
    setIsSubmitting(true);

    const payload = {
      candidate_name: formData.fullName.trim(),
      candidate_email: formData.email.trim(),
      job_role: "Python Developer",
      experience_level: "FRESHER",
    };

    const response = await createInterview(payload);

    console.log("Interview created:", response);

    // Use the actual ID returned by your backend.
    navigate(`/interviews/${response.id}/prepare`);
  } catch (error) {
    console.error("Interview creation failed:", error);

    const message =
      error.response?.data?.detail ||
      "Unable to create your interview. Please try again.";

    setError(message);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleEditDetails = () => {
    setSessionCode("");
  };
  return {
    formData,
    setFormData,
    touched,
    setTouched,
    isSubmitting,
    setIsSubmitting,
    sessionCode,
    setSessionCode,
    fullNameError,
    emailError,
    isFormValid,
    handleChange,
    handleBlur,
    handleSubmit,
    handleEditDetails,
    error
  };
}
