import { FileText, Sparkles } from 'lucide-react';
import React, { useState } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const CoverLetter = () => {

  const toneOptions = ['professional', 'enthusiastic', 'concise'];

  const [jobDescription, setJobDescription] = useState('');
  const [userSkills, setUserSkills] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const { data } = await axios.post('/api/ai/generate-cover-letter',
        { jobDescription, userSkills, tone: selectedTone },
        { headers: { Authorization: `Bearer ${await getToken()}` } }
      );

      if (data.success) {
        setContent(data.content);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error?.response?.data?.message || error.message);
    }
    setLoading(false);
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>

      {/* left col */}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200 border-t-4 border-t-teal-500'>
        <div className='flex items-center gap-3'>
          <Sparkles className='w-6 text-[#0D9488]' />
          <h1 className='text-xl font-semibold'>AI Cover Letter Generator</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>Job Description</p>
        <textarea
          onChange={(e) => setJobDescription(e.target.value)}
          value={jobDescription}
          rows={5}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='Paste the job description here...'
          required
        />

        <p className='mt-4 text-sm font-medium'>Your Skills & Experience</p>
        <textarea
          onChange={(e) => setUserSkills(e.target.value)}
          value={userSkills}
          rows={3}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300'
          placeholder='e.g. I know React, Node.js, built 2 full stack projects...'
          required
        />

        <p className='mt-4 text-sm font-medium'>Tone</p>
        <div className='mt-3 flex gap-3 flex-wrap'>
          {toneOptions.map((tone) => (
            <span
              onClick={() => setSelectedTone(tone)}
              className={`text-xs px-4 py-1.5 border rounded-full cursor-pointer capitalize ${selectedTone === tone ? 'bg-teal-50 text-teal-800 border-teal-300' : 'text-gray-500 border-gray-300'}`}
              key={tone}
            >
              {tone}
            </span>
          ))}
        </div>

        <button
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#0D9488] to-[#059669] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading
            ? <span className='w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin'></span>
            : <FileText className='w-5' />
          }
          Generate Cover Letter
        </button>
      </form>

      {/* right col */}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 border-t-4 border-t-teal-500 min-h-96'>
        <div className='flex items-center gap-3'>
          <FileText className="w-5 h-5 text-[#0D9488]" />
          <h1 className='text-xl font-semibold'>Generated Cover Letter</h1>
        </div>

        {!content ? (
          <div className='flex-1 flex justify-center items-center'>
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <FileText className='w-9 h-9' />
              <p>Fill in the details and click "Generate Cover Letter" to get started</p>
            </div>
          </div>
        ) : (
          <div className='mt-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed'>
            {content}
          </div>
        )}
      </div>
    </div>
  )
}

export default CoverLetter