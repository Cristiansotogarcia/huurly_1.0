# System Architecture and Technical Specifications for Huurly.nl MVP

## 1. Introduction
This document outlines the system architecture and technical specifications for the Minimum Viable Product (MVP) of Huurly.nl, a reverse rental platform designed for the Dutch market. The platform aims to connect landlords with suitable tenants by allowing tenants to create detailed, verified profiles that landlords can search. This approach reverses the traditional rental model, offering a unique value proposition: "Laat De Woning Jou Vinden" (Let The Home Find You). The MVP will focus on core functionalities to establish a trustworthy ecosystem with robust verification features, catering to three distinct user roles: Huurders (renters), Verhuurders (landlords), and Beoordelaars (reviewers), alongside a single Admin account. The technical implementation will adhere to modern web development best practices, emphasizing GDPR compliance, mobile-first design, and a fully Dutch language interface.

## 2. Database Schema Design

The database will be built using Supabase, leveraging its PostgreSQL capabilities. All table and column names will be in Dutch to maintain consistency with the application's language. Row Level Security (RLS) policies will be meticulously applied to ensure data privacy and access control for each user role. Indexes will be added to frequently queried fields to optimize performance. Timestamps (`aangemaakt_op` for creation and `bijgewerkt_op` for last update) will be included in all relevant tables for auditing and data management.

### 2.1. `gebruikers` Table
This table will extend Supabase's `auth.users` table, storing additional user-specific data common to all user types. It will serve as the central point for user identification and authentication.

| Kolomnaam (Column Name) | Datatype (Data Type) | Beschrijving (Description)                               | Opmerkingen (Notes)                                      |
|-------------------------|----------------------|----------------------------------------------------------|----------------------------------------------------------|
| `id`                    | `UUID`               | Unieke identificatie van de gebruiker (Primary Key)      | Gekoppeld aan `auth.users.id`                            |
| `email`                 | `TEXT`               | E-mailadres van de gebruiker                             | Uniek, gekoppeld aan `auth.users.email`                  |
| `rol`                   | `TEXT`               | Rol van de gebruiker (huurder, verhuurder, beoordelaar, admin) | Enum: 'huurder', 'verhuurder', 'beoordelaar', 'admin'    |
| `aangemaakt_op`         | `TIMESTAMP WITH TIME ZONE` | Tijdstempel van aanmaak                                  | Automatisch ingesteld bij aanmaak                        |
| `bijgewerkt_op`         | `TIMESTAMP WITH TIME ZONE` | Tijdstempel van laatste update                           | Automatisch bijgewerkt bij elke wijziging                |

### 2.2. `huurders` Table
This table will store specific profile information for tenants (Huurders).

| Kolomnaam (Column Name) | Datatype (Data Type) | Beschrijving (Description)                               | Opmerkingen (Notes)                                      |
|-------------------------|----------------------|----------------------------------------------------------|----------------------------------------------------------|
| `id`                    | `UUID`               | Unieke identificatie van de huurder (Primary Key)        | Gekoppeld aan `gebruikers.id`                            |
| `voornaam`              | `TEXT`               | Voornaam van de huurder                                  |                                                          |
| `achternaam`            | `TEXT`               | Achternaam van de huurder                                |                                                          |
| `geboortedatum`         | `DATE`               | Geboortedatum van de huurder                             |                                                          |
| `beroep`                | `TEXT`               | Beroep van de huurder                                    |                                                          |
| `locatie_voorkeur`      | `TEXT`               | Voorkeurslocatie(s) voor wonen                           | Bijv. 'Amsterdam', 'Utrecht'                             |
| `grootte_voorkeur`      | `TEXT`               | Voorkeursgrootte van de woning                           | Bijv. 'appartement', 'eengezinswoning'                   |
| `budget_min`            | `NUMERIC`            | Minimaal huurbudget                                      |                                                          |
| `budget_max`            | `NUMERIC`            | Maximaal huurbudget                                      |                                                          |
| `huisdieren`            | `BOOLEAN`            | Geeft aan of huisdieren aanwezig zijn                     |                                                          |
| `roken`                 | `BOOLEAN`            | Geeft aan of de huurder rookt                            |                                                          |
| `inkomen_verificatie_url` | `TEXT`               | URL naar geüploade inkomensverificatie document          | Opslag in Supabase Storage                               |
| `referenties`           | `JSONB`              | Referenties van vorige verhuurders                       | Array of objects: {naam, contact, relatie}               |
| `profielfoto_url`      | `TEXT`               | URL naar de profielfoto                                  | Opslag in Supabase Storage                               |
| `profiel_zichtbaar`     | `BOOLEAN`            | Geeft aan of het profiel zichtbaar is voor verhuurders   |                                                          |
| `profiel_compleet`      | `BOOLEAN`            | Geeft aan of het profiel volledig is ingevuld           | Vereist voor platformtoegang                             |
| `aangemaakt_op`         | `TIMESTAMP WITH TIME ZONE` | Tijdstempel van aanmaak                                  |                                                          |
| `bijgewerkt_op`         | `TIMESTAMP WITH TIME ZONE` | Tijdstempel van laatste update                           |                                                          |

