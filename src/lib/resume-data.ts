export const fullName = 'Aaron Tilley'
export const heroTitle = 'Senior Developer'

// Contact line for the generated PDF's header (not shown on the page).
// Email and LinkedIn are placeholders -- replace them with real values.
// `phone` only appears in the PDF once it's filled in.
export type ContactInfo = {
  location: string
  email: string
  linkedInUrl: string
  websiteUrl: string
  phone?: string
}

export const contact: ContactInfo = {
  location: 'Allen, TX',
  email: 'you@example.com',
  linkedInUrl: 'https://www.linkedin.com/in/your-profile',
  websiteUrl: 'https://aarontilley.me',
}

export const summary =
  'Senior Developer with 18 years of experience across banking, healthcare, and security software. Progressed from technical support and quality assurance into software engineering and team leadership. Currently building React components inside Microsoft Dynamics 365 for a Salesforce-to-Dynamics 365 migration serving 3,000+ clients.'

export const skillGroups = [
  {
    label: 'Languages',
    skills: ['C#', 'TypeScript', 'JavaScript', 'SQL'],
  },
  {
    label: 'Frameworks & Libraries',
    skills: ['React', 'Angular', '.NET', 'SignalR', 'Tailwind CSS', 'shadcn/ui', 'TanStack Router'],
  },
  {
    label: 'Cloud & Platforms',
    skills: [
      'AWS Lambda',
      'AWS ECS',
      'AWS RDS',
      'AWS DynamoDB',
      'AWS SQS',
      'Docker',
      'Terraform',
      'Elasticsearch',
      'Microsoft Dynamics 365',
      'Power Apps',
      'Power Automate',
    ],
  },
  {
    label: 'Tools & Practices',
    skills: ['Git', 'GitHub', 'Jira', 'Visual Studio', 'VS Code', 'SSMS', 'npm', 'Microservices Architecture'],
  },
]

export type Project = {
  name: string
  bullets: string[]
}

export type Role = {
  title: string
  dateRange?: string
  bullets?: string[]
  projects?: Project[]
  // One-line blurb for this role's entry in the About page's "My Journey"
  // timeline (see src/lib/journey.ts). Not shown on the resume.
  aboutDetail?: string
}

export type Company = {
  name: string
  location?: string
  dateRange: string
  roles: Role[]
  // Set to show this company as ONE About timeline entry (its role
  // progression plus this blurb) instead of one entry per role.
  aboutCombined?: { detail: string }
}

export const experience: Company[] = [
  {
    name: 'Alight Solutions',
    location: 'Remote',
    dateRange: 'June 2022 – Present',
    roles: [
      {
        title: 'Senior Developer',
        dateRange: 'June 2026 – Present',
        aboutDetail: 'Developing a Salesforce → Dynamics 365 CRM migration.',
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
        aboutDetail: 'Led a development team while staying hands-on with the code.',
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
              'Led the team through the migration while maintaining continuity of service for existing clients',
            ],
          },
        ],
      },
      {
        title: 'Developer',
        dateRange: 'July 2022 – April 2023',
        aboutDetail: 'Joined to build out enterprise-scale full-stack systems.',
        projects: [
          {
            name: 'Smart Select MD',
            bullets: [
              'Developed a client-facing healthcare navigation tool using Angular, C# services on AWS ECS, SQL, and Elasticsearch, enabling users to search for doctors and facilities by specialty or condition',
              'Built search functionality that combined member health insurance data with provider cost, rating, and quality information to support informed care decisions',
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
        aboutDetail: 'Grew from quality into full-time development on the same product.',
        bullets: [
          'Built and deployed microservices to scale security platform from 10k to 100k agents',
          'Deployed and troubleshot AWS SQS, RDS, DynamoDB, and Lambda infrastructure',
          'Developed and deployed microservices for interacting with Qualys Cloud Security Assessment (CSPM)',
        ],
      },
      {
        title: 'Quality Engineer',
        dateRange: 'May 2016 – April 2019',
        aboutDetail: 'Moved into engineering, ensuring quality testing and reliable software.',
        bullets: [
          'Performed end-to-end web application and API testing',
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
    aboutCombined: {
      detail: 'Supported mission-critical emergency department software where reliability wasn’t optional.',
    },
    roles: [
      {
        title: 'Quality Assurance Analyst',
        dateRange: 'October 2014 – May 2016',
        bullets: [
          'Analyzed and documented root cause related to software, databases, HL7 interfaces, and APIs',
          'Managed database, including configuration, debugging, modifying, and updating stored procedures',
        ],
      },
      {
        title: 'Implementation Technical Engineer',
        dateRange: 'November 2013 – October 2014',
        bullets: [
          'Scoped, planned, and implemented new customer projects, from defining goals and requirements through delivery',
        ],
      },
      {
        title: 'Support Technical Analyst II',
        dateRange: 'January 2011 – November 2013',
        bullets: [
          'Reviewed and resolved escalated issues requiring advanced troubleshooting and provided root cause analysis',
          'Provided leadership, mentoring, training, and instruction to Support Specialists in the Customer Support Group',
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
        aboutDetail: 'Cut my teeth supporting production systems in a high-stakes financial environment.',
        bullets: [
          'Monitored bank-wide IT infrastructure to maintain uptime for essential systems, including Online Banking, Bill Pay, and ATM/POS networks',
          'Administered mainframe, UNIX/Linux, and Windows platforms supporting trading applications and e-commerce software',
        ],
      },
    ],
  },
]

export type Credential = {
  kind: 'degree' | 'certification'
  title: string
  date: string
  detail?: string
  location?: string
  // One-line blurb for the About timeline; only degrees appear there.
  aboutDetail?: string
}

export const credentials: Credential[] = [
  {
    kind: 'certification',
    title: 'AWS Certified Developer - Associate',
    date: 'January 2022',
  },
  {
    kind: 'degree',
    title: 'University of North Texas',
    detail: 'Bachelor of Science in Business Computer Information Systems',
    date: 'December 2004',
    location: 'Denton, TX',
    aboutDetail: 'Turned that high-school BASIC habit into a real foundation in systems and software.',
  },
]
