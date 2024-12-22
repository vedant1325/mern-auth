import React, { useState, useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../Context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const { backendUrl, setLoggedIn,getUserData } = useContext(AppContent);
  const navigate = useNavigate();
  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const SubmitHandler=async(e)=>{
    try {
     e.preventDefault();
     axios.defaults.withCredentials=true
     
     if(state==='Sign Up'){
      const {data}=await axios.post(backendUrl+'/api/auth/register',{name,email,password})
    
      if(data.success){
        setLoggedIn(true);
        getUserData();
        toast.success("New account created");

        navigate('/');
      }
      else{
        toast.error(data.message)
      }

     }
     else{
      const {data}=await axios.post(backendUrl+'/api/auth/login',{email,password})
    
      if(data.success){
        setLoggedIn(true);
        getUserData();
        toast.success('Logged in successfully')
        navigate('/');
      }
      else{
        toast.error(data.message)
      }
     }
     

    } catch (error) {
      toast.error(data.message)
    }

  }

  
  
  return (
    <div className="flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to purple-100 to white-900">
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="error"
        className="absolute left-5 sm:left-2 top-2 w-28 sm:w-44 cursor-pointer"
      />

      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-200">
        <h2 className="text-3xl front-semibold text-white text-center mb-3">
          {state === "Sign Up" ? "Create account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-6">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account"}
        </p>

        <form onSubmit={SubmitHandler}>
          {state === "Sign Up" && (
            <div className="gap-3 mb-4 flex items-center w-full px-5 py-2.5 rounded-full bg-[#333a5c]">
              <img src={assets.person_icon} alt="" />
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className="outline-none bg-transparent"
                type="text"
                placeholder="Full Name"
                required
              />
            </div>
          )}

          <div className="gap-3 mb-4 flex items-center w-full px-5 py-2.5 rounded-full bg-[#333a5c]">
            <img src={assets.mail_icon} alt="" />
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="outline-none bg-transparent"
              type="email"
              placeholder="Email Id"
              required
            />
          </div>

          <div className="gap-3 mb-4 flex items-center w-full px-5 py-2.5 rounded-full bg-[#333a5c]">
            <img src={assets.lock_icon} alt="" />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="outline-none bg-transparent"
              type="password"
              placeholder="Password"
              required
            />
          </div>

          {state === "Login" && (
            <p
              onClick={() => navigate("/reset-password")}
              className="mb-4 text-indigo-200 cursor-pointer hover:underline hover:text-indigo-50"
            >
              Forgot Password{" "}
            </p>
          )}

          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-300 to-indigo-600 text-white hover:from-indigo-400 hover:to-indigo-700 hover:scale-105 hover:shadow-lg hover:border-2 hover:border-indigo-100 transition-all duration-200 ease-in-out">
            {state}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className="text-gray-300 text-center text-xs mt-4">
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="cursor-pointer hover:underline"
            >
              Login here.
            </span>
          </p>
        ) : (
          <p className="text-gray-300 text-center text-xs mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="cursor-pointer hover:underline"
            >
              Sign Up{" "}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
