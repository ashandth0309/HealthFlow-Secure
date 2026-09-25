# HealthFlow Secure

HealthFlow Secure is the security-enhanced version of the original **HealthFlow** healthcare management system, developed for the **SE4030 – Secure Software Development** group assignment.

The objective of this project was to analyze an existing application, identify security vulnerabilities, implement appropriate security controls, integrate OAuth/OpenID Connect authentication, and apply secure software engineering practices without rebuilding the application from scratch.

---

## Team Members

| Student | Student ID | Primary Responsibility |
|---|---|---|
| Ashandth Uthayashankar | IT22272522 | Authentication & Identity Security, Google OIDC, Integration |
| Sobiya Anton Suresh | IT22203694 | Patient Data & API Security |
| S S Y Wickramasinghe | IT21816086 | Application & Infrastructure Hardening |

---

## Repository Information

### Original Application

The original HealthFlow repository represents the application before the security improvements introduced for this assignment.

https://github.com/ashandth0309/HealthFlow

### Security-Enhanced Application

This repository contains the security improvements implemented for the SE4030 assignment.

https://github.com/ashandth0309/HealthFlow-Secure

The original project history was retained so that the vulnerable implementation and the security-enhanced implementation can be compared through Git history.

---

# Security Assessment

The original HealthFlow application was reviewed for security weaknesses in authentication, authorization, API design, configuration, file handling, dependency management, and sensitive data handling.

The following security issues were identified and addressed.

| ID | Security Issue | Area | Security Improvement |
|---|---|---|---|
| V01 | Hardcoded client-side doctor authentication | Authentication | Replaced with server-side authentication using bcrypt and JWT |
| V02 | Insufficient protection of doctor APIs and sensitive authentication data | Access Control / Authentication | Added authentication and authorization middleware and safer password handling |
| V03 | Lack of federated authentication | Identity | Added Google OpenID Connect sign-in for registered doctors |
| V04 | Unauthenticated access to admission APIs | Access Control | Admission endpoints now require authenticated doctor access |
| V05 | Mass assignment in admission updates | Input / API Security | Added an explicit update-field allowlist |
| V06 | Unauthenticated access to prescription APIs | Access Control | Prescription endpoints now require authenticated doctor access |
| V07 | Mass assignment in prescription operations | Input / API Security | Added allowlisted updates and server-controlled doctor identity |
| V08 | Weak HTTP/CORS security configuration | Security Configuration | Restricted CORS and added Helmet security headers |
| V09 | No authentication rate limiting | Authentication | Added rate limiting to authentication endpoints |
| V10 | Unrestricted prescription file uploads | File Security | Restricted file type and size and randomized stored filenames |
| V11 | Known vulnerable and unnecessary dependencies | Dependency Security | Updated vulnerable dependencies and removed unused Nodemailer dependency |

> V03 is the required federated identity enhancement rather than an exploitable vulnerability by itself. The remaining items represent security weaknesses identified in the original application.

---

# Security Improvements

## V01 – Hardcoded Client-Side Doctor Authentication

### Original Issue

The original doctor login implementation performed authentication in the frontend using hardcoded credentials.

The client-side application contained authentication logic using fixed credentials. Because frontend JavaScript is delivered to the user's browser, authentication logic and credentials implemented entirely on the client cannot be treated as trusted security controls.

### Security Fix

Doctor authentication was moved to the backend.

The improved implementation:

- retrieves the doctor account from the database;
- verifies passwords using bcrypt;
- issues a signed JSON Web Token (JWT) after successful authentication;
- returns only the information required by the frontend;
- uses the JWT for subsequent protected API requests.

Invalid credentials are rejected by the backend rather than being evaluated solely in the browser.

---

## V02 – Doctor API Authentication and Authorization

### Original Issue

Sensitive doctor API operations were not sufficiently protected by reusable server-side authentication and authorization controls.

This could allow sensitive functionality to be accessed without consistently verifying the identity and role of the requesting user.

### Security Fix

Reusable authentication and authorization middleware was introduced.

Protected endpoints now validate:

1. the presence of a Bearer token;
2. the validity of the JWT;
3. the authenticated user's role where required.

Passwords are hashed using bcrypt before storage and verified using secure password comparison.

Sensitive password information is not intentionally returned as part of normal authenticated doctor responses.

---

## V03 – Google OpenID Connect

Google sign-in was integrated as the federated authentication feature for the assignment.

The implementation uses **Google OpenID Connect (OIDC)** to authenticate a doctor's Google identity.

### Authentication Flow

