import React, { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Password reset feature will be connected to the backend.");
  };

  return (
    <div className="min-h-[80vh] flex justify-center items-center">
      <div className="w-full max-w-md p-8 border rounded">
        <h1 className="text-3xl font-bold mb-6">
          Forgot Password
        </h1>

        <form onSubmit={handleSubmit}>
          <label className="block mb-4">
            <div className="mb-2">Email</div>

            <input
              type="email"
              className="w-full border px-3 py-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <button
            className="w-full bg-black text-white py-3"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}