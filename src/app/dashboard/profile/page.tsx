import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { User, CreditCard, Phone, MapPin, Building, Flag, ShieldCheck } from "lucide-react";
import { ProfilePictureUpload } from "@/components/dashboard/profile/ProfilePictureUpload";

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;

    const userProfile = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            village: true,
            cell: true,
            sector: true,
        }
    });

    if (!userProfile) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                    My Profile
                </h1>
                <p className="text-slate-500">
                    View your membership information and system roles.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-primary/5 p-8 border-b border-red-100 flex items-center gap-6">
                    <ProfilePictureUpload initialImage={(userProfile as any).profilePicture} />
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{userProfile.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2.5 py-1 bg-red-100 text-primary text-xs font-bold rounded-md capitalize tracking-wide">
                                {userProfile.role.replace('_', ' ').toLowerCase()}
                            </span>
                            {userProfile.isVerified ? (
                                <span className="px-2.5 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-md flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Verified
                                </span>
                            ) : (
                                <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 font-bold text-xs rounded-md">
                                    Pending Verification
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-8 grid gap-8 sm:grid-cols-2">

                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Personal Details</h3>

                        <div className="flex items-start gap-3">
                            <CreditCard className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-slate-500 font-medium">National ID</p>
                                <p className="text-slate-800 font-medium">{userProfile.nationalId}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Phone Number</p>
                                <p className="text-slate-800 font-medium">{userProfile.phone}</p>
                            </div>
                        </div>
                    </div>

                    {/* Location Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Location</h3>

                        <div className="flex items-start gap-3">
                            <Flag className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Sector</p>
                                <p className="text-slate-800 font-medium">{userProfile.sector?.name || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Building className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Cell</p>
                                <p className="text-slate-800 font-medium">{userProfile.cell?.name || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-slate-500 font-medium">Village</p>
                                <p className="text-slate-800 font-medium">{userProfile.village?.name || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