### 2.3. `verhuurders` Table
This table will store specific information for landlords (Verhuurders).

| Kolomnaam (Column Name) | Datatype (Data Type) | Beschrijving (Description)                               | Opmerkingen (Notes)                                      |
|-------------------------|----------------------|----------------------------------------------------------|----------------------------------------------------------|
| `id`                    | `UUID`               | Unieke identificatie van de verhuurder (Primary Key)     | Gekoppeld aan `gebruikers.id`                            |
| `bedrijfsnaam`          | `TEXT`               | Naam van het verhuurbedrijf (indien van toepassing)      |                                                          |
| `contactpersoon`        | `TEXT`               | Naam van de contactpersoon                               |                                                          |
| `telefoonnummer`        | `TEXT`               | Telefoonnummer van de verhuurder                         |                                                          |
| `aantal_woningen`       | `INTEGER`            | Aantal woningen in bezit                                 |                                                          |
| `aangemaakt_op`         | `TIMESTAMP WITH TIME ZONE` | Tijdstempel van aanmaak                                  |                                                          |
| `bijgewerkt_op`         | `TIMESTAMP WITH TIME ZONE` | Tijdstempel van laatste update                           |                                                          |

### 2.4. `beoordelaars` Table
This table will store specific information for reviewers (Beoordelaars).

| Kolomnaam (Column Name) | Datatype (Data Type) | Beschrijving (Description)                               | Opmerkingen (Notes)                                      |
|-------------------------|----------------------|----------------------------------------------------------|----------------------------------------------------------|
| `id`                    | `UUID`               | Unieke identificatie van de beoordelaar (Primary Key)    | Gekoppeld aan `gebruikers.id`                            |
| `naam`                  | `TEXT`               | Naam van de beoordelaar                                  |                                                          |
| `aangemaakt_op`         | `TIMESTAMP WITH TIME ZONE` | Tijdstempel van aanmaak                                  |                                                          |
| `bijgewerkt_op`         | `TIMESTAMP WITH TIME ZONE` | Tijdstempel van laatste update                           |                                                          |

### 2.5. `documenten` Table
This table will store metadata about documents uploaded by tenants for verification.

