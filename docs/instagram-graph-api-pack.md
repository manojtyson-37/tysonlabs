# Meta Instagram Graph API: Approval, Verification & Integration Pack

**Date:** 2026-11-14  
**Author:** TysonLabs Architecture  
**Status:** Ready for Action / Implementation  

---

## 1. Cross-Repository Audit & Existing Approvals

A complete audit was conducted across all local TysonLabs workspaces to uncover our existing API approvals, accounts, and infrastructure:

| Resource / System | Workspace / Source | Key Identifiers / Status | Notes & Verification Proof |
|---|---|---|---|
| **Google Cloud GBP API** | `TysonLabs` (`docs/oauth-verification-pack.md`) | Project `tysonlabs-reviews` (No. `631712576838`) | **Approved 2026-11-02** (Case `9-3586000042356`). Account Management 300 req/min, My Business API 600 req/min. Owner: `manoj.r@tysonlabs.in`. |
| **Meta Developer App** | `Whatsapp Integration- Saas` (`frontend/.env`, `api/.env`) | App ID: `2229540584495459` (`WA Automation`) | **Active Business App** on Meta Graph API `v21.0`. Embedded Signup Config ID: `1563341825174738`. |
| **Meta Permanent Token** | `Whatsapp Integration- Saas` (`.env.local`) | System User ID: `122116957467405156` | **Permanent System User Token** with `business_management`, `whatsapp_business_management`, `whatsapp_business_messaging`. Verified active via live Graph call. |
| **Meta WhatsApp Business** | `Whatsapp Integration- Saas` (`.env.local`) | Phone ID: `1249687118222928` | Verified live business number: `+91 63606 81493` ("KBD Credit Solutions", Quality: `GREEN`). |
| **Verified Domain** | `tysonlabs.in` | Verified in Google Search Console | Production domain hosted on Vercel with HTTPS, DNS control, and legal endpoints. |
| **Live Email Account** | `Silaa Website`, `TysonLabs` | `testtyson37@gmail.com` & `manoj.r@tysonlabs.in` | Active Google & Meta test accounts. |
| **Instagram Manager Project** | `Instagram Manager- Claude Bot` | First Client: `@travel_kathegalu` | Orchestrator built for Reels, Carousels, Stories, Competitor Pulse, and Collab Outreach. |

---

## 2. Instagram Graph API Architecture & Requirements

Unlike the legacy Instagram Basic Display API (deprecated by Meta in December 2024), the **Instagram Graph API** allows businesses and creators to programmatically publish media, retrieve insights, and manage interactions.

### The 3 Core Requirements:
1. **Professional Account**: The target Instagram profile MUST be converted to an **Instagram Business** or **Instagram Creator** account (Personal profiles cannot use the Graph API).
2. **Facebook Page Connection**: The Instagram Professional account must be connected to a Facebook Page that belongs to your Meta Business Portfolio.
3. **Meta App with Instagram Product**: Configured under Meta for Developers (either inside existing App `2229540584495459` or a dedicated app).

### Required Scopes & Permissions:
- `instagram_basic`: Read Instagram account profile info, user ID, username, and media lists.
- `instagram_content_publish`: Create containers and publish photos, carousels, videos, and Reels.
- `instagram_manage_insights`: Read reach, impressions, profile views, follower demographics, and engagement.
- `instagram_manage_comments`: Moderate and reply to post comments.
- `pages_show_list`: Retrieve Facebook Pages owned by the authenticated user to find the linked Instagram account.
- `pages_read_engagement`: Access engagement metrics on the connected Facebook Page.
- `business_management`: Manage assets within the Meta Business Portfolio.

---

## 3. Immediate Fast-Track: Development Mode (Zero Waiting)

Meta allows **instant testing** without submitting for Meta App Review while the app is in Development Mode:

