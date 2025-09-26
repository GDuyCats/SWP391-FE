import { Link } from "react-router-dom"

function Login() {
  return (
    <div className='relative flex flex-col w-screen h-screen justify-center items-center'>
      <h1 className="absolute top-[10px] left-[10px] font-bold text-2xl">2NDEV</h1>
      <div className='flex flex-col w-[500px] h-[500px] shadow p-[20px]'>
        <h1 className='text-2xl font-semibold mt-[50px]'>Login or sign up </h1>

        <div className='flex flex-col mt-[80px] space-y-[20px]'>

          <div className="relative w-full">
            <input
              type="text"
              id="username"
              placeholder=""
              className="peer w-full border border-gray-300 rounded-full px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400"
            />
            <label
              htmlFor="username"
              className="absolute left-3 top-2 text-gray-500 transition-all 
               peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
               peer-focus:-top-3 peer-focus:left-2 peer-focus:text-sm peer-focus:text-blue-500 bg-white px-1"
            >
              Username
            </label>
          </div>

          <div className="relative w-full">
            <input
              type="text"
              id="password"
              placeholder=""
              className="peer w-full border border-gray-300 rounded-full px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400"
            />

            <label
              htmlFor="password"
              className="absolute left-3 top-2 text-gray-500 transition-all 
               peer-placeholder-shown:top-2 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base
               peer-focus:-top-3 peer-focus:left-2 peer-focus:text-sm peer-focus:text-blue-500 bg-white px-1"
            >
              Password
            </label>
          </div>

          <div className="flex mx-auto text-2xl cursor-pointer font-semibold w-[400px] h-[40px] mt-[20px] rounded-full bg-black justify-center items-center hover:scale-110 transition-transform duration-300">
            <p className="text-white">Login</p> 
          </div>

          <p className="text-xs mx-auto cursor-pointer hover:scale-110 transition-transform duration-300">Don't have an account ? </p>

          <Link to = {'/register'} className="mx-auto cursor-pointer hover:underline">Creat a new account ! </Link>

        </div>
      </div>
    </div>
  )
}

export default Login