| Kolomnaam (Column Name) | Datatype (Data Type) | Beschrijving (Description)                               | Opmerkingen (Notes)                                      |
|-------------------------|----------------------|----------------------------------------------------------|----------------------------------------------------------|
| `id`                    | `UUID`               | Unieke identificatie van het document (Primary Key)      |                                                          |
| `huurder_id`            | `UUID`               | ID van de huurder die het document heeft geüpload        | Foreign Key naar `huurders.id`                           |
| `type`                  | `TEXT`               | Type document (bijv. 'inkomensverificatie', 'ID')        | Enum: 'inkomensverificatie', 'ID', 'referentiebrief'     |
| `url`                   | `TEXT`               | URL naar het opgeslagen document                         | Opslag in Supabase Storage                               |
| `status`                | `TEXT`               | Status van het document (bijv. 'ingediend', 'goedgekeurd', 'afgewezen') | Enum: 'ingediend', 'goedgekeurd', 'afgewezen', 'in_behandeling' |
| `opmerkingen`           | `TEXT`               | Opmerkingen van de beoordelaar                           |                                                          |
| `ingediend_op`          | `TIMESTAMP WITH TIME ZONE` | Tijdstempel van indiening                                |                                                          |
| `beoordeeld_op`         | `TIMESTAMP WITH TIME ZONE` | Tijdstempel van beoordeling                              |                                                          |
| `beoordelaar_id`        | `UUID`               | ID van de beoordelaar die het document heeft beoordeeld  | Foreign Key naar `beoordelaars.id`                       |

### 2.6. `verificaties` Table
This table will track the overall verification status of a tenant's profile.

| Kolomnaam (Column Name) | Datatype (Data Type) | Beschrijving (Description)                               | Opmerkingen (Notes)                                      |
|-------------------------|----------------------|----------------------------------------------------------|----------------------------------------------------------|
| `id`                    | `UUID`               | Unieke identificatie van de verificatie (Primary Key)    |                                                          |
| `huurder_id`            | `UUID`               | ID van de huurder wiens profiel wordt geverifieerd       | Foreign Key naar `huurders.id`                           |
| `status`                | `TEXT`               | Algemene verificatiestatus (bijv. 'in_afwachting', 'geverifieerd') | Enum: 'in_afwachting', 'geverifieerd', 'afgewezen'       |
| `laatste_update`        | `TIMESTAMP WITH TIME ZONE` | Tijdstempel van de laatste update van de status          |                                                          |

### 2.7. `notificaties` Table
This table will store in-app notifications for all user types.

| Kolomnaam (Column Name) | Datatype (Data Type) | Beschrijving (Description)                               | Opmerkingen (Notes)                                      |
|-------------------------|----------------------|----------------------------------------------------------|----------------------------------------------------------|
| `id`                    | `UUID`               | Unieke identificatie van de notificatie (Primary Key)    |                                                          |
| `gebruiker_id`          | `UUID`               | ID van de gebruiker voor wie de notificatie is           | Foreign Key naar `gebruikers.id`                         |
| `titel`                 | `TEXT`               | Titel van de notificatie                                 |                                                          |
| `bericht`               | `TEXT`               | Volledige bericht van de notificatie                     |                                                          |
| `gelezen`               | `BOOLEAN`            | Geeft aan of de notificatie is gelezen                   | Standaard `FALSE`                                        |
| `type`                  | `TEXT`               | Type notificatie (bijv. 'systeem', 'actie_vereist')      | Enum: 'systeem', 'actie_vereist', 'informatie'           |
| `aangemaakt_op`         | `TIMESTAMP WITH TIME ZONE` | Tijdstempel van aanmaak                                  |                                                          |

### 2.8. `abonnementen` Table
This table will track tenant subscriptions.

| Kolomnaam (Column Name) | Datatype (Data Type) | Beschrijving (Description)                               | Opmerkingen (Notes)                                      |
|-------------------------|----------------------|----------------------------------------------------------|----------------------------------------------------------|
| `id`                    | `UUID`               | Unieke identificatie van het abonnement (Primary Key)    |                                                          |
| `huurder_id`            | `UUID`               | ID van de huurder met het abonnement                     | Foreign Key naar `huurders.id`                           |
| `stripe_abonnement_id`  | `TEXT`               | Stripe abonnement ID                                     |                                                          |
| `status`                | `TEXT`               | Status van het abonnement (bijv. 'actief', 'geannuleerd') | Enum: 'actief', 'inactief', 'geannuleerd', 'proef'       |
| `start_datum`           | `DATE`               | Startdatum van het abonnement                            |                                                          |
| `eind_datum`            | `DATE`               | Einddatum van het abonnement                             | Voor jaarlijkse abonnementen                             |
| `prijs`                 | `NUMERIC`            | Prijs van het abonnement                                 | €65.00                                                   |
| `valuta`                | `TEXT`               | Valuta van het abonnement                                | 'EUR'                                                    |
| `aangemaakt_op`         | `TIMESTAMP WITH TIME ZONE` | Tijdstempel van aanmaak                                  |                                                          |
| `bijgewerkt_op`         | `TIMESTAMP WITH TIME ZONE` | Tijdstempel van laatste update                           |                                                          |

