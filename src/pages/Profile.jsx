import {
    Avatar,
    Button,
    Cell,
    List,
    Section,
    Textarea,
    Input,
    IconButton
} from '@telegram-apps/telegram-ui';
import {
    initData,
    useSignal,
} from '@tma.js/sdk-react';
import {
    Camera,
    Music,
    Plane,
    Coffee,
    Trash2,
    Plus as PlusIcon,
    X as XIcon,
    Check,
    Info,
    Pencil
} from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useState, useEffect, useMemo, useRef } from 'react';

import { Page } from '@/components/Page.jsx';
import { DisplayData } from '@/components/DisplayData/DisplayData.jsx';
import useAuth from '@/hooks/useAuth';
import useAxiosPrivate from '@/hooks/useAxiosPrivate';

export function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const initDataRaw = useSignal(initData.raw);
    const initDataState = useSignal(initData.state);

    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    const initDataRows = useMemo(() => {
        if (!initDataState || !initDataRaw) {
            return;
        }
        return [
            { title: 'raw', value: initDataRaw },
            ...Object.entries(initDataState).reduce((acc, [title, value]) => {
                if (value instanceof Date) {
                    acc.push({ title, value: value.toISOString() });
                } else if (!value || typeof value !== 'object') {
                    acc.push({ title, value });
                }
                return acc;
            }, []),
        ];
    }, [initDataState, initDataRaw]);



    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

    useEffect(() => {
        if (!emblaApi) return;

        const onSelect = () => {
            setCurrentPhotoIndex(emblaApi.selectedScrollSnap());
        };

        emblaApi.on('select', onSelect);

        return () => {
            emblaApi.off('select', onSelect);
        };
    }, [emblaApi]);

    const [profileData, setProfileData] = useState({
        name: auth.user?.name || '',
        age: '',
        photo_url: '',
        bio: '',
        gender: '',
        id: null,
        user: null,
        showBio: true,
        showInterests: true,
        customFields: [],
        interests: [],
    });
    const [originalProfileData, setOriginalProfileData] = useState(null);
    const bioTextareaRef = useRef(null);

    // Auto-resize bio textarea
    useEffect(() => {
        if (bioTextareaRef.current && isEditing && profileData.showBio) {
            // Use setTimeout to ensure DOM is fully updated after section restoration
            const timer = setTimeout(() => {
                if (bioTextareaRef.current) {
                    bioTextareaRef.current.style.height = 'auto';
                    bioTextareaRef.current.style.height = `${bioTextareaRef.current.scrollHeight}px`;
                }
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [profileData.bio, isEditing, profileData.showBio]);

    // Fetch profile data from backend on component mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axiosPrivate.get('/profiles/me');
                
                // Log the fetched profile data
                console.log('Fetched profile data:', response.data);
                
                // Update profileData with fetched data
                if (response.data) {
                    setProfileData(prevData => {
                        const data = response.data;
                        // Map backend response structure to component state
                        const updatedProfile = {
                            ...prevData,
                            // Map display_name to name
                            name: data.display_name || prevData.name || '',
                            // Map photo_url directly (single URL string)
                            photo_url: data.photo_url || prevData.photo_url || '',
                            // Direct mappings from backend (already camelCase)
                            bio: data.bio || prevData.bio || '',
                            gender: data.gender || prevData.gender || '',
                            interests: data.interests || prevData.interests || [],
                            // Map custom_fields (snake_case) to customFields (camelCase)
                            // Backend uses title/value format, add id for internal tracking
                            customFields: (data.custom_fields || prevData.customFields || []).map((field, index) => ({
                                ...field,
                                id: field.id || `field-${index}-${Date.now()}`
                            })),
                            // Store additional backend data
                            id: data.id || prevData.id,
                            user: data.user || prevData.user,
                            // Visibility flags (already camelCase in backend response)
                            showBio: data.showBio !== undefined ? data.showBio : prevData.showBio,
                            showInterests: data.showInterests !== undefined ? data.showInterests : prevData.showInterests,
                            // Add age if it exists in backend response
                            age: data.age?.toString() || prevData.age || '',
                        };
                        console.log('Updated profile state:', updatedProfile);
                        return updatedProfile;
                    });
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch profile');
                // Optionally, you might want to keep default data or handle 404 differently
                // For now, we'll just set the error and keep the empty state
            } finally {
                setLoading(false);
            }
        };

        // Only fetch if we have auth (initData available)
        if (auth?.initData) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [auth?.initData]); // Re-fetch if initData changes (axiosPrivate is stable)

    const handleSave = async () => {
        try {
            setError(null);
            
            // Map profileData state to backend format
            const payload = {
                display_name: profileData.name,
                age: profileData.age ? parseInt(profileData.age) : undefined,
                bio: profileData.bio,
                gender: profileData.gender,
                photo_url: profileData.photo_url,
                interests: profileData.interests,
                custom_fields: profileData.customFields.map(field => ({
                    title: field.title,
                    value: field.value
                })),
                showBio: profileData.showBio,
                showInterests: profileData.showInterests,
            };
            
            // Remove undefined fields
            Object.keys(payload).forEach(key => {
                if (payload[key] === undefined) {
                    delete payload[key];
                }
            });
            
            console.log('Saving profile data:', payload);
            
            const response = await axiosPrivate.patch('/profiles/me', payload);
            
            console.log('Profile saved successfully:', response.data);
            
            // Update profile data with response from backend
            if (response.data) {
                setProfileData(prevData => {
                    const data = response.data;
                    const updatedProfile = {
                        ...prevData,
                        name: data.display_name || prevData.name || '',
                        photo_url: data.photo_url || prevData.photo_url || '',
                        bio: data.bio || prevData.bio || '',
                        gender: data.gender || prevData.gender || '',
                        interests: data.interests || prevData.interests || [],
                        customFields: (data.custom_fields || prevData.customFields || []).map((field, index) => ({
                            ...field,
                            id: field.id || `field-${index}-${Date.now()}`
                        })),
                        id: data.id || prevData.id,
                        user: data.user || prevData.user,
                        showBio: data.showBio !== undefined ? data.showBio : prevData.showBio,
                        showInterests: data.showInterests !== undefined ? data.showInterests : prevData.showInterests,
                        age: data.age?.toString() || prevData.age || '',
                    };
                    return updatedProfile;
                });
            }
            
            setIsEditing(false);
            setOriginalProfileData(null); // Clear original data after successful save
        } catch (err) {
            console.error('Error saving profile:', err);
            setError(err.response?.data?.message || err.message || 'Failed to save profile');
        } 
    };

    const handleCancel = () => {
        // Restore original data if it was saved
        if (originalProfileData) {
            setProfileData(originalProfileData);
            setOriginalProfileData(null);
        }
        setIsEditing(false);
    };
    
    const handleEditStart = () => {
        // Store current profile data as original before editing
        setOriginalProfileData({ ...profileData });
        setIsEditing(true);
    };

    const deleteSection = (section) => {
        setProfileData({ ...profileData, [section]: false });
    };
    
    const restoreSection = (section) => {
        setProfileData({ ...profileData, [section]: true });
        // Trigger resize for bio textarea if restoring bio section
        if (section === 'showBio' && isEditing) {
            setTimeout(() => {
                if (bioTextareaRef.current) {
                    bioTextareaRef.current.style.height = 'auto';
                    bioTextareaRef.current.style.height = `${bioTextareaRef.current.scrollHeight}px`;
                }
            }, 10);
        }
    };

    const addCustomField = () => {
        const newField = {
            id: Date.now().toString(),
            title: '',
            value: '',
        };
        setProfileData({
            ...profileData,
            customFields: [...profileData.customFields, newField],
        });
    };

    const deleteCustomField = (id) => {
        setProfileData({
            ...profileData,
            customFields: profileData.customFields.filter((field) => field.id !== id),
        });
    };

    const updateCustomField = (id, key, newValue) => {
        setProfileData({
            ...profileData,
            customFields: profileData.customFields.map((field) =>
                field.id === id ? { ...field, [key]: newValue } : field
            ),
        });
    };

    const addInterest = () => {
        setProfileData({
            ...profileData,
            interests: [...profileData.interests, ''],
        });
    };

    const deleteInterest = (interestToDelete) => {
        setProfileData({
            ...profileData,
            interests: profileData.interests.filter((interest) => interest !== interestToDelete),
        });
    };

    // Show loading state
    if (loading) {
        return (
            <Page>
                <List style={{ paddingBottom: '80px' }}>
                    <Section>
                        <Cell>
                            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                                Loading profile...
                            </div>
                        </Cell>
                    </Section>
                </List>
            </Page>
        );
    }

    // Show error state
    if (error && !profileData.name) {
        return (
            <Page>
                <List style={{ paddingBottom: '80px' }}>
                    <Section>
                        <Cell>
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--tgui--error_color)' }}>
                                <div style={{ marginBottom: 10 }}>Error loading profile</div>
                                <div style={{ fontSize: 14, opacity: 0.8 }}>{error}</div>
                            </div>
                        </Cell>
                    </Section>
                </List>
            </Page>
        );
    }

    return (
        <Page>
            {/* Floating Action Buttons - Top Right Corner */}
            <div style={{
                position: 'fixed',
                top: 16,
                right: 16,
                zIndex: 1000,
                display: 'flex',
                gap: 8,
                alignItems: 'center'
            }}>
                {isEditing ? (
                    <>
                        {/* Red Cancel Button */}
                        <button
                            onClick={handleCancel}
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: '#ff3b30',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <XIcon size={24} color="#fff" />
                        </button>
                        {/* Green Save Button */}
                        <button
                            onClick={handleSave}
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: '#34c759',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }}
                            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <Check size={24} color="#fff" />
                        </button>
                    </>
                ) : (
                    /* Pen Icon Button */
                    <button
                        onClick={handleEditStart}
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            backgroundColor: 'var(--tgui--button_color, #3390ec)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <Pencil size={20} color="#fff" />
                    </button>
                )}
            </div>

            <List style={{ paddingBottom: '80px' }}>
                {error && (
                    <Section>
                        <Cell>
                            <div style={{ color: 'var(--tgui--error_color)', fontSize: 14, padding: '10px 0' }}>
                                {error}
                            </div>
                        </Cell>
                    </Section>
                )}
                {/* Header & Photo Section */}
                <Section>
                    <div style={{ padding: 0, textAlign: 'center', position: 'relative' }}>
                        {/* Carousel */}
                        {profileData.photo_url && (
                            <>
                                <div className="embla" ref={emblaRef} style={{ overflow: 'hidden', width: '100%' }}>
                                    <div className="embla__container" style={{ display: 'flex' }}>
                                        <div className="embla__slide" style={{ flex: '0 0 100%', minWidth: 0 }}>
                                            <img
                                                src={profileData.photo_url}
                                                alt="Profile"
                                                style={{
                                                    width: '100%',
                                                    aspectRatio: '4/5', // Premium portrait ratio
                                                    objectFit: 'cover',
                                                    display: 'block'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Pagination Dots - Single dot for single photo */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 10,
                                    left: 0,
                                    right: 0,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 6,
                                    zIndex: 10
                                }}>
                                    <div
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            background: '#fff',
                                            transition: 'background 0.3s ease'
                                        }}
                                    />
                                </div>
                            </>
                        )}

                        {/* Info Overlay (Optional, but keeping below for now as per design request to just change picture) */}
                    </div>

                    <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '24px', fontWeight: '600', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', color: 'var(--tgui--text_color, inherit)', lineHeight: '1.4', display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                            {isEditing ? (
                                <>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        style={{
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: '2px solid var(--tgui--hint_color, #999)',
                                            outline: 'none',
                                            textAlign: 'center',
                                            color: 'var(--tgui--text_color, inherit)',
                                            padding: '0 4px',
                                            display: 'inline-block',
                                            minWidth: '60px',
                                            width: 'auto',
                                            lineHeight: '1.4'
                                        }}
                                        placeholder="Name"
                                    />
                                    <span>,</span>
                                    <input
                                        type="text"
                                        value={profileData.age}
                                        onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                                        style={{
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: '2px solid var(--tgui--hint_color, #999)',
                                            outline: 'none',
                                            textAlign: 'center',
                                            color: 'var(--tgui--text_color, inherit)',
                                            padding: '0 4px',
                                            display: 'inline-block',
                                            minWidth: '30px',
                                            width: 'auto',
                                            lineHeight: '1.4'
                                        }}
                                        placeholder="Age"
                                    />
                                </>
                            ) : (
                                <>
                                    {profileData.name || 'Name'}, {profileData.age || 'Age'}
                                </>
                            )}
                        </div>
                    </div>
                </Section>

                {/* Bio Section */}
                {profileData.showBio && (
                    <Section header={
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            width: '100%',
                        }}>
                            <span style={{ 
                                fontSize: 'var(--tgui--section_header_font_size, 14px)',
                                fontWeight: 'var(--tgui--section_header_font_weight, 500)',
                                color: 'var(--tgui--section_header_text_color, var(--tgui--hint_color))',
                                lineHeight: 'var(--tgui--section_header_line_height, 1.5)',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                marginLeft: '20px'
                            }}>About</span>
                            {isEditing && (
                                <IconButton mode="plain" onClick={() => deleteSection('showBio')} style={{ marginRight: '20px' }}>
                                    <Trash2 size={16} />
                                </IconButton>
                            )}
                        </div>
                    }>
                        {isEditing ? (
                            <div style={{ 
                                padding: '12px 20px',
                                minHeight: '10px'
                            }}>
                                <textarea
                                    ref={bioTextareaRef}
                                    value={profileData.bio}
                                    onChange={(e) => {
                                        setProfileData({ ...profileData, bio: e.target.value });
                                        // Auto-resize on change
                                        if (bioTextareaRef.current) {
                                            bioTextareaRef.current.style.height = 'auto';
                                            bioTextareaRef.current.style.height = `${bioTextareaRef.current.scrollHeight}px`;
                                        }
                                    }}
                                    placeholder="Tell people about yourself..."
                                    style={{
                                        width: '100%',
                                        minHeight: '20px',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '2px solid var(--tgui--hint_color, #999)',
                                        outline: 'none',
                                        color: 'var(--tgui--text_color, inherit)',
                                        fontSize: '16px',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                        padding: '4px 0',
                                        resize: 'none',
                                        overflow: 'hidden',
                                        cursor: 'text',
                                        lineHeight: '1.5'
                                    }}
                                />
                            </div>
                        ) : (
                            <div style={{ 
                                padding: '12px 20px',
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word',
                                lineHeight: '1.5',
                                fontSize: '16px',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                color: 'var(--tgui--text_color, inherit)'
                            }}>
                                {profileData.bio || <span style={{ opacity: 0.5 }}>Tell people about yourself...</span>}
                            </div>
                        )}
                    </Section>
                )}

                {/* Info Section */}
                <Section header="Details">
                    {/* Custom Fields */}
                    {profileData.customFields.map((field) => (
                        isEditing ? (
                            <div
                                key={field.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 20px',
                                    gap: '12px'
                                }}
                            >
                                <Avatar size={28} style={{ background: 'var(--tgui--secondary_bg_color)', flexShrink: 0 }}><Info size={16} /></Avatar>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <input
                                        type="text"
                                        value={field.title || ''}
                                        onChange={(e) => updateCustomField(field.id, 'title', e.target.value)}
                                        placeholder="Field Title"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: '2px solid var(--tgui--hint_color, #999)',
                                            outline: 'none',
                                            color: 'var(--tgui--hint_color, #999)',
                                            fontSize: '14px',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                            padding: '2px 4px',
                                            display: 'inline-block',
                                            minWidth: '80px',
                                            width: 'auto',
                                            cursor: 'text',
                                            lineHeight: '1.5'
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={field.value || ''}
                                        onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                                        placeholder="Field Value"
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: '2px solid var(--tgui--hint_color, #999)',
                                            outline: 'none',
                                            color: 'var(--tgui--text_color, inherit)',
                                            fontSize: '16px',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                            padding: '2px 4px',
                                            display: 'inline-block',
                                            minWidth: '80px',
                                            width: 'auto',
                                            cursor: 'text',
                                            lineHeight: '1.5'
                                        }}
                                    />
                                </div>
                                <IconButton mode="plain" onClick={() => deleteCustomField(field.id)} style={{ flexShrink: 0 }}><Trash2 size={16} /></IconButton>
                            </div>
                        ) : (
                            <Cell
                                key={field.id}
                                before={<Avatar size={28} style={{ background: 'var(--tgui--secondary_bg_color)' }}><Info size={16} /></Avatar>}
                                description={field.title}
                            >
                                {field.value}
                            </Cell>
                        )
                    ))}

                    {/* Add Custom Field */}
                    {isEditing && (
                        <div style={{ padding: '12px 20px' }}>
                            <Button mode="plain" size="s" onClick={addCustomField}>
                                <PlusIcon size={16} style={{ marginRight: 5 }} /> Add Custom Field
                            </Button>
                        </div>
                    )}
                </Section>

                {/* Interests Section */}
                {profileData.showInterests && (
                    <Section header={
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            width: '100%',
                            padding: '0 20px'
                        }}>
                            <span style={{ 
                                fontSize: 'var(--tgui--section_header_font_size, 14px)',
                                fontWeight: 'var(--tgui--section_header_font_weight, 500)',
                                color: 'var(--tgui--section_header_text_color, var(--tgui--hint_color))',
                                lineHeight: 'var(--tgui--section_header_line_height, 1.5)',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                            }}>Interests</span>
                            {isEditing && (
                                <IconButton mode="plain" onClick={() => deleteSection('showInterests')}>
                                    <Trash2 size={16} />
                                </IconButton>
                            )}
                        </div>
                    }>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 20px 20px' }}>
                            {profileData.interests.map((interest, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        padding: '6px 12px',
                                        background: 'var(--tgui--secondary_bg_color)',
                                        borderRadius: 16,
                                        fontSize: '16px',
                                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                        color: 'var(--tgui--text_color, inherit)',
                                        lineHeight: '1.5'
                                    }}
                                >
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={interest}
                                            onChange={(e) => {
                                                const newInterests = [...profileData.interests];
                                                newInterests[index] = e.target.value;
                                                setProfileData({ ...profileData, interests: newInterests });
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                borderBottom: '2px solid var(--tgui--hint_color, #999)',
                                                outline: 'none',
                                                color: 'var(--tgui--text_color, inherit)',
                                                fontSize: '16px',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                                padding: '0 2px',
                                                display: 'inline-block',
                                                minWidth: '40px',
                                                width: 'auto',
                                                maxWidth: '200px',
                                                lineHeight: '1.5'
                                            }}
                                        />
                                    ) : (
                                        interest
                                    )}
                                    {isEditing && (
                                        <XIcon
                                            size={14}
                                            style={{ cursor: 'pointer', opacity: 0.6 }}
                                            onClick={() => deleteInterest(interest)}
                                        />
                                    )}
                                </div>
                            ))}

                            {isEditing && (
                                <Button mode="bezeled" size="s" onClick={addInterest} style={{ borderRadius: 16 }}>
                                    <PlusIcon size={14} /> Add
                                </Button>
                            )}
                        </div>
                    </Section>
                )}

                {/* Hidden Sections - Show in editing mode to allow restoration */}
                {isEditing && (!profileData.showBio || !profileData.showInterests) && (
                    <Section header="Hidden Sections">
                        {!profileData.showBio && (
                            <Cell
                                before={<Avatar size={28} style={{ background: 'var(--tgui--secondary_bg_color)' }}><Info size={16} /></Avatar>}
                                description="About section is hidden"
                                after={
                                    <Button size="s" onClick={() => restoreSection('showBio')} mode="filled">
                                        <PlusIcon size={16} style={{ marginRight: 5 }} /> Restore
                                    </Button>
                                }
                            >
                                About
                            </Cell>
                        )}
                        {!profileData.showInterests && (
                            <Cell
                                before={<Avatar size={28} style={{ background: 'var(--tgui--secondary_bg_color)' }}><Info size={16} /></Avatar>}
                                description="Interests section is hidden"
                                after={
                                    <Button size="s" onClick={() => restoreSection('showInterests')} mode="filled">
                                        <PlusIcon size={16} style={{ marginRight: 5 }} /> Restore
                                    </Button>
                                }
                            >
                                Interests
                            </Cell>
                        )}
                    </Section>
                )}


                {initDataRows && (
                    <Section header="Init Data">
                        <DisplayData rows={initDataRows} />
                    </Section>
                )}


            </List>
        </Page>
    );
}
