// app/admindashboard/facilities/edit/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getFacilityById } from '@/firebase/facilities/read'; // Ensure this function exists
import { updateFacility } from '@/firebase/facilities/update'; // Ensure this function exists and can update all fields
import { uploadImageToImgBB } from '@/lib/imgbb'; // Assuming this utility exists

const AdminFacilityEditPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const facilityId = searchParams.get('id');

    const [loading, setLoading] = useState(true); // Loading state for fetching data
    const [saving, setSaving] = useState(false); // Loading state for saving data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: {
            address: '',
            city: '',
            state: '',
            pincode: '',
            mapLink: ''
        },
        sports: [],
        amenities: [],
        photos: [],
        status: 'pending', // Default status
        ownerId: '' // Might be useful to display
    });
    const [newAmenity, setNewAmenity] = useState('');
    const [newSport, setNewSport] = useState('');
    const [photoPreviews, setPhotoPreviews] = useState([]); // Mirror formData.photos initially
    const [expandedSport, setExpandedSport] = useState(null);

    // Fetch facility data on component mount if ID exists
    useEffect(() => {
        if (!facilityId) {
            toast.error('Facility ID is missing.');
            router.push('/admindashboard/facilities'); // Redirect back to list if no ID
            return;
        }

        const fetchFacility = async () => {
            try {
                setLoading(true);
                const facility = await getFacilityById(facilityId);
                if (!facility) {
                     toast.error('Facility not found.');
                     router.push('/admindashboard/facilities');
                     return;
                }
                // Populate form data
                setFormData({
                    ...facility,
                    location: {
                        ...facility.location,
                        mapLink: facility.location?.mapLink || ''
                    },
                    status: facility.status || 'pending' // Ensure status is set
                });
                // Initialize photo previews
                setPhotoPreviews(facility.photos || []);
            } catch (error) {
                console.error('Error fetching facility:', error);
                toast.error('Failed to load facility data.');
                router.push('/admindashboard/facilities');
            } finally {
                setLoading(false);
            }
        };

        fetchFacility();
    }, [facilityId, router]);

    // --- Handlers (Mostly adapted from FacilityForm) ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                [name]: value
            }
        }));
    };

    const handleAddAmenity = () => {
        if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
            setFormData(prev => ({
                ...prev,
                amenities: [...prev.amenities, newAmenity.trim()]
            }));
            setNewAmenity('');
        }
    };

    const handleRemoveAmenity = (amenity) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.filter(a => a !== amenity)
        }));
    };

    const handleAddSport = () => {
        if (newSport.trim() && !formData.sports.some(s => s.name === newSport.trim())) {
            const newSportObj = {
                name: newSport.trim(),
                weeklySchedule: {
                    monday: { open: '09:00', close: '21:00', isOpen: true },
                    tuesday: { open: '09:00', close: '21:00', isOpen: true },
                    wednesday: { open: '09:00', close: '21:00', isOpen: true },
                    thursday: { open: '09:00', close: '21:00', isOpen: true },
                    friday: { open: '09:00', close: '21:00', isOpen: true },
                    saturday: { open: '08:00', close: '22:00', isOpen: true },
                    sunday: { open: '08:00', close: '20:00', isOpen: true }
                },
                courts: [],
                pricePerHour: 0
            };
            setFormData(prev => ({
                ...prev,
                sports: [...prev.sports, newSportObj]
            }));
            setNewSport('');
        }
    };

    const handleRemoveSport = (sportName) => {
        setFormData(prev => ({
            ...prev,
            sports: prev.sports.filter(s => s.name !== sportName)
        }));
        if (expandedSport === sportName) {
            setExpandedSport(null);
        }
    };

    const toggleSportExpansion = (sportName) => {
        setExpandedSport(expandedSport === sportName ? null : sportName);
    };

    const handleWeeklyScheduleChange = (sportName, day, field, value) => {
        setFormData(prev => ({
            ...prev,
            sports: prev.sports.map(sport =>
                sport.name === sportName
                    ? {
                        ...sport,
                        weeklySchedule: {
                            ...sport.weeklySchedule,
                            [day]: {
                                ...sport.weeklySchedule[day],
                                [field]: value
                            }
                        }
                    }
                    : sport
            )
        }));
    };

    const handleAddCourt = (sportName) => {
        setFormData(prev => ({
            ...prev,
            sports: prev.sports.map(sport =>
                sport.name === sportName
                    ? {
                        ...sport,
                        courts: [
                            ...sport.courts,
                            {
                                id: Date.now(), // Simple ID generation, consider UUID in production
                                name: `Court ${sport.courts.length + 1}`,
                                status: 'active'
                            }
                        ]
                    }
                    : sport
            )
        }));
    };

    const handleRemoveCourt = (sportName, courtId) => {
        setFormData(prev => ({
            ...prev,
            sports: prev.sports.map(sport =>
                sport.name === sportName
                    ? {
                        ...sport,
                        courts: sport.courts.filter(court => court.id !== courtId)
                    }
                    : sport
            )
        }));
    };

    const handleCourtNameChange = (sportName, courtId, newName) => {
        setFormData(prev => ({
            ...prev,
            sports: prev.sports.map(sport =>
                sport.name === sportName
                    ? {
                        ...sport,
                        courts: sport.courts.map(court =>
                            court.id === courtId
                                ? { ...court, name: newName }
                                : court
                        )
                    }
                    : sport
            )
        }));
    };

    const handlePriceChange = (sportName, price) => {
        setFormData(prev => ({
            ...prev,
            sports: prev.sports.map(sport =>
                sport.name === sportName
                    ? { ...sport, pricePerHour: parseFloat(price) || 0 }
                    : sport
            )
        }));
    };


    const handlePhotoUpload = async (e) => {
        const files = Array.from(e.target.files);
        // Check if we would exceed the limit of 15 images
        if (photoPreviews.length + files.length > 15) {
            toast.error(`Maximum 15 photos allowed. You can upload ${15 - photoPreviews.length} more.`);
            return;
        }
        const newPreviews = [];
        const newPhotos = [];
        for (const file of files) {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`"${file.name}" is too large. Each image must be less than 5MB.`);
                continue;
            }
            // Check file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error(`"${file.name}" is not a valid image. Please upload JPEG, PNG, GIF, or WEBP files.`);
                continue;
            }
            try {
                const result = await uploadImageToImgBB(file); // Implement this function
                if (result.success) {
                    newPhotos.push(result.url);
                    newPreviews.push(result.url);
                } else {
                    toast.error(`Failed to upload "${file.name}"`);
                }
            } catch (error) {
                console.error('Image upload error:', error);
                toast.error(`Image upload failed for "${file.name}"`);
            }
        }
        // Update state with new photos
        setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, ...newPhotos]
        }));
        setPhotoPreviews(prev => [...prev, ...newPreviews]); // Update previews
        // Show success message if any photos were uploaded
        if (newPreviews.length > 0) {
            toast.success(`${newPreviews.length} photo(s) uploaded successfully`);
        }
    };

    const handleRemovePhoto = (index) => {
         // Remove from previews state
        const newPreviews = photoPreviews.filter((_, i) => i !== index);
        setPhotoPreviews(newPreviews);

        // Remove from formData state
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const handleStatusChange = (newStatus) => {
        setFormData(prev => ({ ...prev, status: newStatus }));
    };

    // --- Validation (Adapted from FacilityForm) ---
    const validateGoogleMapsLink = (link) => {
        if (!link) return true; // Optional field
        const googleMapsRegex = /^https:\/\/www\.google\.com\/maps\/.*/;
        return googleMapsRegex.test(link);
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error('Facility name is required');
            return false;
        }
        if (!formData.description.trim()) {
            toast.error('Description is required');
            return false;
        }
        if (!formData.location.address.trim()) {
            toast.error('Address is required');
            return false;
        }
        if (!formData.location.city.trim()) {
            toast.error('City is required');
            return false;
        }
        if (!formData.location.state.trim()) {
            toast.error('State is required');
            return false;
        }
        if (!formData.location.pincode.trim()) {
            toast.error('Pincode is required');
            return false;
        }
        if (formData.location.mapLink && !validateGoogleMapsLink(formData.location.mapLink)) {
            toast.error('Please provide a valid Google Maps link');
            return false;
        }
        if (formData.sports.length === 0) {
            toast.error('At least one sport is required');
            return false;
        }
        // Validate each sport
        for (const sport of formData.sports) {
            if (sport.pricePerHour <= 0) {
                toast.error(`Price per hour for ${sport.name} must be greater than 0`);
                return false;
            }
            if (sport.courts.length === 0) {
                toast.error(`At least one court is required for ${sport.name}`);
                return false;
            }
            for (const court of sport.courts) {
                if (!court.name.trim()) {
                    toast.error(`Court name is required for ${sport.name}`);
                    return false;
                }
            }
            // Validate weekly schedule
            for (const [day, schedule] of Object.entries(sport.weeklySchedule)) {
                if (schedule.isOpen) {
                    if (!schedule.open || !schedule.close) {
                        toast.error(`Please set open and close times for ${day} in ${sport.name}`);
                        return false;
                    }
                    // Validate time format (simple regex)
                    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                    if (!timeRegex.test(schedule.open) || !timeRegex.test(schedule.close)) {
                        toast.error(`Invalid time format for ${day} in ${sport.name}`);
                        return false;
                    }
                    // Validate that close time is after open time
                    const openTime = new Date(`1970-01-01T${schedule.open}:00`);
                    const closeTime = new Date(`1970-01-01T${schedule.close}:00`);
                    if (closeTime <= openTime) {
                        toast.error(`Close time must be after open time for ${day} in ${sport.name}`);
                        return false;
                    }
                }
            }
        }
        if (formData.photos.length === 0) {
            toast.error('At least one photo is required');
            return false;
        }
        if (formData.photos.length > 15) {
            toast.error('Maximum 15 photos allowed');
            return false;
        }
        return true;
    };
    // --- End Validation ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (!facilityId) {
            toast.error('Facility ID is missing.');
            return;
        }

        setSaving(true);
        try {
            // Prepare data to send (ensure status is included)
            const facilityDataToUpdate = {
                ...formData,
                // status is already part of formData
                 updatedAt: new Date() // Update timestamp
            };

            await updateFacility(facilityId, facilityDataToUpdate); // Implement this function
            toast.success('Facility updated successfully!');
            router.push('/admindashboard/facilities'); // Redirect back to list
        } catch (error) {
            console.error('Error updating facility:', error);
            toast.error('Failed to update facility.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-purple mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading facility data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-theme-purple to-indigo-600 px-6 py-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white">
                            Edit Facility
                        </h1>
                        <p className="mt-2 text-indigo-100">
                            Review and update facility details. ID: {facilityId}
                        </p>
                         <div className="mt-4 flex justify-center space-x-4">
                            <button
                                onClick={() => router.push('/admindashboard/facilities')}
                                className="px-4 py-2 bg-white text-theme-purple rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                            >
                                Back to List
                            </button>
                             {/* Status Update Buttons */}
                            <div className="flex items-center space-x-2">
                                <span className="text-white font-medium">Set Status:</span>
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange('approved')}
                                    className={`px-3 py-1.5 text-sm rounded-md ${
                                        formData.status === 'approved'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-white text-green-600 hover:bg-green-50'
                                    }`}
                                >
                                    Approve
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange('rejected')}
                                    className={`px-3 py-1.5 text-sm rounded-md ${
                                        formData.status === 'rejected'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-white text-red-600 hover:bg-red-50'
                                    }`}
                                >
                                    Reject
                                </button>
                                 <button
                                    type="button"
                                    onClick={() => handleStatusChange('pending')}
                                    className={`px-3 py-1.5 text-sm rounded-md ${
                                        formData.status === 'pending'
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-white text-yellow-600 hover:bg-yellow-50'
                                    }`}
                                >
                                    Pending
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-8">
                    <div className="space-y-8">

                        {/* Status Display */}
                         <div className="bg-gray-50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Facility Status</h2>
                             <div className="flex items-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    formData.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    formData.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                                </span>
                                <span className="ml-4 text-sm text-gray-600">Owner ID: {formData.ownerId}</span>
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Facility Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-purple focus:border-theme-purple"
                                        placeholder="Enter facility name"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-purple focus:border-theme-purple"
                                        placeholder="Describe your facility..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Location</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                        Address *
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address" // Corrected name
                                        value={formData.location.address}
                                        onChange={handleLocationChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-purple focus:border-theme-purple"
                                        placeholder="Street address"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city" // Corrected name
                                        value={formData.location.city}
                                        onChange={handleLocationChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-purple focus:border-theme-purple"
                                        placeholder="City"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                        State *
                                    </label>
                                    <input
                                        type="text"
                                        id="state"
                                        name="state" // Corrected name
                                        value={formData.location.state}
                                        onChange={handleLocationChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-purple focus:border-theme-purple"
                                        placeholder="State"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                                        Pincode *
                                    </label>
                                    <input
                                        type="text"
                                        id="pincode"
                                        name="pincode" // Corrected name
                                        value={formData.location.pincode}
                                        onChange={handleLocationChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-purple focus:border-theme-purple"
                                        placeholder="Pincode"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="mapLink" className="block text-sm font-medium text-gray-700 mb-2">
                                        Google Maps Link
                                    </label>
                                    <input
                                        type="url"
                                        id="mapLink"
                                        name="mapLink" // Corrected name
                                        value={formData.location.mapLink}
                                        onChange={handleLocationChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-purple focus:border-theme-purple"
                                        placeholder="https://www.google.com/maps/..."
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Optional: Paste the Google Maps share link for your location
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Sports Configuration */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sports Configuration</h2>
                            <div className="mb-6">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={newSport}
                                        onChange={(e) => setNewSport(e.target.value)}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-purple focus:border-theme-purple"
                                        placeholder="Add a sport (e.g. Badminton, Tennis)"
                                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSport())}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSport}
                                        className="px-4 py-3 bg-theme-purple text-white rounded-lg hover:bg-theme-purple transition-colors"
                                    >
                                        Add Sport
                                    </button>
                                </div>
                            </div>
                            {formData.sports.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No sports added yet. Add a sport to configure courts and schedules.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {formData.sports.map((sport) => ( // Removed index from key, using sport.name
                                        <div key={sport.name} className="border border-gray-200 rounded-lg overflow-hidden">
                                            <div
                                                className="bg-white px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                                                onClick={() => toggleSportExpansion(sport.name)}
                                            >
                                                <div className="flex items-center">
                                                    <span className="font-medium text-gray-900">{sport.name}</span>
                                                    <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                                                        {sport.courts.length} courts
                                                    </span>
                                                </div>
                                                <svg
                                                    className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedSport === sport.name ? 'rotate-180' : ''}`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            {expandedSport === sport.name && (
                                                <div className="bg-gray-50 p-4 border-t border-gray-200">
                                                    {/* Price Configuration */}
                                                    <div className="mb-6">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Price per Hour (₹)
                                                        </label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <span className="text-gray-500 sm:text-sm">₹</span>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="10"
                                                                value={sport.pricePerHour}
                                                                onChange={(e) => handlePriceChange(sport.name, e.target.value)}
                                                                className="block w-full pl-8 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-purple focus:border-theme-purple"
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* Weekly Schedule */}
                                                    <div className="mb-6">
                                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Weekly Schedule</h3>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                            {Object.entries(sport.weeklySchedule).map(([day, schedule]) => (
                                                                <div key={day} className="bg-white p-4 rounded-lg border border-gray-200">
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <span className="font-medium text-gray-900 capitalize">{day}</span>
                                                                        <label className="inline-flex items-center cursor-pointer">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={schedule.isOpen}
                                                                                onChange={(e) => handleWeeklyScheduleChange(sport.name, day, 'isOpen', e.target.checked)}
                                                                                className="sr-only peer"
                                                                            />
                                                                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-purple/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-purple"></div>
                                                                        </label>
                                                                    </div>
                                                                    {schedule.isOpen && (
                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <div>
                                                                                <label className="block text-xs text-gray-500 mb-1">Open</label>
                                                                                <input
                                                                                    type="time"
                                                                                    value={schedule.open}
                                                                                    onChange={(e) => handleWeeklyScheduleChange(sport.name, day, 'open', e.target.value)}
                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-theme-purple focus:border-theme-purple"
                                                                                />
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs text-gray-500 mb-1">Close</label>
                                                                                <input
                                                                                    type="time"
                                                                                    value={schedule.close}
                                                                                    onChange={(e) => handleWeeklyScheduleChange(sport.name, day, 'close', e.target.value)}
                                                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-theme-purple focus:border-theme-purple"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {/* Courts Configuration */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-3">
                                                            <h3 className="text-lg font-medium text-gray-900">Courts</h3>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAddCourt(sport.name)}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-theme-purple hover:bg-theme-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-purple"
                                                            >
                                                                <svg className="-ml-1 mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                                                </svg>
                                                                Add Court
                                                            </button>
                                                        </div>
                                                        {sport.courts.length === 0 ? (
                                                            <div className="text-center py-4 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                                                <p>No courts added yet</p>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                {sport.courts.map((court) => (
                                                                    <div key={court.id} className="flex items-center bg-white p-3 rounded-lg border border-gray-200">
                                                                        <input
                                                                            type="text"
                                                                            value={court.name}
                                                                            onChange={(e) => handleCourtNameChange(sport.name, court.id, e.target.value)}
                                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-theme-purple focus:border-theme-purple"
                                                                            placeholder="Court name"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveCourt(sport.name, court.id)}
                                                                            className="ml-3 text-red-500 hover:text-red-700"
                                                                        >
                                                                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="bg-white px-4 py-3 border-t border-gray-200 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSport(sport.name)}
                                                    className="text-sm font-medium text-red-600 hover:text-red-800"
                                                >
                                                    Remove Sport
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Amenities</h2>
                            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                <input
                                    type="text"
                                    value={newAmenity}
                                    onChange={(e) => setNewAmenity(e.target.value)}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-theme-purple focus:border-theme-purple"
                                    placeholder="Add an amenity"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddAmenity}
                                    className="px-4 py-3 bg-theme-purple text-white rounded-lg hover:bg-theme-purple transition-colors"
                                >
                                    Add Amenity
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.amenities.map((amenity, index) => (
                                    <span
                                        key={index} // Index is okay here for simple list
                                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                                    >
                                        {amenity}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAmenity(amenity)}
                                            className="ml-2 text-indigo-800 hover:text-indigo-900"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Photos */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Photos</h2>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Photos (Max 15 images)
                                </label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            <p className="text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, GIF up to 5MB each (Max 15 files)
                                            </p>
                                            {photoPreviews.length > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {photoPreviews.length} of 15 uploaded
                                                </p>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            multiple
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            disabled={photoPreviews.length >= 15}
                                        />
                                    </label>
                                </div>
                                {photoPreviews.length >= 15 && (
                                    <p className="mt-2 text-sm text-yellow-600">
                                        You've reached the maximum of 15 photos
                                    </p>
                                )}
                            </div>
                            {photoPreviews.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {photoPreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePhoto(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                disabled={saving}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                             <button
                                type="button"
                                onClick={() => router.push('/admindashboard/facilities')}
                                disabled={saving}
                                className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-75 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-3 bg-theme-purple text-white font-medium rounded-lg hover:bg-theme-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-purple disabled:opacity-75 transition-all shadow-md"
                            >
                                {saving ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Updating...
                                    </span>
                                ) : (
                                    'Update Facility'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminFacilityEditPage;