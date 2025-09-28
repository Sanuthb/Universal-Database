import React from "react";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState(null);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:9000/api/v1/user/register",
        {
          name,
          email,
          password,
        }
      );

      if (response.status === 201) {
        setMessage("Account created successfully!");
        navigate("/dashboard", { replace: true });
      } else {
        setMessage(response.data.message || "Registration failed.");
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message || "An error occurred during registration."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-[var(--primary-color)] flex items-center justify-between">
      {/* Left branding section */}
      <div className="rounded-r-3xl w-1/2 h-full flex items-center justify-center flex-col bg-[var(--primary-color)] text-white">
        <img
          src="./connecta_register.png"
          alt="connecta"
          className="rounded-r-3xl w-full h-full object-cover"
        />
      </div>

      {/* Right form section */}
      <div className="w-1/2 h-full flex items-center justify-center">
        <div className="flex items-center justify-center bg-white w-[392px] min-h-[450px] rounded-2xl shadow shadow-gray-300">
          <div className="w-full h-full flex flex-col p-5">
            {/* Header */}
            <div>
              <h1 className="text-[var(--primary-color)] font-bold text-xl">
                Create your account
              </h1>
              <p className="text-sm">Enter your details below to sign up</p>
            </div>

            {/* Name */}
            <div className="mt-4 flex flex-col gap-2">
              <label className="font-bold">Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-[var(--border-color)] rounded-lg bg-transparent p-2 focus:outline-[var(--primary-color)] shadow-md focus:shadow-[var(--primary-color)]"
              />
            </div>

            {/* Email */}
            <div className="mt-4 flex flex-col gap-2">
              <label className="font-bold">Email</label>
              <input
                type="email"
                required
                placeholder="user@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[var(--border-color)] rounded-lg bg-transparent p-2 focus:outline-[var(--primary-color)] shadow-md focus:shadow-[var(--primary-color)]"
              />
            </div>

            {/* Password */}
            <div className="mt-4 flex flex-col gap-2">
              <label className="font-bold">Password</label>
              <input
                type="password"
                required
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[var(--border-color)] rounded-lg bg-transparent p-2 focus:outline-[var(--primary-color)] shadow-md focus:shadow-[var(--primary-color)]"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center gap-1 w-full bg-[var(--primary-color)] text-white p-2 rounded-lg mt-4 border hover:bg-[var(--secondary-color)] hover:border-[var(--primary-color)] cursor-pointer hover:text-[var(--primary-color)] hover:font-bold transition-all duration-300"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign up"}
            </button>

            {/* Message */}
            {message && (
              <p className="mt-2 text-sm text-center text-red-500">{message}</p>
            )}

            {/* Login link */}
            <div className="mt-4 text-sm w-full flex items-center justify-center">
              <p>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="underline text-[var(--primary-color)]"
                >
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
