# Google OAuth: publishing and verification pack

Everything needed to take Review Manager from "Testing" (test users only) to a state where any clinic's owner can connect.
Last checked 2026-11-03. Google's console labels change, so treat click paths as approximate.

## 1. Where we are

| Item | State |
|---|---|
| Google Cloud project | `tysonlabs-reviews` (number 631712576838), owner `manoj.r@tysonlabs.in` |
| Business Profile API access | Approved 2026-11-02 (case 9-3586000042356); Account Management 300 req/min, My Business API 600 req/min |
| Consent screen | External, **Testing**, one test user (`manoj.r@tysonlabs.in`) |
| Scopes declared | `openid`, `userinfo.email`, `business.manage` (the console lists all three as **non-sensitive**) |
| Homepage / privacy / terms | `https://tysonlabs.in/reviews`, `/privacy`, `/terms` (live) |
| Authorized domain | `tysonlabs.in` (verified in Search Console) |
| OAuth client | One web client, redirect `https://tysonlabs.in/api/v1/oauth/callback` |
| Real sync tested | Yes, with SRIDATRI PHYSIO CARE (42 reviews) |

## 2. The important caveat (read first)

Google's own console shows `business.manage` as **non-sensitive**, which normally means no verification is needed and the app can simply be
published. But developers in Google's forum (reports dated August to October 2026, none resolved when last checked) describe apps that are
"In production" with that scope where **every non-test user is blocked at consent with `Error 403: access_denied`**, and the Verification Center
offers nothing to submit. Google Business Profile support told one of them it cannot reclassify scopes and sent them to the Auth Platform team.

So we do not know yet which behaviour our project will get. The plan below finds out cheaply and safely, and has fallbacks.

