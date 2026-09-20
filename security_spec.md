# Security Specification & Test Blueprint

## 1. Data Invariants
1. Teacher data isolation: A teacher can only access, create, read, update, or delete data within their own workspace (`/teachers/{teacherId}/...`).
2. Authentication required: All read and write operations require authenticated requests (`request.auth != null`).
3. Document ownership invariant: `teacherId` in subcollections must strictly match the parent document ID `teacherId` and `request.auth.uid`.
4. Document ID sanitization: Path IDs must adhere to `isValidId()` (string <= 128 characters, alphanumeric and hyphens/underscores).
5. Immutable fields: Identity keys (`id`, `teacherId`) and creation timestamp (`createdAt`) cannot be altered during updates.
6. Server timestamps: Timestamps must use `request.time`.
7. Schema validation: All payloads must pass validation helpers checking types, maximum length, and required fields.

## 2. The "Dirty Dozen" Payloads
1. Unauthenticated teacher profile write.
2. Cross-teacher identity spoofing (writing to another teacher's profile or subcollection).
3. Oversized string payload injection (e.g., 20,000 char student name).
4. Malicious document ID injection (path traversal or special characters in ID).
5. Attempting to alter immutable `teacherId` during an update.
6. Grade record with score out of bounds (score < 0 or score > 10).
7. Invalid gender field value (e.g., gender: "Hacker").
8. Invalid examType in grade record (e.g., examType: "ILLEGAL_TYPE").
9. Attendance status injection with invalid status enum.
10. Missing required fields in ClassItem creation (e.g. missing `name`).
11. Blank unverified email write when email verification is enforced.
12. Attempting to overwrite another user's assignment completion status without permission.

## 3. Test Runner Design (`firestore.rules.test.ts`)
All 12 payloads must be rejected with `PERMISSION_DENIED` by Firestore security rules.
