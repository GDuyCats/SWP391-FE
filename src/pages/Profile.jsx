import { SquareUserRound } from 'lucide-react';
import { SquarePen } from 'lucide-react';
import EditButton from '../components/EditButton';
function Profile() {

    return (
        <div>
            <div className="bg-[#3da642] py-10 px-5 rounded-3xl w-150 mx-auto">
                <h1 className="text-2xl text-white text-center font-extrabold">Profile Details</h1>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between mt-7">
                    <div>
                        <p className="font-bold">My Profile</p>
                        <p className="font-light text-{10px}">You can change your profile details here seamlessly</p>
                    </div>


                    <EditButton />



                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between mt-15 items-center">
                    <div className="flex items-center">
                        <SquareUserRound className='w-20 h-20 text-[#3da642]' />
                        <p className="ml-5">Account Name</p>
                    </div>

                    <EditButton />

                </div>

            </div>

            <div className="max-w-7xl mx-auto">
                <div className="mt-15">
                    <p className="font-bold">Personal Information</p>
                </div>

                <div className="flex justify-between">
                    <div className="mt-8 flex flex-col">
                        <div className="flex gap-40">
                            <div>
                                <p>First Name</p>
                                <p className="font-thin">Tien</p>
                            </div>

                            <div>
                                <p>Last Name</p>
                                <p className="font-thin">Nguyen Ba Minh</p>
                            </div>
                        </div>

                        <div className="flex gap-17.5 mt-8">
                            <div>
                                <p>Email Address</p>
                                <p className="font-thin">nguyentien@gmail.com</p>
                            </div>
                            <div>
                                <p>Phone</p>
                                <p className="font-thin">0123456789</p>
                            </div>
                        </div>
                        <div>
                            <p className="mt-8">Bio</p>
                            <p className="font-thin">Reputation makes the brand</p>
                        </div>


                    </div>

                    <EditButton />
                </div>

            </div>


            <div className="max-w-7xl mx-auto">
                <div className="mt-10">
                    <p className="font-bold">Address</p>
                </div>

                <div className="flex justify-between">
                    <div className="mt-8 flex flex-col">
                        <div className="flex gap-40">
                            <div>
                                <p>Region</p>
                                <p className="font-thin">VietNam</p>
                            </div>

                            <div>
                                <p>City</p>
                                <p className="font-thin">Ho Chi Minh</p>
                            </div>
                        </div>

                        <div className="flex gap-17.5 mt-8">
                            <div>
                                <p>Posted Code</p>
                                <p className="font-thin">70000</p>
                            </div>

                        </div>
                    </div>

                    <EditButton />
                </div>

            </div>


        </div>


    );

}

export default Profile


// const MainPage = () => {
//     return (
//         <div>
//             <div className="py-10 px-5 bg-blue-800 relative">
//                 <div className="flex justify-between">
//                     <h1 className="text-[25px]">Profile Setting</h1>
//                     <div>
//                         <button>call</button>
//                         <button className="ml-4">info</button>
//                     </div>
//                 </div>
//                 <div className="absolute bottom-0">
//                     <button className="bg-blue-300 px-4 border-1 text-black">button 1</button>
//                     <button className="bg-blue-300 px-4 border-1 text-black">button 1</button>
//                     <button className="bg-blue-300 px-4 border-1 text-black">button 1</button>
//                 </div>
//             </div>
//             <div className="max-w-7xl mx-auto mt-10">
//                 <div className="flex justify-between">
//                     <div>
//                         <h1>My profile</h1>
//                         <p>mmmm</p>
//                     </div>
//                     <div>
//                         <button>Export Data</button>
//                         <button className="ml-4">Edit</button>
//                     </div>
//                 </div>
//                 <div></div>
//                 <div></div>
//                 <div></div>
//             </div>
//             <div></div>

//         </div>
//     )
// }

// export default MainPage