1. The doctor selects **Sign in with Google**.
2. Google authenticates the user.
3. The resulting Google identity credential is provided to the HealthFlow backend.
4. The backend verifies the Google identity.
5. The verified email address is compared with registered HealthFlow doctor accounts.
6. If a matching registered doctor exists, HealthFlow issues its own application JWT.
7. The authenticated doctor can then access protected HealthFlow functionality.

A Google account that is not associated with a registered HealthFlow doctor is denied HealthFlow doctor access.

This means successful Google authentication alone does not automatically create unrestricted doctor access to the application.

---

## V04 – Unauthenticated Admission API Access

### Original Issue

The original admission API allowed sensitive admission information and operations to be accessed without authentication.

Testing of the original implementation demonstrated that admission information could be retrieved without supplying authentication credentials.

### Security Fix

Admission routes are now protected using JWT authentication and doctor-role authorization.

Unauthenticated requests are rejected with:

```text
HTTP 401 Unauthorized
Authentication required
```

Authenticated users must satisfy the required doctor role before accessing protected admission functionality.

---

## V05 – Admission Mass Assignment

### Original Issue

The original admission update logic used client-supplied request data directly in the database update operation.

Conceptually, the vulnerable pattern was equivalent to accepting:

```javascript
{ $set: req.body }
```

This could allow fields outside the intended generic update functionality to be modified.

### Security Fix

The secured implementation uses an explicit allowlist for permitted admission update fields.

The general admission update operation permits intended fields such as:

- fullname
- nic
- phone
- email
- assignedDoctor
- appointmentData

Sensitive workflow fields are excluded from the generic update operation.

If a request contains no permitted update fields, the application rejects the update.

Testing confirmed that a protected field such as `status` could not be modified through the secured generic update endpoint, while an allowlisted field such as `phone` could still be updated by an authenticated doctor.

---

## V06 – Unauthenticated Prescription API Access

### Original Issue

Prescription API functionality was accessible without authentication.

Testing demonstrated that prescription information could be requested without supplying authentication credentials.

### Security Fix

Prescription routes are now protected using JWT authentication and doctor-role authorization.

Unauthenticated attempts to retrieve prescription information return:

```text
HTTP 401 Unauthorized
Authentication required
```

A valid authenticated doctor JWT is required to access protected prescription functionality.

---

## V07 – Prescription Mass Assignment Protection

### Original Issue

The prescription API accepted client-controlled data too broadly during update operations.

Directly trusting a request body during database updates can allow a client to attempt to modify fields that should be controlled by the application.

### Security Fix

The secured implementation introduces an explicit update allowlist.

Only intended prescription fields can be updated through the generic update endpoint.

The prescribing doctor's email for newly created prescriptions is derived from the authenticated identity rather than trusting a client-supplied doctor identity.

Input validation and normalization are also applied where appropriate.

Testing confirmed that an attempt to modify a protected field such as the doctor's email through the generic update endpoint was rejected, while an allowed prescription update continued to function.

---

## V08 – CORS and HTTP Security Configuration

### Original Issue

The original backend contained weak CORS configuration, including unrestricted CORS middleware.

The application also did not provide the additional HTTP security headers introduced during the security-hardening process.

### Security Fix

The secured backend restricts allowed browser origins to the intended frontend origin during local development:

```text
http://localhost:5173
```

Testing confirmed that a request using the configured frontend origin received:

```text
Access-Control-Allow-Origin: http://localhost:5173
```

A request using the test origin:

```text
https://evil.example
```

was not granted an `Access-Control-Allow-Origin` header permitting that origin.

Helmet was also introduced to provide additional HTTP response security headers.

Observed headers during final testing included:

- Content-Security-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy
- Origin-Agent-Cluster
- Referrer-Policy
- Strict-Transport-Security
- X-Content-Type-Options
- X-DNS-Prefetch-Control
- X-Download-Options
- X-Frame-Options
- X-Permitted-Cross-Domain-Policies

---

## V09 – Missing Authentication Rate Limiting

### Original Issue

The original authentication endpoint did not contain application-level protection against repeated authentication attempts.

An attacker could repeatedly submit login requests without an application-enforced request limit.

### Security Fix

Rate limiting was added to authentication routes.

The implemented configuration limits authentication requests within a defined time window.

Repeated authentication requests eventually return:

```text
HTTP 429 Too Many Requests
```

with:

```json
{
  "success": false,
  "message": "Too many authentication attempts. Please try again later."
}
```

During final integrated testing, the rate limiter successfully blocked additional authentication requests after the configured request limit had been reached.

This reduces the practicality of high-frequency automated password-guessing attempts against the authentication endpoint.

