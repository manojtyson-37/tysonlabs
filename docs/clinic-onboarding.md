# Connecting your clinic to Review Manager

For clinic owners and managers. Takes about two minutes.

## Before you start
You need all of these:
1. **A Google Business Profile for your clinic that is verified.** If you see your clinic on Google Maps with a "Manage this profile" option, you are usually set.
2. **A Google account that is an Owner or Manager of that profile.** Check at <https://business.google.com>: you should see your clinic in the list.
3. If you use a company Google Workspace account, ask your Workspace administrator to make sure **Google Business Profile is turned on** for your account.

You do **not** need to add TysonLabs or anyone else as a manager on your profile.

## Connect
1. In your clinic software, click **Connect Google**.
2. Sign in with the Google account that manages your Business Profile.
3. Google shows a permission screen from **Tyson Labs Review Manager**. It asks to manage your Business Profile listings. This permission is what lets us read your reviews and post replies you approve. Click **Allow**. (If Google shows an "unverified app" notice while we are completing Google's review, choose **Advanced**, then **Continue**.)
4. You return to your clinic software. Choose the location to connect.

## What we do and do not do
- We read your **locations and reviews** and show them in one place.
- We suggest a polite reply. **Nothing is posted until you or your staff approve it.**
- Suggested replies are designed not to mention treatment or health or confirm the reviewer was a patient, and staff can edit them, so please read each one before approving.
- We do not change your listing, sell your data, use it for ads, or send review text to an AI provider.
- Details: <https://tysonlabs.in/privacy#google-user-data>

## Disconnect or delete your data
- Disconnect in Review Manager at any time, or remove access at <https://myaccount.google.com/permissions>.
- When you disconnect we delete the stored sign-in token immediately, and your synced reviews and drafts 30 days later (or at once if you ask).
- To ask for a full export or erasure, email <privacy@tysonlabs.in> from the connected account.
- Replies already posted stay on Google; edit or delete them in your Business Profile.

## Troubleshooting
| What you see | What it means | What to do |
|---|---|---|
| "No Business Profile found for this Google account" (`no_business_profile`) | You signed in, but that account manages no location we can see. Either it is the wrong account, or the profile is not verified | Sign in again with the account that manages your clinic, and check the profile is verified |
| Google says "access denied" or "this app is blocked" | Our app is not yet open to all accounts, or your Workspace admin has blocked it | Tell us your Google email; we can add you as an approved tester (during this testing phase you may need to reconnect about once a week). Workspace admins: allow the app in the Admin console |
| The location list is empty | The profile is not verified, or your account is not an Owner or Manager | Verify the profile, or ask the owner to make you a Manager |
| "Needs reconnect" | Google access was removed or expired | Click Connect Google again |
| A reply was refused as unsafe | It mentioned health or treatment, a phone number, a link, or the reviewer's name | Reword it in general terms, for example a simple thank-you |