## 3. API Endpoints Design

The backend API will be built using Flask, interacting with the Supabase database. The API will be RESTful, with clear and intuitive endpoints for each resource. Authentication and authorization will be handled via Supabase Auth and integrated with Flask. All API responses will be in JSON format, and error messages will be in Dutch.

### 3.1. Authentication Endpoints

| Endpoint                 | Methode | Beschrijving                                       | Toegang                                   |
|--------------------------|---------|----------------------------------------------------|-------------------------------------------|
| `/api/auth/registreren`  | `POST`  | Registreer een nieuwe huurder account              | Open (voor huurders)                      |
| `/api/auth/inloggen`     | `POST`  | Log in gebruiker                                   | Open                                      |
| `/api/auth/uitloggen`    | `POST`  | Log uit gebruiker                                  | Geauthenticeerd                           |
| `/api/auth/wachtwoord_reset` | `POST`  | Vraag wachtwoordreset aan                          | Open                                      |
| `/api/auth/gebruiker`    | `GET`   | Haal geauthenticeerde gebruikerinformatie op      | Geauthenticeerd                           |

### 3.2. Huurder (Tenant) Endpoints

| Endpoint                 | Methode | Beschrijving                                       | Toegang                                   |
|--------------------------|---------|----------------------------------------------------|-------------------------------------------|
| `/api/huurders/profiel`  | `GET`   | Haal huurderprofiel op                             | Huurder                                   |
| `/api/huurders/profiel`  | `PUT`   | Update huurderprofiel                              | Huurder                                   |
| `/api/huurders/documenten` | `POST`  | Upload een document                                | Huurder                                   |
| `/api/huurders/documenten` | `GET`   | Haal geüploade documenten op                       | Huurder                                   |
| `/api/huurders/abonnement` | `GET`   | Haal abonnementsstatus op                          | Huurder                                   |
| `/api/huurders/abonnement/aanmelden` | `POST`  | Start een nieuw abonnement                         | Huurder                                   |
| `/api/huurders/abonnement/annuleren` | `POST`  | Annuleer huidig abonnement                         | Huurder                                   |

### 3.3. Verhuurder (Landlord) Endpoints

| Endpoint                 | Methode | Beschrijving                                       | Toegang                                   |
|--------------------------|---------|----------------------------------------------------|-------------------------------------------|
| `/api/verhuurders/zoeken` | `GET`   | Zoek huurdersprofielen met filters                 | Verhuurder                                |
| `/api/verhuurders/profiel/{id}` | `GET`   | Haal specifiek huurderprofiel op                   | Verhuurder                                |
| `/api/verhuurders/opgeslagen` | `GET`   | Haal opgeslagen huurdersprofielen op               | Verhuurder                                |
| `/api/verhuurders/opgeslagen` | `POST`  | Sla een huurderprofiel op                          | Verhuurder                                |
| `/api/verhuurders/opgeslagen/{id}` | `DELETE` | Verwijder een opgeslagen huurderprofiel            | Verhuurder                                |

### 3.4. Beoordelaar (Reviewer) Endpoints

| Endpoint                 | Methode | Beschrijving                                       | Toegang                                   |
|--------------------------|---------|----------------------------------------------------|-------------------------------------------|
| `/api/beoordelaars/documenten/wachtrij` | `GET`   | Haal documenten in de wachtrij op                  | Beoordelaar                               |
| `/api/beoordelaars/documenten/{id}/beoordeel` | `POST`  | Beoordeel een document (goedkeuren/afwijzen)       | Beoordelaar                               |
| `/api/beoordelaars/documenten/geschiedenis` | `GET`   | Haal beoordelingsgeschiedenis op                   | Beoordelaar                               |

