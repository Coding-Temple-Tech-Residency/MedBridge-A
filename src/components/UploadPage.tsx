import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sampleReportText } from '../mockData';

const ALLOWED_FILE_TYPES = ['pdf', 'txt', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const ANALYSIS_STEPS = [
  'Reading document structure...',
  'Identifying medical terms and values...',
  'Comparing results against reference ranges...',
  'Generating plain-language explanations...',
  'Creating your personalised action plan...',
] as const;

const AnalysingScreen: React.FC = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => Math.min(s + 1, ANALYSIS_STEPS.length - 1));
    }, 580);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F7F4] flex items-center justify-center p-6">
      <div className="text-center max-w-sm w-full">
        <div className="relative w-24 h-24 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-[#8FD4A8]" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#2E7D55] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🧬</div>
        </div>
        <h2 className="text-2xl font-bold text-[#1E3A2F] mb-2">Analysing Your Document</h2>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          Our AI is reviewing your medical document and generating your personalised health
          summary...
        </p>
        <div className="text-left space-y-3">
          {ANALYSIS_STEPS.map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 transition-all duration-400 ${
                i < step ? 'opacity-40' : i === step ? 'opacity-100' : 'opacity-20'
              }`}
            >
              {i < step ? (
                <span className="w-5 h-5 rounded-full bg-[#2E7D55] flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                  ✓
                </span>
              ) : i === step ? (
                <span className="w-5 h-5 rounded-full border-2 border-[#2E7D55] flex-shrink-0 animate-pulse" />
              ) : (
                <span className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
              )}
              <span
                className={`text-sm ${i === step ? 'text-[#1E3A2F] font-medium' : 'text-gray-400'}`}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');

  const hasContent = fileName !== null || pastedText.trim().length > 0;

  const handleTabChange = (tab: 'upload' | 'paste') => {
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const validateFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (!extension || !ALLOWED_FILE_TYPES.includes(extension)) {
      setFileName(null);
      setSuccessMessage(null);
      setErrorMessage('Unsupported file type. Please upload a PDF, DOC, DOCX, TXT, JPG, JPEG, or PNG file.',);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileName(null);
      setSuccessMessage(null);
      setErrorMessage(`File size exceeds ${MAX_FILE_SIZE_MB} MB. Please upload a smaller file.`);
      return;
    }

    setFileName(file.name);
    setErrorMessage(null);
    setSuccessMessage('File validated successfully. Ready for analysis.');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];

    if (file) {
      validateFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      validateFile(file);
    }
  };

  const handleTrySample = () => {
    setPastedText(sampleReportText);
    handleTabChange('paste');
  };

  const handleAnalyse = () => {
    setIsAnalysing(true);
    setTimeout(() => {
      setIsAnalysing(false);
      navigate('/results');
    }, 3200);
  };

  if (isAnalysing) return <AnalysingScreen />;

  return (
    <div className="min-h-screen bg-[#F2F7F4] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1E3A2F] mb-2">Analyse Your Medical Document</h1>
          <p className="text-gray-500">
            Upload a file or paste the text from your lab results, report, or prescription.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white rounded-xl border border-gray-200 p-1 mb-5 shadow-sm">
          <button
            onClick={() => handleTabChange('upload')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'upload'
                ? 'bg-[#1E3A2F] text-white shadow-sm'
                : 'text-gray-400 hover:text-[#1E3A2F]'
            }`}
          >
            📁 Upload File
          </button>
          <button
            onClick={() => handleTabChange('paste')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === 'paste'
                ? 'bg-[#1E3A2F] text-white shadow-sm'
                : 'text-gray-400 hover:text-[#1E3A2F]'
            }`}
          >
            📋 Paste Text
          </button>
        </div>

        {/* Upload drop zone */}
        {activeTab === 'upload' && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-14 text-center transition-all duration-200 cursor-pointer ${
              isDragging
                ? 'border-[#2E7D55] bg-green-50 scale-[1.01]'
                : fileName
                  ? 'border-[#8FD4A8] bg-green-50'
                  : 'border-gray-200 bg-white hover:border-[#8FD4A8] hover:bg-[#F2F7F4]'
            }`}
          >
            <input
              id="file-upload"
              type="file"
              onChange={handleFileInput}
              accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Upload medical document"
            />
            {fileName ? (
              <div>
                <div className="text-5xl mb-3">✅</div>
                <p className="font-semibold text-[#1E3A2F] text-lg">{fileName}</p>
                <p className="text-sm text-gray-400 mt-1">Click to change file</p>
              </div>
            ) : (
              <div>
                <div className="text-6xl mb-4">📄</div>
                <p className="font-semibold text-[#1E3A2F] text-xl">
                  {isDragging ? 'Drop it here!' : 'Drop your file here'}
                </p>
                <p className="text-gray-400 mt-1">or click to browse</p>
                <p className="text-xs text-gray-300 mt-4"> Supports: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG </p>
              </div>
            )}
          </div>
        )}

        {errorMessage && (
          <p className="mt-3 text-sm text-red-600 text-center">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="mt-3 text-sm text-green-700 text-center">
            {successMessage}
          </p>
        )}

        {/* Paste text area */}
        {activeTab === 'paste' && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-500">Medical document text</span>
              {pastedText && (
                <button
                  onClick={() => setPastedText('')}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your lab report, prescription, clinical notes, or any medical document text here..."
              className="w-full h-64 p-4 text-sm text-gray-700 font-mono resize-none focus:outline-none placeholder:text-gray-300"
            />
          </div>
        )}

        {/* Try sample link */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <span className="text-gray-400">No document handy?</span>
          <button
            onClick={handleTrySample}
            className="text-[#2E7D55] font-semibold hover:underline transition-all"
          >
            Try with a sample lab report →
          </button>
        </div>

        {/* Analyse button */}
        <button
          onClick={handleAnalyse}
          disabled={!hasContent}
          className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
            hasContent
              ? 'bg-[#1E3A2F] hover:bg-[#2E7D55] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed'
          }`}
        >
          Analyse Document
        </button>

        {/* Security note */}
        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 Your document is processed securely and is never stored permanently.
        </p>
      </div>
    </div>
  );
};

export default UploadPage;