Source: [forum thread](https://discuss.google.dev/t/oauth-business-manage-shown-as-non-sensitive-in-auth-platform-but-backend-blocks-all-external-users-with-error-403-access-denied-no-submit-for-verification-path-exists/384175).

## 3. Plan, in order

### Step A: pre-flight (do first, all reversible)
- [ ] Open the consent screen **Branding** page and confirm: app name "Tyson Labs Review Manager", support email, homepage, privacy, terms, authorized domain `tysonlabs.in`, developer contact email.
- [ ] Open **Data access** and confirm only the three scopes above. Narrowest scope that works: `business.manage` is the only scope that reads and replies to reviews, so no narrower one exists.
- [ ] Delete any OAuth clients that are not the production client (Google asks for this before verification).
- [ ] Confirm the privacy page matches what the app really does (it was corrected on 2026-11-02; re-read it before submitting).
- [ ] Optional logo: a logo triggers verification and is not required. Skip it for now.

### Step B: publish, then test with a non-test account
1. In **Audience**, click **Publish app** and confirm. (Status becomes "In production". You can go back to Testing from the same page if needed.)
2. Use a Google account that is **not** a listed test user and that manages a Business Profile (ask a clinic friendly to us, or use a second account you control).
3. Create a connect link (`POST /api/v1/connect-sessions`), open it in a private window, sign in with that account.
4. Possible outcomes:
   - **Consent screen appears (maybe with an "unverified app" warning you can continue past):** it works. Go to Step D.
   - **`Error 403: access_denied` for a non-test user:** you have hit the forum bug. Go to Step C.

### Step C: if external users are blocked
Try these in order:
1. **Check the Verification Center** (Google Auth Platform, Verification Center). If a "Prepare for verification" or "Submit" option exists for brand or data access, use Section 5 and 6 below to complete it.
2. **Open a Google Cloud support case** to the Auth Platform team (not the Business Profile API team) with: project number, the exact error, "scope business.manage is listed as non-sensitive but external users get 403 access_denied", and a link to the forum thread above. Mention the approved GBP allowlist case 9-3586000042356. (Basic support may not allow cases; if so, use the Verification Center "contact" link or the Business Profile API support form with "General API Question" and ask them to route it.)
3. **Fallback that works today:** go back to **Testing** and add each onboarding clinic's owner as a **test user** (up to 100). They will see an "unverified app" warning on consent; that is acceptable for a pilot and fine for the first clients. Test users' refresh tokens in Testing mode expire after 7 days, which is a real limitation, so do not rely on this beyond a pilot: the sync would need reconnection weekly. Move to Production as soon as the block is lifted.

### Step D: once external users can connect
- [ ] Re-check Search Console shows `tysonlabs.in` still verified.
- [ ] Keep the app name, domain and privacy URLs unchanged (changing them can trigger re-review).
- [ ] Upgrade Neon to Launch before the first real clinic connects (Free keeps 6 hours of history).
- [ ] Give the clinic `docs/clinic-onboarding.md`.

## 4. Scope justification (paste into the verification form if asked)

> **Scope `https://www.googleapis.com/auth/business.manage`.** Review Manager helps a clinic or local business answer its Google reviews. With the
> signed-in owner's permission, the app (1) lists the Business Profile locations the owner manages, so the owner can choose which to connect; (2) reads
> those locations' reviews so they can be shown in one inbox; and (3) posts a reply that the owner or their staff has approved to a review. All three
> need `business.manage`: it is the only Business Profile scope that covers reading reviews and publishing replies, so a narrower scope cannot deliver the
> feature. We request no other Business Profile data. The app never posts without an explicit approval click, never changes listing information, and
> does not read other Google data. Tokens are stored encrypted and deleted when the owner disconnects.
>
> **Scopes `openid` and `https://www.googleapis.com/auth/userinfo.email`.** Used only to show which Google account is connected and to detect when a
> different account is used to reconnect, so that old location links are not reused by a different account.

Documentation links Google allows (up to three): the [Business Profile APIs prerequisites](https://developers.google.com/my-business/content/prereqs),
our homepage `https://tysonlabs.in/reviews`, and our privacy policy `https://tysonlabs.in/privacy#google-user-data`.

## 5. Limited Use and data handling (must match the privacy page)

| Statement | Where it is true in the code |
|---|---|
| Data used only to show reviews to the owner and post approved replies | no other consumer of the data exists; routes in `src/app/api/v1/tenants/[ref]/` |
| Not sold, not used for ads, not used to train models | no such code; replies come from a built-in library (`src/reviews-service/library.ts`), no review text goes to an AI provider |
| Tokens encrypted at rest | envelope encryption, `src/reviews-service/crypto.ts`; the token is wiped on disconnect and also when Google rejects the grant (`service.ts`) |
| Token deleted at disconnect; reviews and drafts deleted 30 days later or on request (backups excepted) | `disconnect()`, `cron_purge_expired()` (migrations 0002 and 0003), erase endpoint |
| Humans do not read Google data except on request, security, law | **operational policy, confirm before submitting**: the database owner credential is held by one person; no code enforces it |
| Security log holds no review text, kept 12 months | `audit_log`, purged in `cron_purge_expired()` |

**If AI drafting is ever switched on** (`DRAFTS_MODE=ai`), the privacy page, the terms and the verification submission must be updated first,
because they currently say review text is not sent to an AI provider.

## 6. Demo video script (English, 3 to 4 minutes, screen recording)

Record in a clean browser window at 1080p. Upload to YouTube Studio as **Unlisted** and paste the link in the form.
Google asks that it shows the full OAuth grant, the consent screen with the correct app name, and the OAuth client ID visible in the address bar.

| # | Show | Say (short) |
|---|---|---|
| 1 | `https://tysonlabs.in/reviews` homepage | "This is Review Manager. It helps a clinic read and reply to its Google reviews." |
| 2 | Scroll to the privacy page's Google data section | "Our privacy policy explains what we read, why, and how to delete it." |
| 3 | The client app's **Connect Google** button, then the connect URL loading | "The owner clicks Connect." |
| 4 | Google account chooser, then the **consent screen**. **Pause on the address bar so `client_id=` is readable.** Zoom on the app name and the permission text | "Google shows the app name and asks for permission to manage Business Profile listings." |
| 5 | Click Allow, land back on the app with status connected | "The owner approves and returns to the app." |
| 6 | List of locations from the account, choose one to link | "We use the scope to list the locations this owner manages." |
| 7 | Run sync, show the reviews list and the summary | "We read the reviews of the linked location. This is the only data we read." |
| 8 | Create a suggested reply for a review | "The app suggests a reply. Nothing is posted yet." |
| 9 | Show the approval step (approvedBy, confirm), post it, then open the review on Google to show the reply live | "Only after a person approves does the app post the reply." |
| 10 | Disconnect, then show the connection status and the Google permissions page (myaccount.google.com/permissions) with access gone | "The owner can disconnect at any time, and access is revoked." |

Tips: use a test clinic whose reviews you control; blur reviewer names if you prefer (not required); do not show secrets, API keys or `.env` files.

## 7. Things Google may ask in follow-up emails
- **Why not a narrower scope?** Answer from Section 4.
- **How do your users test it?** Reviewers cannot use a real clinic. Offer a short written walkthrough of the video and, if asked, a test Google account with a test Business Profile. Send credentials only through the form's private field, never in this repo.
- **Branding or domain questions:** point to Search Console verification of `tysonlabs.in` and the live pages.
- **Respond within the time they give.** An unanswered Trust and Safety email pauses the review.

## 8. Timeline expectations
Brand verification is usually minutes; a sensitive-scope review can take up to about 10 days. Do not announce launch dates to clinics until Step B or C is resolved.

## 9. Guardrails from Google's approval email
Do not make public statements or press releases suggesting a partnership with, sponsorship by or endorsement by Google without written approval.
Describe Review Manager as using the Google Business Profile API, never as a Google partner.
