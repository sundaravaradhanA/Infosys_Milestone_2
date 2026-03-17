# Backend-Fronend Connection Plan

## Issues Identified:
1. **No user profile endpoint** - Profile page can't fetch/update user data
2. **No transfer endpoint** - Dashboard transfer doesn't work
3. **Rewards not connected** - Rewards page has static data
4. **KYC not connected** - KYC page has no functionality
5. **Bills not connected** - Bills feature exists in backend but no frontend page

## Backend Updates Needed:

### 1. Create Users Route (users.py)
- GET /users/{user_id} - Get user by ID
- PUT /users/{user_id} - Update user profile
- PATCH /users/{user_id}/kyc - Update KYC status

### 2. Create Transfer Endpoint (accounts.py)
- POST /accounts/transfer - Transfer money between accounts

### 3. Create Bills Page in Frontend
- New Bills.jsx page connected to /bills endpoint

## Frontend Updates Needed:

### 1. Profile.jsx
- Connect to /users/{user_id} endpoint
- Handle form submission with PUT

### 2. KYC.jsx
- Connect to user KYC status
- Add document upload functionality

### 3. Rewards.jsx
- Connect to /rewards and /rewards/total-points

### 4. Dashboard.jsx
- Fix transfer to use API endpoint

### 5. App.jsx
- Add Bills route