---

## V10 – Unrestricted Prescription File Upload

### Original Issue

The original pharmacy prescription upload functionality accepted uploaded files without sufficient type or size restrictions.

A harmless `.txt` security-test file was successfully uploaded through the original implementation, demonstrating that the upload functionality was not restricted to the expected prescription document formats.

### Security Fix

The improved implementation:

- permits JPEG images;
- permits PNG images;
- permits PDF documents;
- checks the declared MIME type;
- checks the file extension;
- enforces a maximum file size of 5 MB;
- generates randomized server-side filenames;
- rejects unsupported file types;
- returns controlled errors for invalid uploads.

After remediation, the `.txt` test file was rejected while legitimate image and PDF uploads continued to work.

### Current Limitation

The current implementation validates MIME type and extension but does not perform malware scanning or complete file-content/magic-byte inspection.

This is documented as an area for additional production hardening.

---

## V11 – Vulnerable and Unnecessary Dependencies

### Original Issue

The backend dependency tree was reviewed using:

```bash
npm audit
```

Before remediation, npm reported:

```text
11 vulnerabilities
1 low
2 moderate
7 high
1 critical
```

The findings included vulnerabilities affecting direct or transitive dependencies.

### Security Fix

Compatible vulnerable dependencies were updated.

The project was also checked for usage of the `nodemailer` package. Because it was not used by the tracked application source, it was removed instead of retaining an unnecessary vulnerable dependency.

After remediation:

```text
npm audit
found 0 vulnerabilities
```

The same result was obtained during final integrated testing.

This means npm audit reported **0 known vulnerabilities in the installed dependency tree at the time of testing**. It does not guarantee that the application or its dependencies can never contain additional vulnerabilities.

---

# Secure Software Engineering Practices

The security-enhanced version of HealthFlow applies several secure software engineering principles.

## Server-Side Authentication

Authentication decisions are performed on the server rather than trusting client-side application logic.

## Password Security

Passwords are hashed using bcrypt and verified using secure password comparison.

Plaintext passwords are not intentionally stored as the application's authentication representation.

## Authentication Tokens

JWTs are issued following successful application authentication and are required for protected API operations.

## Authorization

Reusable middleware performs authentication and role checks for protected functionality.

## Least Privilege

Sensitive admission and prescription operations are restricted to authenticated users with the required doctor role.

## Input Control

Explicit allowlists are used for sensitive update operations rather than directly trusting complete client-supplied request objects.

## Secure Configuration

CORS is restricted to the intended frontend origin for the local configuration.

Helmet provides additional HTTP response security headers.

## Abuse Protection

Authentication rate limiting reduces repeated automated login attempts.

## Secure File Handling

Prescription uploads are restricted by expected MIME types, file extensions, and maximum file size.

Stored upload filenames are generated by the server rather than directly trusting the original client filename.

## Dependency Management

Dependencies were audited, vulnerable packages were updated, and an unused vulnerable dependency was removed.

## Secret Management

Environment-specific configuration and secrets are excluded from version control.

Values such as JWT signing secrets must be supplied through local environment configuration rather than committed to Git.

---

# Security Testing

Security controls were tested before and after remediation using:

- Postman
- PowerShell
- curl
- npm audit
- browser-based application testing
- Google authentication testing
- Git/GitHub history and pull-request review

---

# Final Integrated Security Verification

After all three team members' changes were merged, the final `main` branch was tested as one integrated application.

## Dependency Audit

The final backend dependency installation produced:

```text
up to date, audited 195 packages
found 0 vulnerabilities
```

A separate audit also produced:

```text
npm audit
found 0 vulnerabilities
```

---

## Backend Startup

The final backend successfully started with:

```text
Listening on port 8081
Connected to MongoDB
```

A Mongoose duplicate-index warning relating to `roomId` was observed during startup, but it did not prevent the backend or database connection from operating.

---

## Unauthenticated Admission Test

Request:

```text
GET /api/admit
```

Result:

```text
HTTP/1.1 401 Unauthorized
```

Response:

```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

## Unauthenticated Prescription Test

Request:

```text
GET /api/prescriptions
```

Result:

```text
HTTP/1.1 401 Unauthorized
```

Response:

```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

## Valid Doctor Authentication

A registered test doctor was authenticated through the secured login endpoint.

The backend returned:

```text
success: true
message: Login successful
```

and issued an application JWT.

The JWT itself is not included in this documentation.

---

## Authenticated Admission Access

The issued JWT was supplied using the Bearer authorization header.

The authenticated request to:

```text
GET /api/admit
```

