# HuurderDashboard Redesign Plan

## Step 1: Analyze Current Structure
- Examine HuurderDashboard.tsx, ProfileOverview.tsx, and related components.
- Query public.huurders schema for all fields.

## Step 2: Implement Profile and Cover Photo
- Add upload components for profile_pic and cover_photo using Cloudflare.
- Integrate with existing profilePictureUrl.

## Step 3: Redesign Layout
- Create sidebar with cover photo background, circular profile pic, name, and details.
- Display all huurders fields in sections.

## Step 4: Add Completeness Logic
- Check for missing fields/documents and show alerts.

## Step 5: Ensure Responsiveness
- Use Tailwind for mobile-friendly design.

## Step 6: Test and Document
- Run TS check, preview UI, update changelog.md.