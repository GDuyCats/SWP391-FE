import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleArrowLeft } from 'lucide-react';
import InputField from '../components/InputField';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', username: '', password: '' })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { id, value } = e.target
        setForm((prev) => ({ ...prev, [id]: value }))
    }

    const handleRegister = async () => {
        try {
            await axios.post(`${BASE_URL}/register`, form)
            console.log('success')
            navigate('/login')
        } catch (error) {
            alert(error?.response?.data?.message || 'Register Failed')
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='relative flex flex-col w-screen h-screen justify-center items-center'>
            <Link to={'/login'} className="absolute top-[10px] left-[20px] font-semibold text-xl flex items-center gap-[10px] cursor-pointer hover:scale-110 transition-transform duration-300">
                <CircleArrowLeft />
                Back to login
            </Link>
            <div className='flex flex-col w-[500px] h-[500px] shadow p-[20px]'>
                <h1 className='text-2xl font-semibold mt-[50px]'>Create a new account  </h1>

                <div className='flex flex-col mt-[80px] space-y-[20px]'>

                    <InputField id="email" label="Email" type="text"
                        value={form.email} onChange={handleChange} />

                    <InputField id="username" label="Username" type="text"
                        value={form.username} onChange={handleChange} />

                    <InputField id="password" label="Password" type="password"
                        value={form.password} onChange={handleChange} />

                    <button
                        type="button"
                        onClick={handleRegister}
                        disabled={loading}
                        className={`flex mx-auto text-2xl font-semibold w-[400px] h-[40px] mt-[20px] 
                                    rounded-full justify-center items-center transition-transform duration-300
                                ${loading
                                ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                : 'bg-black hover:scale-110 cursor-pointer'}`}
                    >
                        <p className="text-white">{loading ? 'Processing...' : 'Continue'}</p>
                    </button>

                </div>
            </div>
        </div>
    )
}

export default Register
