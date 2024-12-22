import React, { useContext } from 'react'
import {assets} from "../assets/assets"
import {useNavigate} from "react-router-dom"
import { AppContent } from '../Context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {
    const navigate = useNavigate();
    const{userData,backendUrl,setUserData,setLoggedIn}=useContext(AppContent);

    const Logout=async()=>{
      try 
      {
        axios.defaults.withCredentials=true;
        const{data}=await axios.post(backendUrl+'/api/auth/logout');

        data.success && setLoggedIn(false);
        data.success && setUserData(false);
        toast.success('Logged Out')
        navigate('/')
        
      } catch (error) {
        toast.error(error.message)
      }
    }


    const sendVerificationOtp=async()=>{
      try {
        axios.defaults.withCredentials=true;

        const{data}=await axios.post(backendUrl+'/api/auth/send-verify-otp');
        if(data.success){
          navigate('/verify-email');
          toast.success(data.message);
        }
        else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }
  return (
    <>
    
    <div className=' bg-gray-100 w-full flex justify-between items-center p-4 sm:p-2'>
      <img src={assets.logo} alt="error" className='w-28 sm:w-44 ' />


{userData?
<div className='w-8 h-8 flex justify-center items-center rounded-full bg-black text-white cursor-pointer relative group '>
{userData.name[0].toUpperCase()}
<div className='absolute hidden group-hover:block right-0 top-0 z-10 pt-10 text-black rounded   '>
  <ul className='list-none m-0 p-2 bg-gray-300 text-sm'>
    {userData.isAccountVerified?' ': <li className='py-1 px-2 hover:bg-gray-200 hover:rounded-lg hover:text-green-900' onClick={sendVerificationOtp}>Verify Email</li> }
    
    <li className='py-1 px-2 pr-10 hover:bg-gray-200 hover:rounded-lg hover:text-red-500  ' onClick={Logout}>Logout</li>
  </ul>
</div>
</div>
:
<button className='flex items-center gap-2 border border-gray-800 rounded-full px-6 py-2 text-gray-800 hover:bg-white hover:border-black-950 transition-all' onClick={()=>navigate('/login')}>Login <img src={assets.arrow_icon} alt="" /></button>
}



      
    </div>
      
      </>
  )
}

export default Navbar