successfully returned admission data.

This confirmed that the protected route remained accessible to an authenticated doctor after all security changes were integrated.

---

## Authenticated Prescription Access

The same authenticated doctor JWT was used with:

```text
GET /api/prescriptions
```

The request completed without an authentication or authorization error.

---

## HTTP Security Header Verification

Final responses contained Helmet-provided security headers including:

```text
Content-Security-Policy
Cross-Origin-Opener-Policy
Cross-Origin-Resource-Policy
Referrer-Policy
Strict-Transport-Security
X-Content-Type-Options
X-Frame-Options
```

---

## CORS Verification

Request using the configured frontend origin:

```text
Origin: http://localhost:5173
```

received:

```text
Access-Control-Allow-Origin: http://localhost:5173
```

A request using:

```text
Origin: https://evil.example
```

did not receive an `Access-Control-Allow-Origin` header granting that origin access.

The API response itself returned `401` in these tests because no JWT was intentionally supplied. This was expected and independent of the CORS verification.

---

## Authentication Rate-Limit Verification

Repeated requests were sent to:

```text
POST /auth/doctor/login
```

Invalid authentication attempts initially returned:

```text
HTTP 401 Unauthorized
```

After the configured authentication request limit was reached, subsequent requests returned:

```text
HTTP 429 Too Many Requests
```

with:

```json
{
  "success": false,
  "message": "Too many authentication attempts. Please try again later."
}
```

This confirmed that the rate limiter remained operational after all branches were merged.

---

# Team Contributions

## Ashandth Uthayashankar – IT22272522

### Responsibility

**Authentication & Identity Security, Google OIDC, and Integration**

Branch:

```text
ashandth-auth-security
```

Key commits:

```text
c162b43 feat(security): secure doctor authentication and add Google OIDC
12ef2e6 chore(security): remove secrets and dependencies from version control
```

Merged through:

```text
Pull Request #1
```

### Contributions

- analyzed the original doctor authentication implementation;
- removed hardcoded client-side doctor authentication;
- implemented backend doctor authentication;
- implemented bcrypt password verification;
- implemented JWT authentication;
- implemented reusable authentication/authorization middleware;
- protected sensitive doctor functionality;
- prevented sensitive password information from being exposed through normal authenticated responses;
- integrated Google OpenID Connect;
- implemented registered-doctor validation for Google identities;
- removed sensitive/environment-specific files from version control;
- performed integration work across the final security branches;
- performed final merged security verification.

---

## Sobiya Anton Suresh – IT22203694

### Responsibility

**Patient Data & API Security**

Branch:

```text
sobiya-api-security
```

Security commits:

```text
f9fd780 fix(security): protect admission APIs and prevent mass assignment
02dd6f7 fix(security): protect prescription APIs and prevent mass assignment
```

Branch synchronization commit:

```text
408aa5e merge: sync sobiya API security branch with main
```

Merged through:

```text
Pull Request #3
```

### Contributions

- analyzed admission API access controls;
- protected admission routes using authentication;
- introduced doctor-role authorization for admission functionality;
- prevented admission mass assignment using an update allowlist;
- analyzed prescription API access controls;
- protected prescription routes using authentication;
- introduced doctor-role authorization for prescription functionality;
- prevented prescription mass assignment;
- derived prescribing doctor identity from authenticated context;
- verified protected and permitted update behavior.

---

## S S Y Wickramasinghe – IT21816086

### Responsibility

**Application & Infrastructure Hardening**

Branch:

```text
yohan-app-hardening
```

Key commits:

```text
2375ff7 fix(security): restrict CORS and add HTTP security headers
9d52337 fix(security): add authentication rate limiting
8541826 fix(security): restrict prescription file uploads
9f921b6 fix(security): remediate vulnerable backend dependencies
```

Merged through:

```text
Pull Request #2
```

### Contributions

- analyzed backend CORS configuration;
- restricted CORS to the intended frontend origin;
- introduced Helmet security headers;
- implemented authentication rate limiting;
- analyzed prescription upload handling;
- restricted prescription file types;
- implemented file-size restrictions;
- implemented randomized server-side upload filenames;
- audited backend dependencies;
- remediated vulnerable dependencies;
- removed the unused Nodemailer dependency.

---

# Git and Pull Request History

Security development was performed using separate branches so that each area of work could be reviewed independently.

## Pull Request #1

```text
Authentication & Identity Security
```

Merged into `main` with:

```text
66641fe
Merge pull request #1 from ashandth0309/ashandth-auth-security
```

---

## Pull Request #2

```text
Application & Infrastructure Hardening
```

