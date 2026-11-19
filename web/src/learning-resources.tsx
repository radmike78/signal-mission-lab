import React from 'react';

type Resource = {
  title: string;
  url: string;
  use: string;
  access: string;
};

const topics: {title: string; resources: Resource[]}[] = [
  {
    title: 'Networking',
    resources: [{
      title: 'Cisco Networking Academy: Networking Basics',
      url: 'https://www.netacad.com/courses/networking-basics',
      use: 'Start with switches, routers, addressing and basic connectivity checks.',
      access: 'Free self-paced course. Account for enrollment.',
    }],
  },
  {
    title: 'Linux and Windows Server',
    resources: [{
      title: 'Red Hat: Enterprise Linux Technical Overview',
      url: 'https://www.redhat.com/en/services/training/rh024-red-hat-linux-technical-overview',
      use: 'Watch the introduction to Linux before working through service and storage faults.',
      access: 'No-cost on-demand videos. Registration may be required.',
    }, {
      title: 'Red Hat Developer',
      url: 'https://developers.redhat.com/',
      use: 'Find tutorials and hands-on learning for Red Hat Enterprise Linux, containers, and OpenShift.',
      access: 'Public articles. Some labs and downloads require a Red Hat account.',
    }, {
      title: 'Microsoft Learn: Implement Windows Server DNS',
      url: 'https://learn.microsoft.com/en-us/training/modules/implement-windows-server-dns/',
      use: 'Learn how Windows resolves names and how zones and forwarders fit together.',
      access: 'Public learning module.',
    }],
  },
  {
    title: 'Signal courses and credentials',
    resources: [{
      title: 'U.S. Army Signal School: Course information',
      url: 'https://cybercoe.army.mil/Cyber-Center-of-Excellence/Schools/Signal-School/Signal-Courses/',
      use: 'Find the official enlisted, warrant officer, officer and functional course listings.',
      access: 'Public listings. Course enrollment is separate.',
    }, {
      title: 'Army COOL: Find credentials by occupation',
      url: 'https://www.cool.osd.mil/army/index.html',
      use: 'Find credentials related to your Army occupation and review current requirements before paying for an exam.',
      access: 'Public credential directory. Exams and funding have separate requirements.',
    }],
  },
];

function ResourceLink({resource}: {resource: Resource}) {
  return <li>
    <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title}</a>
    <p>{resource.use}</p>
    <p className="muted">{resource.access}</p>
  </li>;
}

export function LearningResources({onVendorStudy}: {onVendorStudy: () => void}) {
  return <section className="learning-resources" aria-labelledby="resource-guide-title">
    <h2 id="resource-guide-title">Where to learn next</h2>
    <article className="resource-feature">
      <h3>O’Reilly for Government</h3>
      <p>Start here for IT books, video courses, and live training, including bootcamp-style sessions when offered.</p>
      <p><strong>No personal subscription charge for eligible Army MWR patrons.</strong> Access is subject to available seats. Live events may require registration.</p>
      <a href="https://army.dodmwrlibraries.org/oreilly" target="_blank" rel="noopener noreferrer">Open O’Reilly through Army MWR Library</a>
      <details>
        <summary>How to sign in</summary>
        <ol>
          <li>Open the Army MWR O’Reilly listing and choose <strong>Army Access</strong>.</li>
          <li>Use your DoD MWR Libraries sign-in. Follow the library’s account linking steps if prompted.</li>
          <li>In O’Reilly, search for your topic or check the live training schedule.</li>
        </ol>
        <a href="https://army.dodmwrlibraries.org/how-do-i...." target="_blank" rel="noopener noreferrer">Army MWR Library sign-in help</a>
      </details>
    </article>
    <h3>Find a resource by topic</h3>
    <div className="foundation-topics">
      {topics.map(topic => <details key={topic.title}>
        <summary>{topic.title}</summary>
        <ul>{topic.resources.map(resource => <ResourceLink resource={resource} key={resource.url}/>)}</ul>
      </details>)}
      <details>
        <summary>Vendor product training</summary>
        <p>Find troubleshooting exercises and official study links for VMware, Palo Alto Networks, Riverbed, Dell, NetApp, and other vendors.</p>
        <button onClick={onVendorStudy}>Browse vendor study paths</button>
      </details>
    </div>
    <p className="muted">This guide is available offline. The linked websites require internet access.</p>
  </section>;
}
