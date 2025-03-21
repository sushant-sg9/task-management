import type React from "react"
import { FaClipboardList } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { useAuth } from "../../Context/AuthContext"
import { Navigate } from "react-router-dom"

const LoginPage: React.FC = () => {
  const { user, signInWithGoogle } = useAuth()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden">
      <div className="flex w-full md:w-1/2 flex-col justify-center items-start px-8 md:px-16 lg:px-24">
        <div className="max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <FaClipboardList className="text-purple-700 text-2xl" />
            <h1 className="text-2xl font-bold text-purple-700">TaskBuddy</h1>
          </div>

          <p className="text-gray-600 mb-6 text-sm md:text-base">
            Streamline your workflow and track progress effortlessly with our all-in-one task management app.
          </p>

          <button
            onClick={signInWithGoogle}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-900 text-white rounded-xl cursor-pointer hover:scale-105 transform transition-transform duration-300 hover:bg-gray-800 transition-colors"
          >
            <FcGoogle className="text-xl" />
            <span>Continue with Google</span>
          </button>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 bg-gray-50 justify-center items-center relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[85%] max-w-2xl relative z-10">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/task-MQFvXoH6RlqqTZGUujM6l1fRV8evPQ.png"
              alt="TaskBuddy App Preview"
              className="w-full h-auto rounded-lg shadow-xl object-contain max-h-[90vh]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-transparent rounded-full transform scale-[1.3] border border-purple-200/30"></div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

