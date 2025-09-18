import DrivingSchoolSurvey from '@/components/DrivingSchoolSurvey';

export default function SurveyPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-200 mb-4">
            Theorieprüfung der Klasse B
          </h1>
          <p className="text-lg text-gray-100 max-w-2xl mx-auto">
             Die Theorieprüfung Klasse B testet Ihr Wissen über Verkehrsregeln, Verkehrszeichen und sicheres Verhalten im Straßenverkehr.         
             </p>
        </div>
        <DrivingSchoolSurvey />
      </div>
    </div>
  );
}