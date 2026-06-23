# Get-Feedback

Get-Feedback is a minimalist, industrial-style visual feedback tool. It allows non-technical clients to paste a website URL, capture a screenshot, draw simple annotations (pins and rectangles) with comments, and share the final annotated image with a freelancer via a generated link.

## How to run it locally

1. **Install Dependencies**
   ```bash
   pnpm install
   # Install Playwright browsers for the screenshot engine:
   npx playwright install chromium
   ```
2. **Environment Setup**
   Copy `.env.example` to `.env` and configure your credentials:
   ```env
   DATABASE_URL="mysql://root:root@127.0.0.1:3307/get_feedback_db"
   CLOUDINARY_CLOUD_NAME="..."
   CLOUDINARY_API_KEY="..."
   CLOUDINARY_API_SECRET="..."
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```
3. **Setup Database Schema**
   ```bash
   pnpm prisma db push
   ```
4. **Run the App**
   ```bash
   pnpm dev
   ```

## Who it's for, and the one job it has to do well
**Who it's for:** Independent freelancers and small agencies communicating with non-technical clients.
**The one job:** To instantly turn a messy website feedback process (usually done via long emails or WhatsApp chats) into a single, annotated image without requiring the client to create an account or install browser extensions.

## Why this problem, and how you know it's worth solving
Communicating visual changes over text is frustrating and prone to misinterpretation. Freelancers waste hours deciphering vague client feedback like "move the red button down a bit". It's worth solving because time is money for freelancers, and reducing friction in client communication directly increases project profitability and client satisfaction.

## What's already out there for it, and why you built this anyway
Tools like **Marker.io**, **Pastel**, or **BugHerd** exist, but they are built for large teams with complex scopes, heavy widget installations, and ticketing system integrations (like Jira). I built **Get-Feedback** because small freelancers don't need enterprise bloat. They need something dead simple, zero-setup for the client, and straight to the point—just paste a URL, point, click, and share. The generated view page is just the image itself, with absolutely zero distractions.

## What you put in scope, what you left out, and why
**In scope:** 
- Headless browser screenshot capture via Playwright.
- Two annotation tools: Pins and Rectangles with auto-expanding textareas.
- Image generation and sharing via Cloudinary.
- Strict industrial aesthetic (no AI-slop, no heavy shadows or rounded corners).
**Left out:**
- User Authentication (Login/Signup). Left out to ensure zero friction for the client.
- Comment threads and resolution states. Left out to keep the tool "fire-and-forget". The focus is on capturing the feedback, not managing a project.

## Where you didn't have answers, what you assumed
- **Assumption:** I assumed that websites to be annotated are publicly accessible. Pages behind logins or auth walls cannot be captured by the backend headless browser in this version.
- **Assumption:** I assumed mobile-responsiveness for the annotation canvas wasn't the absolute priority for v1, since most heavy website review/annotation by clients happens on desktops.

## Three questions you'd ask a real user before building more
1. How often do your clients review pages on mobile devices versus desktop?
2. Would you prefer the feedback to be grouped into a single dashboard (requiring you to log in) or is receiving individual links via chat/email enough?
3. If you could choose, which feature do you need the most: Freehand Drawing or Precision Pin & Rectangle?

## How you'd know it's working, and what you'd do next
**How I'd know:** By tracking the number of generated unique feedback slugs and measuring the drop-off rate between "landing on the editor" and "clicking Generate & Share". If clients successfully create and share links, the core value prop is proven.
**What next:** 
- Implement an optional Chrome Extension for capturing auth-walled or local development sites.
- Add an "Export to PDF" feature for clients who prefer downloading physical files.

## How I used AI (and what it got wrong)
**Where it helped:** I used an AI coding assistant (Antigravity) to rapidly bootstrap the Next.js 14 boilerplate, configure the Prisma database schema, and write the boilerplate Playwright headless-browser route (`/api/screenshot`). It saved me hours of digging through documentation for standard setups.

**What it got wrong:** During the annotation capture phase, the AI suggested and implemented `html2canvas` to render the canvas into a final image. However, when I tested it, the app crashed with an *"unsupported color function oklab"* error. The AI failed to account for the fact that Tailwind CSS v4 uses modern `oklch/oklab` colors under the hood, which `html2canvas`'s custom CSS parser cannot read. I caught this, removed `html2canvas`, and replaced it with `html-to-image` (which uses native SVG `foreignObject` rendering), completely solving the bug.
