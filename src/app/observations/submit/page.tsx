"use client";

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function SubmitObservation() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    species_name: '',
    common_name: '',
    date_observed: new Date().toISOString().split('T')[0],
    location: '',
    notes: ''
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (!file.type.includes('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!image) {
      setError('Please upload an image');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formPayload = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value);
      });
      
      formPayload.append('image', image);
      
      const response = await fetch('/api/submit-observation', {
        method: 'POST',
        body: formPayload
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit observation');
      }
      
      const data = await response.json();
      setSubmitSuccess(true);
      
      // Redirect after a brief success message
      setTimeout(() => {
        router.push(`/observations/${data.observation_id}`);
      }, 1500);
      
    } catch (err) {
      console.error('Error submitting observation:', err);
      setError((err instanceof Error) ? err.message : 'Failed to submit observation. Please try again.');
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <main className="min-h-screen bg-[#1A1A1A] text-white pt-20 pb-10">
      <Header />
      
      <div className="container mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
        <h1 className="text-3xl font-bold text-center mb-8 text-[#1DE954]">
          Submit an Observation
        </h1>
        
        <form 
          className="max-w-2xl mx-auto bg-[#282828] p-6 rounded-lg shadow-lg animate-slideInUp" 
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-md text-red-200 animate-fadeIn">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}
          
          {submitSuccess && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-md text-green-200 animate-fadeIn">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Observation submitted successfully! Redirecting...
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="transition-all duration-300 hover:translate-x-1 focus-within:translate-x-1">
                <label className="block text-[#1DE954] mb-2 text-sm font-medium" htmlFor="species_name">
                  Species Name (Scientific)
                </label>
                <input
                  id="species_name"
                  name="species_name"
                  type="text"
                  className="w-full p-3 rounded bg-[#333] border border-[#444] text-white focus:outline-none focus:border-[#1DE954] transition-colors"
                  placeholder="e.g. Panthera pardus"
                  value={formData.species_name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="transition-all duration-300 hover:translate-x-1 focus-within:translate-x-1">
                <label className="block text-[#1DE954] mb-2 text-sm font-medium" htmlFor="common_name">
                  Common Name
                </label>
                <input
                  id="common_name"
                  name="common_name"
                  type="text"
                  className="w-full p-3 rounded bg-[#333] border border-[#444] text-white focus:outline-none focus:border-[#1DE954] transition-colors"
                  placeholder="e.g. Leopard"
                  value={formData.common_name}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="transition-all duration-300 hover:translate-x-1 focus-within:translate-x-1">
                <label className="block text-[#1DE954] mb-2 text-sm font-medium" htmlFor="date_observed">
                  Date Observed
                </label>
                <input
                  id="date_observed"
                  name="date_observed"
                  type="date"
                  className="w-full p-3 rounded bg-[#333] border border-[#444] text-white focus:outline-none focus:border-[#1DE954] transition-colors"
                  value={formData.date_observed}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="transition-all duration-300 hover:translate-x-1 focus-within:translate-x-1">
                <label className="block text-[#1DE954] mb-2 text-sm font-medium" htmlFor="location">
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="w-full p-3 rounded bg-[#333] border border-[#444] text-white focus:outline-none focus:border-[#1DE954] transition-colors"
                  placeholder="e.g. Margalla Hills, Trail 5"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="transition-all duration-300">
                <label className="block text-[#1DE954] mb-2 text-sm font-medium" htmlFor="image">
                  Upload Image
                </label>
                <div className="border-2 border-dashed border-gray-600 rounded-md p-4 text-center hover:border-[#1DE954] transition-colors h-[180px] flex flex-col justify-center items-center cursor-pointer">
                  <input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    required
                    disabled={isSubmitting}
                  />
                  <label htmlFor="image" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-h-full max-w-full mx-auto rounded object-contain"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setImagePreview(null);
                            setImage(null);
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                          disabled={isSubmitting}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-400 text-sm">Click to upload an image</p>
                        <p className="text-gray-500 text-xs mt-1">JPG, PNG, GIF up to 10MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              
              <div className="transition-all duration-300 hover:translate-x-1 focus-within:translate-x-1">
                <label className="block text-[#1DE954] mb-2 text-sm font-medium" htmlFor="notes">
                  Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="w-full p-3 rounded bg-[#333] border border-[#444] text-white focus:outline-none focus:border-[#1DE954] transition-colors"
                  placeholder="Add any additional details about your observation..."
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={isSubmitting}
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting || submitSuccess}
              className={`w-full py-3 px-4 rounded font-bold transition-all duration-300 flex items-center justify-center
                ${isSubmitting || submitSuccess ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#1DE954] text-black hover:bg-[#19C048] hover:scale-[1.02] hover:shadow-lg'}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : submitSuccess ? (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Submitted!
                </>
              ) : (
                'Submit Observation'
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
