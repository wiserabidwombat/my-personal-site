import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '../../@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '../../@/components/ui/card'

export const Route = createFileRoute('/resume')({
  component: RouteComponent,
})

const summary =
  "A solution-focused, analytical thinker with 16+ years' experience in multiple roles with increasing levels of responsibility. Recognized leader and team player with excellent communication, interpersonal, and problem-solving skills. Quickly and easily adapts to new technologies, software, and environments."

const skillGroups = [
  {
    label: 'Languages',
    skills: ['C#', 'TypeScript', 'JavaScript', 'SQL'],
  },
  {
    label: 'Frameworks & Libraries',
    skills: ['React', 'Angular', '.NET 4', 'Tailwind CSS', 'shadcn/ui', 'npm', 'TanStack Router'],
  },
  {
    label: 'Cloud & DevOps',
    skills: [
      'AWS Lambda',
      'AWS RDS',
      'AWS DynamoDB',
      'Docker',
      'D365 Power Apps',
      'D365 Cloudflows',
      'Terraform',
    ],
  },
  {
    label: 'Enterprise Platforms',
    skills: ['Microsoft Dynamics (D365)', 'Microservices Architecture'],
  },
  {
    label: 'Tools',
    skills: ['Git', 'GitHub', 'Jira', 'Visual Studio', 'SSMS', 'VS Code'],
  },
]

type Role = {
  title: string
  dateRange?: string
  bullets: string[]
}

type Company = {
  name: string
  location: string
  dateRange: string
  roles: Role[]
}

const experience: Company[] = [
  {
    name: 'Armor Defense Inc.',
    location: 'Richardson, TX',
    dateRange: 'May 2016 – Present',
    roles: [
      {
        title: 'Software Engineer',
        dateRange: 'April 2019 – Present',
        bullets: [
          'Build and deploy microservices to scale security platform from 10k to 100k agents',
          'Deploy and troubleshoot AWS SQS, RDS, Dynamo and Lambda infrastructure',
          'Develop and deploy microservices for interacting with Qualys Cloud Security Assessment (CSPM)',
        ],
      },
      {
        title: 'Quality Engineer',
        dateRange: 'May 2016 – April 2019',
        bullets: [
          'Perform end to end web application and API testing',
          'Linux and Windows application testing',
          'Develop and implement test plans, test cases and document outcomes',
        ],
      },
    ],
  },
  {
    name: 'MEDHOST',
    location: 'Plano, TX',
    dateRange: '2011 – 2016',
    roles: [
      {
        title: 'Quality Assurance Analyst',
        dateRange: 'October 2014 – May 2016',
        bullets: [
          'Design, develop, and implement test plans, test cases, and processes to identify issues',
          "Analyze and document root cause related to software, databases, HL7 interfaces, and API's",
          'Manage database, including configuration, debugging, modifying, and updating stored procedures',
        ],
      },
      {
        title: 'Implementation Technical Engineer',
        dateRange: 'November 2013 – October 2014',
        bullets: [
          'Subject matter expert for team on all aspects of hardware and software',
          'Scoped, planned, initiated, and set goals and requirements and implemented new projects to provide positive outcomes for customers',
        ],
      },
      {
        title: 'Support Technical Analyst II',
        dateRange: 'February 2012 – November 2013',
        bullets: [
          'Reviewed and resolved escalated issues requiring advanced troubleshooting or knowledge and provided root cause analysis',
          'Provided leadership, mentoring, training, and instruction to Support Specialists in Customer Support Group',
        ],
      },
      {
        title: 'Support Technical Analyst',
        dateRange: 'January 2011 – February 2012',
        bullets: [
          'Responsible for 30–35 MEDHOST customers; managed conference calls, existing issues, item tracking and customer relationships, software upgrades, maintenance and repairs',
          'Resolved hardware, software, network, HL7 interface, and MEDHOST EDIS (Emergency Department Information System) application issues',
        ],
      },
    ],
  },
  {
    name: 'Bank of America',
    location: 'Plano, TX',
    dateRange: '2006 – 2009',
    roles: [
      {
        title: 'Systems Analyst II / Officer',
        bullets: [
          "Monitored bank's IT infrastructure to prevent downtimes to essential systems such as Online Banking",
          'Administered mainframe, UNIX/Linux and Windows platforms, trading applications, and e-commerce software',
        ],
      },
    ],
  },
]

type Credential = {
  title: string
  date: string
  detail?: string
  location?: string
}

const credentials: Credential[] = [
  {
    title: 'AWS Certified Developer - Associate',
    date: 'January 2022',
  },
  {
    title: 'University of North Texas',
    detail: 'Bachelor of Science in Business Computer Information Systems',
    date: 'December 2004',
    location: 'Denton, TX',
  },
]

const headingClass = 'text-2xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)]'

function RouteComponent() {
  return (
    <div className="min-h-screen bg-[var(--deep-space-black)] text-slate-200">
      <section className="bg-synth-grid px-6 py-20 text-center">
        <div className="relative z-10">
          <p className="text-sm font-semibold tracking-[0.3em] text-[var(--laser-cyan)] uppercase">
            Resume
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold text-[var(--neon-pink)] [text-shadow:var(--glow-pink)] sm:text-4xl">
            Software Developer
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">{summary}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className={headingClass}>Technology Skills</h2>
        <div className="mt-6 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroups.map((group) => (
            <div
              key={group.label}
              className="rounded-2xl border border-[var(--cyber-purple)]/40 bg-[var(--deep-space-purple)]/50 p-5"
            >
              <h3 className="text-sm font-semibold tracking-wide text-[var(--laser-cyan)] uppercase">
                {group.label}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="shadow-glow-cyan">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className={headingClass}>Professional Experience</h2>
        <div className="mt-6 space-y-10">
          {experience.map((company) => (
            <div key={company.name}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-xl font-bold text-slate-50">
                  {company.name} <span className="font-normal text-slate-400">— {company.location}</span>
                </h3>
                <span className="text-sm font-medium text-[var(--laser-cyan)]">{company.dateRange}</span>
              </div>

              <div className="mt-4 space-y-6 border-l-2 border-[var(--cyber-purple)]/40 pl-6">
                {company.roles.map((role) => (
                  <div key={role.title}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h4 className="font-semibold text-[var(--neon-pink)]">{role.title}</h4>
                      {role.dateRange && (
                        <span className="text-xs text-slate-400">{role.dateRange}</span>
                      )}
                    </div>
                    <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300">
                      {role.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-12">
        <h2 className={headingClass}>Education and Professional Development</h2>
        <div className="mx-auto mt-6 grid max-w-2xl gap-4 sm:grid-cols-2">
          {credentials.map((credential) => (
            <Card key={credential.title} className="ring-[var(--cyber-purple)]/40 shadow-glow-purple">
              <CardHeader>
                <CardTitle className="text-base font-semibold text-slate-100">
                  {credential.title}
                </CardTitle>
                {credential.detail && (
                  <CardDescription className="text-slate-300">{credential.detail}</CardDescription>
                )}
                <p className="mt-1 text-xs font-medium tracking-wide text-[var(--laser-cyan)] uppercase">
                  {credential.date}
                  {credential.location && <> &middot; {credential.location}</>}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