Merged into `main` with:

```text
fb335da
Merge pull request #2 from ashandth0309/yohan-app-hardening
```

---

## Pull Request #3

```text
Security: protect patient admission and prescription APIs
```

Merged into `main` with:

```text
7fce983
Merge pull request #3 from ashandth0309/sobiya-api-security
```

At the time of final integrated testing, the final `main` branch was at:

```text
7fce983
```

---

# Local Development Setup

## Prerequisites

Install:

- Git
- Node.js
- npm
- MongoDB

The application also requires appropriate local environment configuration.

---

## Clone the Security-Enhanced Repository

```bash
git clone https://github.com/ashandth0309/HealthFlow-Secure.git
cd HealthFlow-Secure
```

---

## Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the backend:

```bash
npm start
```

The backend is configured to run locally on:

```text
http://localhost:8081
```

---

## Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend is expected to run locally on:

```text
http://localhost:5173
```

---

# Environment Configuration

Sensitive configuration is intentionally excluded from version control.

A local backend `.env` file is required.

Example structure:

```env
PORT=8081
DEV_MODE=development
MONGO_URL=<YOUR_MONGODB_CONNECTION_STRING>
JWT_SECRET=<YOUR_SECURE_JWT_SECRET>
```

Google authentication also requires the appropriate Google OAuth/OIDC configuration used by the application.

Do not commit:

- JWT signing secrets;
- database credentials;
- passwords;
- OAuth client secrets;
- private keys;
- access tokens;
- other production credentials.

---

# Known Limitations and Future Security Improvements

The implemented controls significantly improve the security of the original HealthFlow application, but this assignment does not represent a complete production security architecture.

## 1. Record-Level Authorization

Admission and prescription authorization currently enforces authenticated doctor-role access.

Complete per-record authorization, where a doctor is permitted to access only records specifically assigned to that doctor, has not been implemented across all affected functionality.

This should be considered for future production hardening.

## 2. File Content Inspection

Prescription upload protection currently validates expected MIME types and extensions and enforces a file-size limit.

A production implementation could additionally include:

- file-signature/magic-byte validation;
- malware scanning;
- isolated storage;
- additional content inspection.

## 3. Distributed Rate Limiting

The current authentication rate limiter is suitable for the assignment/local application architecture.

A distributed production deployment could use a shared persistent rate-limit store so that limits remain consistent across multiple backend instances.

## 4. Production Secret Management

Production deployments should use a dedicated secret-management solution rather than manually managed local environment files.

## 5. Continuous Dependency Monitoring

Dependencies should continue to be reviewed and updated as new security advisories are published.

## 6. Production Deployment Configuration

A production deployment would require additional environment-specific controls including:

- HTTPS;
- secure reverse-proxy configuration;
- production CORS origins;
- centralized monitoring;
- secure logging;
- backup and recovery controls;
- deployment-specific secret management.

---

# Evidence Collected

Before-and-after evidence was collected throughout the assessment and remediation process.

Evidence includes:

- original vulnerable source-code examples;
- hardcoded doctor authentication before remediation;
- secured doctor login after remediation;
- JWT-protected API behavior;
- Google sign-in button;
- Google account-selection flow;
- denial of an unregistered Google doctor identity;
- successful Google OIDC authentication for a registered doctor;
- Google OAuth client configuration;
- admission API access before remediation;
- admission API HTTP 401 response after remediation;
- admission mass-assignment testing;
- prescription API access before remediation;
- prescription API HTTP 401 response after remediation;
- prescription mass-assignment testing;
- CORS testing;
- Helmet security-header verification;
- authentication rate-limit testing;
- unrestricted `.txt` prescription upload before remediation;
- rejection of the `.txt` upload after remediation;
- successful permitted image upload;
- successful permitted PDF upload;
- npm audit results before remediation;
- npm audit results after remediation;
- final integrated security verification.

Sensitive values such as JWTs, passwords, secrets, and private credentials should be redacted from evidence used in public documentation or demonstration material.

---

# Demonstration Video

A final demonstration video will be recorded after implementation and documentation are completed.

The demonstration will cover:

- identified vulnerabilities;
- vulnerable behavior before remediation;
- implemented security controls;
- behavior after remediation;
- Google OpenID Connect authentication;
- API security testing;
- application/infrastructure hardening;
- final integrated verification.

The final video link will be added here before submission.

---

# Academic Purpose

This repository was prepared for the **SE4030 – Secure Software Development** group assignment.

The security findings and remediation documented in this repository relate specifically to the reviewed HealthFlow application and the scope of the assignment.
