import { useEffect, useState } from 'react';
import { SquareUserRound } from 'lucide-react';
import EditButton from '../components/EditButton';
import { api } from '../services/api';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get("/user/profile"); 
                setProfile(response.data);
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return <p className="text-center mt-10">Loading...</p>;
    if (!profile) return <p className="text-center mt-10 text-red-500">Không có dữ liệu!</p>;

    return (
        <div>
            {/* Header */}
            <div className="bg-[#3da642] py-10 px-5 rounded-3xl w-150 mx-auto">
                <h1 className="text-2xl text-white text-center font-extrabold">Profile Details</h1>
            </div>

            {/* Title */}
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between mt-7">
                    <div>
                        <p className="font-bold">My Profile</p>
                        <p className="font-light text-sm">You can change your profile details here seamlessly</p>
                    </div>
                    <EditButton />
                </div>
            </div>

            {/* Account Name */}
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between mt-15 items-center">
                    <div className="flex items-center">
                        <SquareUserRound className='w-20 h-20 text-[#3da642]' />
                        <p className="ml-5 font-semibold">{profile.accountName}</p>
                    </div>
                    <EditButton />
                </div>
            </div>

            {/* Personal Info */}
            <div className="max-w-7xl mx-auto">
                <div className="mt-15">
                    <p className="font-bold">Personal Information</p>
                </div>

                <div className="flex justify-between">
                    <div className="mt-8 flex flex-col">
                        <div className="flex gap-40">
                            <div>
                                <p>First Name</p>
                                <p className="font-thin">{profile.firstName}</p>
                            </div>

                            <div>
                                <p>Last Name</p>
                                <p className="font-thin">{profile.lastName}</p>
                            </div>
                        </div>

                        <div className="flex gap-17.5 mt-8">
                            <div>
                                <p>Email Address</p>
                                <p className="font-thin">{profile.email}</p>
                            </div>
                            <div>
                                <p>Phone</p>
                                <p className="font-thin">{profile.phone}</p>
                            </div>
                        </div>

                        <div>
                            <p className="mt-8">Bio</p>
                            <p className="font-thin">{profile.bio}</p>
                        </div>
                    </div>

                    <EditButton />
                </div>
            </div>

            {/* Address */}
            <div className="max-w-7xl mx-auto">
                <div className="mt-10">
                    <p className="font-bold">Address</p>
                </div>

                <div className="flex justify-between">
                    <div className="mt-8 flex flex-col">
                        <div className="flex gap-40">
                            <div>
                                <p>Region</p>
                                <p className="font-thin">{profile.region}</p>
                            </div>

                            <div>
                                <p>City</p>
                                <p className="font-thin">{profile.city}</p>
                            </div>
                        </div>

                        <div className="flex gap-17.5 mt-8">
                            <div>
                                <p>Postal Code</p>
                                <p className="font-thin">{profile.postalCode}</p>
                            </div>
                        </div>
                    </div>

                    <EditButton />
                </div>
            </div>
        </div>
    );
}

export default Profile;
