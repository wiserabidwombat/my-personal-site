import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '../../@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '../../@/components/ui/card'
import { pageTitle } from '../lib/title'

export const Route = createFileRoute('/resume')({
  head: () => ({
    meta: [{ title: pageTitle('Resume') }],
  }),
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
    skills: ['React', 'Angular', '.NET', 'Tailwind CSS', 'shadcn/ui', 'npm', 'TanStack Router'],
  },
  {
    label: 'Cloud & DevOps',
    skills: [
      'AWS Lambda',
      'AWS RDS',
      'AWS DynamoDB',
      'AWS ECS',
      'Docker',
      'D365 Power Apps',
      'D365 Cloudflows',
      'Terraform',
      'GIT',
      'GitHub'
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

type Project = {
  name: string
  bullets: string[]
}

type Role = {
  title: string
  dateRange?: string
  bullets?: string[]
  projects?: Project[]
}

type Company = {
  name: string
  location?: string
  dateRange: string
  roles: Role[]
}

const experience: Company[] = [
  {
    name: 'Alight Solutions',
    location: 'Remote',
    dateRange: 'June 2022 – Present',
    roles: [
      {
        title: 'Senior Developer',
        dateRange: 'June 2026 – Present',
        projects: [
          {
            name: 'Salesforce-to-Dynamics 365 Migration',
            bullets: [
              'Building React-based web resource components embedded within Microsoft Dynamics 365 CRM to support the migration off Salesforce',
              'Leveraging D365 tables, Power Apps, and Power Automate (Cloud Flows) to support end-to-end workflows for client creation, documentation, tracking, and communication',
              'Updating existing backend services to source and display client data from Dynamics 365 instead of Salesforce, ensuring continuity across the broader platform ecosystem',
              'Supporting a platform-wide migration affecting 3,000+ clients',
            ],
          },
        ],
      },
      {
        title: 'Team Lead',
        dateRange: 'April 2023 – June 2026',
        projects: [
          {
            name: 'Health Pros Platform',
            bullets: [
              'Led development of a live communication platform connecting clients with health advocates ("Health Pros") for support with provider search, appointment scheduling, and insurance guidance',
              'Architected a real-time chat system using SignalR, enabling live two-way communication between clients and health advocates',
              'Built a front-end ticketing interface displaying open requests, conversation history, and document/file upload capabilities',
              'Led a development team delivering the platform to 3,000+ clients with 99% uptime',
            ],
          },
          {
            name: 'Alight Platform Integration',
            bullets: [
              'Led the integration of two previously independent client tools (Smart Select MD and Health Pros) into the unified Alight domain, eliminating standalone URLs and consolidating the user experience',
              "Migrated features and business logic into Alight's Angular front-end architecture, aligning UI and navigation with the broader platform",
              "Re-engineered backend services to integrate with Alight's existing notification, ticketing, and communication systems",
              'Led the team through the migration while maintaining continuity of service for 3,000+ clients at 99% uptime',
            ],
          },
        ],
      },
      {
        title: 'Developer',
        dateRange: 'July 2022 – April 2023',
        projects: [
          {
            name: 'Smart Select MD',
            bullets: [
              'Developed a client-facing healthcare navigation tool using Angular, C# services on AWS ECS, SQL, and Elasticsearch, enabling users to search for doctors and facilities by specialty or condition',
              'Built search functionality that combined member health insurance data with provider cost, rating, and quality information to support informed care decisions',
              'Contributed to a platform supporting 3,000+ clients while maintaining 99% uptime',
            ],
          },
        ],
      },
    ],
  },
  {
    name: 'Armor Defense Inc.',
    location: 'Richardson, TX',
    dateRange: 'May 2016 – May 2022',
    roles: [
      {
        title: 'Software Engineer',
        dateRange: 'April 2019 – May 2022',
        bullets: [
          'Built and deployed microservices to scale security platform from 10k to 100k agents',
          'Deployed and troubleshot AWS SQS, RDS, Dynamo and Lambda infrastructure',
          'Developed and deployed microservices for interacting with Qualys Cloud Security Assessment (CSPM)',
        ],
      },
      {
        title: 'Quality Engineer',
        dateRange: 'May 2016 – April 2019',
        bullets: [
          'Performed end to end web application and API testing',
          'Tested Linux and Windows applications',
          'Developed and implemented test plans and test cases, and documented outcomes',
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
          'Designed, developed, and implemented test plans, test cases, and processes to identify issues',
          "Analyzed and documented root cause related to software, databases, HL7 interfaces, and API's",
          'Managed database, including configuration, debugging, modifying, and updating stored procedures',
        ],
      },
      {
        title: 'Implementation Technical Engineer',
        dateRange: 'November 2013 – October 2014',
        bullets: [
          'Served as subject matter expert for the team on all aspects of hardware and software',
          'Scoped, planned, initiated, and set goals and requirements and implemented new projects to provide positive outcomes for customers',
        ],
      },
      {
        title: 'Support Technical Analyst II',
        dateRange: 'January 2011 – November 2013',
        bullets: [
          'Reviewed and resolved escalated issues requiring advanced troubleshooting and provided root cause analysis',
          'Provided leadership, mentoring, training, and instruction to Support Specialists in the Customer Support Group',
          'Managed a portfolio of 30–35 MEDHOST customers, including conference calls, item tracking, software upgrades, and ongoing maintenance and repairs',
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
          'Monitored bank-wide IT infrastructure to maintain uptime for essential systems, including Online Banking, Bill Pay, and ATM/POS networks',
          'Administered mainframe, UNIX/Linux, and Windows platforms supporting trading applications and e-commerce software',
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
    <div className="min-h-screen bg-[var(--deep-space-black)] text-left text-slate-200">
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
                  {company.name}
                  {company.location && (
                    <span className="font-normal text-slate-400"> — {company.location}</span>
                  )}
                </h3>
                <span className="text-sm font-medium text-[var(--laser-cyan)]">{company.dateRange}</span>
              </div>

              <div className="mt-4 space-y-6 border-l-2 border-[var(--cyber-purple)]/40 pl-6">
                {company.roles.map((role) => (
                  <div key={role.title + (role.dateRange ?? '')}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <h4 className="font-semibold text-[var(--neon-pink)]">{role.title}</h4>
                      {role.dateRange && (
                        <span className="text-xs text-slate-400">{role.dateRange}</span>
                      )}
                    </div>
                    {role.projects ? (
                      <div className="mt-2 space-y-4">
                        {role.projects.map((project) => (
                          <div key={project.name}>
                            <p className="text-xs font-medium tracking-wide text-[var(--laser-cyan)] uppercase">
                              Project: {project.name}
                            </p>
                            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300">
                              {project.bullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-300">
                        {role.bullets?.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    )}
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
