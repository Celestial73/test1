import { MapPin, Briefcase, GraduationCap, Music, Camera, Plane, Coffee, Edit2, Check, X as XIcon, Trash2, ChevronLeft, ChevronRight, Plus, Info } from 'lucide-react';
import { useState } from 'react';
import { Page } from '@/components/Page.tsx';

export function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showAddField, setShowAddField] = useState(false);
    const [showAddInterest, setShowAddInterest] = useState(false);
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldValue, setNewFieldValue] = useState('');
    const [newInterest, setNewInterest] = useState('');
    const [profileData, setProfileData] = useState({
        name: 'Sarah',
        age: '28',
        location: 'New York, NY',
        distance: '2',
        photos: [
            'https://images.unsplash.com/photo-1594318223885-20dc4b889f9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHdvbWFuJTIwc21pbGluZ3xlbnwxfHx8fDE3NjU2MDQ2NDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
            'https://images.unsplash.com/photo-1573418944421-11c3c8c5c21b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMG91dGRvb3IlMjBoaWtpbmd8ZW58MXx8fHwxNzY1NjU1MjE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
            'https://images.unsplash.com/photo-1581065112742-eb9b90ecf0a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGNvZmZlZSUyMHNob3B8ZW58MXx8fHwxNjU1ODg5MjF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        ],
        bio: 'Adventurous mf and coffee enthusiast ☕ Love exploring new hiking trails and trying different cuisines. Always up for spontaneous road trips and deep conversations.',
        work: 'Product Designer',
        education: 'NYU, Design',
        showBio: true,
        showWork: true,
        showEducation: true,
        showLocation: true,
        showInterests: true,
        customFields: [] as Array<{ id: string; name: string; value: string }>,
        interests: [
            { id: '1', name: 'Music', icon: 'Music', color: 'pink' },
            { id: '2', name: 'Photography', icon: 'Camera', color: 'purple' },
            { id: '3', name: 'Travel', icon: 'Plane', color: 'blue' },
            { id: '4', name: 'Coffee', icon: 'Coffee', color: 'amber' },
        ] as Array<{ id: string; name: string; icon: string; color: string }>,
    });

    const handleSave = () => {
        setIsEditing(false);
        setShowAddField(false);
        setShowAddInterest(false);
        // Here you would typically save to a backend
    };

    const handleCancel = () => {
        setIsEditing(false);
        setShowAddField(false);
        setShowAddInterest(false);
        // Reset to original data if needed
    };

    const nextPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev + 1) % profileData.photos.length);
    };

    const prevPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev - 1 + profileData.photos.length) % profileData.photos.length);
    };

    const deleteSection = (section: string) => {
        setProfileData({ ...profileData, [section]: false });
    };

    const addCustomField = () => {
        if (newFieldName.trim() && newFieldValue.trim()) {
            const newField = {
                id: Date.now().toString(),
                name: newFieldName,
                value: newFieldValue,
            };
            setProfileData({
                ...profileData,
                customFields: [...profileData.customFields, newField],
            });
            setNewFieldName('');
            setNewFieldValue('');
            setShowAddField(false);
        }
    };

    const deleteCustomField = (id: string) => {
        setProfileData({
            ...profileData,
            customFields: profileData.customFields.filter((field) => field.id !== id),
        });
    };

    const updateCustomField = (id: string, key: 'name' | 'value', newValue: string) => {
        setProfileData({
            ...profileData,
            customFields: profileData.customFields.map((field) =>
                field.id === id ? { ...field, [key]: newValue } : field
            ),
        });
    };

    const addInterest = () => {
        if (newInterest.trim()) {
            const newInterestObj = {
                id: Date.now().toString(),
                name: newInterest,
                icon: 'Music', // Default icon, can be changed based on user input
                color: 'pink', // Default color, can be changed based on user input
            };
            setProfileData({
                ...profileData,
                interests: [...profileData.interests, newInterestObj],
            });
            setNewInterest('');
            setShowAddInterest(false);
        }
    };

    const deleteInterest = (id: string) => {
        setProfileData({
            ...profileData,
            interests: profileData.interests.filter((interest) => interest.id !== id),
        });
    };

    const getIconComponent = (iconName: string) => {
        const icons: { [key: string]: any } = {
            Music,
            Camera,
            Plane,
            Coffee,
        };
        return icons[iconName] || Music;
    };

    const getColorClasses = (color: string) => {
        const colors: { [key: string]: { bg: string; border: string; text: string } } = {
            pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-500' },
            purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-500' },
            blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-500' },
            amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
        };
        return colors[color] || colors.pink;
    };

    return (
        <Page>
            <div className="h-full overflow-y-auto bg-white">
                {/* Main Profile Image with Name Overlay - Tinder Style with Swipe */}
                <div className="relative">
                    <img
                        src={profileData.photos[currentPhotoIndex]}
                        alt="Profile"
                        className="w-full h-[75vh] object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* Photo Navigation Arrows */}
                    {profileData.photos.length > 1 && (
                        <>
                            <button
                                onClick={prevPhoto}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                onClick={nextPhoto}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Photo Indicators */}
                    <div className="absolute top-3 left-0 right-0 flex gap-1 px-3">
                        {profileData.photos.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1 flex-1 rounded-full transition-all ${index === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Edit Photo Button */}
                    {isEditing && (
                        <button className="absolute top-12 right-5 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <Camera className="w-5 h-5 text-gray-700" />
                        </button>
                    )}

                    {/* Edit Button (top right when not editing) */}
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute top-5 right-5 px-4 py-2 bg-white rounded-full flex items-center gap-2 shadow-lg"
                        >
                            <Edit2 className="w-4 h-4 text-gray-700" />
                            <span className="text-sm">Edit</span>
                        </button>
                    )}

                    {/* Name and Age - Positioned at bottom of image */}
                    <div className="absolute bottom-5 left-5 text-white">
                        {isEditing ? (
                            <div className="flex items-end gap-2">
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="text-5xl bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-lg px-3 py-1 text-white placeholder-white/60 w-40"
                                    placeholder="Name"
                                />
                                <input
                                    type="text"
                                    value={profileData.age}
                                    onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                                    className="text-5xl bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-lg px-3 py-1 text-white placeholder-white/60 w-20"
                                    placeholder="Age"
                                />
                            </div>
                        ) : (
                            <h1 className="text-5xl mb-1">{profileData.name}, {profileData.age}</h1>
                        )}
                        <div className="flex items-center gap-1.5 mt-2">
                            <MapPin className="w-4 h-4" />
                            <span className="text-base">{profileData.distance} miles away</span>
                        </div>
                    </div>
                </div>

                {/* Save/Cancel Buttons */}
                {isEditing && (
                    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-3 flex gap-3">
                        <button
                            onClick={handleCancel}
                            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center gap-2 active:bg-gray-200"
                        >
                            <XIcon className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 py-2.5 bg-pink-500 text-white rounded-xl flex items-center justify-center gap-2 active:bg-pink-600"
                        >
                            <Check className="w-4 h-4" />
                            Save
                        </button>
                    </div>
                )}

                {/* Detailed Information Revealed on Scroll */}
                <div className="bg-white px-5 py-6 space-y-6">
                    {/* About Section */}
                    {profileData.showBio && (
                        <section className="relative">
                            {isEditing && (
                                <button
                                    onClick={() => deleteSection('showBio')}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10"
                                >
                                    <Trash2 className="w-4 h-4 text-white" />
                                </button>
                            )}
                            <h2 className="text-xl mb-2.5 text-gray-900">About</h2>
                            {isEditing ? (
                                <textarea
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 leading-relaxed resize-none"
                                    rows={4}
                                    placeholder="Tell people about yourself..."
                                />
                            ) : (
                                <p className="text-gray-700 leading-relaxed">
                                    {profileData.bio}
                                </p>
                            )}
                        </section>
                    )}

                    {/* Info Cards */}
                    <section className="space-y-3">
                        {profileData.showWork && (
                            <div className="relative flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                {isEditing && (
                                    <button
                                        onClick={() => deleteSection('showWork')}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10"
                                    >
                                        <Trash2 className="w-4 h-4 text-white" />
                                    </button>
                                )}
                                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                                    <Briefcase className="w-5 h-5 text-pink-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-500">Work</div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.work}
                                            onChange={(e) => setProfileData({ ...profileData, work: e.target.value })}
                                            className="w-full mt-1 px-2 py-1 bg-white border border-gray-200 rounded text-gray-900"
                                            placeholder="Your job"
                                        />
                                    ) : (
                                        <div className="text-gray-900">{profileData.work}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {profileData.showEducation && (
                            <div className="relative flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                {isEditing && (
                                    <button
                                        onClick={() => deleteSection('showEducation')}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10"
                                    >
                                        <Trash2 className="w-4 h-4 text-white" />
                                    </button>
                                )}
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                    <GraduationCap className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-500">Education</div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.education}
                                            onChange={(e) => setProfileData({ ...profileData, education: e.target.value })}
                                            className="w-full mt-1 px-2 py-1 bg-white border border-gray-200 rounded text-gray-900"
                                            placeholder="Your education"
                                        />
                                    ) : (
                                        <div className="text-gray-900">{profileData.education}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {profileData.showLocation && (
                            <div className="relative flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                {isEditing && (
                                    <button
                                        onClick={() => deleteSection('showLocation')}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10"
                                    >
                                        <Trash2 className="w-4 h-4 text-white" />
                                    </button>
                                )}
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                    <MapPin className="w-5 h-5 text-green-500" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm text-gray-500">Lives in</div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={profileData.location}
                                            onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                            className="w-full mt-1 px-2 py-1 bg-white border border-gray-200 rounded text-gray-900"
                                            placeholder="City, State"
                                        />
                                    ) : (
                                        <div className="text-gray-900">{profileData.location}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Custom Fields */}
                        {profileData.customFields.map((field) => (
                            <div key={field.id} className="relative flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                {isEditing && (
                                    <button
                                        onClick={() => deleteCustomField(field.id)}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10"
                                    >
                                        <Trash2 className="w-4 h-4 text-white" />
                                    </button>
                                )}
                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                    <Info className="w-5 h-5 text-purple-500" />
                                </div>
                                <div className="flex-1">
                                    {isEditing ? (
                                        <>
                                            <input
                                                type="text"
                                                value={field.name}
                                                onChange={(e) => updateCustomField(field.id, 'name', e.target.value)}
                                                className="w-full px-2 py-1 bg-white border border-gray-200 rounded text-sm text-gray-500"
                                                placeholder="Field name"
                                            />
                                            <input
                                                type="text"
                                                value={field.value}
                                                onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                                                className="w-full mt-1 px-2 py-1 bg-white border border-gray-200 rounded text-gray-900"
                                                placeholder="Value"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-sm text-gray-500">{field.name}</div>
                                            <div className="text-gray-900">{field.value}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Add New Field Button/Form */}
                        {isEditing && (
                            <>
                                {showAddField ? (
                                    <div className="flex items-center gap-3 p-4 bg-pink-50 border-2 border-pink-200 rounded-xl">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                                            <Info className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <input
                                                type="text"
                                                value={newFieldName}
                                                onChange={(e) => setNewFieldName(e.target.value)}
                                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-sm"
                                                placeholder="Field name (e.g. nose length)"
                                            />
                                            <input
                                                type="text"
                                                value={newFieldValue}
                                                onChange={(e) => setNewFieldValue(e.target.value)}
                                                className="w-full px-2 py-1 bg-white border border-gray-300 rounded"
                                                placeholder="Value"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={addCustomField}
                                                    className="flex-1 py-1.5 bg-pink-500 text-white rounded text-sm"
                                                >
                                                    Add
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowAddField(false);
                                                        setNewFieldName('');
                                                        setNewFieldValue('');
                                                    }}
                                                    className="flex-1 py-1.5 bg-gray-200 text-gray-700 rounded text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowAddField(true)}
                                        className="w-full flex items-center justify-center gap-2 p-4 bg-pink-50 border-2 border-dashed border-pink-300 rounded-xl text-pink-500 hover:bg-pink-100 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span>Add Custom Field</span>
                                    </button>
                                )}
                            </>
                        )}
                    </section>

                    {/* Interests */}
                    {profileData.showInterests && (
                        <section className="relative">
                            {isEditing && (
                                <button
                                    onClick={() => deleteSection('showInterests')}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg z-10"
                                >
                                    <Trash2 className="w-4 h-4 text-white" />
                                </button>
                            )}
                            <div className="flex items-center justify-between mb-2.5">
                                <h2 className="text-xl text-gray-900">Interests</h2>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {profileData.interests.map((interest) => {
                                    const IconComponent = getIconComponent(interest.icon);
                                    const colorClasses = getColorClasses(interest.color);
                                    return (
                                        <div
                                            key={interest.id}
                                            className={`flex items-center gap-2 px-4 py-2 ${colorClasses.bg} rounded-full border ${colorClasses.border}`}
                                        >
                                            <IconComponent className={`w-4 h-4 ${colorClasses.text}`} />
                                            <span className="text-sm text-gray-900">{interest.name}</span>
                                            {isEditing && (
                                                <button onClick={() => deleteInterest(interest.id)}>
                                                    <XIcon className="w-3 h-3 text-gray-400 cursor-pointer" />
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                                {isEditing && (
                                    <>
                                        {showAddInterest ? (
                                            <div className="w-full flex items-start gap-3 p-4 bg-pink-50 border-2 border-pink-200 rounded-xl">
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        type="text"
                                                        value={newInterest}
                                                        onChange={(e) => setNewInterest(e.target.value)}
                                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded"
                                                        placeholder="Interest name (e.g. hiking)"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={addInterest}
                                                            className="flex-1 py-2 bg-pink-500 text-white rounded"
                                                        >
                                                            Add
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setShowAddInterest(false);
                                                                setNewInterest('');
                                                            }}
                                                            className="flex-1 py-2 bg-gray-200 text-gray-700 rounded"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setShowAddInterest(true)}
                                                className="px-4 py-2 bg-pink-50 border-2 border-dashed border-pink-300 rounded-full text-pink-500 hover:bg-pink-100 transition-colors flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span className="text-sm">Add</span>
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </Page>
    );
}