import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getUserRole } from "../lib/userService";

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateEmployeeData {
  email: string;
  password: string;
  full_name?: string;
}

interface CreateEmployeeResponse {
  user?: {
    id: string;
    email: string;
  };
  message?: string;
  error?: string;
  details?: any;
}

export default function CreateEmployeeModal({ isOpen, onClose }: CreateEmployeeModalProps) {
  const { session, user } = useAuth();

  console.log("CreateEmployeeModal rendered, isOpen:", isOpen);
  const [formData, setFormData] = useState<CreateEmployeeData>({
    email: "",
    password: "",
    full_name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (!session?.access_token || !user?.id) {
      setError("No authentication token or user ID available");
      setIsSubmitting(false);
      return;
    }

    // Fetch user role from users table
    const userRole = await getUserRole(user.id);
    console.log("User role from users table:", userRole);

    if (userRole !== "salon_owner") {
      setError(`Access denied. Required role: salon_owner, Current role: ${userRole || "none"}`);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("https://coaexobmiuoarcgegnfh.supabase.co/functions/v1/create-employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name || undefined,
        }),
      });

      const data: CreateEmployeeResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      setSuccess(`Employee created successfully! Email: ${data.user?.email}`);
      setFormData({ email: "", password: "", full_name: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ email: "", password: "", full_name: "" });
    setError(null);
    setSuccess(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Employee</h2>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="employee-email">Email *</label>
            <input
              id="employee-email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="employee@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="employee-password">Password *</label>
            <input
              id="employee-password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              placeholder="Enter password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="employee-name">Full Name (Optional)</label>
            <input
              id="employee-name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter full name"
            />
          </div>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <div className="modal-actions">
            <button type="button" onClick={handleClose} className="btn-secondary" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
