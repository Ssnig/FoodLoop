# FoodLoop — System Overview & Workflow Description

## Core Narrative
FoodLoop bridges the gap between commercial food waste and local community need. When a food business identifies surplus inventory near its expiration threshold, FoodLoop calculates an immediate mitigation strategy—split between donation for social impact and dynamic discounting for business revenue recovery—and coordinates local rescue operations via human interfaces or autonomous AI agents.

---

## Step-by-Step System Operations

### 1. Surplus Identification & Intake
* **Trigger:** A retail business (e.g., a bakery or restaurant) identifies items close to expiration (e.g., *20 Chicken Sandwiches expiring in 2 hours*).
* **Process:** The operator enters the surplus item, available quantity, location, and hard cutoff time through the business dashboard form. Alternatively, this state can be pushed programmatically via service APIs.

### 2. Deterministic Action Analysis
* **Trigger:** Item entry fires the internal recommendation service engine (`recommendationService.js`).
* **Process:** The system evaluates three core parameters using deterministic business logic:
  * **Time Proximity:** Short remaining shelf-life increases overall action urgency.
  * **Quantity vs. Recipient Capacity:** High volume is matched against real-time recipient intake limits.
  * **Outcome Allocation:** The system calculates a balanced split strategy. For example, allocating 15 sandwiches to local donation (covering 100% of nearby shelter capacity) and marking the remaining 5 for local marketplace discounting to recoup food costs.

### 3. Recipient Matching Engine
* **Trigger:** The donation decision initiates the matching pipeline (`matchingService.js`).
* **Process:** The service evaluates nearby recipient organizations stored in the directory, scoring them based on:
  * **Proximity:** Distance in kilometers from the business location.
  * **Acceptance Capacity:** Current meal handling availability.
  * **Match Score:** A weighted calculation prioritizing the closest organization with compatible intake metrics (e.g., *Community Food Center, 2.1 km away, 94% match*).

### 4. Rescue Plan Generation & Execution
* **Trigger:** The business owner selects the top-ranked recipient or approves the system recommendation.
* **Process:** A structured Rescue Plan object is generated (`rescueService.js`), detailing pickup parameters, quantities, and expiration boundaries. The surplus item state updates from `pending` to `confirmed rescue`, locking the allocation.

### 5. Real-Time Impact Tracking
* **Trigger:** Completion of a rescue plan updates global platform state.
* **Process:** Metric aggregates update dynamically across the application shell:
  * **Meals Rescued:** Total individual meal portions delivered to community organizations.
  * **Food Diverted:** Estimated weight (in kg) kept out of landfills.
  * **Value Recovered:** Financial value preserved through combined tax/donation write-offs and discount sales.

---

## Dual-Channel Execution Architecture

```text
                      SURPLUS IDENTIFIED
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
       HUMAN UI CHANNEL               AI AGENT CHANNEL
       (React Dashboard)               (WebMCP Protocol)
              │                               │
    • Interactive Forms             • getSurplusItems()
    • Visual Cards                  • recommendAction()
    • Button Clicks                 • findNearbyRecipients()
              │                     • createRescue()
              │                               │
              └───────────────┬───────────────┘
                              ▼
                        SERVICE LAYER
                (Business Logic & Demo Data)
                              │
                              ▼
                     RESCUE PLAN CREATED



# FoodLoop — Engineering Specification & Hackathon Blueprint



> **Project Target:** FoodLoop — Business Surplus-Food Rescue MVP  
> **Execution Window:** 225 Minutes (3 Hours 45 Minutes)  
> **Team Allocation:** 2 Engineers (Parallel Frontend and Logic/Agent Tracks)

---

## Shared Architecture & Data Standards

To avoid cross-branch conflicts, developers must strictly adhere to their assigned directories. Interface integration occurs exclusively within `src/App.jsx`.

### Directory Boundaries

* **Frontend Scope (Person A):** Components, UI pages, visual layout, and local React state (`src/components/`, `src/pages/`, `src/styles/`).
* **Backend & Logic Scope (Person B):** Data schemas, stateful business logic, deterministic decision engine, and WebMCP tools (`src/data/`, `src/services/`, `src/webmcp/`).

---

### Shared Data Contracts (JSON Schemas)

#### 1. Surplus Item
```json
{
  "id": "food-001",
  "name": "Chicken Sandwiches",
  "category": "prepared-food",
  "quantity": 20,
  "availableUntil": "20:00",
  "location": "ABC Bakery",
  "status": "pending"
}