### 3.5. Admin Endpoints

| Endpoint                 | Methode | Beschrijving                                       | Toegang                                   |
|--------------------------|---------|----------------------------------------------------|-------------------------------------------|
| `/api/admin/verhuurders` | `POST`  | Maak een nieuwe verhuurder account aan             | Admin                                     |
| `/api/admin/gebruikers`  | `GET`   | Beheer alle gebruikers (lijst, details)          | Admin                                     |
| `/api/admin/gebruikers/{id}` | `PUT`   | Update gebruikerinformatie                         | Admin                                     |
| `/api/admin/gebruikers/{id}` | `DELETE` | Verwijder gebruiker                                | Admin                                     |
| `/api/admin/analytics`   | `GET`   | Haal platform analytics op                         | Admin                                     |
| `/api/admin/instellingen` | `GET`   | Haal systeeminstellingen op                        | Admin                                     |
| `/api/admin/instellingen` | `PUT`   | Update systeeminstellingen                         | Admin                                     |

### 3.6. Notification Endpoints

| Endpoint                 | Methode | Beschrijving                                       | Toegang                                   |
|--------------------------|---------|----------------------------------------------------|-------------------------------------------|
| `/api/notificaties`      | `GET`   | Haal alle notificaties op                          | Geauthenticeerd                           |
| `/api/notificaties/{id}/lezen` | `PUT`   | Markeer notificatie als gelezen                    | Geauthenticeerd                           |

## 4. Frontend Component Design

The frontend will be developed using React with TypeScript, styled with Tailwind CSS and shadcn/ui components. The design will be mobile-first, responsive, and adhere to accessibility standards (WCAG 2.1 AA). All user-facing text, including field names, error messages, and UI elements, will be in Dutch. Icons will be sourced from `lucide-react`, with a preference for housing-related iconography.

### 4.1. Core Layout Components
- **`Layout.tsx`**: Main application layout, including responsive navigation (with mobile hamburger menu), sidebar navigation for authenticated users, and a main content area.
- **`Header.tsx`**: Contains the Huurly logo, navigation links, and user-specific actions (e.g., profile, logout).
- **`Sidebar.tsx`**: Role-based navigation for authenticated users (Tenant, Landlord, Reviewer, Admin dashboards).
- **`Footer.tsx`**: Contains links to public pages like Privacy Policy, Terms of Service, and Contact.

### 4.2. Authentication Components
- **`Login.tsx`**: User login form.
- **`RegisterTenant.tsx`**: Tenant registration form with subscription option.
- **`ForgotPassword.tsx`**: Password reset request form.
- **`ProfileSettings.tsx`**: Component for users to view and edit their profile information.

### 4.3. Huurder (Tenant) Components
- **`TenantDashboard.tsx`**: Main dashboard for tenants, showing profile completion status, recent notifications, and quick links.
- **`ProfileForm.tsx`**: Comprehensive form for tenants to create/edit their profile (personal details, housing preferences, lifestyle, income verification upload, references, profile picture upload).
- **`DocumentUpload.tsx`**: Component for tenants to upload documents and view their verification status.
- **`SubscriptionManagement.tsx`**: Component for tenants to manage their subscription (view status, renew, cancel).

### 4.4. Verhuurder (Landlord) Components
- **`LandlordDashboard.tsx`**: Main dashboard for landlords, showing search interface, saved profiles, and analytics overview.
- **`TenantSearch.tsx`**: Interface for landlords to search tenant profiles with advanced filtering (location, budget, household size, lifestyle, income range).
- **`TenantProfileView.tsx`**: Component to display a detailed tenant profile to landlords.
- **`SavedProfiles.tsx`**: Displays a list of tenant profiles saved by the landlord.

