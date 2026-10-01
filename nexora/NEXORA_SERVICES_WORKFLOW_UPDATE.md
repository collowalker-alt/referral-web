# NEXORA Services — Full Workflow Update

NEXORA now includes a full digital-services workflow alongside Marketplace, Earn, Advertise and Academy.

## Member-facing services
- Websites and landing pages
- Mobile apps
- Web applications / SaaS
- E-commerce stores
- UI/UX and product design
- Automation and AI workflows
- API / payment / WhatsApp integrations
- Branding and digital identity
- Hosting and domain setup
- Website/app maintenance
- Custom software
- Other digital requests

The Services page is designed as a premium service studio: short service descriptions appear directly under each service, service cards select the service and smoothly take the member to the request form, and the same interaction works on mobile.

## Request form
Members can submit:
- service type
- project title
- detailed requirements
- optional budget
- WhatsApp number
- email address
- up to six small reference files (stored as request attachments in the current implementation)

## Project lifecycle
1. Submitted / Awaiting Review
2. Received & Processing
3. Information Required / Feedback
4. Quotation
5. In Progress
6. Completed / Client Review
7. Paid

Members can view a project timeline, receive notifications, accept or request changes to quotations, request a revision, approve completed work and communicate through project chat.

## Admin workflow
Admins can:
- search and filter requests
- mark a request Received
- request more information
- send a quotation with amount and scope note
- start a project
- update milestones
- communicate through project chat
- mark work Completed
- mark a project Paid

Each important admin state change creates a member notification.

## General NEXORA content
Instructions, the public "How NEXORA works" section, FAQ and public feature descriptions now mention NEXORA Services and the project workflow.

## UI direction
The Services page uses the NEXORA dark/navy system with restrained cyan/blue accents, subtle orbital branding, service chips, clear step cards, timeline states, quotation cards, project chat and mobile-first responsive behavior.

## Storage note
Reference attachments are currently stored with the service request as encoded data. For production at scale, migrate attachments to object storage (for example an S3-compatible bucket) and store only secure file references in PostgreSQL.
