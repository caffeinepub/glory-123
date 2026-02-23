# Specification

## Summary
**Goal:** Add admin password authentication to protect product upload and category management features.

**Planned changes:**
- Create backend method to securely hash and verify admin password
- Add admin login form with password input on AdminPage
- Protect product upload form and category management behind authentication
- Add admin logout functionality
- Persist admin session across page refreshes

**User-visible outcome:** Admin must log in with a password to access product upload and category management features. Unauthenticated users only see the login form on the admin page.
