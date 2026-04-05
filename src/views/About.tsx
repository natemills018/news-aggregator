import { Link } from "react-router-dom";

const About = () => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <h1 className="font-heading text-3xl font-bold text-text-primary mb-6">
      About The CLE Brief
    </h1>

    <div className="bg-white border border-stone rounded-lg p-8 space-y-4">
      <p className="text-text-primary leading-relaxed">
        The CLE Brief is a weekly email that tells you what's worth checking
        out in Cleveland this week. Concerts, food festivals, museum exhibits,
        outdoor stuff, family events — we round it up so you don't have to
        dig through a dozen websites.
      </p>

      <p className="text-text-primary leading-relaxed">
        We're not trying to list every event in the city. We pick the ones
        that are actually worth your time, write a quick take on each, and
        send it to your inbox every Wednesday. The whole thing takes about
        two minutes to read.
      </p>

      <p className="text-text-primary leading-relaxed">
        Cleveland has way more going on than people give it credit for. The
        problem isn't a lack of things to do — it's that finding out about
        them is scattered across too many places. We fix that.
      </p>

      <div className="pt-4">
        <Link
          to="/#subscribe"
          className="inline-block font-body text-sm font-semibold no-underline bg-coral text-white px-6 py-3 rounded-md hover:bg-coral-dark transition-colors"
        >
          Subscribe — it's free
        </Link>
      </div>
    </div>
  </div>
);

export default About;
