import { useNavigate } from 'react-router-dom';
import Card from './UI/Card';
import Button from './UI/Button';

type PlaceholderFeature = {
  title: string;
  description: string;
  badge: 'Available' | 'Coming Soon';
};

const placeholderFeatures: PlaceholderFeature[] = [
  {
    title: 'Recent Analyses',
    description: 'Quickly revisit your latest AI document summaries.',
    badge: 'Coming Soon',
  },
  {
    title: 'Health Trend Timeline',
    description: 'Track meaningful health changes over time in one place.',
    badge: 'Coming Soon',
  },
  {
    title: 'Care Reminders',
    description: 'Get reminders for follow-ups, tests, and key appointments.',
    badge: 'Coming Soon',
  },
  {
    title: 'Provider Sharing',
    description: 'Securely share selected summaries with your care team.',
    badge: 'Coming Soon',
  },
];

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-[#1E3A2F] via-[#2E7D55] to-[#66B48B] px-6 py-8 text-white shadow-lg sm:px-8">
        <p className="mb-2 inline-block rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide">
          Dashboard
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">Welcome to your health workspace</h1>
        <p className="mt-3 max-w-2xl text-white/85">
          Use the dashboard to upload reports, review results, and track future features as they
          roll out.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => navigate('/upload')} className="bg-[#D4A843] text-[#1E3A2F] hover:bg-[#c49630]">
            Upload New Document
          </Button>
          <Button variant="outline" onClick={() => navigate('/results')} className="border-white/60 text-white hover:bg-white/10">
            View Latest Results
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="border-[#8FD4A8]/50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E7D55]">Available</p>
              <h2 className="mt-1 text-xl font-bold text-[#1E3A2F]">Document Upload</h2>
              <p className="mt-2 text-sm text-gray-500">
                Start a new AI analysis by uploading a report or pasting content.
              </p>
            </div>
            <span className="rounded-full bg-[#E5F2EA] px-2.5 py-1 text-xs font-semibold text-[#1E3A2F]">
              Live
            </span>
          </div>
        </Card>

        <Card className="border-[#8FD4A8]/50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2E7D55]">Available</p>
              <h2 className="mt-1 text-xl font-bold text-[#1E3A2F]">Results Review</h2>
              <p className="mt-2 text-sm text-gray-500">
                Explore explanations, metrics, and recommended next steps.
              </p>
            </div>
            <span className="rounded-full bg-[#E5F2EA] px-2.5 py-1 text-xs font-semibold text-[#1E3A2F]">
              Live
            </span>
          </div>
        </Card>

        {placeholderFeatures.map((feature) => (
          <Card key={feature.title} className="border-dashed border-gray-200">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Roadmap</p>
                <h2 className="mt-1 text-xl font-bold text-[#1E3A2F]">{feature.title}</h2>
                <p className="mt-2 text-sm text-gray-500">{feature.description}</p>
              </div>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                {feature.badge}
              </span>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default DashboardPage;