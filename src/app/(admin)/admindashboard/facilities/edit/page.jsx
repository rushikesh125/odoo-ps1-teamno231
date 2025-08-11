"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getFacilityById } from '@/firebase/facilities/read';
import { updateFacility } from '@/firebase/facilities/update';
import { uploadImageToImgBB } from '@/lib/imgbb';
import { MapPin, Image, Plus, X, ChevronDown, Trash2, Clock, DollarSign, Loader2, ArrowLeft, User, Info, Building, MapPinCheck, Link, Activity, PlusIcon, Clock1, ChevronDownCircle, Star, Save, XCircle } from 'lucide-react';

const AdminFacilityEditPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const facilityId = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        status: 'pending',
        ownerId: ''
    });
    const [newAmenity, setNewAmenity] = useState('');
    const [newSport, setNewSport] = useState('');
    const [photoPreviews, setPhotoPreviews] = useState([]);
    const [expandedSport, setExpandedSport] = useState(null);

    useEffect(() => {
        if (!facilityId) {
            toast.error('Facility ID is missing.');
            router.push('/admindashboard/facilities');
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
                setFormData({
                    ...facility,
                    location: {
                        ...facility.location,
                        mapLink: facility.location?.mapLink || ''
                    },
                    status: facility.status || 'pending'
                });
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
                                id: Date.now(),
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
        if (photoPreviews.length + files.length > 15) {
            toast.error(`Maximum 15 photos allowed. You can upload ${15 - photoPreviews.length} more.`);
            return;
        }
        const newPreviews = [];
        const newPhotos = [];
        for (const file of files) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`"${file.name}" is too large. Each image must be less than 5MB.`);
                continue;
            }
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                toast.error(`"${file.name}" is not a valid image. Please upload JPEG, PNG, GIF, or WEBP files.`);
                continue;
            }
            try {
                const result = await uploadImageToImgBB(file);
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
        setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, ...newPhotos]
        }));
        setPhotoPreviews(prev => [...prev, ...newPreviews]);
        if (newPreviews.length > 0) {
            toast.success(`${newPreviews.length} photo(s) uploaded successfully`);
        }
    };

    const handleRemovePhoto = (index) => {
        const newPreviews = photoPreviews.filter((_, i) => i !== index);
        setPhotoPreviews(newPreviews);
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index)
        }));
    };

    const handleStatusChange = (newStatus) => {
        setFormData(prev => ({ ...prev, status: newStatus }));
    };

    const validateGoogleMapsLink = (link) => {
        if (!link) return true;
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
            for (const [day, schedule] of Object.entries(sport.weeklySchedule)) {
                if (schedule.isOpen) {
                    if (!schedule.open || !schedule.close) {
                        toast.error(`Please set open and close times for ${day} in ${sport.name}`);
                        return false;
                    }
                    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
                    if (!timeRegex.test(schedule.open) || !timeRegex.test(schedule.close)) {
                        toast.error(`Invalid time format for ${day} in ${sport.name}`);
                        return false;
                    }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        if (!facilityId) {
            toast.error('Facility ID is missing.');
            return;
        }

        setSaving(true);
        try {
            const facilityDataToUpdate = {
                ...formData,
                updatedAt: new Date()
            };

            await updateFacility(facilityId, facilityDataToUpdate);
            toast.success('Facility updated successfully!');
            router.push('/admindashboard/facilities');
        } catch (error) {
            console.error('Error updating facility:', error);
            toast.error('Failed to update facility.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <Loader2 className="animate-spin h-12 w-12 text-purple-500 mx-auto" />
                    <p className="mt-4 text-gray-600 text-lg">Loading facility data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-white">Edit Facility</h1>
                        <p className="mt-2 text-indigo-100 text-sm">Review and update facility details. ID: {facilityId}</p>
                        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={() => router.push('/admindashboard/facilities')}
                                className="inline-flex items-center px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Facilities
                            </button>
                            <div className="flex items-center gap-2">
                                <span className="text-white font-medium">Set Status:</span>
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange('approved')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <User className="h-5 w-5 mr-2 text-purple-600" />
                            Facility Status
                        </h2>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                formData.status === 'approved' ? 'bg-green-100 text-green-800' :
                                formData.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>
                                {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                            </span>
                            <span className="text-sm text-gray-600">Owner ID: {formData.ownerId}</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Info className="h-5 w-5 mr-2 text-purple-600" />
                            Basic Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Facility Name *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                        placeholder="Enter facility name"
                                    />
                                    <Building className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                </div>
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                    placeholder="Describe your facility..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                            Location
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                    Address *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={formData.location.address}
                                        onChange={handleLocationChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                        placeholder="Street address"
                                    />
                                    <MapPinCheck className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.location.city}
                                    onChange={handleLocationChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
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
                                    name="state"
                                    value={formData.location.state}
                                    onChange={handleLocationChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
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
                                    name="pincode"
                                    value={formData.location.pincode}
                                    onChange={handleLocationChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                    placeholder="Pincode"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="mapLink" className="block text-sm font-medium text-gray-700 mb-2">
                                    Google Maps Link
                                </label>
                                <div className="relative">
                                    <input
                                        type="url"
                                        id="mapLink"
                                        name="mapLink"
                                        value={formData.location.mapLink}
                                        onChange={handleLocationChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                        placeholder="https://www.google.com/maps/..."
                                    />
                                    <Link className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Optional: Paste the Google Maps share link for your location
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-purple-600" />
                            Sports Configuration
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <input
                                type="text"
                                value={newSport}
                                onChange={(e) => setNewSport(e.target.value)}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                placeholder="Add a sport (e.g., Badminton, Tennis)"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSport())}
                            />
                            <button
                                type="button"
                                onClick={handleAddSport}
                                className="inline-flex items-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Sport
                            </button>
                        </div>
                        {formData.sports.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                <p>No sports added yet. Add a sport to configure courts and schedules.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {formData.sports.map((sport) => (
                                    <div key={sport.name} className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                        <div
                                            className="bg-white px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                            onClick={() => toggleSportExpansion(sport.name)}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900">{sport.name}</span>
                                                <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
                                                    {sport.courts.length} courts
                                                </span>
                                            </div>
                                            <ChevronDownCircle
                                                className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedSport === sport.name ? 'rotate-180' : ''}`}
                                            />
                                        </div>
                                        {expandedSport === sport.name && (
                                            <div className="bg-gray-50 p-4 border-t border-gray-200 space-y-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Price per Hour (₹)
                                                    </label>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="10"
                                                            value={sport.pricePerHour}
                                                            onChange={(e) => handlePriceChange(sport.name, e.target.value)}
                                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                                                        <Clock1 className="h-5 w-5 mr-2 text-purple-600" />
                                                        Weekly Schedule
                                                    </h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                        {Object.entries(sport.weeklySchedule).map(([day, schedule]) => (
                                                            <div key={day} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <span className="font-medium text-gray-900 capitalize">{day}</span>
                                                                    <label className="inline-flex items-center cursor-pointer">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={schedule.isOpen}
                                                                            onChange={(e) => handleWeeklyScheduleChange(sport.name, day, 'isOpen', e.target.checked)}
                                                                            className="sr-only peer"
                                                                        />
                                                                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
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
                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs text-gray-500 mb-1">Close</label>
                                                                            <input
                                                                                type="time"
                                                                                value={schedule.close}
                                                                                onChange={(e) => handleWeeklyScheduleChange(sport.name, day, 'close', e.target.value)}
                                                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h3 className="text-lg font-medium text-gray-900">Courts</h3>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddCourt(sport.name)}
                                                            className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
                                                        >
                                                            <PlusIcon className="h-4 w-4 mr-1" />
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
                                                                <div key={court.id} className="flex items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                                                    <input
                                                                        type="text"
                                                                        value={court.name}
                                                                        onChange={(e) => handleCourtNameChange(sport.name, court.id, e.target.value)}
                                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                                                        placeholder="Court name"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveCourt(sport.name, court.id)}
                                                                        className="ml-3 text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                                    >
                                                                        <Trash2 className="h-5 w-5" />
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
                                                className="text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md px-3 py-1 transition-colors"
                                            >
                                                Remove Sport
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Star className="h-5 w-5 mr-2 text-purple-600" />
                            Amenities
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            <input
                                type="text"
                                value={newAmenity}
                                onChange={(e) => setNewAmenity(e.target.value)}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                                placeholder="Add an amenity (e.g., Parking, Restrooms)"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                            />
                            <button
                                type="button"
                                onClick={handleAddAmenity}
                                className="inline-flex items-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Amenity
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.amenities.map((amenity, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                                >
                                    {amenity}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAmenity(amenity)}
                                        className="ml-2 text-indigo-800 hover:text-indigo-900"
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Image className="h-5 w-5 mr-2 text-purple-600" />
                            Photos
                        </h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Photos (Max 15 images)
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Image className="w-8 h-8 mb-2 text-gray-400" />
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
                                        disabled={photoPreviews.length >= 15 || saving}
                                    />
                                </label>
                            </div>
                            {photoPreviews.length >= 15 && (
                                <p className="mt-2 text-sm text-yellow-600 flex items-center">
                                    <AlertTriangle className="h-4 w-4 mr-2" />
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
                                            className="w-full h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePhoto(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                            disabled={saving}
                                        >
                                            <XCircle className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/admindashboard/facilities')}
                            disabled={saving}
                            className="inline-flex items-center px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-all shadow-md"
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-all shadow-md"
                        >
                            {saving ? (
                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {saving ? 'Updating...' : 'Update Facility'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminFacilityEditPage;