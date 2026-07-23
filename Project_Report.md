**CHAPTER 4**

**SYSTEM IMPLEMENTATION & WALKTHROUGH**

**4.1 Core System Architecture**
The Omnichannel Restaurant POS System is built using a modern full-stack web architecture. The system separates concerns by utilizing Next.js (App Router) for both the frontend rendering and backend API routes, secured by NextAuth.js. Database transactions are handled via Prisma ORM connected to a PostgreSQL database. 

- **Concurrency Management:** Server-side workflows, such as processing complex orders and generating invoices, are handled asynchronously to prevent bottlenecks during peak restaurant operating hours.

**4.2 User Interface (UI) Walkthrough**

This section provides a step-by-step visual walkthrough of the Omnichannel Restaurant POS System across its three core modules. It describes how user workflows are translated into structured layouts on the screen using React 19 and Tailwind CSS.

#### 4.2.1 Customer Self-Ordering Kiosk (QR Scan) Walkthrough

The Scan interface (`/scan`) is optimized for mobile browser interactions, guiding the user smoothly from product selection to checkout directly from their table.

- **Main Storefront Screen Layout:** Customers scan a table-specific QR code to access the digital menu. The layout features an intuitive vertical scrolling list of food categories. Tapping a category instantly loads interactive item cards.
- **Smart Modifier Selector Modal Box:** Clicking an item card triggers an overlay modal window. This presents structured modifier choices (e.g., Min/Max addon selections like "Extra Cheese" or "Less Sugar"). The application calculates and updates modifier fees instantly on the screen before the user confirms the addition.
- **Shopping Cart & Live Checkout Action:** Customers review their customized selections and change item quantities in a dedicated cart view. Tapping the primary "Checkout" action button submits their verified JSON order package directly to the backend database, linking it to their specific table.

#### 4.2.2 Point of Sale (POS) & Kitchen Tracking Walkthrough

The POS and Kitchen interface (`/pos`) functions as the operational hub for cashiers and production staff, efficiently managing the lifecycle of every order.

- **Real-Time Order Grid Layout:** The POS screen layout is designed to display active order tickets as adaptive digital cards, keeping counter staff updated on kitchen progress.
- **Component Presentation & Behavior:** Newly submitted orders (from both the counter and the customer QR app) populate as tickets in the system queue. Each visual ticket renders vital details: the order number, table number, and clear ingredient adjustment strings.
- **Sequential Queue Interaction:** At the base of each order card, a status mutation action button is visible. Kitchen and counter operators interact with this element to cycle an entry from `PENDING` to `COOKING`, `READY`, and finally `DELIVERED`. 

#### 4.2.3 Back-Office Administrative Dashboard Walkthrough

The administration portal (`/dashboard`) serves as an analytics and configuration suite designed for multi-tenant business management operations.

- **Multi-Tier Navigation Layout:** The admin web app uses a role-based navigation panel. It is divided into `COMPANY_HEAD`, `HQ`, and `STORE` levels, ensuring managers only see data relevant to their authorization level.
- **Menu & Branch CRUD Interface:** The system loads collection layouts for managing the complex hierarchy of master menus and branch-specific item availability. Managers can alter product descriptions, modify pricing, and apply global discounts.
- **Invoicing & Payments:** The management module processes finalized orders into structured `Invoice` records. It supports local transaction tracking by classifying payments under methods like CASH, KPAY, CB_PAY, and CREDIT_CARD.

---

**CHAPTER 5**

**SYSTEM TESTING, EVALUATION & CONCLUSION**

### 5.1 System Testing & Error Handling

To ensure the POS System is stable, secure, and ready for multi-tenant restaurant operations, thorough system testing was conducted. This process involved verifying specific user actions and checking how the backend handles errors.

#### 5.1.1 Functional Testing Matrix

The table below describes the test cases, expected results, and final outcomes executed during the evaluation phase:

| Test ID | System Module | Test Scenario / Action | Expected Result | Pass / Fail |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Scan Frontend | Customer customizes a dish via QR code and clicks "Checkout". | Order payload is sent, table number is linked, total cost calculated correctly. | **PASS** |
| **TC-02** | POS Core | Cashier updates an order status from PENDING to COOKING. | Database state updates securely, and the UI reflects the new badge status. | **PASS** |
| **TC-03** | Auth Validation | A `STAFF` role user attempts to access the `/dashboard/company` route. | NextAuth middleware blocks the action and redirects to an unauthorized notice. | **PASS** |
| **TC-04** | Admin Portal | Admin applies a global discount to a Menu Item. | Invoice generation dynamically calculates the new final amount accurately. | **PASS** |

#### 5.1.2 Error Handling and System Resilience

The backend Next.js API includes custom exception filters to catch unexpected behaviors gracefully:
- **Database Connection Loss:** If PostgreSQL goes offline, Prisma catches the exception and the API returns a standard HTTP 500 error with a clean diagnostic log message, preventing the React frontend from crashing.
- **Validation Errors:** If an order is submitted without meeting the minimum add-on requirements, the server rejects the JSON payload and sends a structured error back to the user interface.

### 5.2 Project Evaluation

The Omnichannel POS system was evaluated based on performance speed, user interface design, and functional business value:

- **Performance and Speed:** By using Next.js Server Components and optimized database indexing via Prisma, data fetching for large menus and order histories happens near-instantly.
- **Usability and Design:** The interface design using Tailwind CSS makes navigation clear for customers on mobile devices and cashiers on tablets. The hierarchical dashboard reduces administrative confusion.
- **Business Operations Impact:** The multi-tenant structure solves the critical business problem of managing multiple branches from a single platform. The omnichannel ordering flow directly reduces wait times and improves table turnover rates.

### 5.3 Conclusion & Recommendations for Future Work

#### 5.3.1 Project Conclusion

The development of the Omnichannel Restaurant POS System successfully delivers an efficient, secure, and highly scalable application. By structuring the solution with Next.js, Tailwind CSS, and a robust PostgreSQL database, the system achieves excellent performance stability.

The project successfully solves the fragmentation of modern restaurant software by unifying customer self-ordering, cashier operations, and multi-branch management into a single, cohesive ecosystem.

#### 5.3.2 Recommendations for Future Work

While the system fulfills all core requirements, the following features are recommended for future updates:

1. **Integrated Payment Gateways:** Connect digital payment APIs (such as live KBZPay or CBPay integration) directly inside the checkout flow to automate invoice payment statuses.
2. **Predictive Analytics:** Implement data visualizations on the company dashboard to track daily sales trends and predict inventory needs.
3. **WebSockets/Real-time Updates:** Integrate a real-time protocol (like Socket.io or Pusher) so the POS kitchen screen updates automatically without requiring a page refresh when a customer submits an order.
