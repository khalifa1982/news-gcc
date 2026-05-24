# Security Specification for VERIFY GCC Firestore

## 1. Data Invariants
- **NewsItem Access**: Publicly readable. Modifiable/creatable strictly by authenticated administrators (verified users in `admins` collection).
- **Users Data**: Users can read and write only their own public profile and private PII. Email verification is mandatory (`email_verified == true`) for writes or reading PII.
- **ID Safety**: Document IDs must be safe and within 128 characters, matching alphanumerics.

## 2. The "Dirty Dozen" Spoof/Poison Payloads (Forbidden writes that must be blocked)
1. **Unauthenticated news item creation** (Attacker creates fake verified news).
2. **Standard authenticated user creating news** (Privilege escalation).
3. **Invalid ID string injection** (Resource exhaustion with gigantic string id).
4. **Altering news verifiedStatus status to fake terminal verify status** (Integrity violation).
5. **Private info read by signed-in non-owner** (PII Leak).
6. **Altering userId or displayName on someone else's public profile** (Identity Spoofing).
7. **Bypassing email validation requirement** (`email_verified` value set artificially by user in private info).
8. **Artificially changing role concept in profile** (Self-assumed role).
9. **Null/Giant values in required news properties** (Schema/Denial of Wallet attack).
10. **Bypassing Server Timestamp for createdAt / updatedAt** (Temporal corruption).
11. **Updating news tags with malicious list format** (Total Array bypass).
12. **Malicious query listing private user profiles of all users** (Blanket read mapping).

## 3. Security Rules Drafting (DRAFT_firestore.rules / firestore.rules)
Our validation rules require standardizing these shapes. We will draft and test `firestore.rules`.
