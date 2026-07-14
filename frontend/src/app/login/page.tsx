"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  loginStudent,
  loginAdmin,
} from "@/lib/auth";

import {
  saveToken,
  saveRole,
  saveUser,
} from "@/lib/storage";

export default function LoginPage() {

  const router = useRouter();

  const [role, setRole] =
    useState("student");

  const [rollNo, setRollNo] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const submit = async () => {

    if (loading) return; // prevent double clicks

    if (!rollNo || !password) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);

    try {

      if (role === "admin") {

        const data = await loginAdmin(rollNo, password);

        saveToken(data.token);
        saveRole("admin");
        saveUser(data.admin);

        window.location.href = "/teacher/sessions";

      } else {

        const data = await loginStudent(rollNo, password);

        saveToken(data.token);
        saveRole("student");
        saveUser(data.student);

        window.location.href = "/student/sessions";

      }

    } catch (error: any) {

      console.error(error);

      alert(
        error?.response?.data?.message ||
        error?.message ||
        "Login Failed"
      );

      setLoading(false); // only reset on error; on success we navigate away

    }

  };

  return (

    <div
      className="
      min-h-screen
      bg-[#0B0B0B]
      flex
      items-center
      justify-center
      p-6
      "
    >

      <div
        className="
        w-full
        max-w-[500px]
        bg-[#111111]
        border
        border-white/10
        rounded-3xl
        p-10
        shadow-2xl
        "
      >

        {/* Logos */}

        <div className="flex justify-center items-center gap-5">

      
         

          <div className="text-center">

            <img
            src="/btc.png"
            alt="CITN"
            className="h-30"
          />

         </div>

        </div>

        {/* Heading */}

        <div className="mt-8 text-center">

          <h1
            className="
            text-4xl
            font-bold
            text-white
            "
          >
            CODE BUILD LAUNCH
          </h1>

          <p
            className="
            text-gray-400
            mt-3
            "
          >
            Classroom Management Platform
          </p>

        </div>

        {/* Role Switch */}

        <div
          className="
          mt-8
          bg-black/30
          p-1
          rounded-xl
          flex
          "
        >

          <button
            onClick={() =>
              setRole("student")
            }
            className={`
            flex-1
            py-3
            rounded-lg
            transition-all
            ${
              role === "student"
                ? "bg-[#B30017] text-white"
                : "text-gray-400"
            }
            `}
          >
            Student
          </button>

          <button
            onClick={() =>
              setRole("admin")
            }
            className={`
            flex-1
            py-3
            rounded-lg
            transition-all
            ${
              role === "admin"
                ? "bg-[#B30017] text-white"
                : "text-gray-400"
            }
            `}
          >
            Admin
          </button>

        </div>

        {/* Inputs */}

        <div className="mt-8 space-y-4">

          <input
            placeholder={
              role === "admin"
                ? "Admin Roll Number"
                : "Student Roll Number"
            }
            value={rollNo}
            onChange={(e) =>
              setRollNo(
                e.target.value
              )
            }
            className="
            w-full
            bg-[#1A1A1A]
            border
            border-white/10
            rounded-xl
            p-4
            text-white
            outline-none
            focus:border-[#B30017]
            "
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="
            w-full
            bg-[#1A1A1A]
            border
            border-white/10
            rounded-xl
            p-4
            text-white
            outline-none
            focus:border-[#B30017]
            "
          />

        </div>

        {/* Login Button */}

        <button
          disabled={loading}
          onClick={submit}
          className="
          w-full
          mt-8
          bg-[#B30017]
          hover:bg-[#8E0012]
          text-white
          py-4
          rounded-xl
          font-semibold
          transition-all
          disabled:opacity-50
          "
        >

          {
            loading
              ? "Logging In..."
              : role === "admin"
              ? "Login as Admin"
              : "Login as Student"
          }

        </button>

        {/* Demo Credentials */}


        {/* Footer */}

        <div
          className="
          text-center
          text-xs
          text-gray-500
          mt-8
          "
        >
          Powered by Build The Circle × Team Eklavya
        </div>

      </div>

    </div>

  );

}