1. **Add Instagram Product to Meta App `2229540584495459`**:
   - Go to [Meta for Developers](https://developers.facebook.com/apps/2229540584495459/add-product/).
   - Click **Add Product** and select **Instagram Graph API** (or **Instagram**).
2. **Add Roles**:
   - In App Dashboard, navigate to **App Roles > Roles**.
   - Add `testtyson37@gmail.com` as **Developer** or **Tester**.
   - Under **Instagram Testers**, click **Add Instagram Tester** and enter the target Instagram username (e.g. `travel_kathegalu` or your test account).
   - The Instagram account owner accepts the invite at:  
     `Instagram App > Settings & Privacy > Website Permissions > Apps and Websites > Tester Invitations`.
3. **Execute API Calls Immediately**:
   - Any token generated for an Instagram Tester can query `/me/accounts`, create media containers, and publish Reels or Carousels right away.

---

## 4. Meta App Review Submission Playbook (For Production / Multi-Tenant)

To allow any external client or business to connect their Instagram account via OAuth (Live Mode), Meta requires App Review. The requirements have been built and verified on `tysonlabs.in`:

### A. Live Compliance Endpoints on `tysonlabs.in`
- **Privacy Policy**:  
  `https://tysonlabs.in/privacy#meta-instagram-data`  
  *(Updated with explicit Section 6 detailing Instagram data handling, limited use, and token security)*
- **Terms of Service**:  
  `https://tysonlabs.in/terms`  
  *(Updated with Section 5 covering Meta & Instagram services and Community Guidelines)*
- **Data Deletion Instructions URL**:  
  `https://tysonlabs.in/data-deletion`  
  *(User-facing self-service page explaining how to remove access and track data deletion)*
- **Data Deletion Callback Webhook**:  
  `https://tysonlabs.in/api/v1/meta/data-deletion`  
  *(Automated server endpoint parsing Meta `signed_request` and returning confirmation codes)*
- **Domain Verification**:  
  Supported dynamically via `META_DOMAIN_VERIFICATION` in `src/app/layout.tsx`.

### B. Scope Justifications for Review Form
When submitting each permission in the Meta App Review center, use the pre-drafted justifications below:

> **For `instagram_content_publish`:**  
> *"TysonLabs provides an Instagram content management and scheduling workspace for creators and local businesses. After drafting and reviewing carousels, reels, and photos, users click 'Publish to Instagram'. The app creates the media container via the Instagram Graph API and publishes the post to the user's verified business profile. The app never publishes content autonomously without explicit human confirmation."*

> **For `instagram_basic` & `pages_show_list`:**  
> *"Used during OAuth onboarding to locate the user's Facebook Page, detect the linked Instagram Professional Account ID, and display the account username and profile picture within their private dashboard."*

> **For `instagram_manage_insights`:**  
> *"Used to display content performance analytics (reach, impressions, saved posts, and engagement rate) in the client's reporting dashboard, helping them refine their content strategy."*

### C. Screencast Video Recording Checklist (3–4 minutes)
Upload an unlisted video on YouTube demonstrating:
1. Show `https://tysonlabs.in` homepage, then scroll to `https://tysonlabs.in/privacy#meta-instagram-data`.
2. Show the client clicking **Connect Instagram**.
3. Pause on the Meta OAuth consent dialog showing the App Name (`WA Automation` / `TysonLabs`) and the requested permissions.
4. Show the redirected dashboard displaying the connected Instagram account.
5. Demonstrate selecting a drafted Reel or Carousel, previewing it, and clicking **Publish**.
6. Switch to Instagram to show the post published live.
7. Show how the user can disconnect their account and visit `/data-deletion`.

---

## 5. TysonLabs Code Implementation

The following modules have been created in `TysonLabs`:

1. `src/lib/instagram.ts`:
   - `getInstagramAuthUrl()`: Builds OAuth URL with the 7 required Instagram & Facebook scopes.
   - `exchangeCodeForLongLivedToken()`: Automatically exchanges short-lived tokens for 60-day tokens.
   - `getConnectedInstagramAccounts()`: Inspects linked Instagram Business accounts.
   - `publishSinglePhoto()`: Container creation + publish.
   - `publishReel()`: Video container creation with async polling for encoding completion + publish.
   - `publishCarousel()`: Multi-item container creation (2–10 items) + parent publish.
   - `getAccountInsights()`: Metrics query for reach, impressions, and engagement.
   - `parseSignedRequest()`: Cryptographic HMAC SHA-256 verification of Meta callbacks.
2. `src/app/api/v1/meta/data-deletion/route.ts`:
   - Production-grade endpoint fulfilling Meta's automated callback check.
3. `src/app/data-deletion/page.tsx`:
   - Interactive user-facing status tracker and removal guide.
4. `src/app/privacy/page.tsx` & `src/app/terms/page.tsx`:
   - Compliant legal sections for Meta App Review.
5. `src/app/layout.tsx`:
   - Support for `facebook-domain-verification`.

---

## 6. Next Steps for Manoj

1. **Log in to Meta for Developers** using `testtyson37@gmail.com` or `manoj.r@tysonlabs.in`.
2. Open App `2229540584495459` (or create a dedicated app).
3. Under **Add Product**, enable **Instagram Graph API**.
4. In **Roles > Instagram Testers**, invite your test account or `@travel_kathegalu`.
5. In Meta App Settings > Basic:
   - Privacy Policy URL: `https://tysonlabs.in/privacy#meta-instagram-data`
   - Terms of Service URL: `https://tysonlabs.in/terms`
   - User Data Deletion: select **Data Deletion Callback URL** and enter `https://tysonlabs.in/api/v1/meta/data-deletion` (or select Data Deletion Instructions URL and enter `https://tysonlabs.in/data-deletion`).
6. Copy `App Secret` into `.env.local` as `FACEBOOK_APP_SECRET`.
7. Test the first live Reel/Carousel publishing using `src/lib/instagram.ts`.
