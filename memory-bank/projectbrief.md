# Huurly 1.0 - Project Brief

## Project Overview
Huurly is a rental property platform that connects property owners (verhuurders), renters (huurders), property managers (beheerders), and evaluators (beoordelaars) in the Dutch rental market.

## Core Requirements
- Multi-role user system with distinct dashboards for each user type
- Property search and matching functionality
- Application and approval workflows
- Payment processing integration
- Document management
- Real-time messaging between users
- Profile management and verification

## Current Task Scope
Modify the huurder (renter) dashboard to:
1. Change button text from "mijn gebruikers naam en wachtwoord" to "instellingen"
2. Create an instellingen (settings) page with password reset functionality
3. Add email update capability
4. Add account deletion with confirmation
5. Use existing password reset modal as foundation

## Technical Stack
- React/TypeScript frontend
- Supabase backend (auth, database, storage)
- Tailwind CSS for styling
- React Router for navigation
- Form validation with react-hook-form
- State management with Zustand

## Success Criteria
- Button text updated correctly
- Settings page accessible from dashboard
- Password reset functionality works from dashboard
- Email update functionality implemented
- Account deletion with proper confirmation
- All functionality properly integrated with existing auth system
