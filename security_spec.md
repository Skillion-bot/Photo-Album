# Security Specification - SnapVault Archive

## Data Invariants
1. A photo must always belong to an existing album and the same user who owns the album.
2. A user can only manage (create, update, delete) their own albums and photos.
3. Timestamps (createdAt) must be set by the server.
4. IDs must be valid alphanumeric strings.
5. Search queries and listing must be owner-enforced by the rules.

## The Dirty Dozen Payloads
1. **Identity Spoofing**: Attempt to create a photo with someone else's `userId`.
2. **Orphaned Photo**: Create a photo referencing a `projectId` (albumId) that doesn't exist.
3. **Privilege Escalation**: Update an album's `userId` to take ownership.
4. **Denial of Wallet**: Inject a 1MB string into the `title` field.
5. **ID Poisoning**: Create a document where `photoId` is a 2KB junk string.
6. **State Mutation**: Change `createdAt` on an update.
7. **Cross-User Leak**: Attempt to list photos without a `where` clause on `userId` (should be blocked by rules if query doesn't match).
8. **Malicious Schema**: Add a `isVerified: true` hidden field to a user profile.
9. **Timestamp Fraud**: Provide a client-side timestamp for `createdAt`.
10. **Album Stealing**: Try to add a photo to an album owned by another user.
11. **PII Leak**: Read another user's private data (email) via a collection scan.
12. **Recursive Cost Attack**: Create deep subcollection structures (if allowed).

## Test Runner (Conceptual)
All payloads above must return `PERMISSION_DENIED`.
