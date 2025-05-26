
import ResumeGenerator from '@/components/ResumeGenerator';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            AI Resume Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let our AI interview you and create a professional, tailored resume that highlights your unique strengths and experiences.
          </p>
        </div>
        <ResumeGenerator />
      </div>
    </div>
  );
};

export default Index;
