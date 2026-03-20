# 🩸 Bharat Blood Bank — React Frontend

Production-ready React frontend with PWA support.

## Tech Stack
| | |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| State | Redux Toolkit |
| HTTP | Axios (JWT interceptor) |
| Router | React Router v6 |
| Charts | Recharts |
| Notifications | React Hot Toast |
| PWA | vite-plugin-pwa |

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Make sure backend is running
```
https://bharatbloodbank.netlify.app/
```

### 3. Start dev server
```bash
npm run dev
```
Opens at: https://bharatbloodbank.netlify.app/

### 4. Build for production
```bash
npm run build
```

## Pages

### Public (No login required)
| Route | Description |
|-------|-------------|
| `/` | Home — hero, stats, bank search, live inventory |
| `/find-blood` | Search blood by group + state + city |
| `/banks` | All blood banks directory |
| `/banks/:id` | Single bank — full inventory table + chart |

### Auth
| Route | Description |
|-------|-------------|
| `/login` | Login for all roles |
| `/register` | Choose role → fill registration form |
| `/forgot-password` | Request reset email |
| `/reset-password` | Reset with token |

### Dashboards (Protected)
| Route | Role | Description |
|-------|------|-------------|
| `/admin` | ADMIN | Tabbed — Overview, Blood Banks, Doctors |
| `/bank` | BLOOD_BANK | Sidebar — Overview, Inventory, Donors, Donations, Requests |
| `/doctor` | DOCTOR | Sidebar — Find & Request, My Requests, Overview |

## Features
- ✅ JWT auto-attach on all API calls
- ✅ Auto logout on 401
- ✅ PWA — installable on mobile
- ✅ Responsive (mobile + tablet + desktop)
- ✅ Role-based route protection
- ✅ Inventory table with all blood groups × components
- ✅ Charts for inventory (bank detail) and doctor stats
- ✅ Emergency request flow
- ✅ Real-time stock check before requesting