### 4.5. Beoordelaar (Reviewer) Components
- **`ReviewerDashboard.tsx`**: Main dashboard for reviewers, displaying the document review queue and performance metrics.
- **`DocumentReviewQueue.tsx`**: Lists documents awaiting review with priority sorting.
- **`DocumentViewer.tsx`**: Component to preview documents and provide approval/rejection options with reason selection.
- **`ReviewHistory.tsx`**: Displays a history of reviewed documents.

### 4.6. Admin Components
- **`AdminDashboard.tsx`**: Central dashboard for admin, with links to user management, landlord creation, analytics, and system settings.
- **`UserManagement.tsx`**: Interface to manage all user accounts (list, view, edit, delete).
- **`CreateLandlord.tsx`**: Form for admin to create new landlord accounts.
- **`AnalyticsDashboard.tsx`**: Displays comprehensive platform analytics using Recharts.
- **`SystemSettings.tsx`**: Interface to configure system-wide settings.

### 4.7. General UI Components
- **`NotificationCenter.tsx`**: Displays in-app notifications for all user types.
- **`ToastNotification.tsx`**: Component for displaying transient messages (success, error, info).
- **`LoadingSpinner.tsx`**: Visual indicator for asynchronous operations.
- **`EmptyState.tsx`**: Components to display when data is not available, with helpful guidance.
- **`ErrorBoundary.tsx`**: For graceful error handling.
- **`LanguageSwitcher.tsx`**: (If multi-language support is considered in future, currently Dutch only).
- **`DarkModeToggle.tsx`**: For dark mode functionality.

## 5. Third-Party Integrations

### 5.1. Supabase
- **Authentication**: User registration, login, password reset, session management, and role-based access control.
- **Database**: PostgreSQL for all data storage, with RLS for security.
- **Storage**: For storing uploaded documents (income verification, profile pictures) and other media assets.

### 5.2. Stripe
- **Subscription Management**: Handling the €65/year subscription for tenants.
- **Payment Processing**: Securely processing payments, managing recurring billing, invoicing, cancellations, and renewals.
- **Webhooks**: To receive real-time updates on payment events (e.g., successful payment, subscription cancellation).

### 5.3. Resend
- **Email Notifications**: Sending transactional emails such as document submission confirmations, approval/rejection notifications, system alerts, and subscription-related emails.

## 6. Security Considerations
- **GDPR Compliance**: Data handling will be GDPR compliant, including data export, account deletion options, consent management, privacy settings, and data retention policies. EU-based hosting will be prioritized.
- **Secure Admin Credentials**: Admin credentials will be securely managed using environment variables and not hardcoded in the frontend or public repositories.
- **Authentication & Authorization**: Supabase Auth will provide robust authentication. Role-based access control (RBAC) will be implemented to ensure users only access resources relevant to their role.
- **Row Level Security (RLS)**: Implemented in Supabase to restrict data access at the database level.
- **Input Validation**: Comprehensive validation on all forms using `react-hook-form` and `zod` to prevent common vulnerabilities like injection attacks.
- **Rate Limiting**: For API calls to prevent abuse and denial-of-service attacks.
- **SSL/TLS Encryption**: All communication between frontend and backend will be encrypted.
- **Automated Backups**: Regular database backups will be configured.

## 7. Deployment Strategy

The MVP will be deployed to a cloud platform that supports both React frontend and Flask backend applications, with a focus on EU-based data centers for GDPR compliance. Continuous Integration/Continuous Deployment (CI/CD) pipelines will be set up to automate testing and deployment processes.

## 8. Future Enhancements (Beyond MVP)
- Two-factor authentication (2FA) for all user roles.
- Advanced analytics and reporting for admin.
- In-app messaging between landlords and tenants (after initial match).
- Integration with external calendar services for viewing appointments.
- Multi-language support (though current MVP is Dutch only).
- AI-powered tenant-landlord matching improvements.

This document serves as a comprehensive guide for the development of the Huurly.nl MVP, ensuring a structured and efficient build process.

