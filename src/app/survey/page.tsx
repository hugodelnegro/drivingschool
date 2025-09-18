import DrivingSchoolSurvey from '@/components/DrivingSchoolSurvey';

export default function SurveyPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-200 mb-4">
            Student Survey
          </h1>
          <p className="text-lg text-gray-100 max-w-2xl mx-auto">
            Help us provide you with the best driving instruction experience.
            Please take a few minutes to complete this survey so we can tailor
            our services to your needs.
          </p>
        </div>
        <DrivingSchoolSurvey />
      </div>
    </div>
  );
}